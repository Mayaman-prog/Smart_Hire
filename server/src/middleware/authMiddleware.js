const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const userId = decoded?.id || decoded?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const [rows] = await pool.query(
      `SELECT id, email, name, role, company_id, is_active FROM users WHERE id = ?`,
      [userId],
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    // IMPORTANT: normalize user object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: String(user.role).toLowerCase(),
      company_id: user.company_id,
    };

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(); // allow anonymous
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      "SELECT id, email, name, role, company_id FROM users WHERE id = ?",
      [decoded.id || decoded.userId],
    );

    if (rows.length) {
      req.user = rows[0];
    }

    next();
  } catch {
    next();
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const userRole = String(req.user.role).toLowerCase();

    if (!roles.map((r) => r.toLowerCase()).includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient role",
      });
    }

    next();
  };
};

module.exports = { protect, roleCheck };
