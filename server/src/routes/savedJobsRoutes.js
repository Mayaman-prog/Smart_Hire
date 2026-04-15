const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  saveJob,
  getSavedJobs,
  removeSavedJob,
} = require("../controllers/savedJobsController");

const router = express.Router();

router.use(protect);

router.post("/", saveJob);
router.get("/", getSavedJobs);
router.delete("/:jobId", removeSavedJob);

module.exports = router;