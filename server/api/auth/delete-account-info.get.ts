import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token as string;
  if (!token)
    throw createError({ statusCode: 400, message: "Token is required" });

  let payload: { id: string };
  try {
    payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    ) as { id: string };
  } catch {
    throw createError({ statusCode: 410, message: "Invalid or expired token" });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { password: true },
  });
  if (!user) throw createError({ statusCode: 404, message: "User not found" });

  return { isOAuth: !user.password };
});
