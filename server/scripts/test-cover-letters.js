const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzIsImVtYWlsIjoicmFtYW1pdDAzMTVAZ21haWwuY29tIiwicm9sZSI6ImpvYl9zZWVrZXIiLCJjb21wYW55X2lkIjpudWxsLCJpYXQiOjE3Nzc2MzE4NjcsImV4cCI6MTc3NzcxODI2N30.vfcsMWpRSKFwExhmoPONSQqdN4CSQ6hor4RF2uSh8YM';
let firstLetterId = '';
let secondLetterId = '';

// Helper: login as job seeker (change credentials to your test user)
async function login() {
  const res = await axios.post(`${API_BASE}/auth/login`, {
    email: 'ramamit0315@gmail.com',
    password: 'password123'
  });
  authToken = res.data.data.token;
  console.log('Login successful');
}

async function testCoverLetters() {
  try {
    await login();

    // CREATE cover letter
    console.log('\n Creating cover letter...');
    const createRes = await axios.post(
      `${API_BASE}/cover-letters`,
      { name: 'Software Engineer Template', content: 'Dear Hiring Manager, I am a passionate developer...' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    firstLetterId = createRes.data.data.id;
    console.log('Created:', createRes.data.data);

    // CREATE second cover letter
    console.log('\n Creating second cover letter...');
    const createRes2 = await axios.post(
      `${API_BASE}/cover-letters`,
      { name: 'Data Analyst Template', content: 'To the recruiting team, I excel at data analysis...' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    secondLetterId = createRes2.data.data.id;
    console.log('Second created:', createRes2.data.data);

    // GET all cover letters
    console.log('\n Fetching all cover letters...');
    const getAllRes = await axios.get(
      `${API_BASE}/cover-letters`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`Found ${getAllRes.data.data.length} letters:`);
    getAllRes.data.data.forEach(l => console.log(`  - ${l.name} (default: ${l.is_default})`));

    // UPDATE the first cover letter
    console.log('\n Updating first cover letter...');
    const updateRes = await axios.put(
      `${API_BASE}/cover-letters/${firstLetterId}`,
      { name: 'Updated Software Engineer Template', content: 'Updated content...' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('Updated:', updateRes.data.data);

    // SET SECOND LETTER AS DEFAULT
    console.log('\n Setting second cover letter as default...');
    const defaultRes = await axios.put(
      `${API_BASE}/cover-letters/${secondLetterId}/default`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('Default set:', defaultRes.data.data);

    // DELETE the first cover letter
    console.log('\n Deleting first cover letter...');
    await axios.delete(
      `${API_BASE}/cover-letters/${firstLetterId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('Deleted');

    // FINAL verification (get all again)
    console.log('\n Final list after deletion...');
    const finalRes = await axios.get(
      `${API_BASE}/cover-letters`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    finalRes.data.data.forEach(l => console.log(`  - ${l.name} (default: ${l.is_default})`));

    console.log('\n All cover letter operations completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('The token may be malformed or expired. Try logging in again.');
    }
  }
}

testCoverLetters();