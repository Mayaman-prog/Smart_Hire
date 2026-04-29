const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  unsubscribe
} = require('../controllers/savedSearchController');

router.get('/unsubscribe/:token', unsubscribe);

// All routes in this file are protected and require authentication
router.use(protect);
router.route('/')
  .get(getSavedSearches)
  .post(createSavedSearch);
router.route('/:id')
  .put(updateSavedSearch)
  .delete(deleteSavedSearch);

module.exports = router;