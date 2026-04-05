const { Sequelize } = require('sequelize');

// Initialize MySQL connection with hardcoded credentials
const sequelize = new Sequelize(
  'smarthire',
  'root',
  '',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Test database connection and exit if fails
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully to database: smarthire');
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };