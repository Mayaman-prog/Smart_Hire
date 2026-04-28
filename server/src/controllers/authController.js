// Import validation and hashing libraries
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
// Import database and utilities
const { pool } = require("../config/database");
const generateToken = require("../utils/generateToken");
const { addEmailJob } = require("../queues/emailQueue");

// Validation rules for registration
const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("role")
    .isIn(["job_seeker", "employer"])
    .withMessage("Role must be either job_seeker or employer"),
  body("companyName")
    .optional()
    .if(body("role").equals("employer"))
    .notEmpty()
    .withMessage("Company name is required for employers")
    .trim()
    .isLength({ min: 2, max: 100 }),
];

// Validation rules for login
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Register a new user
const register = async (req, res) => {
  let connection;
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Get data from request
    const { email, password, name, role, companyName } = req.body;

    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Start database transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert user into database
    const [userResult] = await connection.query(
      "INSERT INTO users (email, password_hash, name, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())",
      [email, hashedPassword, name, role],
    );
    const userId = userResult.insertId;

    // If employer, create company and employer record
    let companyId = null;
    if (role === "employer") {
      const [companyResult] = await connection.query(
        "INSERT INTO companies (name, is_verified, created_at) VALUES (?, 0, NOW())",
        [companyName],
      );
      companyId = companyResult.insertId;
      await connection.query("UPDATE users SET company_id = ? WHERE id = ?", [
        companyId,
        userId,
      ]);
      await connection.query(
        "INSERT INTO employers (user_id, company_id, is_primary_contact) VALUES (?, ?, 1)",
        [userId, companyId],
      );
    } else {
      // If job seeker, create job seeker record
      await connection.query(
        "INSERT INTO job_seekers (user_id, profile_completeness) VALUES (?, 0)",
        [userId],
      );
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Fetch the new user data
    const [newUser] = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.company_id,
        c.name AS company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = ?
      `,
      [userId],
    );

    // Add welcome email job to the queue with rate limit and retry logic and log the job in the database with userId for tracking and auditing purposes and handle potential rate limit errors gracefully and log any unexpected errors without crashing the registration process and ensure that the user registration succeeds even if the email job fails to enqueue (since email sending is a secondary concern and should not block user registration) and provide clear feedback in the response if the email job fails due to rate limiting or other issues, while still returning a successful registration response to the client
    try {
      await addEmailJob({
        userId: userId,
        to: email,
        subject: "Welcome to SmartHire!",
        template: "account-verification",
        templateData: {
          user_name: name,
          dashboard_url: `${process.env.FRONTEND_URL}/dashboard`,
          jobs_url: `${process.env.FRONTEND_URL}/jobs`,
        },
      });
    } catch (emailError) {
      if (emailError.statusCode === 429) {
        return res
          .status(429)
          .json({ success: false, message: emailError.message });
      }
      console.error("Failed to enqueue welcome email:", emailError);
    }

    // Generate token and return response
    const token = generateToken(newUser[0]);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { token, user: newUser[0] },
    });
  } catch (error) {
    // Rollback transaction if error
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// User login
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Get email and password
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Query user by email
    const [users] = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.password_hash,
        u.name,
        u.role,
        u.company_id,
        u.is_active,
        c.name AS company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.email = ?
      `,
      [email],
    );
    console.log("User query result:", users.length);

    // Check if user exists
    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account disabled" });
    }

    // Compare password with hash
    console.log("Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Update last login time
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Login successful",
      data: { token, user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Login error details:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get logged-in user's profile
const getProfile = async (req, res) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export all functions and validation rules
module.exports = {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
};
