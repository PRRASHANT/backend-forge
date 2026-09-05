const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config');
const { AppError, asyncHandler } = require('../utils/errors');
const validator = require('validator');

function signToken(userId) {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required.', 400);
  }

  if (!validator.isEmail(email)) {
    throw new AppError('Please provide a valid email address.', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400);
  }

  // Check for existing user
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  // Include password explicitly (select: false in schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    },
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
    },
  });
});

module.exports = { register, login, getMe };
