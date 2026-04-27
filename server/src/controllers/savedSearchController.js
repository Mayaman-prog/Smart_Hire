// Import database connection pool for querying saved searches
const { pool } = require('../config/database');

/**
 * @desc    Get all saved searches for the logged-in user
 * @route   GET /api/saved-searches
 * @param   {Object} req - Express request object containing user info from auth middleware
 * @param   {Object} res - Express response object
 * @returns {JSON} Array of saved searches ordered by most recent
 */
const getSavedSearches = async (req, res) => {
  try {
    // Query database for all saved searches belonging to the authenticated user
    // Sort by creation date in descending order (newest first)
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
    // Destructure search criteria from request body
    const { name, keyword, location, job_type, salary_min, salary_max, alert_frequency } = req.body;

    // Validate that search name is provided and not empty
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Search name is required' });
    }

    // Insert new saved search into database with user ID and provided criteria
    // Default alert_frequency to 'instant' if not specified
    // Optional fields are set to null if not provided
    const [result] = await pool.query(
      `INSERT INTO saved_searches (user_id, name, keyword, location, job_type, salary_min, salary_max, alert_frequency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name.trim(),
        keyword || null,
        location || null,
        job_type || null,
        salary_min || null,
        salary_max || null,
        alert_frequency || 'instant'
      ]
    );

    // Retrieve and return the newly created search with its generated ID
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

    // Validate name if provided - ensure it's not empty string
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ success: false, message: 'Search name cannot be empty' });
    }

    // Verify that the saved search exists and belongs to the authenticated user (ownership check)
    const [existing] = await pool.query('SELECT * FROM saved_searches WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    // Build dynamic update object containing only the fields that were provided
    // This allows for partial updates without overwriting unspecified fields
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (keyword !== undefined) updates.keyword = keyword;
    if (location !== undefined) updates.location = location;
    if (job_type !== undefined) updates.job_type = job_type;
    if (salary_min !== undefined) updates.salary_min = salary_min;
    if (salary_max !== undefined) updates.salary_max = salary_max;
    if (alert_frequency !== undefined) updates.alert_frequency = alert_frequency;
    if (is_active !== undefined) updates.is_active = is_active;

    // Ensure at least one field was provided to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    // Dynamically build SET clause for SQL UPDATE query based on provided fields
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    // Execute the dynamic UPDATE query with only provided fields
    await pool.query(`UPDATE saved_searches SET ${setClause} WHERE id = ?`, values);

    // Retrieve and return the updated search record
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

    // Verify ownership - ensure the saved search exists and belongs to the authenticated user
    const [existing] = await pool.query('SELECT * FROM saved_searches WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    // Delete the saved search from the database
    await pool.query('DELETE FROM saved_searches WHERE id = ?', [id]);
    res.json({ success: true, message: 'Saved search deleted' });
  } catch (error) {
    console.error('deleteSavedSearch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export all controller functions for use in routes
module.exports = {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch
};