const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJhZG1pbkBzbWFydGhpcmUuY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueV9pZCI6bnVsbCwiaWF0IjoxNzc3NDgyMjczLCJleHAiOjE3Nzc1Njg2NzN9.WoEcXwXGrGsnEIl6YU4BP_9JUne3v1eU1Ep0jupqEM4';

const API_URL = 'http://localhost:5000/api/admin/analytics/kpi';

async function testKPI() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing KPI endpoint:', error.message);
  }
}

testKPI();