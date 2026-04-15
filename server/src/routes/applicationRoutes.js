const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  applyForJob,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/applicationController");

const router = express.Router();

router.use(protect);

router.post("/", applyForJob);
router.get("/my", getMyApplications);
router.get("/employer", getEmployerApplications);
router.put("/:id/status", updateApplicationStatus);
router.delete("/:id", withdrawApplication);

module.exports = router;