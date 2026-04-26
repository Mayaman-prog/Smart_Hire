const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { sendEmail } = require('../config/email');

// sendTemplatedEmail
const sendTemplatedEmail = async (to, templateName, data, subject) => {
  try {
    const templatePath = path.join(
      __dirname,
      '../email-templates',
      `${templateName}.html`
    );

    // Check file exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templateName}`);
    }

    // Read and compile template
    const source = fs.readFileSync(templatePath, 'utf8');

    // Validate template content
    if (!source || source.trim() === '') {
      throw new Error(`Template "${templateName}" is empty`);
    }

    // Generate HTML content
    const template = Handlebars.compile(source);
    const html = template(data);

    // Generate text version
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    console.log("FINAL HTML LENGTH:", html.length);

    // Basic validation of generated HTML
    if (!html || html.length < 20) {
      throw new Error('Generated HTML is invalid');
    }

    await sendEmail(to, subject, html, text);

    console.log(`Email "${templateName}" sent to ${to}`);
  } catch (error) {
    console.error(`Failed template "${templateName}":`, error.message);
    throw error;
  }
};

module.exports = { sendTemplatedEmail };