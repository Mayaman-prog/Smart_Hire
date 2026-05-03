const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Helper for colored console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

const logSuccess = (msg) => console.log(`${colors.green} ${msg}${colors.reset}`);
const logError = (msg) => console.log(`${colors.red} ${msg}${colors.reset}`);
const logWarning = (msg) => console.log(`${colors.yellow} ${msg}${colors.reset}`);

async function testOAuth() {
  console.log('\n Testing OAuth Routes...\n');

  // Test /auth/google – should redirect to Google
  try {
    const response = await axios.get(`${BASE_URL}/google`, {
      maxRedirects: 0, // Prevent automatic redirect
      validateStatus: (status) => status === 302,
    });
    logSuccess('Google OAuth init route (/google) is working (302 redirect)');
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logSuccess('Google OAuth init route (/google) is working (302 redirect)');
    } else {
      logError(`Google OAuth init route failed: ${error.message}`);
      logWarning('Make sure your server is running on port 5000 and the route is registered.');
    }
  }

  // Test /auth/google/callback – should return 302 or 401
  try {
    const response = await axios.get(`${BASE_URL}/google/callback`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302 || status === 401,
    });
    if (response.status === 302) {
      logSuccess('Google callback route is ready (302 redirect)');
    } else if (response.status === 401) {
      logSuccess('Google callback route is ready (401 - expected without valid code)');
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logSuccess('Google callback route is ready (302 redirect)');
    } else if (error.response && error.response.status === 401) {
      logSuccess('Google callback route is ready (401 - expected without valid code)');
    } else {
      logError(`Google callback route failed: ${error.message}`);
    }
  }

  // Test /auth/linkedin – should be disabled (503)
  try {
    const response = await axios.get(`${BASE_URL}/linkedin`, {
      validateStatus: (status) => status === 503,
    });
    logSuccess('LinkedIn OAuth route is correctly disabled (503)');
  } catch (error) {
    if (error.response && error.response.status === 503) {
      logSuccess('LinkedIn OAuth route is correctly disabled (503)');
    } else {
      logError(`LinkedIn OAuth route returned unexpected status: ${error.response?.status || error.message}`);
    }
  }

  // Test /auth/linkedin/callback – should be disabled (503)
  try {
    const response = await axios.get(`${BASE_URL}/linkedin/callback`, {
      validateStatus: (status) => status === 503,
    });
    logSuccess('LinkedIn callback route is correctly disabled (503)');
  } catch (error) {
    if (error.response && error.response.status === 503) {
      logSuccess('LinkedIn callback route is correctly disabled (503)');
    } else {
      logError(`LinkedIn callback route returned unexpected status: ${error.response?.status || error.message}`);
    }
  }

  console.log('\n Test completed.\n');
}

// Run the test
testOAuth().catch((err) => {
  console.error('Test failed:', err.message);
});