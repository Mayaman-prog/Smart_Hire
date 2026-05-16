const {
  calculateMatchesForUser,
  calculateMatchesForAllUsers,
  getMatchesForUser,
} = require("../src/services/jobMatchingService");

async function run() {
  try {
    const userId = process.argv[2];

    if (userId) {
      console.log(`[Test] Calculating matches for user ${userId}...`);

      const matches = await calculateMatchesForUser(userId);
      console.log(`[Test] Created/updated ${matches.length} matches.`);

      const storedMatches = await getMatchesForUser(userId, 10);
      console.table(
        storedMatches.map((match) => ({
          job_id: match.job_id,
          title: match.title || match.job_title,
          score: match.match_score,
          reason: match.reason_summary,
        }))
      );
    } else {
      console.log("[Test] Calculating matches for all users...");

      const summary = await calculateMatchesForAllUsers();
      console.log(summary);
    }

    process.exit(0);
  } catch (error) {
    console.error("[Test] Job matching test failed:", error);
    process.exit(1);
  }
}

run();