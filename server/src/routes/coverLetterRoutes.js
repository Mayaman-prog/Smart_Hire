const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCoverLetters,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  setDefaultCoverLetter
} = require('../controllers/coverLetterController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getCoverLetters)
  .post(createCoverLetter);

router.route('/:id')
  .put(updateCoverLetter)
  .delete(deleteCoverLetter);

router.put('/:id/default', setDefaultCoverLetter);

module.exports = router;