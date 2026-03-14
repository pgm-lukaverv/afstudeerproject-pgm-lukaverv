import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createHash } from "crypto";

const MAX_ATTEMPTS = 3;
const ATTEMPTS_COOKIE = "delete_attempts";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function isTokenBlacklisted(token: string): Promise<boolean> {
  const hash = hashToken(token);
  const blacklisted = await prisma.blacklistedToken.findUnique({
    where: { tokenHash: hash },
  });
  return !!blacklisted && blacklisted.expiresAt > new Date();
}

async function blacklistToken(token: string, expiresAt: Date): Promise<void> {
  const hash = hashToken(token);
  await prisma.blacklistedToken.upsert({
    where: { tokenHash: hash },
    create: { tokenHash: hash, expiresAt },
    update: { expiresAt },
  });
}

export default defineEventHandler(async (event) => {
  const { token, password } = await readBody(event);

  if (!token)
    throw createError({ statusCode: 400, message: "Token is required" });

  // Check if token is blacklisted (burned after 3 attempts)
  if (await isTokenBlacklisted(token)) {
    throw createError({
      statusCode: 403,
      message:
        "This link has been disabled due to too many failed attempts. Please request a new deletion link.",
    });
  }

  // Verify JWT — expiry is handled automatically by jsonwebtoken
  let payload: { id: string; exp?: number };
  try {
    payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    ) as { id: string; exp?: number };
  } catch {
    throw createError({
      statusCode: 410,
      message: "This link has expired. Please request a new one.",
    });
  }

  // Track attempts in a signed cookie — no DB fields needed
  const attemptsCookie = getCookie(event, ATTEMPTS_COOKIE);
  let attempts = 0;
  if (attemptsCookie) {
    try {
      const decoded = jwt.verify(
        attemptsCookie,
        process.env.JWT_SECRET || "your-secret-key",
      ) as { attempts: number; userId: string };
      if (decoded.userId === payload.id) attempts = decoded.attempts;
    } catch {}
  }

  if (attempts >= MAX_ATTEMPTS) {
    deleteCookie(event, ATTEMPTS_COOKIE);
    throw createError({
      statusCode: 403,
      message: "Too many failed attempts. Please request a new deletion link.",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, password: true },
  });
  if (!user) throw createError({ statusCode: 404, message: "User not found" });

  // Password-based users: verify password
  if (user.password) {
    const valid = await bcrypt.compare(password || "", user.password);
    if (!valid) {
      const newAttempts = attempts + 1;
      const remaining = MAX_ATTEMPTS - newAttempts;

      if (newAttempts >= MAX_ATTEMPTS) {
        // Blacklist this token permanently
        const expiresAt = payload.exp
          ? new Date(payload.exp * 1000)
          : new Date(Date.now() + 24 * 60 * 60 * 1000);
        await blacklistToken(token, expiresAt);
        deleteCookie(event, ATTEMPTS_COOKIE);
        throw createError({
          statusCode: 403,
          message:
            "Too many failed attempts. This link has been disabled. Please request a new deletion link from your settings.",
        });
      }

      const attemptToken = jwt.sign(
        { attempts: newAttempts, userId: payload.id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" },
      );
      setCookie(event, ATTEMPTS_COOKIE, attemptToken, {
        httpOnly: true,
        sameSite: "strict",
      });

      throw createError({
        statusCode: 401,
        message: `Incorrect password. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      });
    }
  }

  // All checks passed → delete (cascades to Profile, Beats, etc. via onDelete: Cascade)
  deleteCookie(event, ATTEMPTS_COOKIE);
  await prisma.user.delete({ where: { id: user.id } });

  return { message: "Your account has been permanently deleted." };
});
