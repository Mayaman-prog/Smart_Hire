const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { pool } = require("./database");
const userService = require("../services/userService");
const generateToken = require("../utils/generateToken");

// GOOGLE STRATEGY (Active)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userService.findOrCreateGoogleUser(profile);
        const token = generateToken(user);
        return done(null, { user, token });
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    },
  ),
);

// Google Link Strategy (for linking to existing account)
passport.use(
  "google-link",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/link/google/callback`,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // 1. Parse state safely
        let state;
        try {
          state = req.query.state ? JSON.parse(req.query.state) : null;
        } catch (err) {
          return done(null, false, { message: "Invalid OAuth state" });
        }

        const userId = state?.userId;

        // 2. Validate userId
        if (!userId) {
          return done(null, false, {
            message: "Missing authenticated user",
          });
        }

        const googleId = profile.id;

        // 3. Check if Google already linked to another user
        const [existing] = await pool.query(
          "SELECT id FROM users WHERE google_id = ? AND id != ?",
          [googleId, userId]
        );

        if (existing.length > 0) {
          return done(null, false, {
            message: "This Google account is already linked to another user.",
          });
        }

        // 4. Check if already linked to same user
        const [alreadyLinked] = await pool.query(
          "SELECT id FROM users WHERE id = ? AND google_id = ?",
          [userId, googleId]
        );

        if (alreadyLinked.length > 0) {
          return done(null, false, {
            message: "This Google account is already linked to your profile.",
          });
        }

        // 5. Link account
        await pool.query(
          "UPDATE users SET google_id = ? WHERE id = ?",
          [googleId, userId]
        );

        // 6. Audit log
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, ip_address, user_agent)
           VALUES (?, ?, ?, ?)`,
          [userId, "link_google", req.ip, req.headers["user-agent"]]
        );

        return done(null, { id: userId, googleId });
      } catch (error) {
        console.error("Google link error:", error);
        return done(error, null);
      }
    }
  )
);

// LINKEDIN STRATEGY (Pending – Commented Out)
/*
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/linkedin/callback`,
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      // Logic will be uncommented when credentials are ready
      return done(null, false, { message: 'LinkedIn OAuth not configured yet' });
    }
  )
);
*/

module.exports = passport;
