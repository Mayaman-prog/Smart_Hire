const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const jobController = require('../controllers/jobController');
const searchLogger = require('../middleware/searchLogger');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', searchLogger, jobController.getJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/recommended', authMiddleware.protect, jobController.getRecommendedJobs);

// Employer route
router.get('/me', authMiddleware.protect, jobController.getMyJobs);

// Public param routes
router.get('/:id', jobController.getJobById);

// Employer routes
router.post('/', authMiddleware.protect, jobController.createJob);
router.put('/:id', authMiddleware.protect, jobController.updateJob);
router.delete('/:id', authMiddleware.protect, jobController.deleteJob);

module.exports = router;