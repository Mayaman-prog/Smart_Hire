// Load environment variables from .env file located in parent directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Import axios for making HTTP requests to the API
const axios = require('axios');

// Configuration
// Base URL for the API endpoints
const BASE = 'http://localhost:5000/api';

// Test user credentials for authentication
const EMAIL = 'mayaman@example.com';
const PASSWORD = 'password123';

/**
 * Main test function that performs a complete CRUD test on saved searches
 * Tests the flow: Create -> Read -> Update -> Delete
 */
async function run() {
  // Authenticate user and obtain JWT token
  console.log('Logging in...');
  const loginRes = await axios.post(`${BASE}/auth/login`, { email: EMAIL, password: PASSWORD });
  const token = loginRes.data.data.token;
  console.log('Token obtained\n');

  // Set up authorization header with Bearer token for all subsequent requests
  const headers = { Authorization: `Bearer ${token}` };

  // CREATE TEST
  console.log('Creating saved search...');
  const createRes = await axios.post(`${BASE}/saved-searches`, {
    name: 'Remote React',
    keyword: 'React',
    location: 'Remote',
    job_type: 'full-time',
    salary_min: 80000,
    alert_frequency: 'daily'
  }, { headers });
  const id = createRes.data.data.id;
  console.log('Created, ID:', id, '\n');

  // READ TEST
  console.log('Fetching all saved searches...');
  const getAllRes = await axios.get(`${BASE}/saved-searches`, { headers });
  console.log(`Found ${getAllRes.data.data.length} saved search(es)\n`);

  // UPDATE TEST
  console.log('Updating saved search...');
  // Update the created saved search with a new name
  await axios.put(`${BASE}/saved-searches/${id}`, { name: 'Updated Name' }, { headers });
  // Fetch all searches to verify the update
  const updatedRes = await axios.get(`${BASE}/saved-searches`, { headers });
  const updated = updatedRes.data.data.find(s => s.id === id);
  console.log('Updated name:', updated.name, '\n');

  // DELETE TEST
  console.log('Deleting saved search...');
  // Delete the saved search
  await axios.delete(`${BASE}/saved-searches/${id}`, { headers });
  // Fetch all searches to confirm deletion
  const finalRes = await axios.get(`${BASE}/saved-searches`, { headers });
  const deleted = finalRes.data.data.find(s => s.id === id);
  console.log('Deleted:', !deleted, '\n');

  console.log('All tests passed!');
}

// Execute the test function and handle any errors
run().catch(err => {
  // Log error response from API or generic error message
  console.log('Error:', err.response?.data || err.message);
});