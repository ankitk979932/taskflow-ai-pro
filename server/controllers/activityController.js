const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../middleware/asyncHandler");

const getActivity = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };

  if (req.query.board) query.board = req.query.board;
  if (req.query.task) query.task = req.query.task;

  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const activity = await ActivityLog.find(query)
    .populate("user", "name email")
    .populate("task", "title status")
    .populate("board", "title")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(activity);
});

module.exports = { getActivity };
