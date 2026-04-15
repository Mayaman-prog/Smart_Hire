const rateLimit = require('express-rate-limit');

// Rate limiter for login (5 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General limiter for auth routes (30 requests per minute)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
});

module.exports = { loginLimiter, authLimiter };