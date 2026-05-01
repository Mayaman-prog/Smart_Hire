const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_hire',
};

let db;

// Helper: Connect to database
async function connectDB() {
  db = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to database');
}

// Helper: Clear and populate `search_logs` with test data
async function resetSearchLogs() {
  console.log('Clearing and populating search_logs...');
  await db.execute('DELETE FROM search_logs');
  await db.execute(`
    INSERT INTO search_logs (search_term, user_id, result_count) VALUES
    ('react', NULL, 5),
    ('react developer', NULL, 3),
    ('python', NULL, 2),
    ('full stack', NULL, 4),
    ('React Native', NULL, 1)
  `);
  console.log('search_logs populated with test data');
}

// Helper: Test endpoint
async function testSuggestions(query, expectedFirst = null) {
  const url = `${API_BASE}/search/suggest?q=${encodeURIComponent(query)}`;
  console.log(`\n Suggestions for "${query}"`);

  try {
    const res = await axios.get(url);
    const data = res.data.data;

    if (data.length === 0) {
      console.log(`No suggestions found (as expected)`);
    } else {
      console.log(`Found ${data.length} suggestions:`);
      data.forEach((term, i) => console.log(`      ${i + 1}. "${term}"`));
    }

    if (expectedFirst !== null) {
      if (data.length > 0 && data[0] === expectedFirst) {
        console.log(`First suggestion matches expected: "${expectedFirst}"`);
      } else if (data.length > 0) {
        console.log(`Expected first suggestion "${expectedFirst}", got "${data[0]}"`);
      } else {
        console.log(`Expected first suggestion "${expectedFirst}", but got none`);
      }
    }

    return data;
  } catch (error) {
    console.error(`Error: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

// Main test function 
async function runTests() {
  console.log('\n Testing Suggest Endpoint (Typo Tolerance & Autocomplete)');

  await connectDB();
  await resetSearchLogs();

  // Prefix match (should return "react" and "react developer")
  await testSuggestions('rea', 'react');

  // Prefix match with capitalisation
  await testSuggestions('React', 'react');

  // Typo tolerance using SOUNDEX
  await testSuggestions('reac', 'react');

  // Partial match with no results
  await testSuggestions('xyz', null);

  // Empty query (should return empty)
  await testSuggestions('', null);

  // Single character query (should return empty)
  await testSuggestions('r', null);

  console.log('\n All suggestion tests completed.\n');
  await db.end();
}

// Run the tests
runTests().catch((err) => {
  console.error('Test failed:', err);
});