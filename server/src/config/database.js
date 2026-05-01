const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool with 10 concurrent connections
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_hire',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('MySQL connection failed:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };