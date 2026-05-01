const fs = require('fs');
const path = require('path');
const { parseResume } = require('../src/services/resumeParser');

const filePath = path.join(__dirname, '..', 'test-resume.pdf');

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  console.log('Please place test-resume.pdf in the server folder.');
  process.exit(1);
}

async function testParser() {
  try {
    const buffer = fs.readFileSync(filePath);
    const parsedData = await parseResume(buffer, 'application/pdf');
    console.log('Parser output:', JSON.stringify(parsedData, null, 2));
  } catch (error) {
    console.error('Parser error:', error.message);
  }
}

testParser();