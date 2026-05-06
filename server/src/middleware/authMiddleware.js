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
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const [users] = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.company_id,
        u.is_active
      FROM users u
      WHERE u.id = ?
      `,
      [userId]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: String(user.role).toLowerCase(),
      company_id: user.company_id,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
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

    if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient role",
      });
    }

    next();
  };
};

module.exports = { protect, roleCheck };