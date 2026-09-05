const dotenv = require('dotenv');

// Load env before anything else
dotenv.config();

/**
 * Validate that all required environment variables are set.
 * Fails fast at startup rather than at runtime.
 */
function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.error('FATAL: JWT_SECRET must be at least 16 characters');
    process.exit(1);
  }
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  authRateLimit: {
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 20,
  },
  runtimeRateLimit: {
    windowMs: parseInt(process.env.RUNTIME_RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RUNTIME_RATE_LIMIT_MAX_REQUESTS, 10) || 200,
  },
};

module.exports = { config, validateEnv };
