const { pool } = require("../config/database");

// Gets the real user IP address.
// x-forwarded-for is checked first because deployed apps may run behind proxy/server.
const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

// Separates IP and user agent from the extra details object.
const prepareDetails = (details = {}) => {
  const safeDetails = details && typeof details === "object" ? { ...details } : {};

  const ipAddress = safeDetails.ip_address || safeDetails.ipAddress || null;
  const userAgent = safeDetails.user_agent || safeDetails.userAgent || null;

  delete safeDetails.ip_address;
  delete safeDetails.ipAddress;
  delete safeDetails.user_agent;
  delete safeDetails.userAgent;

  return {
    ipAddress,
    userAgent,
    details: safeDetails,
  };
};

// Non-blocking audit log function.
// setImmediate allows the main request response to continue without waiting for the log insert.
const logAction = (userId, action, details = {}) => {
  const { ipAddress, userAgent, details: auditDetails } = prepareDetails(details);

  setImmediate(async () => {
    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, details)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId || null,
          action,
          ipAddress,
          userAgent,
          JSON.stringify(auditDetails),
        ]
      );
    } catch (error) {
      console.error("Audit log failed:", error.message);
    }
  });
};

// Adds req.logAction() to every request.
const auditLogger = (req, res, next) => {
  req.logAction = (action, details = {}) => {
    const auditDetails = {
      ...details,
      ip_address: getClientIp(req),
      user_agent: req.get("user-agent") || null,
      method: req.method,
      path: req.originalUrl,
    };

    logAction(req.user?.id || null, action, auditDetails);
  };

  next();
};

module.exports = {
  auditLogger,
  logAction,
};