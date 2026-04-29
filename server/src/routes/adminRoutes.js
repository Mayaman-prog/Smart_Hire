const express = require('express');
const { protect } = require('../middleware/authMiddleware');
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
  getAdminStats,
} = require('../controllers/adminController');

// Analytics controller
const {
  getOverview,
  getTimeline,
  getPopular,
  getRetention,
  getKPIs,
} = require('../controllers/analyticsController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
});

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.delete('/users/:id', deleteUser);

// Companies
router.get('/companies', getAllCompanies);
router.put('/companies/:id/verify', verifyCompany);
router.delete('/companies/:id', deleteCompany);

// Jobs
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/feature', featureJob);
router.put('/jobs/:id/unfeature', unfeatureJob);
router.delete('/jobs/:id', deleteJob);

// Analytics
router.get('/analytics/overview',   getOverview);
router.get('/analytics/timeline',   getTimeline);
router.get('/analytics/popular',    getPopular);
router.get('/analytics/retention',  getRetention);
router.get('/analytics/kpi',        getKPIs);

module.exports = router;