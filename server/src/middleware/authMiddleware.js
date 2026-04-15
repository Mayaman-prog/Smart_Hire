const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

// Authentication middleware to protect routes and attach user info to request
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.company_id,
        u.is_active,
        c.name AS company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = ?
      `,
      [decoded.id],
    );

    const user = users[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account disabled" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: insufficient role" });
    }

    next();
  };
};

module.exports = { protect, roleCheck };
