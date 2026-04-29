const { pool } = require("../config/database");

/**
 * @desc    Get overview totals (users, jobs, applications, companies)
 * @route   GET /api/admin/analytics/overview
 * @access  Admin
 */
exports.getOverview = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users",
    );
    const [[{ totalJobs }]] = await pool.query(
      "SELECT COUNT(*) AS totalJobs FROM jobs",
    );
    const [[{ activeJobs }]] = await pool.query(
      "SELECT COUNT(*) AS activeJobs FROM jobs WHERE is_active = 1",
    );
    const [[{ totalApplications }]] = await pool.query(
      "SELECT COUNT(*) AS totalApplications FROM applications",
    );
    const [[{ totalCompanies }]] = await pool.query(
      "SELECT COUNT(*) AS totalCompanies FROM companies",
    );
    const [[{ verifiedCompanies }]] = await pool.query(
      "SELECT COUNT(*) AS verifiedCompanies FROM companies WHERE is_verified = 1",
    );

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        activeJobs,
        totalApplications,
        totalCompanies,
        verifiedCompanies,
      },
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get timeline data (new users/jobs/apps per day for last 30 days)
 * @route   GET /api/admin/analytics/timeline
 * @access  Admin
 */
exports.getTimeline = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [users] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM users
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days],
    );

    const [jobs] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM jobs
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days],
    );

    const [applications] = await pool.query(
      `SELECT DATE(applied_at) AS date, COUNT(*) AS count
       FROM applications
       WHERE applied_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(applied_at)
       ORDER BY date ASC`,
      [days],
    );

    res.json({
      success: true,
      data: {
        users,
        jobs,
        applications,
      },
    });
  } catch (error) {
    console.error("Analytics timeline error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get popular job types and locations
 * @route   GET /api/admin/analytics/popular
 * @access  Admin
 */
exports.getPopular = async (req, res) => {
  try {
    const [jobTypes] = await pool.query(
      `SELECT job_type, COUNT(*) AS count
       FROM jobs
       WHERE is_active = 1
       GROUP BY job_type
       ORDER BY count DESC
       LIMIT 10`,
    );

    const [locations] = await pool.query(
      `SELECT location, COUNT(*) AS count
       FROM jobs
       WHERE is_active = 1 AND location IS NOT NULL
       GROUP BY location
       ORDER BY count DESC
       LIMIT 10`,
    );

    const [categories] = await pool.query(
      `SELECT jc.name AS category, COUNT(*) AS count
       FROM jobs j
       JOIN job_categories jc ON j.category_id = jc.id
       WHERE j.is_active = 1
       GROUP BY jc.name
       ORDER BY count DESC
       LIMIT 10`,
    );

    res.json({
      success: true,
      data: {
        jobTypes,
        locations,
        categories,
      },
    });
  } catch (error) {
    console.error("Analytics popular error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get retention data (active users over time, cohort-like)
 * @route   GET /api/admin/analytics/retention
 * @access  Admin
 */
exports.getRetention = async (req, res) => {
  try {
    const [[{ activeUsers }]] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS activeUsers
       FROM activity_logs
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
    );

    const [[{ inactiveUsers }]] = await pool.query(
      `SELECT COUNT(*) AS inactiveUsers
       FROM users
       WHERE id NOT IN (
         SELECT DISTINCT user_id FROM activity_logs
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       )`,
    );

    const [weeklyCohorts] = await pool.query(
      `SELECT
         YEARWEEK(created_at, 1) AS week,
         MIN(DATE(created_at)) AS week_start,
         COUNT(*) AS new_users
       FROM users
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
       GROUP BY YEARWEEK(created_at, 1)
       ORDER BY week ASC`,
    );

    res.json({
      success: true,
      data: {
        activeUsers,
        inactiveUsers,
        weeklyCohorts,
      },
    });
  } catch (error) {
    console.error("Analytics retention error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get KPI data for admin dashboard (4 cards with percent change)
 * @route   GET /api/admin/analytics/kpi
 * @access  Admin
 */
exports.getKPIs = async (req, res) => {
  try {
    // Current totals
    const [[current]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'job_seeker') AS totalUsers,
        (SELECT COUNT(*) FROM jobs WHERE is_active = 1) AS totalJobs,
        (SELECT COUNT(*) FROM applications) AS totalApps,
        (SELECT COUNT(*) FROM job_reports WHERE status = 'pending') AS totalReports
    `);

    // Totals from 7 days ago (created before 7 days ago)
    const [[previous]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'job_seeker' AND created_at < NOW() - INTERVAL 7 DAY) AS prevUsers,
        (SELECT COUNT(*) FROM jobs WHERE is_active = 1 AND created_at < NOW() - INTERVAL 7 DAY) AS prevJobs,
        (SELECT COUNT(*) FROM applications WHERE applied_at < NOW() - INTERVAL 7 DAY) AS prevApps,
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

    res.json({
      success: true,
      data: { kpi },
    });
  } catch (error) {
    console.error("Analytics KPI error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
