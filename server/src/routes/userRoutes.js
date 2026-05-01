const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/userController");
const {
  uploadResume,
  getAllResumes,
  getResumeById,
  getPrimaryResume,
  updateResume,
  deleteResume,
  setPrimaryResume,
} = require('../controllers/resumeController');
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/resumes/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname),
    ),
});

// File filter to allow only PDF and DOCX files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".pdf", ".doc", ".docx"].includes(ext)) cb(null, true);
  else cb(new Error("Only PDF, DOC, DOCX files are allowed"), false);
};

// Limit file size to 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All routes in this file require authentication
router.use(protect);
router.put("/profile", updateProfile);
router.post('/resume', protect, uploadResume);
router.get('/resume', protect, getAllResumes);
router.get('/resume/primary', protect, getPrimaryResume);
router.get('/resume/:id', protect, getResumeById);
router.put('/resume/:id', protect, updateResume);
router.delete('/resume/:id', protect, deleteResume);
router.put('/resume/:id/primary', protect, setPrimaryResume);

module.exports = router;