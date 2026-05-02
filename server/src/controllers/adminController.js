const { pool } = require("../config/database");

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
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE users SET is_active = 0 WHERE id = ?", [id]);
    res.json({ success: true, message: "User banned" });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE users SET is_active = 1 WHERE id = ?", [id]);
    res.json({ success: true, message: "User unbanned" });
  } catch (error) {
    console.error("Unban user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
    console.error("Get all companies error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE companies SET is_verified = 1 WHERE id = ?", [id]);
    res.json({ success: true, message: "Company verified" });
  } catch (error) {
    console.error("Verify company error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM companies WHERE id = ?", [id]);
    res.json({ success: true, message: "Company deleted" });
  } catch (error) {
    console.error("Delete company error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
    console.error("Get all jobs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const featureJob = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE jobs SET is_featured = 1 WHERE id = ?", [id]);
    res.json({ success: true, message: "Job featured" });
  } catch (error) {
    console.error("Feature job error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const unfeatureJob = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE jobs SET is_featured = 0 WHERE id = ?", [id]);
    res.json({ success: true, message: "Job unfeatured" });
  } catch (error) {
    console.error("Unfeature job error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM jobs WHERE id = ?", [id]);
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN DASHBOARD STATS
const getAdminStats = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT COUNT(*) AS total FROM users");
    const [jobs] = await pool.query("SELECT COUNT(*) AS total FROM jobs");
    const [companies] = await pool.query(
      "SELECT COUNT(*) AS total FROM companies",
    );
    const [applications] = await pool.query(
      "SELECT COUNT(*) AS total FROM applications",
    );

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
        applicationsByStatus,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch admin stats" });
  }
};

// KPI, Timeline, Popular (analytics)
const getKPIs = async (req, res) => {
  try {
    const [[current]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'jobseeker') AS totalUsers,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') AS totalJobs,
        (SELECT COUNT(*) FROM applications) AS totalApps,
        (SELECT COUNT(*) FROM job_reports WHERE status = 'pending') AS totalReports
    `);

    const [[previous]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'jobseeker' AND created_at < NOW() - INTERVAL 7 DAY) AS prevUsers,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active' AND created_at < NOW() - INTERVAL 7 DAY) AS prevJobs,
        (SELECT COUNT(*) FROM applications WHERE created_at < NOW() - INTERVAL 7 DAY) AS prevApps,
        (SELECT COUNT(*) FROM job_reports WHERE status = 'pending' AND created_at < NOW() - INTERVAL 7 DAY) AS prevReports
    `);

    const kpi = [
      {
        label: "Total Users",
        value: current.totalUsers,
        change:
          previous.prevUsers > 0
            ? (
                ((current.totalUsers - previous.prevUsers) /
                  previous.prevUsers) *
                100
              ).toFixed(1)
            : 0,
      },
      {
        label: "Active Jobs",
        value: current.totalJobs,
        change:
          previous.prevJobs > 0
            ? (
                ((current.totalJobs - previous.prevJobs) / previous.prevJobs) *
                100
              ).toFixed(1)
            : 0,
      },
      {
        label: "Applications",
        value: current.totalApps,
        change:
          previous.prevApps > 0
            ? (
                ((current.totalApps - previous.prevApps) / previous.prevApps) *
                100
              ).toFixed(1)
            : 0,
      },
      {
        label: "Pending Reports",
        value: current.totalReports,
        change:
          previous.prevReports > 0
            ? (
                ((current.totalReports - previous.prevReports) /
                  previous.prevReports) *
                100
              ).toFixed(1)
            : 0,
      },
    ];

    res.json({ success: true, data: { kpi } });
  } catch (error) {
    console.error("KPI error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch KPI data" });
  }
};

const getTimeline = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  try {
    const [rows] = await pool.query(
      `
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
    `,
      [days],
    );

    const dates = rows.map((r) => r.date);
    const users = rows.map((r) => r.users);
    const jobs = rows.map((r) => r.jobs);

    res.json({ success: true, data: { dates, users, jobs } });
  } catch (error) {
    console.error("Timeline error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch timeline data" });
  }
};

