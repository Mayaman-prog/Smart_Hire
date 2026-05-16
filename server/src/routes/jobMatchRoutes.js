const express = require("express");
const router = express.Router();

const jobMatchController = require("../controllers/jobMatchController");

// Adjust this import if your auth middleware uses a different exported name.
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Helper to support different auth middleware export styles.
 * Some projects export protect, some export authenticateToken,
 * and some export the middleware function directly.
 */
const protect =
  authMiddleware.protect ||
  authMiddleware.authenticateToken ||
  authMiddleware.verifyToken ||
  authMiddleware;

/**
 * GET /api/job-matches/me
 * Returns stored job recommendations for the logged-in user.
 */
router.get("/me", protect, jobMatchController.getMyJobMatches);

/**
 * POST /api/job-matches/recalculate/me
 * Recalculates matches for the logged-in user.
 */
router.post(
  "/recalculate/me",
  protect,
  jobMatchController.recalculateMyJobMatches
);

/**
 * POST /api/job-matches/recalculate/all
 * Recalculates matches for all jobseekers.
 *
 * In production, this should be restricted to admin users only.
 */
router.post(
  "/recalculate/all",
  protect,
  jobMatchController.recalculateAllJobMatches
);

module.exports = router;