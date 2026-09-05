const rateLimit = require('express-rate-limit');
const { config } = require('../config');

// In test environment, create a pass-through middleware instead of rate limiting
const isTest = config.env === 'test';
const noopMiddleware = (req, res, next) => next();

// General API rate limiter
const generalLimiter = isTest ? noopMiddleware : rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests. Please try again later.' },
  },
});

// Stricter limiter for auth endpoints
const authLimiter = isTest ? noopMiddleware : rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many authentication attempts. Please try again later.' },
  },
});

// Runtime API rate limiter (per API key via IP fallback)
const runtimeLimiter = isTest ? noopMiddleware : rateLimit({
  windowMs: config.runtimeRateLimit.windowMs,
  max: config.runtimeRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    // Use API key prefix if available, otherwise IP
    return req.apiKeyPrefix || req.ip;
  },
  message: {
    success: false,
    error: { message: 'Rate limit exceeded. Please try again later.' },
  },
});

module.exports = { generalLimiter, authLimiter, runtimeLimiter };
