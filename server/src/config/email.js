// Import nodemailer for sending emails
const nodemailer = require('nodemailer');

// Setup SMTP transporter with env variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT == 465, // SSL for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Check if email service is working
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service configured successfully');
    return true;
  } catch (error) {
    console.error('Email service configuration failed:', error.message);
    return false;
  }
};

// Send email function
const sendEmail = async (to, subject, html, text = '') => {
  // Check if SMTP variables are set
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email service not configured. Please set SMTP_* environment variables.');
  }

  // Email options
  const mailOptions = {
    from: `"SmartHire" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text: text || html.replace(/<[^>]*>/g, ''), // fallback plain text
    html,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    // Log error if email fails
    console.error(`Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

// Export functions
module.exports = { sendEmail, verifyConnection };