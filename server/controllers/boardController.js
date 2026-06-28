const Board = require("../models/Board");
const Task = require("../models/Task");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorMiddleware");
const { logActivity } = require("../services/activityService");

const findOwnedBoard = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });

  if (!board) {
    throw new ApiError("Board not found", 404);
  }

  return board;
};

const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ owner: req.user._id }).sort({ updatedAt: -1 });
  const counts = await Task.aggregate([
    { $match: { owner: req.user._id } },
    { $group: { _id: "$board", totalTasks: { $sum: 1 }, completedTasks: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } } } }
  ]);

  const countMap = new Map(counts.map((item) => [String(item._id), item]));
  const data = boards.map((board) => {
    const count = countMap.get(String(board._id)) || { totalTasks: 0, completedTasks: 0 };
    return {
      ...board.toObject(),
      totalTasks: count.totalTasks,
      completedTasks: count.completedTasks
    };
  });

  res.json(data);
});

const getBoard = asyncHandler(async (req, res) => {
  const board = await findOwnedBoard(req.params.id, req.user._id);
  res.json(board);
});

const createBoard = asyncHandler(async (req, res) => {
  const board = await Board.create({
    title: req.body.title,
    description: req.body.description || "",
    owner: req.user._id
  });

  await logActivity({ action: "board_created", user: req.user._id, board: board._id });
  res.status(201).json(board);
});

const updateBoard = asyncHandler(async (req, res) => {
  const board = await findOwnedBoard(req.params.id, req.user._id);

  board.title = req.body.title ?? board.title;
  board.description = req.body.description ?? board.description;
  await board.save();

  await logActivity({ action: "board_updated", user: req.user._id, board: board._id });
  res.json(board);
});

const deleteBoard = asyncHandler(async (req, res) => {
  const board = await findOwnedBoard(req.params.id, req.user._id);

  await Task.deleteMany({ board: board._id, owner: req.user._id });
  await board.deleteOne();
  await logActivity({ action: "board_deleted", user: req.user._id, board: board._id });

  res.json({ message: "Board deleted" });
});

module.exports = { getBoards, getBoard, createBoard, updateBoard, deleteBoard, findOwnedBoard };
