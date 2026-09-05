const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;

/**
 * Connect to in-memory MongoDB for tests.
 */
async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Set env for config
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-16-chars';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(uri);
}

/**
 * Clear all collections between tests.
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Clear dynamic model cache
  const { clearModelCache } = require('../src/services/schemaEngine');
  clearModelCache();
}

/**
 * Disconnect and stop in-memory MongoDB.
 */
async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { setupTestDB, clearDatabase, teardownTestDB, app };
