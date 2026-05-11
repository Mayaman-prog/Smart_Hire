const { pool } = require('../config/database');

exports.getEstimate = async (req, res) => {
  const { title, location } = req.query;

  if (!title || !location) {
    return res.status(400).json({ message: 'Missing required parameters: title and location' });
  }

  try {
    // Average
    const [avgResult] = await pool.query(
      `SELECT AVG((salary_min + salary_max) / 2) AS average
       FROM jobs
       WHERE title LIKE ? AND location LIKE ?
       AND salary_min IS NOT NULL AND salary_max IS NOT NULL`,
      [`%${title}%`, `%${location}%`]
    );
    const average = avgResult[0]?.average || 0;

    // Median (manual calculation using row number for MariaDB)
    const [medianResult] = await pool.query(
      `SELECT AVG(salary) AS median FROM (
        SELECT (salary_min + salary_max) / 2 AS salary,
               ROW_NUMBER() OVER (ORDER BY (salary_min + salary_max) / 2) AS row_num,
               COUNT(*) OVER () AS total_count
        FROM jobs
        WHERE title LIKE ? AND location LIKE ?
        AND salary_min IS NOT NULL AND salary_max IS NOT NULL
      ) AS subquery
      WHERE row_num IN (FLOOR((total_count + 1) / 2), CEIL((total_count + 1) / 2))`,
      [`%${title}%`, `%${location}%`]
    );
    const median = medianResult[0]?.median || 0;

    // 25th percentile (manual)
    const [p25Result] = await pool.query(
      `SELECT AVG(salary) AS p25 FROM (
        SELECT (salary_min + salary_max) / 2 AS salary,
               ROW_NUMBER() OVER (ORDER BY (salary_min + salary_max) / 2) AS row_num,
               COUNT(*) OVER () AS total_count
        FROM jobs
        WHERE title LIKE ? AND location LIKE ?
        AND salary_min IS NOT NULL AND salary_max IS NOT NULL
      ) AS subquery
      WHERE row_num IN (FLOOR((total_count + 1) * 0.25), CEIL((total_count + 1) * 0.25))`,
      [`%${title}%`, `%${location}%`]
    );
    const p25 = p25Result[0]?.p25 || 0;

    // 75th percentile (manual)
    const [p75Result] = await pool.query(
      `SELECT AVG(salary) AS p75 FROM (
        SELECT (salary_min + salary_max) / 2 AS salary,
               ROW_NUMBER() OVER (ORDER BY (salary_min + salary_max) / 2) AS row_num,
               COUNT(*) OVER () AS total_count
        FROM jobs
        WHERE title LIKE ? AND location LIKE ?
        AND salary_min IS NOT NULL AND salary_max IS NOT NULL
      ) AS subquery
      WHERE row_num IN (FLOOR((total_count + 1) * 0.75), CEIL((total_count + 1) * 0.75))`,
      [`%${title}%`, `%${location}%`]
    );
    const p75 = p75Result[0]?.p75 || 0;

    // Sample count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS sampleCount
       FROM jobs
       WHERE title LIKE ? AND location LIKE ?
       AND salary_min IS NOT NULL AND salary_max IS NOT NULL`,
      [`%${title}%`, `%${location}%`]
    );
    const sampleCount = countResult[0]?.sampleCount || 0;

    res.json({
      average: Math.round(average),
      median: Math.round(median),
      p25: Math.round(p25),
      p75: Math.round(p75),
      sampleCount,
    });
  } catch (error) {
    console.error('Salary estimate error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTrend = async (req, res) => {
  const { title, location, months = 6 } = req.query;

  if (!title || !location) {
    return res.status(400).json({ message: 'Missing required parameters: title and location' });
  }

  try {
    // Monthly trend
    const [trend] = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        AVG((salary_min + salary_max) / 2) AS avg
       FROM jobs
       WHERE title LIKE ? AND location LIKE ?
       AND salary_min IS NOT NULL AND salary_max IS NOT NULL
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       GROUP BY month
       ORDER BY month ASC`,
      [`%${title}%`, `%${location}%`, parseInt(months)]
    );

    // Percentiles for trend
    const [percentileResult] = await pool.query(
      `SELECT
        AVG(CASE WHEN row_num IN (FLOOR((total_count + 1) * 0.25), CEIL((total_count + 1) * 0.25)) THEN salary ELSE NULL END) AS p25,
        AVG(CASE WHEN row_num IN (FLOOR((total_count + 1) * 0.50), CEIL((total_count + 1) * 0.50)) THEN salary ELSE NULL END) AS p50,
        AVG(CASE WHEN row_num IN (FLOOR((total_count + 1) * 0.75), CEIL((total_count + 1) * 0.75)) THEN salary ELSE NULL END) AS p75
       FROM (
        SELECT 
          (salary_min + salary_max) / 2 AS salary,
          ROW_NUMBER() OVER (ORDER BY (salary_min + salary_max) / 2) AS row_num,
          COUNT(*) OVER () AS total_count
        FROM jobs
        WHERE title LIKE ? AND location LIKE ?
        AND salary_min IS NOT NULL AND salary_max IS NOT NULL
       ) AS subquery`,
      [`%${title}%`, `%${location}%`]
    );
    const { p25, p50, p75 } = percentileResult[0] || {};

    res.json({
      trend: trend.map(t => ({ month: t.month, avg: Math.round(t.avg) })),
      percentiles: {
        p25: Math.round(p25 || 0),
        p50: Math.round(p50 || 0),
        p75: Math.round(p75 || 0),
      },
    });
  } catch (error) {
    console.error('Salary trend error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};