const express = require("express");
const router = express.Router();

// Controllers and middleware
const { protect, roleCheck } = require("../middleware/authMiddleware");
const {
  getEmployerDashboardSummary,
} = require("../controllers/employerController");

// Employer dashboard summary route
router.get(
  "/dashboard-summary",
  protect,
  roleCheck("employer"),
  getEmployerDashboardSummary
);

module.exports = router;