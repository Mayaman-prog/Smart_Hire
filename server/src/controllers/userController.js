const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
  try {
    const { user } = req;
    const { name, email, currentPassword, newPassword } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, user.id]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      updates.push('email = ?');
      values.push(email);
    }
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password required' });
      }
      const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [user.id]);
      const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Current password incorrect' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      updates.push('password_hash = ?');
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(user.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT id, email, name, role, company_id FROM users WHERE id = ?', [user.id]);
    res.json({ success: true, data: updated[0], message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // In a real app, you would save the file path in the database
  // For now, just return success
  res.json({ success: true, message: 'Resume uploaded', file: req.file.filename });
};

module.exports = { updateProfile, uploadResume };