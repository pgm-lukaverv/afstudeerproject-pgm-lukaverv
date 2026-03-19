import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (
  email: string,
  resetLink: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password - BeatStack",
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
          <h2 style="color:#fff;margin:0 0 16px;">Reset Your Password 🔒</h2>
          <p style="color:#9ca3af;font-size:16px;line-height:1.6;">We received a request to reset your password. Click the button below to create a new password for your BeatStack account.</p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 30px;">
          <a href="${resetLink}" style="display:inline-block;padding:14px 32px;background:#3b82f6;color:#fff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">Reset Password</a>
          <p style="color:#6b7280;font-size:14px;margin:16px 0 4px;">Or copy and paste this link:</p>
          <p style="color:#3b82f6;font-size:13px;word-break:break-all;margin:0;">${resetLink}</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #2d3748;background:rgba(239,68,68,0.1);">
          <p style="color:#ef4444;font-size:14px;font-weight:600;margin:0 0 8px;">⚠️ Security Notice</p>
          <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">This link expires in <strong style="color:#e5e7eb;">15 minutes</strong>.</p>
          <p style="color:#9ca3af;font-size:13px;margin:0;">If you didn't request this, ignore this email or contact support.</p>
        </td></tr>
        <tr><td align="center" style="padding:20px 40px;">
          <p style="color:#4b5563;font-size:12px;margin:0;">© ${new Date().getFullYear()} BeatStack. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
};
