const {
  calculateMatchesForUser,
  calculateMatchesForAllUsers,
  getMatchesForUser,
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