const express = require("express");
const passport = require("../config/passport");
const {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { loginLimiter, authLimiter } = require("../middleware/rateLimiter");
const userService = require("../services/userService");

const router = express.Router();

router.use(authLimiter);

// Email/Password Auth Routes
router.post("/register", registerValidation, register);
router.post("/login", loginLimiter, loginValidation, login);
router.post("/logout", (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Protected routes
router.get("/me", protect, getProfile);

// Google OAuth Routes (Active)
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent select_account",
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    failWithError: true,
  }),
  (req, res) => {
    // Success
    const { user, token } = req.user;
    res.redirect(
      `${process.env.FRONTEND_URL}/login?token=${token}&social=google`,
    );
  },
  (err, req, res, next) => {
    // Error handler that catches ALL errors
    console.error("Google OAuth error:", err);

    // Specific handling for email conflict
    if (err.message === "EMAIL_CONFLICT") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=email_conflict&provider=google`,
      );
    }

    // Handle "Bad Request" (invalid OAuth code or missing state)
    if (err.status === 400 || err.message === "Bad Request") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=invalid_request&provider=google`,
      );
    }

    // Generic fallback
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=auth_failed&provider=google`,
    );
  },
);

// LinkedIn OAuth Routes (Temporarily Disabled)
router.get("/linkedin", (req, res) => {
  res.status(503).json({
    success: false,
    message: "LinkedIn OAuth is not configured yet. Please check back later.",
  });
});

router.get("/linkedin/callback", (req, res) => {
  res.status(503).json({
    success: false,
    message: "LinkedIn OAuth is not configured yet.",
  });
});

// Middleware to accept token via query param for OAuth initiation
// This avoids CORS issues when redirecting from frontend
const allowTokenViaQuery = (req, res, next) => {
  const token = req.query.token;
  console.log("Token from query:", token ? "present" : "missing");
  if (token && token !== "null" && token !== "undefined") {
    req.headers.authorization = `Bearer ${token}`;
    console.log("Authorization header set");
  }
  next();
};

// Google Linking Flow (authenticated user only)
router.get("/link/google", allowTokenViaQuery, protect, (req, res, next) => {
  passport.authenticate("google-link", {
    accessType: "offline",
    prompt: "consent",
    state: JSON.stringify({ userId: req.user.id }),
  })(req, res, next);
});

// Google Linking Callback
router.get(
  "/link/google/callback",
  passport.authenticate("google-link", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=link_failed`,
  }),
  async (req, res) => {
    const role = req.user.role;

    const redirectPath =
      role === "employer"
        ? "/dashboard/employer/profile"
        : role === "admin"
          ? "/dashboard/admin/profile"
          : "/dashboard/seeker/profile";

    return res.redirect(
      `${process.env.FRONTEND_URL}${redirectPath}?success=google_linked`,
    );
  },
);

// Unlink Social provider (Googlr or LinkedIn)
router.delete("/me/social/:provider", protect, async (req, res) => {
  const { provider } = req.params;
  const userId = req.user.id;
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  if (!["google", "linkedin"].includes(provider)) {
    return res
      .status(400)
      .json({ message: 'Invalid provider. Use "google" or "linkedin".' });
  }

  try {
    const result = await userService.unlinkSocialAccount(
      userId,
      provider,
      ip,
      userAgent,
    );
    res.json({ success: true, message: `Successfully unlinked ${provider}.` });
  } catch (error) {
    console.error("Error unlinking social account:", error);
    const status = error.message.includes("only login method") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
});

console.log("Auth routes registered:");
console.log("  - POST /register");
console.log("  - POST /login");
console.log("  - GET /profile");
console.log("  - GET /me");
console.log("  - GET /google");
console.log("  - GET /google/callback");
console.log("  - GET /linkedin (disabled)");
console.log("  - GET /linkedin/callback (disabled)");

module.exports = router;
