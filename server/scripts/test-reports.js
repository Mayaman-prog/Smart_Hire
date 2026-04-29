const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'ramamit0315@gmail.com';
const TEST_PASSWORD = 'Amitram098@#';

// Utility: coloured console output (simple)
const log = {
  pass: (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`),
  fail: (msg) => console.log(`\x1b[31m✕ ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[36m➤ ${msg}\x1b[0m`),
};

(async () => {
  let token;

  // Login
  log.info('Logging in…');
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    token = loginRes.data.data.token;
    log.pass('Login successful');
  } catch (err) {
    log.fail(`Login failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Valid report
  log.info('Test 1: Valid report (jobId=22, reason=spam)');
  try {
    const res = await axios.post(`${BASE_URL}/reports`, { jobId: 22, reason: 'spam' }, authHeader);
    if (res.data.success && res.status === 201) {
      log.pass('Valid report accepted');
    } else {
      log.fail(`Unexpected response: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    log.fail(`Unexpected error: ${err.response?.status} – ${err.response?.data?.message}`);
  }

  // Duplicate report
  log.info('Test 2: Duplicate report (same job + user)');
  try {
    await axios.post(`${BASE_URL}/reports`, { jobId: 22, reason: 'spam' }, authHeader);
    log.fail('Duplicate report was accepted – should have been 409');
  } catch (err) {
    if (err.response?.status === 409 && err.response.data.message.includes('already reported')) {
      log.pass('Duplicate correctly rejected (409)');
    } else {
      log.fail(`Expected 409, got ${err.response?.status}: ${err.response?.data?.message}`);
    }
  }

  // Missing reason
  log.info('Test 3: Missing reason');
  try {
    await axios.post(`${BASE_URL}/reports`, { jobId: 22 }, authHeader);
    log.fail('Missing reason accepted – should have been 400');
  } catch (err) {
    if (err.response?.status === 400 && err.response.data.message.includes('reason')) {
      log.pass('Missing reason correctly rejected (400)');
    } else {
      log.fail(`Expected 400, got ${err.response?.status}: ${err.response?.data?.message}`);
    }
  }

  // Invalid reason
  log.info('Test 4: Invalid reason');
  try {
    await axios.post(`${BASE_URL}/reports`, { jobId: 23, reason: 'hacked' }, authHeader);
    log.fail('Invalid reason accepted – should have been 400');
  } catch (err) {
    if (err.response?.status === 400 && err.response.data.message.includes('Invalid reason')) {
      log.pass('Invalid reason correctly rejected (400)');
    } else {
      log.fail(`Expected 400, got ${err.response?.status}: ${err.response?.data?.message}`);
    }
  }

  // No auth
  log.info('Test 5: No authentication');
  try {
    await axios.post(`${BASE_URL}/reports`, { jobId: 22, reason: 'spam' });
    log.fail('Unauthenticated request accepted – should have been 401');
  } catch (err) {
    if (err.response?.status === 401) {
      log.pass('Unauthenticated request correctly rejected (401)');
    } else {
      log.fail(`Expected 401, got ${err.response?.status}`);
    }
  }

  // Rate limit (5 reports)
  log.info('Test 6: Rate limit – sending 5 reports from clean state');
  log.info('(If you have already sent some reports, reset with: redis-cli DEL report_limit:12)');
  const jobIds = [23, 24, 25, 26, 27, 28];
  let rateLimitHit = false;
  for (let i = 0; i < jobIds.length; i++) {
    const jobId = jobIds[i];
    try {
      const res = await axios.post(`${BASE_URL}/reports`, { jobId, reason: 'other' }, authHeader);
      if (i < 5) {
        // First 5 should succeed
        log.pass(`Report #${i+1} (jobId=${jobId}) accepted`);
      } else {
        log.fail(`Report #${i+1} should have been rate limited (429) but succeeded`);
      }
    } catch (err) {
      if (i < 5) {
        // Unexpected failure for first 5 – maybe job doesn't exist or duplicate
        log.fail(`Report #${i+1} (jobId=${jobId}) failed: ${err.response?.status} ${err.response?.data?.message}`);
      } else {
        // The 6th report should be 429
        if (err.response?.status === 429) {
          log.pass('Rate limit correctly enforced on 6th report (429)');
          rateLimitHit = true;
          break;
        } else {
          log.fail(`Expected 429, got ${err.response?.status} for 6th report`);
        }
      }
    }
  }

  if (!rateLimitHit) {
    log.fail('Rate limit test incomplete – could not reach 429. Ensure Redis is running and counter is reset.');
  }

  // Cleanup: – reset Redis counter for next test
  log.info('Done. To reset rate limit for future tests: redis-cli DEL report_limit:12');
})();