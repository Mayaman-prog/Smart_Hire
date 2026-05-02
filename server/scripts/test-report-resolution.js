const fetch = require('node-fetch');

// CONFIGURATION
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJhZG1pbkBzbWFydGhpcmUuY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueV9pZCI6bnVsbCwiaWF0IjoxNzc3NjU2ODQxLCJleHAiOjE3Nzc3NDMyNDF9.lnVZC1gr00DIia5IRfBC1jWC5jyezVd0z3rIsfQPk7o';
const BASE_URL = 'http://localhost:5000/api';

// ARGUMENTS
const reportId = process.argv[2];
const status = process.argv[3] || 'removed';
const note = process.argv[4] || 'Tested via script';

if (!reportId) {
  console.error('Please provide a report ID as the first argument.');
  process.exit(1);
}

async function testResolveReport() {
  console.log(`\n Testing report resolution...`);
  console.log(`   Report ID: ${reportId}`);
  console.log(`   Status: ${status}`);
  console.log(`   Note: ${note}`);

  try {
    const url = `${BASE_URL}/admin/reports/${reportId}/status`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, resolutionNote: note })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`Success: ${data.message}`);
    } else {
      console.error(`Failed: ${data.message || 'Unknown error'}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function testGetReports() {
  console.log(`\n Fetching all reports...`);
  try {
    const url = `${BASE_URL}/admin/reports?page=1&limit=5`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`Found ${data.data.length} reports (total: ${data.pagination.total})`);
      data.data.forEach(r => {
        console.log(`   - #${r.id}: ${r.job_title} (${r.status}) — ${r.reporter_name}`);
      });
    } else {
      console.error(`Failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testGetStats() {
  console.log(`\n Fetching report statistics...`);
  try {
    const url = `${BASE_URL}/admin/reports/stats`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Stats:', data.data);
    } else {
      console.error(`Failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function run() {
  console.log('\n Starting report resolution tests...\n');
  await testResolveReport();
  await testGetReports();
  await testGetStats();
  console.log('\n All tests completed.\n');
}

run();