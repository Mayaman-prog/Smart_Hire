const {
  calculateMatchesForUser,
  calculateMatchesForAllUsers,
  getMatchesForUser,
  saveRecommendationFeedback,
} = require("../services/jobMatchingService");

function getAuthUserId(req) {
  return req.user?.id || req.user?.userId || req.user?.user_id;
}

exports.getMyJobMatches = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const limit = req.query.limit || 20;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised. User ID was not found in request.",
      });
    }

    const matches = await getMatchesForUser(userId, limit);

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("[JobMatchController] getMyJobMatches:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job matches.",
    });
  }
};

exports.recalculateMyJobMatches = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised. User ID was not found in request.",
      });
    }

    const matches = await calculateMatchesForUser(userId);

    return res.status(200).json({
      success: true,
      message: "Job matches recalculated successfully.",
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("[JobMatchController] recalculateMyJobMatches:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to recalculate job matches.",
    });
  }
};

exports.recalculateAllJobMatches = async (req, res) => {
  try {
    const summary = await calculateMatchesForAllUsers();

    return res.status(200).json({
      success: true,
      message: "All job matches recalculated successfully.",
      summary,
    });
  } catch (error) {
    console.error("[JobMatchController] recalculateAllJobMatches:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to recalculate all job matches.",
    });
  }
};

exports.saveMyRecommendationFeedback = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const jobId = Number(req.params.jobId);
    const { feedback } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised. User ID was not found in request.",
      });
    }

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid job ID is required.",
      });
    }

    if (!["up", "down", null, undefined, ""].includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be either up, down, or empty to remove it.",
      });
    }

    // Saves up or down feedback, or removes feedback when the same button is clicked again.
    const savedFeedback = await saveRecommendationFeedback(
      userId,
      jobId,
      feedback || null,
    );

    // The existing audit logger records recommendation feedback activity.
    if (req.logAction) {
      req.logAction("RECOMMENDATION_FEEDBACK", {
        job_id: jobId,
        feedback: savedFeedback || "removed",
      });
    }

    return res.status(200).json({
      success: true,
      message: savedFeedback
        ? "Recommendation feedback saved successfully."
        : "Recommendation feedback removed successfully.",
      data: {
        job_id: jobId,
        feedback: savedFeedback,
      },
    });
  } catch (error) {
    console.error("[JobMatchController] saveMyRecommendationFeedback:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 404 ? error.message : "Failed to save feedback.",
    });
  }
};
