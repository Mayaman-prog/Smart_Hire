const Bull = require('bull');
const Redis = require('ioredis');
const { pool } = require('../config/database');
const { sendTemplatedEmail } = require('../services/emailService');

// Redis client for rate limiting – reuse Bull’s Redis connection values for consistency
const redis = new Redis({ host: '127.0.0.1', port: 6379 });

const RATE_LIMIT = 10;           // max emails per window
const RATE_LIMIT_WINDOW = 60;    // 60 seconds

// Bull queue for processing email jobs with Redis connection details defined here for clarity and reuse (also used in addEmailJob function)
const emailQueue = new Bull('email', {
  redis: { host: '127.0.0.1', port: 6379 }
});

// Custom retry backoff (1min, 5min, 15min)
const retryBackoff = (attemptsMade) => {
  switch (attemptsMade) {
    case 0: return 60 * 1000;      // 1 minute
    case 1: return 5 * 60 * 1000;  // 5 minutes
    case 2: return 15 * 60 * 1000; // 15 minutes
    default: return 60 * 1000;
  }
};

// Database helpers (now include user_id)
async function insertLog(jobId, recipient, subject, template, userId, status, error = null) {
  await pool.execute(
    `INSERT INTO email_logs (job_id, recipient, subject, template, user_id, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [jobId, recipient, subject, template, userId, status, error]
  );
}

// Update log status for a job (called at start of each attempt and on failure)
async function updateLogStatus(jobId, status, error = null) {
  await pool.execute(
    `UPDATE email_logs
        SET status = ?, error_message = ?, attempts = attempts + 1, updated_at = NOW()
      WHERE job_id = ?`,
    [status, error, jobId]
  );
}

// Rate limiting function – checks if user has exceeded email sending limit in the current window
async function checkEmailRateLimit(userId) {
  const key = `email_limit:${userId}`;
  const current = await redis.incr(key);

  // Set expiration on first increment (when current goes from 0 to 1)
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }

  return current <= RATE_LIMIT;
}

// Add email job with rate limit & retry logic
async function addEmailJob(data) {
  const { userId, to, subject, template, templateData } = data;

  // Check rate limit before adding job to queue
  const allowed = await checkEmailRateLimit(userId);
  if (!allowed) {
    const err = new Error('Too many emails. Limit is 10 per minute.');
    err.statusCode = 429;
    throw err;
  }

  // Add job to Bull WITH retry settings and custom backoff function and log the job in the database with initial status "queued"
  const job = await emailQueue.add(
    { to, subject, template, templateData, userId },
    {
      attempts: 4,
      backoff: {
        type: 'custom',
        delay: retryBackoff
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  );

  // Log initial "queued" status with userId for rate limit tracking and auditing purposes
  await insertLog(job.id.toString(), to, subject, template, userId, 'queued');

  return job;
}

// Process email jobs (Bull processor)
emailQueue.process(async (job) => {
  const { to, subject, template, templateData } = job.data;
  const jobId = job.id.toString();

  // Update status to 'processing' at the start of each attempt (so we can track retries and current state in the logs)
  await updateLogStatus(jobId, 'processing');

  try {
    await sendTemplatedEmail(to, template, templateData, subject);
    await updateLogStatus(jobId, 'sent');
  } catch (err) {
    await updateLogStatus(jobId, 'failed', err.message);
    throw err;  
  }
});

// Final failure handler (after all retries exhausted)
emailQueue.on('failed', async (job, err) => {
  const { to, subject, userId } = job.data;
  const jobId = job.id.toString();

  // The last attempt already updated the log to 'failed' – we can add final error if necessary
  // But it's safe to set the final status explicitly:
  await pool.execute(
    `UPDATE email_logs SET status = 'failed', error_message = ?, updated_at = NOW()
      WHERE job_id = ?`,
    [err.message, jobId]
  );

  // Send admin alert (ignoring failures so we don't create a loop)
  try {
    await sendTemplatedEmail(
      process.env.ADMIN_EMAIL,
      'admin-alert',
      {
        adminMessage: `Email permanently failed after 3 retries.\nJobId: ${jobId}\nRecipient: ${to}\nSubject: ${subject}\nError: ${err.message}`
      },
      'Email delivery failed permanently'
    );
  } catch (alertErr) {
    console.error('Failed to send admin alert email:', alertErr);
  }
});

// Job event logging
emailQueue.on('completed', job => console.log(`Email job ${job.id} completed`));

module.exports = { emailQueue, addEmailJob };