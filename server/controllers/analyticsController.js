const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../middleware/asyncHandler");

const statuses = ["todo", "in-progress", "review", "done"];
const priorities = ["low", "medium", "high", "urgent"];

const countBy = (items, key, values) => {
  const counts = Object.fromEntries(values.map((value) => [value, 0]));
  items.forEach((item) => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getSummary = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ owner: req.user._id });
  const now = new Date();
  const completed = tasks.filter((task) => task.status === "done").length;
  const overdue = tasks.filter((task) => task.dueDate && task.status !== "done" && task.dueDate < now).length;
  const totalEffort = tasks.reduce((sum, task) => sum + (task.estimatedEffort || 0), 0);
  const completedEffort = tasks
    .filter((task) => task.status === "done")
    .reduce((sum, task) => sum + (task.estimatedEffort || 0), 0);

  const effortByStatus = statuses.map((status) => ({
    name: status,
    effort: tasks
      .filter((task) => task.status === status)
      .reduce((sum, task) => sum + (task.estimatedEffort || 0), 0)
  }));

  const recentActivity = await ActivityLog.find({ user: req.user._id })
    .populate("task", "title")
    .populate("board", "title")
    .sort({ createdAt: -1 })
    .limit(8);

  res.json({
    totalTasks: tasks.length,
    completedTasks: completed,
    overdueTasks: overdue,
    completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    totalEffort,
    completedEffort,
    statusBreakdown: countBy(tasks, "status", statuses),
    priorityBreakdown: countBy(tasks, "priority", priorities),
    effortByStatus,
    recentActivity
  });
});

module.exports = { getSummary };
