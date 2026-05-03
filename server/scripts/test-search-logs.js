const axios = require('axios');
const mysql = require('mysql2/promise');

// Configuration
const API_URL = 'http://localhost:5000/api';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_hire',
  port: process.env.DB_PORT || 3306
};

// Test search term – change this to a job title that actually exists in your DB
const TEST_SEARCH_TERM = 'React';

console.log('\n Starting Search Logging & Highlighting Test...\n');

async function testSearchLogging() {
  let db = null;
  try {
    // 1. Connect to the database
    console.log('Connecting to database...');
    db = await mysql.createConnection(DB_CONFIG);
    console.log('Database connected successfully.\n');

    // 2. Clear old logs for the test term (optional – to make it cleaner)
    await db.execute(`DELETE FROM search_logs WHERE search_term = ?`, [TEST_SEARCH_TERM]);

    // 3. Perform a search request via the API
    console.log(`Searching for: "${TEST_SEARCH_TERM}"`);
    const response = await axios.get(`${API_URL}/jobs`, {
      params: { search: TEST_SEARCH_TERM, limit: 10 }
    });

    const { data: result } = response;
    console.log(`API Response Status: ${response.status}`);
    console.log(`Total jobs found: ${result.total}`);

    // 4. Check if relevance_score is present (FULLTEXT is active)
    if (result.data && result.data.length > 0) {
      const firstJob = result.data[0];
      if (firstJob.hasOwnProperty('relevance_score')) {
        console.log('FULLTEXT search is working! "relevance_score" field present.');
      } else {
        console.warn('"relevance_score" not found. Ensure FULLTEXT search is enabled.');
      }
    } else {
      console.warn('No jobs found for this search term. It might not exist in your database.');
    }

    // 5. Verify that the search term was logged in the database
    const [logEntries] = await db.execute(
      `SELECT * FROM search_logs WHERE search_term = ? ORDER BY created_at DESC LIMIT 1`,
      [TEST_SEARCH_TERM]
    );

    if (logEntries.length > 0) {
      const log = logEntries[0];
      console.log('\n Search Log Entry Found:');
      console.log(`ID: ${log.id}`);
      console.log(`Search Term: "${log.search_term}"`);
      console.log(`Result Count: ${log.result_count}`);
      console.log(`User ID: ${log.user_id || 'Guest'}`);
      console.log(`IP Address: ${log.ip_address || 'N/A'}`);
      console.log(`Created At: ${log.created_at}`);
      console.log('Search logging is working correctly!');
    } else {
      console.error('No search log entry found for the test term.');
      console.log('Possible issues:');
      console.log('The search logging middleware might not be attached.');
      console.log('The search term might not have triggered the logging logic.');
      console.log('The INSERT INTO search_logs query is failing.');
    }

    // 6. Provide a direct query to check the table manually
    console.log('\n You can also check the search_logs table manually with:');
    console.log(`SELECT * FROM search_logs WHERE search_term LIKE '%${TEST_SEARCH_TERM}%' ORDER BY created_at DESC;`);

  } catch (error) {
    console.error('\n Test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || 'Unknown error'}`);
      console.error(`URL: ${error.config?.url}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to the server. Make sure the backend is running on port 5000.');
    } else {
      console.error(`   ${error.message}`);
    }
    console.error('\n Troubleshooting tips:');
    console.error('Is the server running? Run `npm run dev` in the server folder.');
    console.error('Has the search_logs table been created? Run the schema script.');
    console.error('Is the search parameter being sent correctly? Check your axios call.');
  } finally {
    if (db) await db.end();
    console.log('\n Test completed.');
  }
}

// Run the test
testSearchLogging();