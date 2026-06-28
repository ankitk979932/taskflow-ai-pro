const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

const loginValidator = [
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

module.exports = { registerValidator, loginValidator };
