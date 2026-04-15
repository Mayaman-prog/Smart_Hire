const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const generateToken = require('../utils/generateToken');

// Validation rules for register
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[A-Za-z\s\-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  body('role')
    .isIn(['job_seeker', 'employer'])
    .withMessage('Role must be either job_seeker or employer'),
  body('companyName')
    .optional()
    .if(body('role').equals('employer'))
    .notEmpty()
    .withMessage('Company name is required for employers')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  let connection;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password, name, role, companyName } = req.body;

    // Check existing user
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get connection for transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert user
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password_hash, name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [email, hashedPassword, name, role]
    );
    const userId = userResult.insertId;

    let companyId = null;
    if (role === 'employer') {
      // Insert company
      const [companyResult] = await connection.query(
        `INSERT INTO companies (name, is_verified, created_at)
         VALUES (?, 0, NOW())`,
        [companyName]
      );
      companyId = companyResult.insertId;
      // Update user with company_id
      await connection.query('UPDATE users SET company_id = ? WHERE id = ?', [companyId, userId]);
      // Insert into employers table
      await connection.query(
        `INSERT INTO employers (user_id, company_id, is_primary_contact)
         VALUES (?, ?, 1)`,
        [userId, companyId]
      );
    } else {
      // Insert into job_seekers table
      await connection.query(
        `INSERT INTO job_seekers (user_id, profile_completeness)
         VALUES (?, 0)`,
        [userId]
      );
    }

    await connection.commit();
    connection.release();

    // Fetch new user
    const [newUserRows] = await pool.query(
      `SELECT id, email, name, role, company_id FROM users WHERE id = ?`,
      [userId]
    );
    const newUser = newUserRows[0];

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { token, user: newUser },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const [users] = await pool.query(
      `SELECT id, email, password_hash, name, role, company_id, is_active
       FROM users WHERE email = ?`,
      [email]
    );
    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account disabled. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    });

    // Exclude password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user: userWithoutPassword },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Export all functions and validations
module.exports = {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
};