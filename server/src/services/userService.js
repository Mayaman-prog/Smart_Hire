const { pool } = require("../config/database");

class UserService {
  async findOrCreateGoogleUser(profile) {
    const { id, emails, name } = profile;
    const email = emails?.[0]?.value;
    const fullName =
      name?.givenName + " " + name?.familyName || profile.displayName;

    if (!email) {
      throw new Error("No email returned from Google");
    }

    // Check if user already has this google_id
    const [existing] = await pool.query(
      `SELECT * FROM users WHERE google_id = ?`,
      [id],
    );
    if (existing.length > 0) {
      return existing[0];
    }

    // Check if user exists by email (link account)
    const [emailUser] = await pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email],
    );
    if (emailUser.length > 0) {
      await pool.query(`UPDATE users SET google_id = ? WHERE id = ?`, [
        id,
        emailUser[0].id,
      ]);
      const [updated] = await pool.query(`SELECT * FROM users WHERE id = ?`, [
        emailUser[0].id,
      ]);
      return updated[0];
    }

    // Create new user as job_seeker
    const [result] = await pool.query(
      `INSERT INTO users (email, name, role, google_id, is_active, created_at) 
       VALUES (?, ?, 'job_seeker', ?, 1, NOW())`,
      [email, fullName, id],
    );
    const [newUser] = await pool.query(`SELECT * FROM users WHERE id = ?`, [
      result.insertId,
    ]);
    return newUser[0];
  }

  // Link Google account to an existing user
  async linkGoogleAccount(userId, googleId, ip, userAgent) {
    // Check if this Google account is already linked to another user
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE google_id = ? AND id != ?",
      [googleId, userId],
    );
    if (existing.length > 0) {
      throw new Error("This Google account is already linked to another user.");
    }

    // Check if already linked to current user
    const [alreadyLinked] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND google_id = ?",
      [userId, googleId],
    );
    if (alreadyLinked.length > 0) {
      throw new Error("This Google account is already linked to your profile.");
    }

    // Link the Google account
    await pool.query("UPDATE users SET google_id = ? WHERE id = ?", [
      googleId,
      userId,
    ]);

    // Log the action
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)",
      [userId, "link_google", ip, userAgent],
    );

    return { success: true };
  }

  // Unlink a social account
  async unlinkSocialAccount(userId, provider, ip, userAgent) {
    const [userResult] = await pool.query(
      "SELECT password_hash, google_id, linkedin_id FROM users WHERE id = ?",
      [userId],
    );
    const user = userResult[0];
    if (!user) {
      throw new Error("User not found");
    }

    // Count login methods
    let loginMethods = 0;
    if (user.password_hash) loginMethods++;
    if (user.google_id) loginMethods++;
    if (user.linkedin_id) loginMethods++;

    if (loginMethods <= 1) {
      throw new Error(
        "You cannot unlink your only login method. Please set a password or link another social account first.",
      );
    }

    let updateField = "";
    if (provider === "google") {
      // Check if google_id actually exists before unlinking
      if (!user.google_id) {
        throw new Error("Google account is not linked to this user.");
      }
      updateField = "google_id = NULL";
    } else if (provider === "linkedin") {
      if (!user.linkedin_id) {
        throw new Error("LinkedIn account is not linked to this user.");
      }
      updateField = "linkedin_id = NULL";
    } else {
      throw new Error('Invalid provider. Use "google" or "linkedin".');
    }

    await pool.query(`UPDATE users SET ${updateField} WHERE id = ?`, [userId]);

    // Log the action using the passed ip and userAgent (NOT req)
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)",
      [userId, `unlink_${provider}`, ip, userAgent],
    );

    return { success: true };
  }
}

module.exports = new UserService();
