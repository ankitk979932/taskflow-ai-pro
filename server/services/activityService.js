const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({ action, user, task = null, board = null }) => {
  try {
    await ActivityLog.create({ action, user, task, board });
  } catch (error) {
    console.error("Activity log failed:", error.message);
  }
};

module.exports = { logActivity };
