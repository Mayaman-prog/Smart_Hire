// Load env variables
require("dotenv").config();

// Import email functions
const { sendEmail, verifyConnection } = require("../src/config/email");

// Test if email works
const testEmail = async () => {
  console.log("Testing email configuration...");

  // Check if connection works
  const isConnected = await verifyConnection();
  if (!isConnected) {
    console.error("Connection failed. Check SMTP settings.");
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("ADMIN_EMAIL not set in .env");
    process.exit(1);
  }

  try {
    // Send test email
    await sendEmail(
      adminEmail,
      'SmartHire Test Email',
      '<h1>SmartHire Email Service</h1><p>If you receive this, the email service is working correctly.</p>',
      'SmartHire Email Service – If you receive this, the email service is working correctly.'
    );
    console.log('Test email sent successfully.');
  } catch (error) {
    // Log error if email fails
    console.error('Failed to send test email:', error.message);
  }
};

// Run the test
testEmail();
