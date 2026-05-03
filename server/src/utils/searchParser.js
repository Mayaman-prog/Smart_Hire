/**
 * Parses a raw search query and converts it to MySQL boolean mode syntax.
 * Supported operators:
 *   - "exact phrase"     → "exact phrase" (preserved)
 *   - -keyword           → -keyword (exclude)
 *   - OR                 → | (boolean OR)
 *   - AND                → space (boolean AND, default)
 * 
 * @param {string} raw - Raw search string from user
 * @returns {string} - Query ready for MySQL MATCH ... AGAINST (IN BOOLEAN MODE)
 */
function parseAdvancedQuery(raw) {
  if (!raw || typeof raw !== 'string') return raw;

  let query = raw.trim();

  // Handle exact phrases (keep them as is)
  query = query.replace(/\s+OR\s+/gi, ' | ');
  query = query.replace(/\s+AND\s+/gi, ' ');
  query = query.replace(/\s+/g, ' ').trim();

  return query;
}

module.exports = { parseAdvancedQuery };