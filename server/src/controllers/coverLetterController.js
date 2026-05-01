const { pool: db } = require('../config/database');

// @desc    Get all cover letters for the authenticated user
// @route   GET /api/cover-letters
// @access  Private
exports.getCoverLetters = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, user_id, name, content, is_default, created_at, updated_at FROM cover_letters WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get cover letters error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new cover letter
// @route   POST /api/cover-letters
// @access  Private
exports.createCoverLetter = async (req, res) => {
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ success: false, message: 'Name and content are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO cover_letters (user_id, name, content) VALUES (?, ?, ?)',
      [req.user.id, name.trim(), content]
    );

    // If this is the first cover letter, make it default automatically
    const [countRows] = await db.execute('SELECT COUNT(*) as count FROM cover_letters WHERE user_id = ?', [req.user.id]);
    if (countRows[0].count === 1) {
      await db.execute('UPDATE cover_letters SET is_default = TRUE WHERE id = ?', [result.insertId]);
    }

    const [newLetter] = await db.execute(
      'SELECT id, user_id, name, content, is_default, created_at, updated_at FROM cover_letters WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newLetter[0] });
  } catch (error) {
    console.error('Create cover letter error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a cover letter (name and/or content)
// @route   PUT /api/cover-letters/:id
// @access  Private
exports.updateCoverLetter = async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;

  if (!name && !content) {
    return res.status(400).json({ success: false, message: 'At least one field (name or content) is required' });
  }

  try {
    // Check ownership
    const [existing] = await db.execute(
      'SELECT id, user_id FROM cover_letters WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Cover letter not found' });
    }

    const fields = [];
    const values = [];
    if (name) {
      fields.push('name = ?');
      values.push(name.trim());
    }
    if (content) {
      fields.push('content = ?');
      values.push(content);
    }
    values.push(id, req.user.id);

    await db.execute(
      `UPDATE cover_letters SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    const [updated] = await db.execute(
      'SELECT id, user_id, name, content, is_default, created_at, updated_at FROM cover_letters WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update cover letter error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a cover letter
// @route   DELETE /api/cover-letters/:id
// @access  Private
exports.deleteCoverLetter = async (req, res) => {
  const { id } = req.params;

  try {
    // Check ownership and get is_default status
    const [existing] = await db.execute(
      'SELECT id, user_id, is_default FROM cover_letters WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Cover letter not found' });
    }

    const wasDefault = existing[0].is_default;

    // Delete the letter
    await db.execute('DELETE FROM cover_letters WHERE id = ? AND user_id = ?', [id, req.user.id]);

    // If the deleted letter was the default, set the most recently updated as new default
    if (wasDefault) {
      const [nextDefault] = await db.execute(
        'SELECT id FROM cover_letters WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
        [req.user.id]
      );
      if (nextDefault.length > 0) {
        await db.execute('UPDATE cover_letters SET is_default = TRUE WHERE id = ?', [nextDefault[0].id]);
      }
    }

    res.json({ success: true, message: 'Cover letter deleted' });
  } catch (error) {
    console.error('Delete cover letter error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Set a cover letter as default (unset others)
// @route   PUT /api/cover-letters/:id/default
// @access  Private
exports.setDefaultCoverLetter = async (req, res) => {
  const { id } = req.params;

  try {
    // Check ownership
    const [existing] = await db.execute(
      'SELECT id, user_id FROM cover_letters WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Cover letter not found' });
    }

    // Unset all others and set this one as default
    await db.execute('UPDATE cover_letters SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    await db.execute('UPDATE cover_letters SET is_default = TRUE WHERE id = ?', [id]);

    const [updated] = await db.execute(
      'SELECT id, user_id, name, content, is_default, created_at, updated_at FROM cover_letters WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Set default cover letter error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};