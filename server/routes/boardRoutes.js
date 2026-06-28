const express = require("express");
const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard
} = require("../controllers/boardController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  boardIdValidator,
  createBoardValidator,
  updateBoardValidator
} = require("../validators/boardValidators");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getBoards)
  .post(createBoardValidator, validateRequest, createBoard);

router.route("/:id")
  .get(boardIdValidator, validateRequest, getBoard)
  .put(updateBoardValidator, validateRequest, updateBoard)
  .delete(boardIdValidator, validateRequest, deleteBoard);

module.exports = router;
