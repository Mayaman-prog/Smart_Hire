const { pool } = require('../config/database');

// USER MANAGEMENT
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, email, name, role, company_id, is_active, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'User banned' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'User unbanned' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// COMPANY MANAGEMENT
const getAllCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query(`
      SELECT c.*, COUNT(j.id) as jobs_count
      FROM companies c
      LEFT JOIN jobs j ON j.company_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verification is a simple flag update, but in a real application, you might want to add more complex logic (e.g., sending notification emails, logging actions, etc.)
const verifyCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE companies SET is_verified = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Company verified' });
  } catch (error) {
    console.error('Verify company error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Soft delete could be implemented by setting an 'is_deleted' flag instead of actually deleting the record
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM companies WHERE id = ?', [id]);
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// JOB MODERATION
const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT j.*, c.name as company_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC
    `);
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Feature a job by setting an 'is_featured' flag
const featureJob = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE jobs SET is_featured = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Job featured' });
  } catch (error) {
    console.error('Feature job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Unfeaturing a job simply sets the 'is_featured' flag back to 0
const unfeatureJob = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE jobs SET is_featured = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Job unfeatured' });
  } catch (error) {
    console.error('Unfeature job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Soft delete could be implemented by setting an 'is_deleted' flag instead of actually deleting the record
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN DASHBOARD STATS
const getAdminStats = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [jobs] = await pool.query('SELECT COUNT(*) AS total FROM jobs');
    const [companies] = await pool.query('SELECT COUNT(*) AS total FROM companies');
    const [applications] = await pool.query('SELECT COUNT(*) AS total FROM applications');

    // Applications by status (for charts)
    const [applicationsByStatus] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM applications
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        users: users[0].total,
        jobs: jobs[0].total,
        companies: companies[0].total,
        applications: applications[0].total,
        applicationsByStatus
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats'
    });
  }
};

/**
 * GET /admin/analytics/kpi
 * Returns KPI cards: total users, active jobs, applications, pending reports
 * with percentage change vs previous week
 */
const getKPIs = async (req, res) => {
  try {
    // Current totals
    const [[current]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'jobseeker') AS totalUsers,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') AS totalJobs,
        (SELECT COUNT(*) FROM applications) AS totalApps,
        (SELECT COUNT(*) FROM job_reports WHERE status = 'pending') AS totalReports
    `);

    // Totals from 7 days ago (anything created before 7 days ago)
    const [[previous]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'jobseeker' AND created_at < NOW() - INTERVAL 7 DAY) AS prevUsers,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active' AND created_at < NOW() - INTERVAL 7 DAY) AS prevJobs,
        (SELECT COUNT(*) FROM applications WHERE created_at < NOW() - INTERVAL 7 DAY) AS prevApps,
        (SELECT COUNT(*) FROM job_reports WHERE status = 'pending' AND created_at < NOW() - INTERVAL 7 DAY) AS prevReports
    `);

    const kpi = [
      {
        label: 'Total Users',
        value: current.totalUsers,
        change: previous.prevUsers > 0 
          ? ((current.totalUsers - previous.prevUsers) / previous.prevUsers * 100).toFixed(1)
          : 0
      },
      {
        label: 'Active Jobs',
        value: current.totalJobs,
        change: previous.prevJobs > 0 
          ? ((current.totalJobs - previous.prevJobs) / previous.prevJobs * 100).toFixed(1)
          : 0
      },
      {
        label: 'Applications',
        value: current.totalApps,
        change: previous.prevApps > 0 
          ? ((current.totalApps - previous.prevApps) / previous.prevApps * 100).toFixed(1)
          : 0
      },
      {
        label: 'Pending Reports',
        value: current.totalReports,
        change: previous.prevReports > 0 
          ? ((current.totalReports - previous.prevReports) / previous.prevReports * 100).toFixed(1)
          : 0
      }
    ];

    res.json({ success: true, data: { kpi } });
  } catch (error) {
    console.error('KPI error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch KPI data' });
  }
};

/** 
 * GET /admin/analytics/timeline?days=30
 * Returns daily counts for users and jobs over the last N days
 */
const getTimeline = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(CASE WHEN role = 'jobseeker' THEN 1 END) as users,
        COUNT(CASE WHEN table_name = 'jobs' THEN 1 END) as jobs
      FROM (
        SELECT created_at, 'users' as table_name, role FROM users
        UNION ALL
        SELECT created_at, 'jobs' as table_name, NULL FROM jobs
      ) combined
      WHERE created_at >= NOW() - INTERVAL ? DAY
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);

    const dates = rows.map(r => r.date);
    const users = rows.map(r => r.users);
    const jobs = rows.map(r => r.jobs);

    res.json({ success: true, data: { dates, users, jobs } });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline data' });
  }
};

/**
 * GET /admin/analytics/popular?type=job_types
 * Returns top job types with counts for pie chart
 */
const getPopular = async (req, res) => {
  const type = req.query.type || 'job_types';
  try {
    if (type === 'job_types') {
      const [rows] = await pool.query(`
        SELECT job_type as name, COUNT(*) as count
        FROM jobs
        WHERE status = 'active'
        GROUP BY job_type
        ORDER BY count DESC
        LIMIT 10
      `);
      return res.json({ success: true, data: { jobTypes: rows } });
    }

    res.status(400).json({ success: false, message: 'Unsupported popular type' });
  } catch (error) {
    console.error('Popular error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch popular data' });
  }
};

module.exports = {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  getAllCompanies,
  verifyCompany,
  deleteCompany,
  getAllJobs,
  featureJob,
  unfeatureJob,
  deleteJob,
  getAdminStats
};