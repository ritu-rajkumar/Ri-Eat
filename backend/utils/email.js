const nodemailer = require("nodemailer");

const isGmail =
  (process.env.EMAIL_SERVICE || "gmail").toLowerCase() === "gmail";

const transporter = nodemailer.createTransport(
  isGmail
    ? {
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          // Allow self-signed / intercepting certificates (set to false for production if using proper certs)
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.SMTP_HOST || "127.0.0.1",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // STARTTLS by default
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
);

async function sendEmail(to, subject, text) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials are not set. Skipping email send.");
    console.log(`Would send email to ${to}: ${text}`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending email via transporter:", err);
    throw err;
  }
}

module.exports = sendEmail;
