const { pool } = require("../config/database");

// @desc    Get employer dashboard summary
// @route   GET /api/employer/dashboard-summary
// @access  Private (employer only)
const getEmployerDashboardSummary = async (req, res) => {
  try {
    const { user } = req;

    if (!user.company_id) {
      return res.status(400).json({
        success: false,
        message: "Employer is not associated with any company",
      });
    }

    const companyId = user.company_id;

    // Job stats for this employer
    const [jobStatsRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS totalJobs,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activeJobs
      FROM jobs
      WHERE company_id = ?
      `,
      [companyId],
    );

    // Applicant stats for this employer's jobs
    const [applicantStatsRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS totalApplicants,
        SUM(CASE WHEN a.status = 'reviewed' THEN 1 ELSE 0 END) AS reviewedApplicants,
        SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlistedApplicants,
        SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) AS hiredApplicants
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE j.company_id = ?
      `,
      [companyId],
    );

    // Recent jobs posted by this employer
    const [recentJobs] = await pool.query(
      `
      SELECT
        id,
        title,
        location,
        job_type,
        salary_min,
        salary_max,
        is_active,
        created_at
      FROM jobs
      WHERE company_id = ?
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [companyId],
    );

    // Recent applicants for this employer's jobs
    const [recentApplicants] = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.applied_at,
        u.id AS user_id,
        u.name AS applicant_name,
        u.email AS applicant_email,
        j.id AS job_id,
        j.title AS job_title
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.user_id = u.id
      WHERE j.company_id = ?
      ORDER BY a.applied_at DESC
      LIMIT 5
      `,
      [companyId],
    );

    const jobStats = jobStatsRows[0] || {};
    const applicantStats = applicantStatsRows[0] || {};

    return res.status(200).json({
      success: true,
      data: {
        totalJobs: Number(jobStats.totalJobs || 0),
        activeJobs: Number(jobStats.activeJobs || 0),
        totalApplicants: Number(applicantStats.totalApplicants || 0),
        reviewedApplicants: Number(applicantStats.reviewedApplicants || 0),
        shortlistedApplicants: Number(
          applicantStats.shortlistedApplicants || 0,
        ),
        hiredApplicants: Number(applicantStats.hiredApplicants || 0),
        recentJobs,
        recentApplicants,
      },
    });
  } catch (error) {
    console.error("Error fetching employer dashboard summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employer dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getEmployerDashboardSummary,
};
