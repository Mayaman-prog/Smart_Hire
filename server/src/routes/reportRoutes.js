const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { reportJob } = require('../controllers/reportController');

// Protected route for reporting a job posting
router.post('/', protect, reportJob);

module.exports = router;