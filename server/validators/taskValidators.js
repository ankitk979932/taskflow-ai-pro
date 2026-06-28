const { body, param } = require("express-validator");

const statuses = ["todo", "in-progress", "review", "done"];
const priorities = ["low", "medium", "high", "urgent"];

const taskIdValidator = [param("id").isMongoId().withMessage("Invalid task id")];

const createTaskValidator = [
  body("title").trim().isLength({ min: 2, max: 160 }).withMessage("Title must be 2-160 characters"),
  body("description").optional().trim().isLength({ max: 1200 }).withMessage("Description is too long"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
  body("priority").optional().isIn(priorities).withMessage("Invalid priority"),
  body("dueDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid due date"),
  body("estimatedEffort").optional().isFloat({ min: 0, max: 200 }).withMessage("Effort must be 0-200 hours"),
  body("board").isMongoId().withMessage("Valid board id is required")
];

const updateTaskValidator = [
  ...taskIdValidator,
  body("title").optional().trim().isLength({ min: 2, max: 160 }).withMessage("Title must be 2-160 characters"),
  body("description").optional().trim().isLength({ max: 1200 }).withMessage("Description is too long"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
  body("priority").optional().isIn(priorities).withMessage("Invalid priority"),
  body("dueDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid due date"),
  body("estimatedEffort").optional().isFloat({ min: 0, max: 200 }).withMessage("Effort must be 0-200 hours"),
  body("board").optional().isMongoId().withMessage("Invalid board id")
];

const moveTaskValidator = [
  ...taskIdValidator,
  body("status").isIn(statuses).withMessage("Invalid status")
];

module.exports = { taskIdValidator, createTaskValidator, updateTaskValidator, moveTaskValidator, statuses, priorities };
