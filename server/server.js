const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Import pool from database config (not the whole module)
const { pool } = require('./src/config/database');

// Import auth routes
const authRoutes = require('./src/routes/authRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API ROUTES

app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Hire API is running',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            test: '/api/test',
            jobs: '/api/jobs',
            companies: '/api/companies',
            auth: '/api/auth'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working! CORS is configured correctly.',
        timestamp: new Date().toISOString()
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// 404 handler - MUST be last
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

// Test database connection using pool
const startServer = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully');
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/api`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Test API: http://localhost:${PORT}/api/test`);
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

startServer();