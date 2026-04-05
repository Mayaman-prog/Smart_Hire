const express = require('express');
const cors = require('cors');
const { connectDB } = require('./database/connection');
const User = require('./src/models/User');

const app = express();

// Connect to MySQL database
connectDB();

// Middleware setup
app.use(cors());
app.use(express.json());

// Sync database tables (creates/updates tables based on models)
const syncDatabase = async () => {
  try {
    await User.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Database sync error:', error);
  }
};
syncDatabase();

// Root route - check server status
app.get('/', (req, res) => {
  res.send('SmartHire Backend Running with MySQL');
});

// Test route - verify backend and database connection
app.get('/api/test', async (req, res) => {
  try {
    const userCount = await User.count();
    res.json({ 
      message: 'Backend is working',
      database: 'Connected',
      userCount: userCount
    });
  } catch (error) {
    res.json({ 
      message: 'Error', 
      error: error.message 
    });
  }
});

// Health check route - for monitoring services
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test API: http://localhost:${PORT}/api/test`);
});