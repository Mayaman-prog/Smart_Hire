const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./database");
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
