const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// GOOGLE STRATEGY (Active)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, name } = profile;
        const email = emails?.[0]?.value;
        const fullName = name?.givenName + ' ' + name?.familyName || profile.displayName;

        if (!email) {
          return done(null, false, { message: 'No email returned from Google' });
        }

        // Check if user exists by google_id
        const [existing] = await db.execute(
          `SELECT * FROM users WHERE google_id = ?`,
          [id]
        );

        if (existing.length > 0) {
          const token = generateToken(existing[0]);
          return done(null, { user: existing[0], token });
        }

        // Check if user exists by email (link account)
        const [emailUser] = await db.execute(
          `SELECT * FROM users WHERE email = ?`,
          [email]
        );

        if (emailUser.length > 0) {
          await db.execute(
            `UPDATE users SET google_id = ? WHERE id = ?`,
            [id, emailUser[0].id]
          );
          const updatedUser = { ...emailUser[0], google_id: id };
          const token = generateToken(updatedUser);
          return done(null, { user: updatedUser, token });
        }

        // New user – create with role 'job_seeker'
        const [result] = await db.execute(
          `INSERT INTO users (email, name, role, google_id, is_active, created_at) 
           VALUES (?, ?, 'job_seeker', ?, 1, NOW())`,
          [email, fullName, id]
        );

        const [newUser] = await db.execute(
          `SELECT * FROM users WHERE id = ?`,
          [result.insertId]
        );

        const token = generateToken(newUser[0]);
        return done(null, { user: newUser[0], token });
      } catch (error) {
        console.error('Google OAuth error:', error);
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