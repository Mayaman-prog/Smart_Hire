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

async function connectDB() {
  db = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to database');
}

async function checkFulltextIndex() {
  console.log('\n Checking FULLTEXT index on jobs table...');
  const [rows] = await db.execute(
    `SHOW INDEX FROM jobs WHERE Key_name = 'ft_search' AND Index_type = 'FULLTEXT'`
  );
  if (rows.length > 0) {
    console.log('FULLTEXT index "ft_search" exists on jobs(title, description, requirements)');
  } else {
    console.log(' FULLTEXT index "ft_search" NOT found. Run: ALTER TABLE jobs ADD FULLTEXT INDEX ft_search (title, description, requirements);');
  }
}

async function testSearch(searchTerm, sort = 'relevance', additionalParams = {}) {
  const params = new URLSearchParams({
    search: searchTerm,
    sort,
    limit: 5,
    ...additionalParams,
  }).toString();

  const url = `${API_BASE}/jobs?${params}`;
  console.log(`\n Testing: ${url}`);

  try {
    const res = await axios.get(url);
    const jobs = res.data.data;
    const total = res.data.total;

    console.log(`Found ${jobs.length} jobs (total: ${total})`);
    if (jobs.length > 0) {
      console.log(`   First job: "${jobs[0].title}" (relevance_score: ${jobs[0].relevance_score || 'N/A'})`);
    }
    return res.data;
  } catch (error) {
    console.error('Request failed:', error.response?.data || error.message);
    return null;
  }
}

async function testLegacyKeyword(keyword) {
  const url = `${API_BASE}/jobs?keyword=${encodeURIComponent(keyword)}&limit=3`;
  console.log(`\n Testing legacy keyword search: ${url}`);

  try {
    const res = await axios.get(url);
    const jobs = res.data.data;
    console.log(`Found ${jobs.length} jobs using keyword search`);
    return res.data;
  } catch (error) {
    console.error('Request failed:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  await connectDB();
  await checkFulltextIndex();

  console.log('\n Running FULLTEXT search tests...');

  // Basic search
  await testSearch('React');

  // Search with filter + relevance sort
  await testSearch('developer', 'relevance', { location: 'Remote', job_type: 'full-time' });

  // Search with pagination
  await testSearch('engineer', 'relevance', { page: 2, limit: 2 });

  // Search with salary filter
  await testSearch('senior', 'relevance', { min_salary: 80000 });

  // Legacy keyword search (backward compatibility)
  await testLegacyKeyword('React');

  // Test relevance score ordering (compare first two results)
  console.log('\n Verifying relevance score ordering...');
  const res1 = await testSearch('React developer', 'relevance', { limit: 3 });
  if (res1 && res1.data.length >= 2) {
    const score1 = res1.data[0].relevance_score || 0;
    const score2 = res1.data[1].relevance_score || 0;
    if (score1 >= score2) {
      console.log(`Relevance scores are ordered correctly: ${score1} >= ${score2}`);
    } else {
      console.log(`Relevance scores not ordered correctly: ${score1} < ${score2}`);
    }
  }

  // Edge case: empty search term
  console.log('\n Testing empty search term...');
  const emptyRes = await testSearch('', 'relevance');
  if (emptyRes && emptyRes.data.length > 0) {
    console.log(`Empty search returned jobs (fallback to default sort)`);
  }

  // Edge case: search term with no matches
  console.log('\n Testing search term with no matches...');
  const noMatchRes = await testSearch('xyzabc123nonexistent', 'relevance');
  if (noMatchRes && noMatchRes.data.length === 0) {
    console.log(`Search with no matches returned empty array`);
  }

  await db.end();
  console.log('\n FULLTEXT search tests completed.');
}

runTests().catch(console.error);