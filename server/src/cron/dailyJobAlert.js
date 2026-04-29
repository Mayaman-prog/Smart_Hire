const cron = require('node-cron');
const { pool } = require('../config/database');
const { addEmailJob } = require('../queues/emailQueue');

// Format salary for display
function formatSalary(min, max) {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;
  if (!hasMin && !hasMax) return 'Negotiable';
  if (hasMin && !hasMax) return `$${Number(min).toLocaleString()}+`;
  if (!hasMin && hasMax) return `Up to $${Number(max).toLocaleString()}`;
  return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
}

function buildDigestHtml(search, jobs, unsubscribeLink, frontendUrl) {
  const jobCards = jobs.map(job => `
    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin-bottom:12px;">
      <h3 style="margin:0 0 4px;">${job.title}</h3>
      <p style="margin:0; color:#6b7280;">${job.company_name} · ${job.location || 'Remote'}</p>
      <p style="margin:8px 0;">${formatSalary(job.salary_min, job.salary_max)}</p>
      <a href="${frontendUrl}/jobs/${job.id}" style="display:inline-block; background:#2563eb; color:white; padding:8px 16px; border-radius:4px; text-decoration:none;">View Job</a>
    </div>
  `).join('');

  return `
    <html>
    <head><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;}</style></head>
    <body style="max-width:600px; margin:auto; padding:20px;">
      <h2>New Jobs Matching "${search.name}"</h2>
      <p>We found ${jobs.length} new job(s) since your last alert.</p>
      ${jobCards}
      <hr style="margin:20px 0;">
      <p style="color:#6b7280; font-size:14px;">
        <a href="${unsubscribeLink}" style="color:#dc2626;">Unsubscribe</a> from these alerts.
      </p>
    </body>
    </html>
  `;
}

function startDailyJobAlert() {
  // Schedule every day at 08:00
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running daily job alert');
    try {
      // Get last run timestamp
      const [cronRows] = await pool.query("SELECT last_run FROM cron_state WHERE job_name = 'daily_job_alert'");
      const lastRun = cronRows.length ? new Date(cronRows[0].last_run) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Fetch active daily saved searches
      const [searches] = await pool.query(
        `SELECT * FROM saved_searches WHERE is_active = 1 AND alert_frequency = 'daily'`
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      for (const search of searches) {
        // Build job query based on search criteria
        const conditions = ['j.is_active = 1', 'j.created_at > ?'];
        const params = [lastRun];

        if (search.keyword) {
          conditions.push('(j.title LIKE ? OR j.description LIKE ?)');
          params.push(`%${search.keyword}%`, `%${search.keyword}%`);
        }
        if (search.location) {
          conditions.push('j.location = ?');
          params.push(search.location);
        }
        if (search.job_type) {
          conditions.push('j.job_type = ?');
          params.push(search.job_type);
        }
        if (search.salary_min) {
          conditions.push('j.salary_max >= ?');
          params.push(search.salary_min);
        }
        if (search.salary_max) {
          conditions.push('j.salary_min <= ?');
          params.push(search.salary_max);
        }

        const query = `
          SELECT j.*, c.name AS company_name
          FROM jobs j
          JOIN companies c ON j.company_id = c.id
          WHERE ${conditions.join(' AND ')}
          ORDER BY j.created_at DESC
          LIMIT 20
        `;

        const [jobs] = await pool.query(query, params);
        if (jobs.length === 0) continue;

        // Build unsubscribe link and send email
        const unsubscribeLink = `${frontendUrl}/api/saved-searches/unsubscribe/${search.unsubscribe_token}`;
        const emailHtml = buildDigestHtml(search, jobs, unsubscribeLink, frontendUrl);

        // Get user email
        const [user] = await pool.query('SELECT email FROM users WHERE id = ?', [search.user_id]);
        if (user.length) {
          await addEmailJob({
            to: user[0].email,
            subject: `New jobs for "${search.name}"`,
            html: emailHtml,
          });
        }
      }

      // Update last run timestamp
      await pool.query("UPDATE cron_state SET last_run = NOW() WHERE job_name = 'daily_job_alert'");
      console.log('[Cron] Daily job alert finished');
    } catch (err) {
      console.error('[Cron] Error in daily job alert:', err);
    }
  });
}

module.exports = startDailyJobAlert;