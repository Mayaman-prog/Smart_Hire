const express = require('express');
const {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply general rate limiting to all auth routes
router.use(authLimiter);

// Register route
router.post('/register', registerValidation, register);

// Login route with stricter rate limiting
router.post('/login', loginLimiter, loginValidation, login);

// Protected route: get profile
router.get('/profile', protect, getProfile);

module.exports = router;