import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

try {
  await transporter.verify();
  console.log("Gmail SMTP connection verified successfully.");
} catch (error) {
  console.error("SMTP verification failed:", error);
}


// ----------------- SEND RESET OTP EMAIL -----------------
export const sendResetOtpEmail = async (to, name, otp) => {
  try {
    await transporter.sendMail({
      from: `"InvoiceFlow Support" <${process.env.GMAIL_USER}>`,
      to,
      subject: "InvoiceFlow - Password Reset OTP",

      text: `
Hello ${name},

We received a request to reset your InvoiceFlow account password.

Your password reset OTP is: ${otp}

This OTP expires in 5 minutes.

If you did not request this password reset, you can safely ignore this email.

Regards,
InvoiceFlow Support Team
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937;">

          <h2 style="color: #2F1B5E; margin-bottom: 8px;">
            InvoiceFlow
          </h2>

          <p style="color: #6b7280; margin-top: 0;">
            Invoice Management System
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb;" />

          <p>Hello <strong>${escapeHtml(name)}</strong>,</p>

          <p>
            We received a request to reset your InvoiceFlow account
            password. Use the verification code below to continue.
          </p>

          <div style="background: #f5f3ff; padding: 22px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
              YOUR VERIFICATION CODE
            </p>

            <h1 style="color: #2F1B5E; letter-spacing: 8px; margin: 0;">
              ${otp}
            </h1>
          </div>

          <p>
            This OTP expires in <strong>5 minutes</strong>.
          </p>

          <p>
            If you did not request this password reset, please ignore
            this email. Your password will remain unchanged.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 28px;" />

          <p style="font-size: 12px; color: #6b7280;">
            InvoiceFlow Support Team
          </p>
        </div>
      `,
    });

    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("OTP email delivery failed:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

// Escape user-provided content before inserting it into HTML.
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
