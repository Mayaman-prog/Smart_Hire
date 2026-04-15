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

router.use(authLimiter);

router.post('/register', registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);

// Protected routes
router.get('/me', protect, getProfile);

console.log('✅ Auth routes registered:');
console.log('  - POST /register');
console.log('  - POST /login');
console.log('  - GET /profile');
console.log('  - GET /me');

module.exports = router;