const Bull = require('bull');
const { pool } = require('../config/database');
const { sendTemplatedEmail } = require('../services/emailService');

// Initialize Bull queue for email jobs
const emailQueue = new Bull('email', {
  redis: { host: '127.0.0.1', port: 6379 }
});

// Helper functions to log email jobs in the database
async function insertLog(jobId, recipient, subject, template, status, error = null) {
  await pool.execute(
    `INSERT INTO email_logs (job_id, recipient, subject, template, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [jobId, recipient, subject, template, status, error]
  );
}

async function updateLogStatus(jobId, status, error = null) {
  await pool.execute(
    `UPDATE email_logs
        SET status = ?, error_message = ?, attempts = attempts + 1, updated_at = NOW()
      WHERE job_id = ?`,
    [status, error, jobId]
  );
}

// Process email jobs from the queue
emailQueue.process(async (job) => {
  const { to, subject, template, templateData } = job.data;
  const jobId = job.id.toString();

  await updateLogStatus(jobId, 'processing');
  try {
    await sendTemplatedEmail(to, template, templateData, subject);
    await updateLogStatus(jobId, 'sent');
  } catch (err) {
    await updateLogStatus(jobId, 'failed', err.message);
    throw err;
  }
});

// Helper function to add email jobs to the queue and log them in the database
async function addEmailJob(data) {
  const job = await emailQueue.add(data);
  await insertLog(job.id.toString(), data.to, data.subject, data.template, 'queued');
  return job;
}

// Log job completion and failure for monitoring
emailQueue.on('completed', job => console.log(`Email job ${job.id} completed`));
emailQueue.on('failed', (job, err) => console.error(`Email job ${job.id} failed: ${err.message}`));

module.exports = { emailQueue, addEmailJob };