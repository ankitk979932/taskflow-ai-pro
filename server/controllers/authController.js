const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorMiddleware");
const { signToken } = require("../services/tokenService");
const { logActivity } = require("../services/activityService");

const authResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email
  }
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError("Email is already registered", 409);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  await logActivity({ action: "user_registered", user: user._id });

  res.status(201).json(authResponse(user, token));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError("Invalid email or password", 401);
  }

  const token = signToken(user._id);
  await logActivity({ action: "user_logged_in", user: user._id });

  res.json(authResponse(user, token));
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

module.exports = { register, login, getMe };
