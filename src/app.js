const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { config } = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const runtimeRoutes = require('./routes/runtime');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Request logging (skip in test)
if (config.env !== 'test') {
  app.use(morgan('short'));
}

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// General rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Management API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Runtime Data API routes
app.use('/api/v1', runtimeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.path} not found.` },
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
