const Task = require("../models/Task");
const { findOwnedBoard } = require("./boardController");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorMiddleware");
const { logActivity } = require("../services/activityService");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findOwnedTask = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, owner: userId });

  if (!task) {
    throw new ApiError("Task not found", 404);
  }

  return task;
};

const buildTaskQuery = (query, userId) => {
  const filters = [{ owner: userId }];

  if (query.board) filters.push({ board: query.board });
  if (query.status) filters.push({ status: query.status });
  if (query.priority) filters.push({ priority: query.priority });
  if (query.overdue === "true") {
    filters.push({ dueDate: { $lt: new Date() }, status: { $ne: "done" } });
  }
  if (query.search) {
    const regex = new RegExp(escapeRegExp(query.search), "i");
    filters.push({ $or: [{ title: regex }, { description: regex }] });
  }

  return filters.length === 1 ? filters[0] : { $and: filters };
};

const buildTaskSort = (sort) => {
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "due-asc": { dueDate: 1, createdAt: -1 },
    "due-desc": { dueDate: -1, createdAt: -1 }
  };

  return sortMap[sort] || sortMap.newest;
};

const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const query = buildTaskQuery(req.query, req.user._id);
  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .populate("board", "title")
    .sort(buildTaskSort(req.query.sort))
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1)
    }
  });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  await task.populate("board", "title description");
  res.json(task);
});

const createTask = asyncHandler(async (req, res) => {
  const board = await findOwnedBoard(req.body.board, req.user._id);
  const task = await Task.create({
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "todo",
    priority: req.body.priority || "medium",
    dueDate: req.body.dueDate || null,
    estimatedEffort: req.body.estimatedEffort ?? 4,
    board: board._id,
    owner: req.user._id
  });

  await logActivity({ action: "task_created", user: req.user._id, task: task._id, board: board._id });
  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  const previousStatus = task.status;

  if (req.body.board && String(req.body.board) !== String(task.board)) {
    const board = await findOwnedBoard(req.body.board, req.user._id);
    task.board = board._id;
  }

  task.title = req.body.title ?? task.title;
  task.description = req.body.description ?? task.description;
  task.status = req.body.status ?? task.status;
  task.priority = req.body.priority ?? task.priority;
  task.dueDate = req.body.dueDate === "" ? null : req.body.dueDate ?? task.dueDate;
  task.estimatedEffort = req.body.estimatedEffort ?? task.estimatedEffort;
  await task.save();

  await logActivity({
    action: previousStatus !== task.status ? "task_moved" : "task_updated",
    user: req.user._id,
    task: task._id,
    board: task.board
  });

  res.json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);

  await task.deleteOne();
  await logActivity({ action: "task_deleted", user: req.user._id, task: task._id, board: task.board });

  res.json({ message: "Task deleted" });
});

const moveTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  task.status = req.body.status;
  await task.save();

  await logActivity({ action: "task_moved", user: req.user._id, task: task._id, board: task.board });
  res.json(task);
});

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, moveTask, findOwnedTask };
