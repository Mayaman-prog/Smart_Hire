const express = require("express");
const router = express.Router();

const jobMatchController = require("../controllers/jobMatchController");
const authMiddleware = require("../middleware/authMiddleware");

// Supports the current auth middleware export style used in this project.
const protect =
  authMiddleware.protect ||
  authMiddleware.authenticateToken ||
  authMiddleware.verifyToken ||
  authMiddleware;

// Returns stored recommendations for the logged-in job seeker.
router.get("/me", protect, jobMatchController.getMyJobMatches);

// Saves thumbs up or thumbs down feedback for one recommended job.
router.post(
  "/:jobId/feedback",
  protect,
  jobMatchController.saveMyRecommendationFeedback,
);

// Recalculates recommendations for the logged-in user.
router.post(
  "/recalculate/me",
  protect,
  jobMatchController.recalculateMyJobMatches,
);

// Recalculates recommendations for all users.
router.post(
  "/recalculate/all",
  protect,
  jobMatchController.recalculateAllJobMatches,
);

module.exports = router;
