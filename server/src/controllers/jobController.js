const { pool } = require("../config/database");
const { addEmailJob } = require("../queues/emailQueue");
const { parseAdvancedQuery } = require("../utils/searchParser");

// @desc   Get all jobs with filters, pagination, sorting
// @route  GET /api/jobs
// @access  Public
const getUsersWithMatchingSavedSearches = async (job) => {
  try {
    const [users] = await pool.query(
      `
      SELECT DISTINCT
        u.id,
        u.email,
        u.name,
        ss.name AS saved_search_name
      FROM users u
      JOIN job_seekers js ON u.id = js.user_id
      LEFT JOIN saved_searches ss ON u.id = ss.user_id
      WHERE 
        u.role = 'job_seeker'
        AND u.is_active = 1
        AND (ss.location IS NULL OR LOWER(ss.location) = LOWER(?) OR LOWER(job.location) LIKE CONCAT('%', LOWER(ss.location), '%'))
        AND (ss.job_type IS NULL OR ss.job_type = ?)
        AND (ss.min_salary IS NULL OR ? >= ss.min_salary)
      LIMIT 100
      `,
      [job.location, job.job_type, job.salary_min || 0],
    );
    return users;
  } catch (error) {
    console.error("Error fetching matching users:", error);
    return [];
  }
};

const normalizeJobTypeForDb = (value) => {
  if (!value) return null;

  const map = {
    "full-time": "full-time",
    "part-time": "part-time",
    contract: "contract",
    internship: "internship",
    remote: "remote",
    full_time: "full-time",
    part_time: "part-time",
  };

  return map[value] || value;
};

const normalizeSort = (sort) => {
  switch (sort) {
    case "salary_high":
      return "j.salary_max DESC, j.created_at DESC";
    case "salary_low":
      return "j.salary_min ASC, j.created_at DESC";
    case "recent":
    default:
      return "j.created_at DESC";
  }
};

const buildJobsWhereClause = (filters = {}) => {
  const conditions = ["j.is_active = 1"];
  const values = [];

  if (filters.keyword) {
    conditions.push(
      "(j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)",
    );
    values.push(
      `%${filters.keyword}%`,
      `%${filters.keyword}%`,
      `%${filters.keyword}%`,
    );
  }

  if (filters.location) {
    conditions.push("j.location LIKE ?");
    values.push(`%${filters.location}%`);
  }

  if (filters.job_type) {
    const rawTypes = String(filters.job_type)
      .split(",")
      .map((t) => normalizeJobTypeForDb(t.trim()))
      .filter(Boolean);

    if (rawTypes.length > 0) {
      const placeholders = rawTypes.map(() => "?").join(", ");
      conditions.push(`j.job_type IN (${placeholders})`);
      values.push(...rawTypes);
    }
  }

  if (filters.min_salary) {
    conditions.push("j.salary_min IS NOT NULL AND j.salary_min >= ?");
    values.push(Number(filters.min_salary));
  }

  if (filters.max_salary) {
    conditions.push("j.salary_max IS NOT NULL AND j.salary_max <= ?");
    values.push(Number(filters.max_salary));
  }

  if (filters.companyId) {
    conditions.push("j.company_id = ?");
    values.push(Number(filters.companyId));
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    values,
  };
};

