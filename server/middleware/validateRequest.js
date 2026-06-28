const { validationResult } = require("express-validator");
const { ApiError } = require("./errorMiddleware");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError("Validation failed", 422, errors.array()));
  }

  next();
};

module.exports = validateRequest;
