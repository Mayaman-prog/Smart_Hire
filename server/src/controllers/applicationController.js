const { pool } = require("../config/database");

// @desc    Apply for a job
// @route   POST /api/applications/apply
const applyForJob = async (req, res) => {
  try {
    const { user } = req;
    const { jobId, cover_letter } = req.body;
    if (user.role !== "job_seeker") {
      return res
        .status(403)
        .json({ success: false, message: "Only job seekers can apply" });
    }

    // Check if already applied
    const [existing] = await pool.query(
      "SELECT id FROM applications WHERE job_id = ? AND user_id = ?",
      [jobId, user.id],
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    await pool.query(
      "INSERT INTO applications (job_id, user_id, cover_letter, status, applied_at) VALUES (?, ?, ?, ?, NOW())",
      [jobId, user.id, cover_letter || "", "pending"],
    );

    res
      .status(201)
      .json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Get applications for logged in job seeker
// @route GET /api/applications/my
// @access Private (job seeker)
const getMyApplications = async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== "job_seeker") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [applications] = await pool.query(
      `
      SELECT 
        a.id, a.job_id, a.status, a.cover_letter, a.applied_at, a.updated_at,
        j.title as job_title, j.location, j.salary_min, j.salary_max,
        c.id as company_id, c.name as company_name, c.logo_url
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
    `,
      [user.id],
    );

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error("getMyApplications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get applications for employer's jobs
// @route GET /api/applications/employer
// @access Private (employer)
const getEmployerApplications = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Only employers can view these applications",
      });
    }

    const companyId = user.company_id;

    const [applications] = await pool.query(
      `
      SELECT 
        a.id,
        a.status,
        a.applied_at,
        a.user_id,
        u.name AS applicant_name,
        u.email AS applicant_email,
        j.id AS job_id,
        j.title AS job_title
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.user_id = u.id
      WHERE j.company_id = ?
      ORDER BY a.applied_at DESC
      `,
      [companyId],
    );

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get employer applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// @desc Update application status (employer only)
// @route PUT /api/applications/:id/status
// @access Private (employer)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { user } = req;

    const allowedStatuses = [
      "pending",
      "reviewed",
      "shortlisted",
      "rejected",
      "hired",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const [apps] = await pool.query(
      `
      SELECT a.id, j.company_id FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `,
      [id],
    );
    if (apps.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    if (apps[0].company_id !== user.company_id && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    await pool.query("UPDATE applications SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Withdraw application (job seeker only)
// @route DELETE /api/applications/:id
// @access Private (job seeker)
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const [apps] = await pool.query(
      "SELECT user_id FROM applications WHERE id = ?",
      [id],
    );

    if (apps.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (apps[0].user_id !== user.id && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    await pool.query("DELETE FROM applications WHERE id = ?", [id]);
    res.json({ success: true, message: "Application withdrawn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus,
  withdrawApplication,
};
