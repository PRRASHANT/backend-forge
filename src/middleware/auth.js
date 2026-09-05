const jwt = require('jsonwebtoken');
const { config } = require('../config');
const User = require('../models/User');
const { AppError } = require('../utils/errors');

/**
 * JWT authentication middleware for Management API.
 * Extracts and verifies Bearer token, attaches user to req.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token expired. Please log in again.', 401);
      }
      throw new AppError('Invalid token.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
