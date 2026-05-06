const { pool } = require('../config/database');

class UserService {
  async findOrCreateGoogleUser(profile) {
    const { id, emails, name } = profile;
    const email = emails?.[0]?.value;
    const fullName = name?.givenName + ' ' + name?.familyName || profile.displayName;

    if (!email) {
      throw new Error('No email returned from Google');
    }

    // Check if user already has this google_id
    const [existing] = await pool.query(`SELECT * FROM users WHERE google_id = ?`, [id]);
    if (existing.length > 0) {
      return existing[0];
    }

    // Check if user exists by email (link account)
    const [emailUser] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (emailUser.length > 0) {
      await pool.query(`UPDATE users SET google_id = ? WHERE id = ?`, [id, emailUser[0].id]);
      const [updated] = await pool.query(`SELECT * FROM users WHERE id = ?`, [emailUser[0].id]);
      return updated[0];
    }

    // Create new user as job_seeker
    const [result] = await pool.query(
      `INSERT INTO users (email, name, role, google_id, is_active, created_at) 
       VALUES (?, ?, 'job_seeker', ?, 1, NOW())`,
      [email, fullName, id]
    );
    const [newUser] = await pool.query(`SELECT * FROM users WHERE id = ?`, [result.insertId]);
    return newUser[0];
  }
}

module.exports = new UserService();