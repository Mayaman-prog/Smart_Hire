const { pool } = require("../config/database");
const { addEmailJob } = require("../queues/emailQueue");

const applyForJobService = async (user, jobId, coverLetter) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Check job
    const [job] = await conn.query("SELECT id FROM jobs WHERE id = ?", [
      jobId,
    ]);

    if (!job.length) throw new Error("JOB_NOT_FOUND");

    // Check duplicate
    const [existing] = await conn.query(
      "SELECT id FROM applications WHERE job_id = ? AND user_id = ?",
      [jobId, user.id]
    );

    if (existing.length) throw new Error("ALREADY_APPLIED");

    // Insert
    await conn.query(
      `INSERT INTO applications (job_id, user_id, cover_letter, status, applied_at)
       VALUES (?, ?, ?, 'pending', NOW())`,
      [jobId, user.id, coverLetter]
    );

    await conn.commit();

    // EMAIL (non-blocking)
    addEmailJob({
      userId: user.id,
      to: user.email,
      subject: "Application Received",
      template: "application-confirmation",
      templateData: {
        user_name: user.name,
      },
    }).catch(() => {});

    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { applyForJobService };