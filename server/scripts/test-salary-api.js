const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_TITLE = 'Frontend Developer';
const TEST_LOCATION = 'Remote';
const TEST_MONTHS = 6;

/* Test the salary estimate endpoint */
async function testSalaryEstimate() {
  console.log('\n Testing GET /salary/estimate...');
  try {
    const response = await axios.get(`${API_BASE_URL}/salary/estimate`, {
      params: {
        title: TEST_TITLE,
        location: TEST_LOCATION,
      },
    });

    const data = response.data;
    console.log(' Status:', response.status);
    console.log(' Data:', data);

    // Validate response structure
    if (typeof data.average !== 'number') throw new Error('average is not a number');
    if (typeof data.median !== 'number') throw new Error('median is not a number');
    if (typeof data.p25 !== 'number') throw new Error('p25 is not a number');
    if (typeof data.p75 !== 'number') throw new Error('p75 is not a number');
    if (typeof data.sampleCount !== 'number') throw new Error('sampleCount is not a number');

    console.log(' All fields validated.');
    return true;
  } catch (error) {
    console.error(' Error testing /salary/estimate:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

/* Test the salary trend endpoint */
async function testSalaryTrend() {
  console.log('\n Testing GET /salary/trend...');
  try {
    const response = await axios.get(`${API_BASE_URL}/salary/trend`, {
      params: {
        title: TEST_TITLE,
        location: TEST_LOCATION,
        months: TEST_MONTHS,
      },
    });

    const data = response.data;
    console.log(' Status:', response.status);
    console.log(' Trend data:', data.trend);
    console.log(' Percentiles:', data.percentiles);

    // Validate response structure
    if (!Array.isArray(data.trend)) throw new Error('trend is not an array');
    if (data.trend.length > 0) {
      const first = data.trend[0];
      if (typeof first.month !== 'string') throw new Error('trend item missing month');
      if (typeof first.avg !== 'number') throw new Error('trend item missing avg');
    }

    const p = data.percentiles;
    if (typeof p.p25 !== 'number') throw new Error('p25 is not a number');
    if (typeof p.p50 !== 'number') throw new Error('p50 is not a number');
    if (typeof p.p75 !== 'number') throw new Error('p75 is not a number');

    console.log(' All fields validated.');
    return true;
  } catch (error) {
    console.error(' Error testing /salary/trend:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

/* Run all tests */
async function runTests() {
  console.log(' Starting salary API tests...');
  const estimateOk = await testSalaryEstimate();
  const trendOk = await testSalaryTrend();

  console.log('\n Summary:');
  console.log(`  /salary/estimate: ${estimateOk ? ' PASS' : ' FAIL'}`);
  console.log(`  /salary/trend:    ${trendOk ? ' PASS' : ' FAIL'}`);

  if (estimateOk && trendOk) {
    console.log('\n All salary API tests passed!');
  } else {
    console.log('\n Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { testSalaryEstimate, testSalaryTrend };