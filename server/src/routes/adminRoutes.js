const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAdminStats } = require('../controllers/adminController');
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
} = require('../controllers/adminController');

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

// Stats
router.get('/stats/overview', getAdminStats);

module.exports = router;