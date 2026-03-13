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
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Account Deletion</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0a0e27 0%, #0d1230 50%, #0a0e27 100%); min-height: 100vh;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #161b33; border-radius: 16px; border: 1px solid #2d3748; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px 40px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                        <span style="font-size: 32px;">🎵</span>
                      </div>
                      <h1 style="margin: 20px 0 0 0; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">BeatStack</h1>
                    </td>
                  </tr>

                  <!-- Warning icon -->
                  <tr>
                    <td align="center" style="padding: 0 40px 10px 40px;">
                      <div style="width: 56px; height: 56px; background: rgba(239, 68, 68, 0.15); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; border: 2px solid rgba(239, 68, 68, 0.4);">
                        <span style="font-size: 28px;">⚠️</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 10px 40px 30px 40px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: bold; color: #f87171; text-align: center;">Delete Your Account?</h2>
                      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #9ca3af;">We received a request to permanently delete your BeatStack account. This will erase <strong style="color: #e5e7eb;">all your data</strong> including beats, likes, comments, and your profile — and <strong style="color: #e5e7eb;">cannot be undone</strong>.</p>
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #9ca3af;">If you want to continue, click the button below. You'll be asked to confirm your password. The link expires in <strong style="color: #e5e7eb;">24 hours</strong>.</p>
                    </td>
                  </tr>

                  <!-- Button -->
                  <tr>
                    <td align="center" style="padding: 0 40px 30px 40px;">
                      <table role="presentation" style="border-collapse: collapse;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                            <a href="${deleteLink}" style="display: inline-block; padding: 14px 36px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">Confirm Deletion</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Ignore notice -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px;">
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">If you didn't request this, you can safely ignore this email. Your account will not be deleted.</p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; border-top: 1px solid #2d3748;">
                      <p style="margin: 0; font-size: 12px; color: #4b5563; text-align: center;">© ${new Date().getFullYear()} BeatStack. All rights reserved.</p>
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
