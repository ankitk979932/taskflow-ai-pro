const { body } = require("express-validator");

const suggestValidator = [
  body("title").trim().isLength({ min: 2, max: 160 }).withMessage("Title must be 2-160 characters"),
  body("description").optional().trim().isLength({ max: 1200 }).withMessage("Description is too long")
];

module.exports = { suggestValidator };
