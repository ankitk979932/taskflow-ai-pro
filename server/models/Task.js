const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: ""
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "done"],
      default: "todo",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    estimatedEffort: {
      type: Number,
      min: 0,
      max: 200,
      default: 4
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

taskSchema.virtual("isOverdue").get(function isOverdue() {
  return Boolean(this.dueDate && this.status !== "done" && new Date(this.dueDate) < new Date());
});

module.exports = mongoose.model("Task", taskSchema);
