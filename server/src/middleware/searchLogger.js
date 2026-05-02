const { pool } = require('../config/database');

// Middleware to log search terms
const searchLogger = async (req, res, next) => {
  if (req.method === 'GET' && req.query.search) {
    try {
      const searchTerm = req.query.search;
      const userId = req.user ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;

    //   Log the search term in the database
      await pool.execute(
        `INSERT INTO search_logs (search_term, user_id, ip_address, result_count) 
         VALUES (?, ?, ?, 0)`,
        [searchTerm, userId, ipAddress]
      );
      console.log(`Search logged: "${searchTerm}"`);
    } catch (error) {
      console.error('Search logging failed:', error.message);
    }
  }
  next();
};

module.exports = searchLogger;