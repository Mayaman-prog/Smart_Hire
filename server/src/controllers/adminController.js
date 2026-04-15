const { pool } = require("../config/database");

// @desc Get all users
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, name, email, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ success: true, data: users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Toggle user active status
// @route PATCH /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      "SELECT is_active FROM users WHERE id = ?",
      [id],
    );

    if (!users.length) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newStatus = users[0].is_active ? 0 : 1;

    await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    res.json({
      success: true,
      message: "User status updated",
      is_active: newStatus,
    });
  } catch (error) {
    console.error("toggleUserStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Get all jobs (admin)
// @route GET /api/admin/jobs
const getAllJobsAdmin = async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT
        j.id,
        j.title,
        j.location,
        j.job_type,
        j.is_active,
        j.created_at,
        c.name AS company_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC
    `);

    res.json({ success: true, data: jobs });
  } catch (err) {
    console.error("getAllJobsAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Delete job (admin)
// @route DELETE /api/admin/jobs/:id
const deleteJobAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM jobs WHERE id = ?", [id]);

    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    console.error("deleteJobAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Get all companies
// @route GET /api/admin/companies
const getAllCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query(`
      SELECT id, name, location, created_at
      FROM companies
      ORDER BY created_at DESC
    `);

    res.json({ success: true, data: companies });
  } catch (err) {
    console.error("getAllCompanies error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getLastNMonths = (count = 6) => {
  const months = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    months.push({ key, label });
  }

  return months;
};

const getAdminStatsOverview = async (req, res) => {
  try {
    const [userRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%b') AS month, COUNT(*) AS users
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);

    const [jobRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%b') AS month, COUNT(*) AS jobs
      FROM jobs
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);

    const monthOrder = [];
    const monthMap = {};

    [...userRows, ...jobRows].forEach((row) => {
      if (!monthMap[row.month]) {
        monthMap[row.month] = { month: row.month, users: 0, jobs: 0 };
        monthOrder.push(row.month);
      }
    });

    userRows.forEach((row) => {
      monthMap[row.month].users = Number(row.users);
    });

    jobRows.forEach((row) => {
      monthMap[row.month].jobs = Number(row.jobs);
    });

    res.json({
      success: true,
      data: {
        growth: monthOrder.map((m) => monthMap[m]),
      },
    });
  } catch (error) {
    console.error("getAdminStatsOverview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
  toggleUserStatus,
  getAdminStatsOverview,
};
