const { pool } = require('../config/database');
const { parseResume } = require('../services/resumeParser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Configuration (for upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/resumes/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${req.user.id}-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF and DOCX are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('resume');

// CREATE – Upload and parse a new resume
exports.uploadResume = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    try {
      const userId = req.user.id;
      const buffer = fs.readFileSync(req.file.path);
      const parsedData = await parseResume(buffer, req.file.mimetype);

      // Insert the new resume
      const [result] = await pool.query(
        `INSERT INTO resumes (user_id, title, file_path, is_primary, parsed_data) VALUES (?, ?, ?, ?, ?)`,
        [userId, req.file.originalname, req.file.path, true, JSON.stringify(parsedData)]
      );

      // Set this as primary (unset any previous primary)
      await pool.query(
        `UPDATE resumes SET is_primary = 0 WHERE user_id = ? AND id != ?`,
        [userId, result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully',
        data: {
          id: result.insertId,
          parsed_data: parsedData
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ success: false, message: 'Failed to upload resume: ' + error.message });
    }
  });
};

// READ – Get all resumes for the current user
exports.getAllResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, title, file_path, is_primary, created_at, updated_at, parsed_data
       FROM resumes
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get all resumes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// READ – Get a single resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    const [rows] = await pool.query(
      `SELECT id, title, file_path, is_primary, created_at, updated_at, parsed_data
       FROM resumes
       WHERE id = ? AND user_id = ?`,
      [resumeId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get resume by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// READ – Get the primary resume for the current user
exports.getPrimaryResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, title, file_path, parsed_data
       FROM resumes
       WHERE user_id = ? AND is_primary = 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get primary resume error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE – Update resume metadata (only title and is_primary)
exports.updateResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    const { title, is_primary } = req.body;

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM resumes WHERE id = ? AND user_id = ?',
      [resumeId, userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (is_primary !== undefined) {
      updates.push('is_primary = ?');
      values.push(is_primary ? 1 : 0);
    }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(resumeId, userId);
    await pool.query(
      `UPDATE resumes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    // If setting as primary, unset others
    if (is_primary === true) {
      await pool.query(
        `UPDATE resumes SET is_primary = 0 WHERE user_id = ? AND id != ?`,
        [userId, resumeId]
      );
    }

    res.json({ success: true, message: 'Resume updated successfully' });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE – Delete a resume by ID
exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);

    const [resume] = await pool.query(
      'SELECT file_path, is_primary FROM resumes WHERE id = ? AND user_id = ?',
      [resumeId, userId]
    );

    if (resume.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Delete file if it exists
    if (resume[0].file_path && fs.existsSync(resume[0].file_path)) {
      fs.unlinkSync(resume[0].file_path);
    }

    // Delete the record
    await pool.query('DELETE FROM resumes WHERE id = ?', [resumeId]);

    // If the deleted resume was primary, promote the most recent one
    if (resume[0].is_primary) {
      await pool.query(
        `UPDATE resumes SET is_primary = 1
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );
    }

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Set a specific resume as primary
exports.setPrimaryResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM resumes WHERE id = ? AND user_id = ?',
      [resumeId, userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Unset all others
    await pool.query(
      'UPDATE resumes SET is_primary = 0 WHERE user_id = ?',
      [userId]
    );

    // Set this as primary
    await pool.query(
      'UPDATE resumes SET is_primary = 1 WHERE id = ?',
      [resumeId]
    );

    res.json({ success: true, message: 'Primary resume updated' });
  } catch (error) {
    console.error('Set primary resume error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};