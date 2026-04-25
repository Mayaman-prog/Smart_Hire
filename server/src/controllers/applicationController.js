// Import database connection
const { pool } = require('../config/database');
// Import email service
const { sendEmail } = require('../config/email');

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { user } = req;
    const { jobId, cover_letter } = req.body;
    
    // Check if user is a job seeker
    if (user.role !== 'job_seeker') {
      return res
        .status(403)
        .json({ success: false, message: 'Only job seekers can apply' });
    }

    // Check if already applied to this job
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND user_id = ?',
      [jobId, user.id],
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    // Insert new application with pending status
    await pool.query(
      'INSERT INTO applications (job_id, user_id, cover_letter, status, applied_at) VALUES (?, ?, ?, ?, NOW())',
      [jobId, user.id, cover_letter || '', 'pending'],
    );

    res
      .status(201)
      .json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all applications for the logged-in job seeker
const getMyApplications = async (req, res) => {
  try {
    const { user } = req;
    
    // Only job seekers can view their own applications
    if (user.role !== 'job_seeker') {
      return res.status(403).json({ success: false, message: 'Access denied' });
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
    console.error('getMyApplications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get applications for employer's job postings
const getEmployerApplications = async (req, res) => {
  try {
    const { user } = req;

    // Check if user is an employer
    if (user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Only employers can view these applications',
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
    console.error('Get employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
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
      'pending',
      'reviewed',
      'shortlisted',
      'rejected',
      'hired',
    ];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status',
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
        .json({ success: false, message: 'Application not found' });
    if (apps[0].company_id !== user.company_id && user.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    // Update the status
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [
      status,
      id,
    ]);

    // Send email notification to the job seeker (non‑blocking)
    try {
      // Get applicant email and job title
      const [application] = await pool.query(
        `
        SELECT a.user_id, j.title as job_title
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = ?
        `,
        [id],
      );

      if (application.length > 0) {
        // Fetch user email
        const [userRow] = await pool.query(
          'SELECT email FROM users WHERE id = ?',
          [application[0].user_id],
        );

        if (userRow.length > 0) {
          const subject = `Application Status Update: ${application[0].job_title}`;
          const html = `<p>Your application for <strong>${application[0].job_title}</strong> has been ${status}.</p><p>Log in to your dashboard for more details.</p>`;
          const text = `Your application for ${application[0].job_title} has been ${status}.`;
          // Send email in background
          sendEmail(userRow[0].email, subject, html, text).catch(err =>
            console.error('Failed to send status email:', err)
          );
        }
      }
    } catch (emailError) {
      console.error('Error sending status email:', emailError.message);
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Withdraw application by job seeker
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Find the application
    const [apps] = await pool.query(
      'SELECT user_id FROM applications WHERE id = ?',
      [id],
    );

    if (apps.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Application not found' });
    }

    // Check if user owns the application
    if (apps[0].user_id !== user.id && user.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }
    
    // Delete the application
    await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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