const { pool } = require("../config/database");
const { addEmailJob } = require("../queues/emailQueue");

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { user } = req;
    const { jobId, cover_letter, coverLetter } = req.body;

    const finalCoverLetter = String(cover_letter || coverLetter || "").trim();

    // Validate jobId
    if (!jobId || isNaN(Number(jobId))) {
      return res.status(400).json({
        success: false,
        message: "Valid jobId is required",
      });
    }

    // Check job exists
    const [jobExists] = await pool.query("SELECT id FROM jobs WHERE id = ?", [
      jobId,
    ]);

    if (jobExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Role check
    if (user.role !== "job_seeker") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can apply",
      });
    }

    // Duplicate check
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

    // Insert application
    await pool.query(
      `INSERT INTO applications (job_id, user_id, cover_letter, status, applied_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [jobId, user.id, finalCoverLetter, "pending"],
    );

    // EMAIL SECTION (safe)
    try {
      // Employer email
      const [jobInfo] = await pool.query(
        `
        SELECT j.title, c.name AS company_name, u.email AS employer_email
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        JOIN users u ON u.company_id = c.id AND u.role = 'employer'
        WHERE j.id = ?
        LIMIT 1
        `,
        [jobId],
      );

      if (jobInfo.length > 0) {
        const { title, company_name, employer_email } = jobInfo[0];

        const coverPreview =
          finalCoverLetter.slice(0, 100) +
          (finalCoverLetter.length > 100 ? "…" : "");

        await addEmailJob({
          userId: user.id,
          to: employer_email,
          subject: `New applicant for ${title}`,
          template: "new-applicant",
          templateData: {
            company_name,
            job_title: title,
            applicant_name: user.name,
            applicant_email: user.email,
            applied_date: new Date().toLocaleDateString(),
            cover_letter_preview: coverPreview,
            applicants_url: `${process.env.FRONTEND_URL}/dashboard/employer?tab=applicants&jobId=${jobId}`,
          },
        }).catch((err) => {
          console.error("Employer email queue failed:", err.message);
        });
      }

      // Job seeker email
      const [jobDetails] = await pool.query(
        `
        SELECT j.title, j.location, j.job_type, j.salary_min, j.salary_max, c.name AS company_name
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
        `,
        [jobId],
      );

      if (jobDetails.length > 0) {
        const job = jobDetails[0];

        const salaryRange =
          job.salary_min && job.salary_max
            ? `$${job.salary_min} - $${job.salary_max}`
            : "Not specified";

        await addEmailJob({
          userId: user.id,
          to: user.email,
          subject: "Application Received",
          template: "application-confirmation",
          templateData: {
            user_name: user.name,
            job_title: job.title,
            company_name: job.company_name,
            job_location: job.location,
            job_type: job.job_type,
            salary_range: salaryRange,
            dashboard_url: `${process.env.FRONTEND_URL}/dashboard/seeker`,
          },
        }).catch((err) => {
          console.error("Seeker email queue failed:", err.message);
        });
      }
    } catch (emailError) {
      console.error("Email system error:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Apply error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get my applications
const getMyApplications = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== "job_seeker") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        a.id AS application_id,
        a.status,
        a.applied_at,
        a.cover_letter,
        j.id AS job_id,
        j.title AS job_title,
        j.location,
        j.salary_min,
        j.salary_max,
        j.job_type,
        j.is_featured,
        c.name AS company_name,
        c.logo_url
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
      `,
      [user.id],
    );

    // Transform to nested job object for JobCard
    const applications = rows.map(row => ({
      application_id: row.application_id,
      status: row.status,
      applied_at: row.applied_at,
      cover_letter: row.cover_letter,
      job: {
        id: row.job_id,
        title: row.job_title,
        company_name: row.company_name,
        logo_url: row.logo_url,
        location: row.location,
        salary_min: row.salary_min,
        salary_max: row.salary_max,
        job_type: row.job_type || 'full-time', // fallback if null
        is_featured: row.is_featured === 1 || row.is_featured === true
      }
    }));

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Employer applications
const getEmployerApplications = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Only employers allowed",
      });
    }

    const [applications] = await pool.query(
      `
      SELECT a.*, u.name AS applicant_name, u.email AS applicant_email,
             j.title AS job_title
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      WHERE j.company_id = ?
      ORDER BY a.applied_at DESC
      `,
      [user.company_id],
    );

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body.status || "")
      .trim()
      .toLowerCase();
    const { user } = req;

    const allowedStatuses = [
      "pending",
      "reviewed",
      "shortlisted",
      "rejected",
      "hired",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const [apps] = await pool.query(
      `SELECT a.id, j.company_id FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [id],
    );

    if (apps.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (apps[0].company_id !== user.company_id && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
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

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const [apps] = await pool.query(
      "SELECT user_id FROM applications WHERE id = ?",
      [id],
    );

    if (apps.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (apps[0].user_id !== user.id && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
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