// @desc    Get all jobs with filters, pagination, sorting, FULLTEXT search
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const {
      keyword = "",
      location = "",
      job_type = "",
      min_salary,
      max_salary,
      page = 1,
      limit = 6,
      sort = "recent",
      search = "",
      similar,
      jobId,
    } = req.query;

    // If similar query, return similar jobs (unchanged)
    if (String(similar) === "true" && jobId) {
      const [baseJobs] = await pool.query(
        "SELECT id, company_id, job_type FROM jobs WHERE id = ? AND is_active = 1",
        [jobId],
      );

      if (!baseJobs.length) {
        return res.json({ success: true, data: [] });
      }

      const baseJob = baseJobs[0];

      const [similarJobs] = await pool.query(
        `
        SELECT
          j.id, j.title, j.description, j.salary_min, j.salary_max,
          j.location, j.job_type, j.is_featured, j.created_at,
          c.id AS company_id, c.name AS company_name
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = 1
          AND j.id != ?
          AND (j.company_id = ? OR j.job_type = ?)
        ORDER BY j.created_at DESC
        LIMIT 6
        `,
        [jobId, baseJob.company_id, baseJob.job_type],
      );

      return res.json({
        success: true,
        data: similarJobs,
        total: similarJobs.length,
      });
    }

    // Build WHERE clause
    const conditions = ["j.is_active = 1"];
    const values = [];

    // FULLTEXT search (if 'search' provided and non-empty)
    const useFulltext = search && search.trim() !== "";
    let parsedSearch = "";

    // If FULLTEXT search is used, parse the search query for boolean mode
    if (useFulltext) {
      parsedSearch = parseAdvancedQuery(search);

      if (!parsedSearch || parsedSearch.trim() === "") {
        useFulltext = false; // Fallback to keyword search if parsing results in empty string
      } else {
        conditions.push(
          "MATCH(j.title, j.description, j.requirements) AGAINST(? IN BOOLEAN MODE)",
        );
        values.push(parsedSearch);
      }
    }

    // If no FULLTEXT search, but 'keyword' provided, use legacy keyword search
    if (!useFulltext && keyword && keyword.trim() !== "") {
      conditions.push(
        "(j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)",
      );
      values.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    // Location
    if (location) {
      conditions.push("j.location LIKE ?");
      values.push(`%${location}%`);
    }

    // Job type
    if (job_type) {
      const rawTypes = String(job_type)
        .split(",")
        .map((t) => normalizeJobTypeForDb(t.trim()))
        .filter(Boolean);

      if (rawTypes.length > 0) {
        const placeholders = rawTypes.map(() => "?").join(", ");
        conditions.push(`j.job_type IN (${placeholders})`);
        values.push(...rawTypes);
      }
    }

    // Min salary
    if (min_salary) {
      conditions.push("j.salary_min IS NOT NULL AND j.salary_min >= ?");
      values.push(Number(min_salary));
    }

    // Max salary
    if (max_salary) {
      conditions.push("j.salary_max IS NOT NULL AND j.salary_max <= ?");
      values.push(Number(max_salary));
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Build SELECT fields
    let selectFields = `
      j.id, j.title, j.description, j.requirements, j.salary_min, j.salary_max,
      j.location, j.job_type, j.is_featured, j.created_at,
      c.id AS company_id, c.name AS company_name, c.logo_url AS company_logo
    `;

    let relevanceSelect = "";
    let orderBy = "";

    // If FULLTEXT search is active, add relevance_score
    if (useFulltext && parsedSearch && parsedSearch.trim() !== "") {
      relevanceSelect = `, MATCH(j.title, j.description, j.requirements) AGAINST(? IN BOOLEAN MODE) AS relevance_score`;

      // For ORDER BY: if sort is 'relevance', order by score; otherwise use user's sort choice
      if (sort === "relevance") {
        orderBy = "ORDER BY relevance_score DESC";
      } else {
        orderBy = "ORDER BY " + normalizeSort(sort);
      }
    } else {
      // No FULLTEXT search – use normal sorting
      // If sort is 'relevance' but no search, fallback to 'recent'
      const effectiveSort = sort === "relevance" ? "recent" : sort;
      orderBy = "ORDER BY " + normalizeSort(effectiveSort);
    }

    // Pagination
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 6, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    // Total count query (without relevance_score)
    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
      `,
      values,
    );

    // Main query with optional relevance_score
    // If using FULLTEXT, we need to duplicate the search param for the SELECT
    let queryParams = [...values];
    if (useFulltext && parsedSearch && parsedSearch.trim() !== "") {
      queryParams.push(parsedSearch); // For relevance_score in SELECT
    }
    queryParams.push(parsedLimit, offset);

    const sql = `
      SELECT ${selectFields} ${relevanceSelect}
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [jobs] = await pool.query(sql, queryParams);
    const totalCount = Number(countRows[0]?.total || 0);

    // Log search if 'search' param is present and non-empty
    if (search && search.trim() !== "") {
      try {
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip || req.connection.remoteAddress;

        await pool.query(
          `INSERT INTO search_logs (search_term, user_id, ip_address, result_count) 
           VALUES (?, ?, ?, ?)`,
          [search.trim(), userId, ipAddress, totalCount],
        );
      } catch (logError) {
        console.error("Search log error:", logError);
        // Don't fail the request if logging fails
      }
    }

    res.json({
      success: true,
      data: jobs,
      total: totalCount,
      page: parsedPage,
      limit: parsedLimit,
    });
  } catch (error) {
    console.error("getJobs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!user.company_id) {
      return res.status(400).json({
        success: false,
        message: "No company associated with this employer",
      });
    }

    const [jobs] = await pool.query(
      `
      SELECT
        j.*,
        (
          SELECT COUNT(*)
          FROM applications a
          WHERE a.job_id = j.id
        ) AS applications_count
      FROM jobs j
      WHERE j.company_id = ?
      ORDER BY j.created_at DESC
      `,
      [user.company_id],
    );

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("getMyJobs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
const getFeaturedJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT
        j.id,
        j.title,
        j.salary_min,
        j.salary_max,
        j.location,
        j.job_type,
        c.id AS company_id,
        c.name AS company_name,
        c.logo_url AS company_logo
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.is_featured = 1 AND j.is_active = 1
      ORDER BY j.created_at DESC
      LIMIT 6
    `);

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Get featured jobs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Get single job by ID
// @route GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    const [jobs] = await pool.query(
      `
      SELECT
        j.*,
        c.id AS company_id,
        c.name AS company_name,
        c.logo_url AS company_logo,
        c.website AS company_website,
        c.location AS company_location,
        c.is_verified AS company_verified
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
      LIMIT 1
      `,
      [jobId],
    );

    if (!jobs.length) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      data: jobs[0],
    });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

// @desc    Create a new job (employer only)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Only employers can post jobs",
      });
    }

    const {
      title,
      description,
      requirements,
      salary_min,
      salary_max,
      location,
      job_type,
      experience_level,
    } = req.body;

    if (!title || !description || !requirements || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const companyId = user.company_id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Employer profile incomplete",
      });
    }

    const normalizedExperienceLevelMap = {
      entry: "entry",
      mid: "mid",
      senior: "senior",
      lead: "lead",
    };

    const normalizedJobType = normalizeJobTypeForDb(job_type) || "full-time";
    const normalizedExperienceLevel =
      normalizedExperienceLevelMap[experience_level] || "mid";

    const [result] = await pool.query(
      `
      INSERT INTO jobs (
        title,
        description,
        requirements,
        salary_min,
        salary_max,
        location,
        job_type,
        experience_level,
        company_id,
        posted_by,
        is_active,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
      `,
      [
        title,
        description,
        requirements,
        salary_min || null,
        salary_max || null,
        location,
        normalizedJobType,
        normalizedExperienceLevel,
        companyId,
        user.id,
      ],
    );

    const [newJob] = await pool.query(
      `
      SELECT
        j.*,
        c.name AS company_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
      `,
      [result.insertId],
    );

    // Send job alerts to users with matching saved searches (non-blocking)
    try {
      const matchingUsers = await getUsersWithMatchingSavedSearches(newJob[0]);

      for (const user of matchingUsers) {
        const salary_range =
          newJob[0].salary_min && newJob[0].salary_max
            ? `$${newJob[0].salary_min} - $${newJob[0].salary_max}`
            : "Not specified";

        const replacements = {
          user_name: user.name,
          saved_search_name: user.saved_search_name || "Your saved search",
          job_title: newJob[0].title,
          company_name: newJob[0].company_name,
          job_location: newJob[0].location,
          job_type: newJob[0].job_type,
          salary_range: salary_range,
          job_summary:
            newJob[0].description.substring(0, 150) +
            (newJob[0].description.length > 150 ? "…" : ""),
          job_url: `${process.env.FRONTEND_URL}/jobs/${newJob[0].id}`,
          manage_alerts_url: `${process.env.FRONTEND_URL}/dashboard/seeker?tab=alerts`,
        };

        // Send email in background using template
        addEmailJob({
          to: user.email,
          subject: "New Job Match!",
          template: "new-job-alert",
          templateData: replacements,
        });
      }
    } catch (alertError) {
      console.error("Error sending job alerts:", alertError.message);
    }
    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob[0],
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

// @desc    Update a job (employer only)
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const updates = { ...req.body };

    const [jobs] = await pool.query(
      "SELECT company_id, posted_by FROM jobs WHERE id = ?",
      [id],
    );

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (jobs[0].posted_by !== user.id && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to edit this job" });
    }

    if (updates.job_type !== undefined) {
      updates.job_type = normalizeJobTypeForDb(updates.job_type);
    }

    const allowedFields = [
      "title",
      "description",
      "requirements",
      "salary_min",
      "salary_max",
      "location",
      "job_type",
      "experience_level",
      "is_active",
      "is_featured",
    ];

    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (setClauses.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    values.push(id);

    await pool.query(
      `UPDATE jobs SET ${setClauses.join(", ")} WHERE id = ?`,
      values,
    );

    const [updated] = await pool.query(
      `
      SELECT
        j.*,
        c.name AS company_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
      `,
      [id],
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a job (employer or admin)
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const [jobs] = await pool.query(
      "SELECT posted_by, company_id FROM jobs WHERE id = ?",
      [id],
    );

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (jobs[0].posted_by !== user.id && user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete this job" });
    }

    await pool.query("DELETE FROM jobs WHERE id = ?", [id]);

    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get recommended jobs based on user's skills
// @route   GET /api/jobs/recommended
const getRecommendedJobs = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== "job_seeker") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // 1. Get user's skill IDs
    const [skillRows] = await pool.query(
      `SELECT skill_id FROM job_seeker_skills WHERE job_seeker_id = ?`,
      [user.id], // Ensure user.id is the correct ID for job_seekers
    );

    let skillIds = skillRows.map((row) => row.skill_id);

    let sql;
    let params = [];

    if (skillIds.length > 0) {
      // 2. Build a query that joins jobs with required skills
      const placeholders = skillIds.map(() => "?").join(",");
      sql = `
        SELECT DISTINCT
          j.id, j.title, j.description, j.requirements, j.salary_min, j.salary_max,
          j.location, j.job_type, j.is_featured, j.created_at,
          c.id AS company_id, c.name AS company_name, c.logo_url AS company_logo
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        JOIN job_required_skills jrs ON j.id = jrs.job_id
        WHERE j.is_active = 1
          AND jrs.skill_id IN (${placeholders})
        ORDER BY j.created_at DESC
        LIMIT 6
      `;
      params = skillIds;
    } else {
      // Fallback: latest jobs
      sql = `
        SELECT 
          j.id, j.title, j.description, j.requirements, j.salary_min, j.salary_max,
          j.location, j.job_type, j.is_featured, j.created_at,
          c.id AS company_id, c.name AS company_name, c.logo_url AS company_logo
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = 1
        ORDER BY j.created_at DESC
        LIMIT 6
      `;
    }

    const [jobs] = await pool.query(sql, params);

    res.json({
      success: true,
      data: jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error("getRecommendedJobs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getJobs,
  getMyJobs,
  getFeaturedJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecommendedJobs,
};