const getPopular = async (req, res) => {
  const type = req.query.type || "job_types";
  try {
    if (type === "job_types") {
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
    res
      .status(400)
      .json({ success: false, message: "Unsupported popular type" });
  } catch (error) {
    console.error("Popular error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch popular data" });
  }
};

// JOB REPORTS (job seeker reports on jobs)
const getJobReports = async (req, res) => {
  try {
    const { status, reason, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT r.id, r.reason, r.status, r.created_at, r.resolved_at,
             j.title AS job_title, j.id AS job_id,
             u.name AS reporter_name, u.email AS reporter_email,
             admin.name AS resolver_name
      FROM job_reports r
      JOIN jobs j ON r.job_id = j.id
      JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users admin ON r.resolved_by = admin.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += " AND r.status = ?";
      params.push(status);
    }
    if (reason) {
      sql += " AND r.reason LIKE ?";
      params.push(`%${reason}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM job_reports r WHERE 1=1 ${status ? "AND status = ?" : ""} ${reason ? "AND reason LIKE ?" : ""}`,
      params,
    );
    const total = countResult[0].total;

    sql += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(sql, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get job reports error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getJobReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const [report] = await pool.query(
      `SELECT r.id, r.reason, r.status, r.created_at, r.resolved_at, r.resolution_notes,
              j.title AS job_title, j.id AS job_id,
              u.name AS reporter_name, u.email AS reporter_email,
              admin.name AS resolver_name
       FROM job_reports r
       JOIN jobs j ON r.job_id = j.id
       JOIN users u ON r.reporter_id = u.id
       LEFT JOIN users admin ON r.resolved_by = admin.id
       WHERE r.id = ?`,
      [id],
    );

    if (!report || report.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    res.json({ success: true, data: report[0] });
  } catch (error) {
    console.error("Get job report by ID error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin resolves report by approving, removing job, or dismissing report
const updateJobReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body; // 'approved', 'removed', 'dismissed'
    const adminId = req.user.id;

    const allowed = ["approved", "removed", "dismissed"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const [report] = await pool.query(
      `SELECT r.id, r.reason, r.status AS old_status,
              j.title AS job_title, j.id AS job_id,
              u.id AS reporter_id, u.name AS reporter_name, u.email AS reporter_email
       FROM job_reports r
       JOIN jobs j ON r.job_id = j.id
       JOIN users u ON r.reporter_id = u.id
       WHERE r.id = ?`,
      [id],
    );

    if (!report || report.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    const reportData = report[0];
    if (reportData.old_status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Report already resolved (status: ${reportData.old_status})`,
        });
    }

    await pool.query(
      `UPDATE job_reports
       SET status = ?, resolved_at = NOW(), resolved_by = ?, resolution_notes = ?
       WHERE id = ?`,
      [status, adminId, resolutionNote || null, id],
    );

    if (status === "removed") {
      await pool.query("UPDATE jobs SET is_active = 0 WHERE id = ?", [
        reportData.job_id,
      ]);
    }

    const resolutionLabels = {
      approved: "Approved – No action taken",
      removed: "Job Removed",
      dismissed: "Dismissed – No violation found",
    };

    const emailData = {
      reporterName: reportData.reporter_name,
      jobTitle: reportData.job_title,
      reason: reportData.reason,
      resolutionLabel: resolutionLabels[status],
      resolutionNote: resolutionNote || null,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/jobseeker`,
    };

    const { addEmailJob } = require("../queues/emailQueue");
    await addEmailJob({
      userId: reportData.reporter_id,
      to: reportData.reporter_email,
      subject: `Report update: ${resolutionLabels[status]}`,
      template: "report-resolution",
      templateData: emailData,
    });

    res.json({
      success: true,
      message: "Report resolved and reporter notified",
    });
  } catch (error) {
    console.error("Update job report status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getJobReportStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'removed' THEN 1 ELSE 0 END) AS removed,
        SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) AS dismissed
      FROM job_reports
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error("Get job report stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// EXPORTS
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
  getAdminStats,
  getKPIs,
  getTimeline,
  getPopular,
  getJobReports,
  getJobReportById,
  updateJobReportStatus,
  getJobReportStats,
};
