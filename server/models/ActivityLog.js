const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
