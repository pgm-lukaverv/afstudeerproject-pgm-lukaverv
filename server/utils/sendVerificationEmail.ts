import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "~/generated/prisma/client";

export const sendVerificationEmail = async (user: User) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1d" },
  );

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/api/auth/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify Your Email - BeatStack",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#0a0e27;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#161b33;border-radius:16px;border:1px solid #2d3748;">
        <tr><td align="center" style="padding:40px 40px 20px;">
          <h1 style="color:#fff;margin:0;">BeatStack</h1>
        </td></tr>
        <tr><td style="padding:20px 40px;">
          <h2 style="color:#fff;margin:0 0 16px;">Welcome to BeatStack! 🎉</h2>
          <p style="color:#9ca3af;font-size:16px;line-height:1.6;">Thank you for signing up! To get started, please verify your email address by clicking the button below.</p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 30px;">
          <a href="${verifyLink}" style="display:inline-block;padding:14px 32px;background:#3b82f6;color:#fff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">Verify Email Address</a>
          <p style="color:#6b7280;font-size:14px;margin:16px 0 4px;">Or copy and paste this link:</p>
          <p style="color:#3b82f6;font-size:13px;word-break:break-all;margin:0;">${verifyLink}</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #2d3748;">
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">This verification link will expire in 24 hours.</p>
          <p style="color:#6b7280;font-size:13px;margin:0;">If you didn't create an account with BeatStack, you can safely ignore this email.</p>
          <p style="color:#4b5563;font-size:12px;text-align:center;margin:16px 0 0;">© ${new Date().getFullYear()} BeatStack. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  return token;
};
