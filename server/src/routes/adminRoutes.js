const express = require("express");
const router = express.Router();

// Controllers and middleware
const {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  getAllCompanies,
  verifyCompany,
  deleteCompany,
  getAllJobs,
  featureJob,
  unfeatureJob,
  deleteJob,
  toggleUserStatus,
  getAdminStatsOverview,
} = require('../controllers/adminController');

// All routes in this file are protected and require admin role
const { protect, roleCheck } = require("../middleware/authMiddleware");

// Apply authentication and role-based access control middleware to all admin routes
router.use(protect);
router.use(roleCheck("admin"));

// Admin stats overview route
router.get("/stats/overview", getAdminStatsOverview);
router.patch('/users/:id/toggle', toggleUserStatus);

// User management routes
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle", toggleUserStatus);

// Job management routes
router.get("/jobs", getAllJobsAdmin);
router.delete("/jobs/:id", deleteJobAdmin);

// Company management route
router.get("/companies", getAllCompanies);

module.exports = router;
