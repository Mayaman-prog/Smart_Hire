const { pool } = require('../config/database');

// @desc    Get all companies
// @route   GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query(`
      SELECT 
        c.id, c.name, c.logo_url, c.description, c.location, 
        c.website, c.email, c.phone, c.is_verified, c.created_at,
        COUNT(j.id) as jobs_count
      FROM companies c
      LEFT JOIN jobs j ON j.company_id = c.id AND j.is_active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single company by ID
// @route   GET /api/companies/:id
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [companies] = await pool.query(`
      SELECT 
        c.id, c.name, c.logo_url, c.description, c.location, 
        c.website, c.email, c.phone, c.is_verified, c.created_at
      FROM companies c
      WHERE c.id = ?
    `, [id]);

    if (companies.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: companies[0] });
  } catch (error) {
    console.error('Get company by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update company profile (employer/owner only)
// @route   PUT /api/companies/:id
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const updates = req.body;

    // Check if user owns this company
    if (user.role !== 'admin' && user.company_id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this company' });
    }

    const allowedFields = ['name', 'logo_url', 'description', 'location', 'website', 'email', 'phone'];
    const setClauses = [];
    const values = [];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }
    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    values.push(id);
    await pool.query(`UPDATE companies SET ${setClauses.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getCompanies, getCompanyById, updateCompany };