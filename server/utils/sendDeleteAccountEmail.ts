import nodemailer from "nodemailer";

export const sendDeleteAccountEmail = async (
  email: string,
  deleteLink: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirm Account Deletion - BeatStack",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#0a0e27;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#161b33;border-radius:16px;border:1px solid #2d3748;">
                <tr>
                  <td align="center" style="padding:40px 40px 20px;">
                    <h1 style="color:#fff;margin:0;">BeatStack</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px;">
                    <h2 style="color:#f87171;text-align:center;">Delete Your Account?</h2>
                    <p style="color:#9ca3af;font-size:15px;line-height:1.6;">We received a request to permanently delete your BeatStack account. This will erase <strong style="color:#e5e7eb;">all your data</strong> and <strong style="color:#e5e7eb;">cannot be undone</strong>.</p>
                    <p style="color:#9ca3af;font-size:15px;line-height:1.6;">The link expires in <strong style="color:#e5e7eb;">24 hours</strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:20px 40px 30px;">
                    <a href="${deleteLink}" style="display:inline-block;padding:14px 36px;background:#dc2626;color:#fff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">Confirm Deletion</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #2d3748;">
                    <p style="color:#6b7280;font-size:12px;text-align:center;">If you didn't request this, ignore this email.</p>
                    <p style="color:#4b5563;font-size:12px;text-align:center;">© ${new Date().getFullYear()} BeatStack. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
};
