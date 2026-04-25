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

// =COMPANY MANAGEMENT

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