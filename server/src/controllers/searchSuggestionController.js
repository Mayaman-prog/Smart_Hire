const { pool } = require('../config/database');

// @desc    Get autocomplete suggestions based on partial input (with typo tolerance)
// @route   GET /api/search/suggest
// @access  Public
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const term = q.trim();

    // Prefix match from search_logs (fastest)
    const [prefixMatches] = await pool.query(
      `SELECT DISTINCT search_term, COUNT(*) as freq
       FROM search_logs
       WHERE search_term LIKE ?
       GROUP BY search_term
       ORDER BY freq DESC, search_term ASC
       LIMIT 10`,
      [`${term}%`]
    );

    if (prefixMatches.length > 0) {
      return res.json({
        success: true,
        data: prefixMatches.map(row => row.search_term)
      });
    }

    // No prefix match – use SOUNDEX for typo tolerance
    const [soundexMatches] = await pool.query(
      `SELECT DISTINCT search_term, COUNT(*) as freq
       FROM search_logs
       WHERE SOUNDEX(search_term) = SOUNDEX(?)
       GROUP BY search_term
       ORDER BY freq DESC, search_term ASC
       LIMIT 5`,
      [term]
    );

    if (soundexMatches.length > 0) {
      return res.json({
        success: true,
        data: soundexMatches.map(row => row.search_term)
      });
    }

    // Fallback – suggest from job titles directly
    const [jobTitleMatches] = await pool.query(
      `SELECT DISTINCT title as search_term
       FROM jobs
       WHERE SOUNDEX(title) = SOUNDEX(?)
          OR title LIKE ?
       LIMIT 5`,
      [term, `%${term}%`]
    );

    const suggestions = jobTitleMatches.map(row => row.search_term);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};