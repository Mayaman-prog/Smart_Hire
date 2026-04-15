const { pool } = require("../config/database");

const saveJob = async (req, res) => {
  try {
    const { user } = req;
    const { jobId } = req.body;
    if (!jobId)
      return res
        .status(400)
        .json({ success: false, message: "Job ID required" });
    const [existing] = await pool.query(
      "SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?",
      [user.id, jobId],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Job already saved" });
    }
    await pool.query(
      "INSERT INTO saved_jobs (user_id, job_id, saved_at) VALUES (?, ?, NOW())",
      [user.id, jobId],
    );
    res.status(201).json({ success: true, message: "Job saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== "job_seeker") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Check if saved_jobs table exists
    const [tableCheck] = await pool.query("SHOW TABLES LIKE 'saved_jobs'");
    if (tableCheck.length === 0) {
      console.error("saved_jobs table does not exist");
      return res
        .status(500)
        .json({ success: false, message: "Database setup incomplete" });
    }

    const [saved] = await pool.query(
      `
      SELECT 
        sj.id as saved_id, sj.saved_at,
        j.id, j.title, j.salary_min, j.salary_max, j.location, j.job_type,
        c.id as company_id, c.name as company_name, c.logo_url
      FROM saved_jobs sj
      LEFT JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE sj.user_id = ?
      ORDER BY sj.saved_at DESC
    `,
      [user.id],
    );

    res.json({ success: true, data: saved });
  } catch (error) {
    console.error("getSavedJobs error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    const { user } = req;
    const { jobId } = req.params;
    const [result] = await pool.query(
      "DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?",
      [user.id, jobId],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Saved job not found" });
    }
    res.json({ success: true, message: "Job removed from saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { saveJob, getSavedJobs, removeSavedJob };
