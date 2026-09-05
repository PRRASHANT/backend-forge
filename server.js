const { validateEnv, config } = require('./src/config');
const { connectDB } = require('./src/config/db');
const app = require('./src/app');

// Validate environment before starting
validateEnv();

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`\n  Backend Forge server running in ${config.env} mode on port ${config.port}`);
    console.log(`  Health: http://localhost:${config.port}/health`);
    console.log(`  API:    http://localhost:${config.port}/api\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
}

startServer();
