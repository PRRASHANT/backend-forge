const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const APIKey = require('../models/APIKey');
const { AppError } = require('../utils/errors');

/**
 * Runtime API authentication via X-API-Key header.
 * Validates the key against stored hashes, resolves project context.
 */
async function runtimeAuth(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      throw new AppError('API key required. Provide X-API-Key header.', 401);
    }

    // Extract prefix for lookup narrowing
    const prefix = apiKey.substring(0, 12);

    // Find active keys with matching prefix
    const candidates = await APIKey.find({ prefix, isActive: true }).populate('project');

    if (candidates.length === 0) {
      throw new AppError('Invalid API key.', 401);
    }

    // Verify against hash — iterate candidates (typically 1)
    let matchedKey = null;
    for (const candidate of candidates) {
      const isMatch = await bcrypt.compare(apiKey, candidate.keyHash);
      if (isMatch) {
        matchedKey = candidate;
        break;
      }
    }

    if (!matchedKey) {
      throw new AppError('Invalid API key.', 401);
    }

    if (!matchedKey.project) {
      throw new AppError('Project associated with this API key no longer exists.', 401);
    }

    // Attach project context for downstream middleware
    req.project = matchedKey.project;
    req.apiKeyPrefix = matchedKey.prefix;
    req.apiKeyId = matchedKey._id;

    // Update lastUsedAt asynchronously (fire and forget)
    APIKey.updateOne({ _id: matchedKey._id }, { lastUsedAt: new Date() }).catch(() => { });

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { runtimeAuth };
