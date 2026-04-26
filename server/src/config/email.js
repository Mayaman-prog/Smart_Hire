const nodemailer = require("nodemailer");

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// sendEmail
const sendEmail = async (to, subject, html, text) => {
  const mailOptions = {
    from: `"SmartHire" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html: html.trim(),
    text,
  };

  return transporter.sendMail(mailOptions);
};

// verifyConnection
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email service configured successfully");
    return true;
  } catch (error) {
    console.error("Email service configuration failed:", error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  verifyConnection,
};