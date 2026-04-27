// Import required modules for routing
const express = require('express');
const router = express.Router();

// Import authentication middleware to protect routes
const { protect } = require('../middleware/authMiddleware');

// Import controller functions for saved search operations
const {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch
} = require('../controllers/savedSearchController');

// Apply authentication middleware to all saved search routes
// This ensures only authenticated users can access these endpoints
router.use(protect);

// Route for retrieving all saved searches and creating new saved searches
// GET / - Retrieve all saved searches for the authenticated user
// POST / - Create a new saved search with specified criteria
router.route('/')
  .get(getSavedSearches)
  .post(createSavedSearch);

// Route for updating and deleting specific saved searches by ID
// PUT /:id - Update an existing saved search by its ID
// DELETE /:id - Delete a saved search by its ID
router.route('/:id')
  .put(updateSavedSearch)
  .delete(deleteSavedSearch);

// Export the configured router for use in the main application
module.exports = router;