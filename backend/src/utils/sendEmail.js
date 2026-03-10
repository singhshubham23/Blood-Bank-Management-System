
const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@bloodbank.example",
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = sendEmail;
