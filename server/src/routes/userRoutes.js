const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  updateProfile,
  uploadResume,
} = require("../controllers/userController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/resumes/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    ),
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".pdf", ".doc", ".docx"].includes(ext)) cb(null, true);
  else cb(new Error("Only PDF, DOC, DOCX files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.use(protect);
router.put("/profile", updateProfile);
router.post("/resume", upload.single("resume"), uploadResume);

module.exports = router;
