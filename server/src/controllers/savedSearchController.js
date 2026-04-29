const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get all saved searches for the logged-in user
 * @route   GET /api/saved-searches
 * @param   {Object} req - Express request object containing user info from auth middleware
 * @param   {Object} res - Express response object
 * @returns {JSON} Array of saved searches ordered by most recent
 */
const getSavedSearches = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getSavedSearches error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create a new saved search for the authenticated user
 * @route   POST /api/saved-searches
 * @param   {Object} req - Express request object with search criteria in body
 * @param   {Object} res - Express response object
 * @returns {JSON} Newly created saved search object with ID
 */
const createSavedSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, keyword, location, job_type, salary_min, salary_max, alert_frequency } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Search name is required' });
    }

    const token = uuidv4();

    const [result] = await pool.query(
      `INSERT INTO saved_searches (user_id, name, keyword, location, job_type, salary_min, salary_max, alert_frequency, unsubscribe_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        keyword || null,
        location || null,
        job_type || null,
        salary_min || null,
        salary_max || null,
        alert_frequency || 'instant',
        token
      ]
    );

    const [newSearch] = await pool.query('SELECT * FROM saved_searches WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newSearch[0] });
  } catch (error) {
    console.error('createSavedSearch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update an existing saved search
 * @route   PUT /api/saved-searches/:id
 * @param   {Object} req - Express request object with search ID in params and update fields in body
 * @param   {Object} res - Express response object
 * @returns {JSON} Updated saved search object
 */
const updateSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, keyword, location, job_type, salary_min, salary_max, alert_frequency, is_active } = req.body;

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ success: false, message: 'Search name cannot be empty' });
    }

    const [existing] = await pool.query('SELECT * FROM saved_searches WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (keyword !== undefined) updates.keyword = keyword;
    if (location !== undefined) updates.location = location;
    if (job_type !== undefined) updates.job_type = job_type;
    if (salary_min !== undefined) updates.salary_min = salary_min;
    if (salary_max !== undefined) updates.salary_max = salary_max;
    if (alert_frequency !== undefined) updates.alert_frequency = alert_frequency;
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    await pool.query(`UPDATE saved_searches SET ${setClause} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM saved_searches WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('updateSavedSearch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete a saved search
 * @route   DELETE /api/saved-searches/:id
 * @param   {Object} req - Express request object with search ID in params
 * @param   {Object} res - Express response object
 * @returns {JSON} Success confirmation message
 */
const deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM saved_searches WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    await pool.query('DELETE FROM saved_searches WHERE id = ?', [id]);
    res.json({ success: true, message: 'Saved search deleted' });
  } catch (error) {
    console.error('deleteSavedSearch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Unsubscribe (deactivate) a saved search via unique token
 * @route   GET /api/saved-searches/unsubscribe/:token
 * @access  Public (token-based)
 */
const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM saved_searches WHERE unsubscribe_token = ?',
      [token]
    );
    if (!rows.length) {
      return res.status(404).send('<h2>Invalid unsubscribe link.</h2>');
    }

    await pool.query('UPDATE saved_searches SET is_active = 0 WHERE id = ?', [rows[0].id]);

    res.send(`
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family:sans-serif; padding:2rem; text-align:center;">
          <h2>You've been unsubscribed</h2>
          <p>You will no longer receive job alerts for "${rows[0].name}".</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('unsubscribe error:', error);
    res.status(500).send('Something went wrong.');
  }
};

// Export all controller functions for use in routes
module.exports = {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  unsubscribe
};