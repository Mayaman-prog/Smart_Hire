const express = require('express');
const router = express.Router();
const { getSuggestions } = require('../controllers/searchSuggestionController');

// GET /api/search/suggest?q=...
router.get('/', getSuggestions);

module.exports = router;