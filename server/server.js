const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");

// Import pool from database config
const { pool } = require("./src/config/database");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const companyRoutes = require("./src/routes/companyRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");
const savedJobsRoutes = require("./src/routes/savedJobsRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const userRoutes = require("./src/routes/userRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const savedSearchRoutes = require("./src/routes/savedSearchRoutes");
const startDailyJobAlert = require("./src/cron/dailyJobAlert");
const startDailyJobMatchingCron = require("./src/cron/dailyJobMatching");
const reportRoutes = require("./src/routes/reportRoutes");
const coverLetterRoutes = require("./src/routes/coverLetterRoutes");
const searchSuggestionRoutes = require("./src/routes/searchSuggestionRoutes");
const passport = require("./src/config/passport");
const salaryRoutes = require("./src/routes/salaryRoutes");
const jobMatchRoutes = require("./src/routes/jobMatchRoutes");
const { auditLogger } = require("./src/middleware/auditLogger");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auditLogger);

// Serve uploaded files (for resumes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start scheduled background jobs
startDailyJobAlert();
startDailyJobMatchingCron();

// API ROUTES
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Hire API is running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      test: "/api/test",
      jobs: "/api/jobs",
      companies: "/api/companies",
      auth: "/api/auth",
      applications: "/api/applications",
      savedJobs: "/api/saved-jobs",
      jobMatches: "/api/job-matches",
      admin: "/api/admin",
      users: "/api/users",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working! CORS is configured correctly.",
    timestamp: new Date().toISOString(),
  });
});

// Initialize Passport middleware
app.use(passport.initialize());

// Auth routes
app.use("/api/auth", authRoutes);

// Job routes
app.use("/api/jobs", jobRoutes);

// Salary routes
app.use("/api/salary", salaryRoutes);

// Company routes
app.use("/api/companies", companyRoutes);

// Application routes
app.use("/api/applications", applicationRoutes);

// Employer routes
app.use("/api/employer", require("./src/routes/employerRoutes"));

// Saved Jobs routes
app.use("/api/saved-jobs", savedJobsRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// User routes
app.use("/api/users", userRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Saved Search routes
app.use("/api/saved-searches", savedSearchRoutes);

// Report routes
app.use("/api/reports", reportRoutes);

// Cover Letter routes
app.use("/api/cover-letters", coverLetterRoutes);

// Search Suggestion routes
app.use("/api/search/suggest", searchSuggestionRoutes);

// Job Matching Routes
app.use("/api/job-matches", jobMatchRoutes);

// 404 handler - MUST be last
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Test database connection using pool
const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Test API: http://localhost:${PORT}/api/test`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
