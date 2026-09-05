const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const APIKey = require('../models/APIKey');
const { AppError } = require('../utils/errors');

/**
 * Generate a cryptographically secure API key.
 * Returns { rawKey, prefix, keyHash }.
 */
async function generateAPIKey(projectId, name, keyType = 'secret') {
  // Generate 32 random bytes → 64 hex characters
  const randomPart = crypto.randomBytes(32).toString('hex');

  // Prefix for identification
  const typePrefix = keyType === 'secret' ? 'bf_sk_' : 'bf_pk_';
  const rawKey = `${typePrefix}${randomPart}`;

  // Store first 12 chars (includes prefix) for lookup narrowing
  const prefix = rawKey.substring(0, 12);

  // Hash the full key with bcrypt
  const keyHash = await bcrypt.hash(rawKey, 10);

  const apiKey = await APIKey.create({
    project: projectId,
    name,
    prefix,
    keyHash,
    keyType,
  });

  return {
    id: apiKey._id,
    name: apiKey.name,
    prefix: apiKey.prefix,
    keyType: apiKey.keyType,
    rawKey, // Returned ONCE — never stored or logged
    createdAt: apiKey.createdAt,
  };
}

/**
 * List API keys for a project (metadata only — no raw keys or hashes).
 */
async function listAPIKeys(projectId) {
  return APIKey.find({ project: projectId })
    .select('-keyHash')
    .sort({ createdAt: -1 });
}

/**
 * Revoke (deactivate) an API key.
 */
async function revokeAPIKey(keyId, projectId) {
  const key = await APIKey.findOne({ _id: keyId, project: projectId });
  if (!key) {
    throw new AppError('API key not found.', 404);
  }
  key.isActive = false;
  await key.save();
  return key;
}

/**
 * Delete an API key permanently.
 */
async function deleteAPIKey(keyId, projectId) {
  const key = await APIKey.findOneAndDelete({ _id: keyId, project: projectId });
  if (!key) {
    throw new AppError('API key not found.', 404);
  }
  return key;
}

module.exports = { generateAPIKey, listAPIKeys, revokeAPIKey, deleteAPIKey };
