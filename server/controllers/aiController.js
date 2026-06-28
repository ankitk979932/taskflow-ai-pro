const asyncHandler = require("../middleware/asyncHandler");
const { suggestTaskPlan } = require("../services/aiService");
const { logActivity } = require("../services/activityService");

const suggestTask = asyncHandler(async (req, res) => {
  const suggestion = await suggestTaskPlan({
    title: req.body.title,
    description: req.body.description || ""
  });

  await logActivity({ action: "ai_suggestion_generated", user: req.user._id });
  res.json(suggestion);
});

module.exports = { suggestTask };
