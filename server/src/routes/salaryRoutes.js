const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

router.get('/estimate', salaryController.getEstimate);
router.get('/trend', salaryController.getTrend);

module.exports = router;