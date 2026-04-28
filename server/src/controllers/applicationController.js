// Import database connection
const { pool } = require("../config/database");
// Import email sending utility
const { addEmailJob } = require("../queues/emailQueue");

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { user } = req;
    const { jobId, cover_letter } = req.body;

    // Check if user is a job seeker
    if (user.role !== "job_seeker") {
      return res
        .status(403)
        .json({ success: false, message: "Only job seekers can apply" });
    }

    // Check if already applied to this job
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

    // Insert new application with pending status
    await pool.query(
      "INSERT INTO applications (job_id, user_id, cover_letter, status, applied_at) VALUES (?, ?, ?, ?, NOW())",
      [jobId, user.id, cover_letter || "", "pending"],
    );

    // Send notification to employer about new applicant (non-blocking)
    try {
      // Employer notification – get job and employer details for email template
      const [jobInfo] = await pool.query(
        `
        SELECT 
          j.title,
          j.company_id,
          c.name AS company_name,
          u.email AS employer_email
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        JOIN users u ON c.id = u.company_id
        WHERE j.id = ? AND u.role = 'employer'
        LIMIT 1
        `,
        [jobId],
      );

      if (jobInfo.length > 0) {
        const { title, company_name, employer_email } = jobInfo[0];
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
            cover_letter_preview:
              (cover_letter || "").substring(0, 100) +
              ((cover_letter?.length || 0) > 100 ? "…" : ""),
            applicants_url: `${process.env.FRONTEND_URL}/dashboard/employer?tab=applicants&jobId=${jobId}`,
          },
        });
      }

      // Job seeker confirmation email with job details using template (non-blocking)
      const [jobDetails] = await pool.query(
        `SELECT j.title, j.location, j.job_type, j.salary_min, j.salary_max, c.name AS company_name
         FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE j.id = ?`,
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
        });
      }
    } catch (emailError) {
      // Rate limit? Return 429 immediately
      if (emailError.statusCode === 429) {
        return res
          .status(429)
          .json({ success: false, message: emailError.message });
      }
      // Otherwise log and continue (the application itself was saved)
      console.error("Failed to enqueue application emails:", emailError);
    }

    // Application was saved successfully
    res
      .status(201)
      .json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all applications for the logged-in job seeker
const getMyApplications = async (req, res) => {
  try {
    const { user } = req;

    // Only job seekers can view their own applications
    if (user.role !== "job_seeker") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Fetch applications with job and company details
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

// Get applications for employer's job postings
const getEmployerApplications = async (req, res) => {
  try {
    const { user } = req;

    // Check if user is an employer
    if (user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Only employers can view these applications",
      });
    }

    const companyId = user.company_id;

    // Get all applications for this company's jobs
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

// Update application status by employer
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { user } = req;

    // List of allowed statuses
    const allowedStatuses = [
      "pending",
      "reviewed",
      "shortlisted",
      "rejected",
      "hired",
    ];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    // Check if application exists and verify employer owns it
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

    // Update the status
    await pool.query("UPDATE applications SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    // Send email notification to the job seeker using template (non‑blocking)
    try {
      // Get applicant details and job info
      const [application] = await pool.query(
        `
        SELECT 
          a.user_id, 
          u.name as job_seeker_name,
          u.email,
          j.title as job_title,
          c.name as company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
        `,
        [id],
      );

      if (application.length > 0) {
        // Map status to color and message
        const statusColorMap = {
          pending: "#f59e0b",
          reviewed: "#3b82f6",
          shortlisted: "#8b5cf6",
          rejected: "#ef4444",
          hired: "#10b981",
        };
        const statusMessageMap = {
          pending: "Your application is pending review.",
          reviewed: "Your application has been reviewed.",
          shortlisted: "Congratulations! You have been shortlisted.",
          rejected:
            "We regret to inform you that your application was not selected.",
          hired: "Welcome aboard! You have been hired.",
        };

        // Prepare email template replacements
        const replacements = {
          user_name: application[0].job_seeker_name,
          job_title: application[0].job_title,
          company_name: application[0].company_name,
          new_status: status.toUpperCase(),
          status_color: statusColorMap[status] || "#2563eb",
          status_message:
            statusMessageMap[status] ||
            "Your application status has been updated.",
          dashboard_url: `${process.env.FRONTEND_URL}/dashboard/seeker`,
        };

        // Enqueue email job with rate limit and retry logic and log the job in the database with userId for tracking and auditing purposes and handle potential rate limit errors gracefully and log any unexpected errors without crashing the status update process and ensure that the status update succeeds even if the email job fails to enqueue (since email sending is a secondary concern and should not block status updates) and provide clear feedback in the response if the email job fails due to rate limiting or other issues, while still returning a successful status update response to the client
        addEmailJob({
          userId: user.id,
          to: application[0].email,
          subject: `Application Status: ${status}`,
          template: "status-change",
          templateData: replacements,
        });
      }
    } catch (emailError) {
      if (emailError.statusCode === 429) {
        return res
          .status(429)
          .json({ success: false, message: emailError.message });
      }
      console.error("Error sending status email:", emailError.message);
    }

    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Withdraw application by job seeker
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    // Find the application
    const [apps] = await pool.query(
      "SELECT user_id FROM applications WHERE id = ?",
      [id],
    );

    if (apps.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Check if user owns the application
    if (apps[0].user_id !== user.id && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Delete the application
    await pool.query("DELETE FROM applications WHERE id = ?", [id]);
    res.json({ success: true, message: "Application withdrawn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export all controller functions
module.exports = {
  applyForJob,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus,
  withdrawApplication,
};
