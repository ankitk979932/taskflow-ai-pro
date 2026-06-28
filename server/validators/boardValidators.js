const { body, param } = require("express-validator");

const boardIdValidator = [param("id").isMongoId().withMessage("Invalid board id")];

const createBoardValidator = [
  body("title").trim().isLength({ min: 2, max: 120 }).withMessage("Title must be 2-120 characters"),
  body("description").optional().trim().isLength({ max: 600 }).withMessage("Description is too long")
];

const updateBoardValidator = [
  ...boardIdValidator,
  body("title").optional().trim().isLength({ min: 2, max: 120 }).withMessage("Title must be 2-120 characters"),
  body("description").optional().trim().isLength({ max: 600 }).withMessage("Description is too long")
];

module.exports = { boardIdValidator, createBoardValidator, updateBoardValidator };
