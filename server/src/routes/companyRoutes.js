const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCompanies, getCompanyById, updateCompany } = require('../controllers/companyController');

const router = express.Router();

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Protected routes
router.put('/:id', protect, updateCompany);

module.exports = router;