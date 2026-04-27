const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api/applications';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoicmFtYW1pdDAzMTVAZ21haWwuY29tIiwicm9sZSI6ImpvYl9zZWVrZXIiLCJjb21wYW55X2lkIjpudWxsLCJpYXQiOjE3NzczMDU0MTIsImV4cCI6MTc3NzM5MTgxMn0.qpBz4vHjg8MrUaWQU-8ozS3daO0YVDQyPDJt8gk9Vn4';
const JOB_ID = 1;
const COVER_LETTER = 'Timing test script.';

async function testResponseTime() {
  // Delete previous application (optional but avoids 409)
  try {
    const deleteUrl = `http://localhost:5000/api/applications/${JOB_ID}`;
    await axios.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('Old application cleared.');
  } catch (err) {
    // ignore if not found
  }

  // Measure time taken for API response
  const start = Date.now();
  try {
    const res = await axios.post(
      API_URL,
      { jobId: JOB_ID, cover_letter: COVER_LETTER },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const elapsed = Date.now() - start;
    console.log(`API response received in ${elapsed} ms`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(`API error after ${elapsed} ms`);
    console.error(err.response?.data || err.message);
  }
}

testResponseTime();