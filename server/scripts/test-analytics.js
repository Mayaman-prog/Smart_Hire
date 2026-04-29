const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@smarthire.com';
const ADMIN_PASSWORD = 'password123';

// Utility: coloured console output
const log = {
  pass: (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`),
  fail: (msg) => console.log(`\x1b[31m✕ ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[36m➤ ${msg}\x1b[0m`),
  title: (msg) => console.log(`\n\x1b[33m${'='.repeat(60)}\x1b[0m`),
  data: (label, value) => console.log(`  ${label}: ${value}`),
};

(async () => {
  let token;

  // Login as admin
  log.info('Logging in as admin…');
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    token = loginRes.data.data.token;
    log.pass('Admin login successful');
  } catch (err) {
    log.fail(`Login failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Helper function to fetch and display data
  const fetchAnalytics = async (url, label) => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/analytics/${url}`, authHeader);
      if (res.data.success) {
        console.log(`\x1b[36m➤ ${label}\x1b[0m`);
        console.log(JSON.stringify(res.data.data, null, 2));
        console.log('');
      } else {
        log.fail(`${label}: ${res.data.message}`);
      }
    } catch (err) {
      log.fail(`${label}: ${err.response?.data?.message || err.message}`);
    }
  };

  // Overview
  await fetchAnalytics('overview', 'OVERVIEW – Platform Totals');

  // Timeline
  await fetchAnalytics('timeline?days=7', 'TIMELINE – Daily Growth (last 7 days)');

  // Popular
  await fetchAnalytics('popular', 'POPULAR – Top Job Types, Locations, Categories');

  // Retention
  await fetchAnalytics('retention', 'RETENTION – Active Users & Weekly Cohorts');

  log.info('All analytics endpoints tested.');
})();