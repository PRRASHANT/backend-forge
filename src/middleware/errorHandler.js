const { config } = require('../config');

/**
 * Centralized error handling middleware.
 * Converts known error types to proper HTTP responses.
 * Hides implementation details in production.
 */
function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate value for ${field}. This ${field} already exists.`;
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Hide internal errors in production
  if (statusCode === 500 && config.env === 'production') {
    message = 'Internal server error';
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error('Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(config.env === 'development' && statusCode >= 500 && { stack: err.stack }),
    },
  });
}

module.exports = { errorHandler };
