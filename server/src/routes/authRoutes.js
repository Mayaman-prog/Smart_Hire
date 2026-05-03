const express = require('express');
const passport = require('../config/passport');
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

// Email/Password Auth Routes
router.post('/register', registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);

// Protected routes
router.get('/me', protect, getProfile);

// Google OAuth Routes (Active)
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    // Successful authentication – redirect with token
    const { user, token } = req.user;
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&social=google`);
  }
);

// LinkedIn OAuth Routes (Temporarily Disabled)
router.get('/linkedin', (req, res) => {
  res.status(503).json({
    success: false,
    message: 'LinkedIn OAuth is not configured yet. Please check back later.'
  });
});

router.get('/linkedin/callback', (req, res) => {
  res.status(503).json({
    success: false,
    message: 'LinkedIn OAuth is not configured yet.'
  });
});

console.log('Auth routes registered:');
console.log('  - POST /register');
console.log('  - POST /login');
console.log('  - GET /profile');
console.log('  - GET /me');
console.log('  - GET /google');
console.log('  - GET /google/callback');
console.log('  - GET /linkedin (disabled)');
console.log('  - GET /linkedin/callback (disabled)');

module.exports = router;