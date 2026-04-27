require('dotenv').config();

// This worker listens to the 'email' queue and processes email sending jobs.
const emailQueue = require('../src/queues/emailQueue');

console.log('Email worker started, waiting for jobs...');

// Graceful shutdown on SIGTERM (e.g., when stopping the server)
process.on('SIGTERM', async () => {
  console.log('Shutting down email worker...');
  await emailQueue.close();
  process.exit(0);
});