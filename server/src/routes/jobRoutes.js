const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getJobs,
  getFeaturedJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getRecommendedJobs,
} = require('../controllers/jobController');

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/me', protect, getMyJobs);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;