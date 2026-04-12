import nodemailer from "nodemailer";
import { logger } from "./logger";

const EMAIL_USER = process.env["EMAIL_USER"];
const EMAIL_PASS = process.env["EMAIL_PASS"];

if (!EMAIL_USER || !EMAIL_PASS) {
  logger.warn("EMAIL_USER or EMAIL_PASS not set — email sending will fail");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export function buildOtpEmail(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email — SaimServices</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f2e;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f2e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0d1435;border-radius:20px;border:1px solid rgba(67,97,238,0.28);overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#4361ee,#3a86ff,#0ea5e9);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 40px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width:52px;height:52px;background:linear-gradient(135deg,rgba(67,97,238,0.25),rgba(14,165,233,0.15));border-radius:14px;border:1px solid rgba(67,97,238,0.4);">
                    <span style="font-size:24px;line-height:52px;">⚡</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">SaimServices</h1>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.45);letter-spacing:0.5px;text-transform:uppercase;">Email Verification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#ffffff;">Hi ${name},</p>
              <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;">
                Thanks for signing up! Use the one-time code below to verify your email address and activate your SaimServices account.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <table cellpadding="0" cellspacing="0" style="background:rgba(67,97,238,0.1);border:1px solid rgba(67,97,238,0.35);border-radius:16px;padding:24px 40px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Your Verification Code</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:'Courier New',monospace;">${otp}</p>
                    <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">Expires in <strong style="color:rgba(255,165,0,0.85);">10 minutes</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;">
                If you did not create an account with SaimServices, you can safely ignore this email. This code will expire automatically.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 40px 32px;">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.3);">
                SaimServices &mdash; Engineering &amp; Academic Tools Platform
              </p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
                &copy; ${new Date().getFullYear()} SaimServices. All rights reserved. &nbsp;|&nbsp; United States
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendOtpEmail(toEmail: string, name: string, otp: string): Promise<void> {
  const html = buildOtpEmail(name, otp);

  await transporter.sendMail({
    from: `"SaimServices" <${EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your SaimServices verification code`,
    html,
    text: `Hi ${name},\n\nYour SaimServices email verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not sign up, please ignore this email.\n\n— SaimServices`,
  });
}
