const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");
const generateToken = require("../utils/generateToken");

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

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const register = async (req, res) => {
  let connection;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { email, password, name, role, companyName } = req.body;
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [userResult] = await connection.query(
      "INSERT INTO users (email, password_hash, name, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())",
      [email, hashedPassword, name, role],
    );
    const userId = userResult.insertId;
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
      await connection.query(
        "INSERT INTO job_seekers (user_id, profile_completeness) VALUES (?, 0)",
        [userId],
      );
    }
    await connection.commit();
    connection.release();
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
    const token = generateToken(newUser[0]);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { token, user: newUser[0] },
    });
  } catch (error) {
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

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

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

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const user = users[0];
    if (!user.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account disabled" });
    }

    console.log("Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);
    const token = generateToken(user);
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

const getProfile = async (req, res) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
};
