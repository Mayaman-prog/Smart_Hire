const { pool } = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const { user } = req;
    const [notifications] = await pool.query(`
      SELECT id, title, message, type, is_read, link, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [user.id]);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, user.id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getNotifications, markAsRead };