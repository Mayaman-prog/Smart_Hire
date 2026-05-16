const cron = require("node-cron");
const {
  calculateMatchesForAllUsers,
} = require("../services/jobMatchingService");

/**
 * Daily Job Matching Cron
 *
 * Runs every day at 2:00 AM server time.
 * It recalculates job match scores for all jobseekers
 * and stores the latest result in the job_matches table.
 */

function startDailyJobMatchingCron() {
  cron.schedule("0 2 * * *", async () => {
    console.log("[JobMatchingCron] Daily job matching started.");

    try {
      const summary = await calculateMatchesForAllUsers();

      console.log("[JobMatchingCron] Daily job matching completed:", summary);
    } catch (error) {
      console.error("[JobMatchingCron] Daily job matching failed:", error);
    }
  });
}

module.exports = startDailyJobMatchingCron;