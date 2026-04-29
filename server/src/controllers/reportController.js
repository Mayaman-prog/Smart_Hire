const { pool } = require('../config/database');
const redis = require('../config/redis');

// Controller for reporting a job posting as inappropriate or fraudulent by a user. This includes input validation, rate limiting, and duplicate report prevention.
exports.reportJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId, reason, description } = req.body;

    // 1. Input validation
    if (!jobId || !reason) {
      return res.status(400).json({ success: false, message: 'Job ID and reason are required.' });
    }

    const validReasons = ['spam', 'fraud', 'inappropriate', 'duplicate', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid reason.' });
    }

    // 2. Rate limit: maximum 5 reports per user per 24 hours
    const rateKey = `report_limit:${userId}`;
    const reportCount = parseInt(await redis.get(rateKey)) || 0;
    if (reportCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'You have reached the maximum number of reports. Please try again later.'
      });
    }

    // 3. Duplicate check (frontend disables button, this is a safety net)
    const [existing] = await pool.query(
      'SELECT id FROM job_reports WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );
    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: 'You have already reported this job.'
      });
    }

    // Insert the report
    await pool.query(
      'INSERT INTO job_reports (job_id, user_id, reason, description) VALUES (?, ?, ?, ?)',
      [jobId, userId, reason, description || null]
    );

    // Increment rate counter (set TTL to 24h on first use)
    const multi = redis.multi();
    multi.incr(rateKey);
    if (reportCount === 0) {
      multi.expire(rateKey, 24 * 60 * 60);
    }
    await multi.exec();

    res.status(201).json({ success: true, message: 'Report submitted successfully.' });
  } catch (error) {
    console.error('reportJob error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};