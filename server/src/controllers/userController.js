const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

const updateProfile = async (req, res) => {
  try {
    const { user } = req;
    const {
      name,
      email,
      currentPassword,
      newPassword,
      phone,
      skills,
      experience,
      education,
    } = req.body;

    // Update users table (name, email, password)
    const updates = [];
    const values = [];

    let passwordChanged = false;

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      const [existing] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, user.id],
      );
      if (existing.length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
      updates.push("email = ?");
      values.push(email);
    }
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Current password required" });
      }
      const [rows] = await pool.query(
        "SELECT password_hash FROM users WHERE id = ?",
        [user.id],
      );
      const isValid = await bcrypt.compare(
        currentPassword,
        rows[0].password_hash,
      );
      if (!isValid) {
        return res
          .status(401)
          .json({ success: false, message: "Current password incorrect" });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      updates.push("password_hash = ?");
      values.push(hashed);
      passwordChanged = true;
    }

    // Apply user updates if any
    if (updates.length > 0) {
      values.push(user.id);
      await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );
    }

    // Update job_seekers table (phone, skills, experience, education)
    const seekerUpdates = [];
    const seekerValues = [];

    if (phone !== undefined) {
      seekerUpdates.push("phone = ?");
      seekerValues.push(phone);
    }
    if (skills !== undefined) {
      seekerUpdates.push("skills = ?");
      seekerValues.push(skills);
    }
    if (experience !== undefined) {
      seekerUpdates.push("experience = ?");
      seekerValues.push(experience);
    }
    if (education !== undefined) {
      seekerUpdates.push("education = ?");
      seekerValues.push(education);
    }

    // Only proceed if at least one job_seeker field is provided
    if (seekerUpdates.length > 0) {
      // Check if a job_seeker record exists for this user
      const [existingSeeker] = await pool.query(
        "SELECT id FROM job_seekers WHERE user_id = ?",
        [user.id],
      );

      if (existingSeeker.length > 0) {
        // Update existing record
        const sql = `UPDATE job_seekers SET ${seekerUpdates.join(", ")} WHERE user_id = ?`;
        await pool.query(sql, [...seekerValues, user.id]);
      } else {
        // Insert new record
        // Extract column names from the update strings (e.g., 'phone = ?' -> 'phone')
        const columns = seekerUpdates.map((u) => u.split(" ")[0]);
        const placeholders = columns.map(() => "?");
        const sql = `INSERT INTO job_seekers (user_id, ${columns.join(", ")}) VALUES (?, ${placeholders.join(", ")})`;
        await pool.query(sql, [user.id, ...seekerValues]);
      }
    }

    // Return updated user data
    const [updated] = await pool.query(
      "SELECT id, email, name, role, company_id FROM users WHERE id = ?",
      [user.id],
    );

    if (passwordChanged && req.logAction) {
      req.logAction("PASSWORD_CHANGE", {
        affected_user_id: user.id,
      });
    }

    res.json({
      success: true,
      data: updated[0],
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadResume = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  // In a real app, you would save the file path in the database
  // For now, just return success
  res.json({
    success: true,
    message: "Resume uploaded",
    file: req.file.filename,
  });
};

module.exports = { updateProfile, uploadResume };
