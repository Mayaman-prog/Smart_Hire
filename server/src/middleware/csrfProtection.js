const csrf = require("csurf");

const isProduction = process.env.NODE_ENV === "production";

// Uses a cookie-based CSRF secret so the API can protect unsafe requests.
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  },
});

// Sends a CSRF token to the frontend when it needs to make unsafe requests.
const sendCsrfToken = (req, res) => {
  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    csrfToken: req.csrfToken(),
  });
};

// Returns a clear 403 response when the CSRF token is missing or invalid.
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") {
    return next(err);
  }

  if (req.logAction) {
    req.logAction("CSRF_TOKEN_REJECTED", {
      reason: "invalid_or_missing_csrf_token",
      path: req.originalUrl,
      method: req.method,
    });
  }

  return res.status(403).json({
    success: false,
    message: "Invalid or missing CSRF token.",
  });
};

module.exports = {
  csrfProtection,
  sendCsrfToken,
  handleCsrfError,
};
