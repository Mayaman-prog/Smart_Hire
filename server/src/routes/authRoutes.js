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
const userService = require("../services/userService");

const router = express.Router();

// Email and password authentication routes.
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

router.post("/logout", (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Protected routes.
router.get("/me", protect, getProfile);

// Google OAuth routes.
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
    const { token } = req.user;

    res.redirect(
      `${process.env.FRONTEND_URL}/login?token=${token}&social=google`,
    );
  },
  (err, req, res, next) => {
    console.error("Google OAuth error:", err);

    if (err.message === "EMAIL_CONFLICT") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=email_conflict&provider=google`,
      );
    }

    if (err.status === 400 || err.message === "Bad Request") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=invalid_request&provider=google`,
      );
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=auth_failed&provider=google`,
    );
  },
);

// LinkedIn OAuth routes are still disabled until provider credentials are configured.
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

// Allows OAuth account linking to receive the JWT token through the query string during redirect flow.
const allowTokenViaQuery = (req, res, next) => {
  const token = req.query.token;

  if (token && token !== "null" && token !== "undefined") {
    req.headers.authorization = `Bearer ${token}`;
  }

  next();
};

// Google account linking for authenticated users.
router.get("/link/google", allowTokenViaQuery, protect, (req, res, next) => {
  passport.authenticate("google-link", {
    accessType: "offline",
    prompt: "consent",
    state: JSON.stringify({ userId: req.user.id }),
  })(req, res, next);
});

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
    await userService.unlinkSocialAccount(userId, provider, ip, userAgent);

    return res.json({
      success: true,
      message: `Successfully unlinked ${provider}.`,
    });
  } catch (error) {
    console.error("Error unlinking social account:", error);

    const status = error.message.includes("only login method") ? 400 : 500;

    return res.status(status).json({
      message: error.message,
    });
  }
});

console.log("Auth routes registered:");
console.log("  - POST /register");
console.log("  - POST /login");
console.log("  - POST /logout");
console.log("  - GET /me");
console.log("  - GET /google");
console.log("  - GET /google/callback");
console.log("  - GET /linkedin (disabled)");
console.log("  - GET /linkedin/callback (disabled)");

module.exports = router;
