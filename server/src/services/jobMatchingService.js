const { pool } = require("../config/database");

/**
 * SmartHire Job Matching Service
 *
 * This service calculates job recommendation scores by comparing
 * user features with active job posts.
 *
 * Features used:
 * - Skills
 * - Past applied jobs
 * - Saved jobs
 * - Past work titles
 * - Location
 * - Job type
 * - Salary expectation
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "you",
  "your",
  "we",
  "our",
  "will",
  "can",
  "must",
  "should",
  "job",
  "role",
  "work",
  "team",
]);

const WEIGHTS = {
  keyword: 0.45,
  location: 0.15,
  jobType: 0.15,
  salary: 0.15,
  history: 0.1,
};

function clampScore(value) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function optionalQuery(sql, params = []) {
  try {
    return await query(sql, params);
  } catch (error) {
    console.warn("[JobMatching] Optional query skipped:", error.message);
    return [];
  }
}

function normaliseText(value) {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value.join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).join(" ");
  }

  return String(value)
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^a-z0-9+#. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePossibleJson(value) {
  if (!value) return "";

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function tokenize(text) {
  return normaliseText(text)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .filter((token) => !STOP_WORDS.has(token));
}

function termFrequency(tokens) {
  const tf = {};

  tokens.forEach((token) => {
    tf[token] = (tf[token] || 0) + 1;
  });

  const total = tokens.length || 1;

  Object.keys(tf).forEach((token) => {
    tf[token] = tf[token] / total;
  });

  return tf;
}

function inverseDocumentFrequency(documents) {
  const idf = {};
  const totalDocuments = documents.length || 1;

  documents.forEach((tokens) => {
    const uniqueTokens = new Set(tokens);

    uniqueTokens.forEach((token) => {
      idf[token] = (idf[token] || 0) + 1;
    });
  });

  Object.keys(idf).forEach((token) => {
    idf[token] = Math.log((totalDocuments + 1) / (idf[token] + 1)) + 1;
  });

  return idf;
}

function buildTfidfVector(tokens, idf) {
  const tf = termFrequency(tokens);
  const vector = {};

  Object.keys(tf).forEach((token) => {
    vector[token] = tf[token] * (idf[token] || 1);
  });

  return vector;
}

function cosineSimilarity(vectorA, vectorB) {
  const allTokens = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  allTokens.forEach((token) => {
    const a = vectorA[token] || 0;
    const b = vectorB[token] || 0;

    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  });

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function getField(record, possibleNames) {
  for (const name of possibleNames) {
    if (record && record[name] !== undefined && record[name] !== null) {
      return record[name];
    }
  }

  return "";
}

function buildJobText(job) {
  return [
    getField(job, ["title", "job_title"]),
    getField(job, ["description", "job_description"]),
    getField(job, ["requirements", "requirement"]),
    getField(job, ["skills_required", "required_skills", "skills"]),
    getField(job, ["job_type", "type"]),
    getField(job, ["location", "job_location"]),
  ].join(" ");
}

function buildUserText(
  user,
  appliedJobs,
  savedJobs,
  workExperiences,
  resumeRows,
) {
  const skills = parsePossibleJson(
    getField(user, ["skills", "user_skills", "technical_skills"]),
  );

  const appliedJobTitles = appliedJobs.map((job) =>
    getField(job, ["title", "job_title"]),
  );

  const savedJobTitles = savedJobs.map((job) =>
    getField(job, ["title", "job_title"]),
  );

  const workTitles = workExperiences.map((item) =>
    getField(item, ["title", "job_title", "position", "designation"]),
  );

  const resumeText = resumeRows
    .map((resume) =>
      [
        getField(resume, ["skills", "parsed_skills"]),
        getField(resume, ["summary", "resume_text", "parsed_text"]),
      ].join(" "),
    )
    .join(" ");

  return [
    skills,
    getField(user, ["bio", "summary", "profile_summary"]),
    getField(user, ["preferred_job_title", "desired_job_title"]),
    appliedJobTitles.join(" "),
    savedJobTitles.join(" "),
    workTitles.join(" "),
    resumeText,
  ].join(" ");
}

function getMatchingKeywords(userTokens, jobTokens) {
  const userSet = new Set(userTokens);
  const matches = [];

  jobTokens.forEach((token) => {
    if (userSet.has(token) && !matches.includes(token)) {
      matches.push(token);
    }
  });

  return matches.slice(0, 12);
}

function calculateLocationScore(user, job) {
  const userLocation = normaliseText(
    getField(user, ["preferred_location", "location", "city", "address"]),
  );

  const jobLocation = normaliseText(
    getField(job, ["location", "job_location", "city"]),
  );

  if (!userLocation || !jobLocation) {
    return 50;
  }

  if (jobLocation.includes("remote") || jobLocation.includes("hybrid")) {
    return 85;
  }

  if (userLocation === jobLocation) {
    return 100;
  }

  if (
    jobLocation.includes(userLocation) ||
    userLocation.includes(jobLocation)
  ) {
    return 90;
  }

  const userTokens = new Set(tokenize(userLocation));
  const jobTokens = tokenize(jobLocation);

  const overlap = jobTokens.filter((token) => userTokens.has(token)).length;

  if (overlap > 0) {
    return 70;
  }

  return 25;
}

function calculateJobTypeScore(user, job) {
  const preferredType = normaliseText(
    getField(user, ["preferred_job_type", "job_type", "desired_job_type"]),
  );

  const jobType = normaliseText(getField(job, ["job_type", "type"]));

  if (!preferredType || !jobType) {
    return 50;
  }

  if (preferredType === jobType) {
    return 100;
  }

  if (preferredType.includes(jobType) || jobType.includes(preferredType)) {
    return 85;
  }

  const preferredTokens = new Set(tokenize(preferredType));
  const jobTokens = tokenize(jobType);

  const overlap = jobTokens.filter((token) =>
    preferredTokens.has(token),
  ).length;

  return overlap > 0 ? 70 : 25;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(String(value).replace(/[^0-9.]/g, ""));

  return Number.isFinite(number) ? number : null;
}

function getJobSalaryRange(job) {
  const minSalary = parseNumber(
    getField(job, ["salary_min", "min_salary", "minimum_salary"]),
  );

  const maxSalary = parseNumber(
    getField(job, ["salary_max", "max_salary", "maximum_salary"]),
  );

  const fixedSalary = parseNumber(getField(job, ["salary", "salary_range"]));

  if (minSalary && maxSalary) {
    return { min: minSalary, max: maxSalary };
  }

  if (fixedSalary) {
    return { min: fixedSalary, max: fixedSalary };
  }

  return { min: null, max: null };
}

function estimateExpectedSalary(user, appliedJobs, savedJobs) {
  const userExpectedSalary = parseNumber(
    getField(user, ["expected_salary", "salary_expectation", "desired_salary"]),
  );

  if (userExpectedSalary) {
    return userExpectedSalary;
  }

  const salaryValues = [...appliedJobs, ...savedJobs]
    .map((job) => {
      const range = getJobSalaryRange(job);

      if (range.min && range.max) {
        return (range.min + range.max) / 2;
      }

      return range.min || range.max;
    })
    .filter(Boolean);

  if (salaryValues.length === 0) {
    return null;
  }

  return (
    salaryValues.reduce((total, salary) => total + salary, 0) /
    salaryValues.length
  );
}

function calculateSalaryScore(user, job, appliedJobs, savedJobs) {
  const expectedSalary = estimateExpectedSalary(user, appliedJobs, savedJobs);
  const jobSalary = getJobSalaryRange(job);

  if (!expectedSalary || (!jobSalary.min && !jobSalary.max)) {
    return 50;
  }

  const minSalary = jobSalary.min || jobSalary.max;
  const maxSalary = jobSalary.max || jobSalary.min;

  if (expectedSalary >= minSalary && expectedSalary <= maxSalary) {
    return 100;
  }

  const distance =
    expectedSalary < minSalary
      ? minSalary - expectedSalary
      : expectedSalary - maxSalary;

  const tolerance = expectedSalary * 0.5 || 1;

  return clampScore(100 - (distance / tolerance) * 100);
}

function calculateHistoryScore(job, appliedJobs, savedJobs, workExperiences) {
  const jobTitleTokens = tokenize(getField(job, ["title", "job_title"]));

  const historyText = [
    ...appliedJobs.map((item) => getField(item, ["title", "job_title"])),
    ...savedJobs.map((item) => getField(item, ["title", "job_title"])),
    ...workExperiences.map((item) =>
      getField(item, ["title", "job_title", "position", "designation"]),
    ),
  ].join(" ");

  const historyTokens = new Set(tokenize(historyText));

  if (jobTitleTokens.length === 0 || historyTokens.size === 0) {
    return 50;
  }

  const overlap = jobTitleTokens.filter((token) =>
    historyTokens.has(token),
  ).length;

  return clampScore((overlap / jobTitleTokens.length) * 100);
}

function isActiveJob(job) {
  const status = normaliseText(getField(job, ["status", "job_status"]));
  const isActive = getField(job, ["is_active", "active"]);

  if (isActive === 1 || isActive === true || isActive === "1") {
    return true;
  }

  if (!status) {
    return true;
  }

  return ["active", "open", "published", "approved"].includes(status);
}

function createReasonSummary(scores, matchingKeywords) {
  const reasons = [];

  if (scores.keywordScore >= 60) {
    reasons.push("strong keyword and skills overlap");
  }

  if (scores.locationScore >= 80) {
    reasons.push("location preference matches");
  }

  if (scores.jobTypeScore >= 80) {
    reasons.push("job type preference matches");
  }

  if (scores.salaryScore >= 80) {
    reasons.push("salary expectation is aligned");
  }

  if (scores.historyScore >= 60) {
    reasons.push("similarity with previous applied or saved jobs");
  }

  if (matchingKeywords.length > 0) {
    reasons.push(`matching keywords: ${matchingKeywords.join(", ")}`);
  }

  return reasons.length > 0
    ? reasons.join("; ")
    : "general recommendation based on available profile data";
}

async function getAllJobSeekers() {
  const users = await query("SELECT * FROM users");

  return users.filter((user) => {
    const role = normaliseText(getField(user, ["role", "user_role"]));

    return (
      !role || ["jobseeker", "job seeker", "seeker", "candidate"].includes(role)
    );
  });
}

async function getActiveJobs() {
  const jobs = await query("SELECT * FROM jobs");

  return jobs.filter(isActiveJob);
}

async function getUserFeatureData(userId) {
  const users = await query("SELECT * FROM users WHERE id = ?", [userId]);

  if (!users.length) {
    throw new Error("User not found.");
  }

  const user = users[0];

  const appliedJobs = await optionalQuery(
    `
    SELECT j.*
    FROM applications a
    INNER JOIN jobs j ON j.id = a.job_id
    WHERE a.user_id = ?
    `,
    [userId],
  );

  const savedJobs = await optionalQuery(
    `
    SELECT j.*
    FROM saved_jobs sj
    INNER JOIN jobs j ON j.id = sj.job_id
    WHERE sj.user_id = ?
    `,
    [userId],
  );

  const workExperiences = [];

  const resumeRows = await optionalQuery(
    `
    SELECT *
    FROM resumes
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [userId],
  );

  return {
    user,
    appliedJobs,
    savedJobs,
    workExperiences,
    resumeRows,
  };
}

async function calculateMatchesForUser(userId) {
  const featureData = await getUserFeatureData(userId);
  const activeJobs = await getActiveJobs();

  const userText = buildUserText(
    featureData.user,
    featureData.appliedJobs,
    featureData.savedJobs,
    featureData.workExperiences,
    featureData.resumeRows,
  );

  const userTokens = tokenize(userText);

  const jobDocuments = activeJobs.map((job) => tokenize(buildJobText(job)));
  const documentsForIdf = [userTokens, ...jobDocuments];
  const idf = inverseDocumentFrequency(documentsForIdf);

  const userVector = buildTfidfVector(userTokens, idf);

  const matches = [];

  for (const job of activeJobs) {
    const jobTokens = tokenize(buildJobText(job));
    const jobVector = buildTfidfVector(jobTokens, idf);

    const keywordScore = clampScore(
      cosineSimilarity(userVector, jobVector) * 100,
    );
    const locationScore = clampScore(
      calculateLocationScore(featureData.user, job),
    );
    const jobTypeScore = clampScore(
      calculateJobTypeScore(featureData.user, job),
    );
    const salaryScore = clampScore(
      calculateSalaryScore(
        featureData.user,
        job,
        featureData.appliedJobs,
        featureData.savedJobs,
      ),
    );
    const historyScore = clampScore(
      calculateHistoryScore(
        job,
        featureData.appliedJobs,
        featureData.savedJobs,
        featureData.workExperiences,
      ),
    );

    const matchScore = clampScore(
      keywordScore * WEIGHTS.keyword +
        locationScore * WEIGHTS.location +
        jobTypeScore * WEIGHTS.jobType +
        salaryScore * WEIGHTS.salary +
        historyScore * WEIGHTS.history,
    );

    const matchingKeywords = getMatchingKeywords(userTokens, jobTokens);

    const scoreBreakdown = {
      keywordScore,
      locationScore,
      jobTypeScore,
      salaryScore,
      historyScore,
    };

    matches.push({
      userId,
      jobId: job.id,
      matchScore,
      ...scoreBreakdown,
      matchingKeywords,
      reasonSummary: createReasonSummary(scoreBreakdown, matchingKeywords),
    });
  }

  await saveMatches(matches);

  return matches;
}

async function saveMatches(matches) {
  for (const match of matches) {
    await query(
      `
      INSERT INTO job_matches (
        user_id,
        job_id,
        match_score,
        keyword_score,
        location_score,
        job_type_score,
        salary_score,
        history_score,
        matching_keywords,
        reason_summary,
        last_calculated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        match_score = VALUES(match_score),
        keyword_score = VALUES(keyword_score),
        location_score = VALUES(location_score),
        job_type_score = VALUES(job_type_score),
        salary_score = VALUES(salary_score),
        history_score = VALUES(history_score),
        matching_keywords = VALUES(matching_keywords),
        reason_summary = VALUES(reason_summary),
        last_calculated_at = NOW(),
        updated_at = NOW()
      `,
      [
        match.userId,
        match.jobId,
        match.matchScore,
        match.keywordScore,
        match.locationScore,
        match.jobTypeScore,
        match.salaryScore,
        match.historyScore,
        JSON.stringify(match.matchingKeywords),
        match.reasonSummary,
      ],
    );
  }
}

async function calculateMatchesForAllUsers() {
  const users = await getAllJobSeekers();

  const summary = {
    totalUsers: users.length,
    processedUsers: 0,
    failedUsers: 0,
    totalMatches: 0,
    errors: [],
  };

  for (const user of users) {
    try {
      const matches = await calculateMatchesForUser(user.id);

      summary.processedUsers += 1;
      summary.totalMatches += matches.length;
    } catch (error) {
      summary.failedUsers += 1;
      summary.errors.push({
        userId: user.id,
        message: error.message,
      });

      console.error(`[JobMatching] Failed for user ${user.id}:`, error.message);
    }
  }

  return summary;
}

async function getMatchesForUser(userId, limit = 20) {
  return query(
    `
    SELECT
      jm.id,
      jm.user_id,
      jm.job_id,
      jm.match_score,
      jm.keyword_score,
      jm.location_score,
      jm.job_type_score,
      jm.salary_score,
      jm.history_score,
      jm.matching_keywords,
      jm.reason_summary,
      jm.last_calculated_at,
      j.*
    FROM job_matches jm
    INNER JOIN jobs j ON j.id = jm.job_id
    WHERE jm.user_id = ?
    ORDER BY jm.match_score DESC, jm.last_calculated_at DESC
    LIMIT ?
    `,
    [userId, Number(limit)],
  );
}

module.exports = {
  calculateMatchesForUser,
  calculateMatchesForAllUsers,
  getMatchesForUser,
};
