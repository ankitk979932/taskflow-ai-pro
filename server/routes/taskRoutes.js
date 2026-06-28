const express = require("express");
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  taskIdValidator,
  createTaskValidator,
  updateTaskValidator,
  moveTaskValidator
} = require("../validators/taskValidators");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getTasks)
  .post(createTaskValidator, validateRequest, createTask);

router.patch("/:id/move", moveTaskValidator, validateRequest, moveTask);

router.route("/:id")
  .get(taskIdValidator, validateRequest, getTask)
  .put(updateTaskValidator, validateRequest, updateTask)
  .delete(taskIdValidator, validateRequest, deleteTask);

module.exports = router;
