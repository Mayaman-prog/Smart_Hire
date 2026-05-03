const { parseAdvancedQuery } = require('../src/utils/searchParser');
const { pool } = require('../src/config/database');
const fetch = require('node-fetch');

// COLOR OUTPUT
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const print = (msg, color = '') => console.log(`${color}${msg}${COLORS.reset}`);

// UNIT TESTS: parseAdvancedQuery
const runParserTests = () => {
  console.log('\n' + '='.repeat(60));
  print('UNIT TESTS: parseAdvancedQuery()', COLORS.cyan);
  console.log('='.repeat(60));

  const tests = [
    { input: 'react OR vue', expected: 'react | vue' },
    { input: 'react AND vue', expected: 'react vue' },
    { input: '"senior dev"', expected: '"senior dev"' },
    { input: 'react -vue', expected: 'react -vue' },
    { input: '"senior dev" OR lead -junior', expected: '"senior dev" | lead -junior' },
    { input: '   react  OR  vue   ', expected: 'react | vue' },
    { input: ' react AND vue OR angular ', expected: 'react vue | angular' },
    { input: '""', expected: '""' },
    { input: '', expected: '' },
    { input: '   ', expected: '' },
  ];

  let passCount = 0;
  tests.forEach(({ input, expected }) => {
    const result = parseAdvancedQuery(input);
    const pass = result === expected;
    if (pass) passCount++;
    const icon = pass ? '✅' : '❌';
    const color = pass ? COLORS.green : COLORS.red;
    print(`${icon} Input: "${input}" → Result: "${result}" ${pass ? '' : `(Expected: "${expected}")`}`, color);
  });

  print(`\n Parser tests: ${passCount}/${tests.length} passed`, COLORS.green);
  return passCount === tests.length;
};

// LIVE API TESTS (requires server running on localhost:5000)
const runLiveApiTests = async (skipLive) => {
  if (skipLive) {
    print('\n Skipping live API tests (--skip-live passed)', COLORS.yellow);
    return true;
  }

  console.log('\n' + '='.repeat(60));
  print('LIVE API TESTS: GET /api/jobs', COLORS.cyan);
  console.log('='.repeat(60));

  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

  // Ensure the server is reachable
  try {
    await fetch(`${baseUrl}/api/jobs?limit=1`);
  } catch (err) {
    print(`\n Server unreachable at ${baseUrl}. Please start the server first.`, COLORS.red);
    print('   Or use --skip-live to test only the parser.', COLORS.yellow);
    return false;
  }

  const testQueries = [
    { label: 'Exact phrase', q: '"senior developer"' },
    { label: 'Exclude (-)', q: 'react -vue' },
    { label: 'OR', q: 'react OR vue' },
    { label: 'AND (explicit)', q: 'react AND vue' },
    { label: 'Mixed operators', q: '"senior dev" OR lead -junior' },
  ];

  let passCount = 0;
  for (const t of testQueries) {
    try {
      const url = `${baseUrl}/api/jobs?search=${encodeURIComponent(t.q)}&sort=relevance&limit=5`;
      print(`\n Testing: ${t.label} (${t.q})`, COLORS.cyan);

      const response = await fetch(url);
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        print(`OK - ${json.data.length} results (total: ${json.total})`, COLORS.green);
        passCount++;
      } else {
        print(`Unexpected response structure`, COLORS.red);
        console.log(json);
      }
    } catch (err) {
      print(`Error: ${err.message}`, COLORS.red);
    }
  }

  print(`\n Live API tests: ${passCount}/${testQueries.length} passed`, COLORS.green);
  return passCount === testQueries.length;
};

// MAIN
const main = async () => {
  const args = process.argv.slice(2);
  const skipLive = args.includes('--skip-live');

  print('\n Advanced Search Operator Test Runner\n', COLORS.cyan);

  // Parser tests
  const parserOk = runParserTests();

  // Live API tests
  const liveOk = await runLiveApiTests(skipLive);

  // Final result
  console.log('\n' + '='.repeat(60));
  if (parserOk && (skipLive || liveOk)) {
    print('ALL TESTS PASSED', COLORS.green);
    process.exit(0);
  } else {
    print('SOME TESTS FAILED', COLORS.red);
    process.exit(1);
  }
};

main().catch((err) => {
  print(`\n Fatal error: ${err.message}`, COLORS.red);
  process.exit(1);
});