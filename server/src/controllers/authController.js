const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");
const generateToken = require("../utils/generateToken");
const { addEmailJob } = require("../queues/emailQueue");

// VALIDATION
const registerValidation = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Min 6 characters required")
    .matches(/\d/)
    .withMessage("Must include a number"),
  body("name").isLength({ min: 2 }).withMessage("Name required"),
  body("role").isIn(["job_seeker", "employer"]).withMessage("Invalid role"),
  body("companyName").optional(),
];

const loginValidation = [body("email").isEmail(), body("password").notEmpty()];

// REGISTER
const register = async (req, res) => {
  let connection;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name, role, companyName } = req.body;

    // check existing user
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // insert user
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password_hash, name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [email, hashedPassword, name, role],
    );

    const userId = userResult.insertId;

    // employer
    if (role === "employer") {
      const [company] = await connection.query(
        "INSERT INTO companies (name, is_verified, created_at) VALUES (?, 0, NOW())",
        [companyName],
      );

      await connection.query("UPDATE users SET company_id=? WHERE id=?", [
        company.insertId,
        userId,
      ]);

      await connection.query(
        "INSERT INTO employers (user_id, company_id, is_primary_contact) VALUES (?, ?, 1)",
        [userId, company.insertId],
      );
    } else {
      const firstName = name.split(" ")[0];
      const lastName = name.split(" ").slice(1).join(" ");

      await connection.query(
        `INSERT INTO job_seekers (user_id, first_name, last_name, profile_completeness)
         VALUES (?, ?, ?, 0)`,
        [userId, firstName, lastName],
      );
    }

    await connection.commit();
    connection.release();

    // get user
    const [newUser] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.company_id, c.name AS company_name
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = ?`,
      [userId],
    );

    const user = newUser[0];

    // email job
    try {
      await addEmailJob({
        userId,
        to: email,
        subject: "Welcome to SmartHire",
        template: "welcome",
        templateData: {
          user_name: name,
          dashboard_url: `${process.env.FRONTEND_URL}/dashboard`,
        },
      });
    } catch (err) {
      console.error("Email job failed:", err.message);
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: { token, user },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const [users] = await pool.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await pool.query("UPDATE users SET last_login = NOW() WHERE id=?", [
      user.id,
    ]);

    const { password_hash, ...safeUser } = user;

    const token = generateToken(user);

    return res.json({
      success: true,
      data: { token, user: safeUser },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PROFILE (UPDATED)
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, company_id, google_id, linkedin_id, is_active, created_at
       FROM users WHERE id = ?`,
      [req.user.id],
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent caching to ensure fresh data (fixes 304 Not Modified)
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.json({
      success: true,
      data: { user: rows[0] },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
};
