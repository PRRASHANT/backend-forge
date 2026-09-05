const { asyncHandler } = require('../utils/errors');
const { generateAPIKey, listAPIKeys, revokeAPIKey, deleteAPIKey } = require('../services/apiKeyService');

/**
 * POST /api/projects/:projectId/api-keys
 */
const createAPIKey = asyncHandler(async (req, res) => {
  const { name, keyType } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: { message: 'API key name is required.' },
    });
  }

  const result = await generateAPIKey(req.params.projectId, name, keyType || 'secret');

  res.status(201).json({
    success: true,
    data: {
      apiKey: result,
      warning: 'Store this key securely. It will not be shown again.',
    },
  });
});

/**
 * GET /api/projects/:projectId/api-keys
 */
const getAPIKeys = asyncHandler(async (req, res) => {
  const keys = await listAPIKeys(req.params.projectId);

  res.json({
    success: true,
    data: { apiKeys: keys },
  });
});

/**
 * PATCH /api/projects/:projectId/api-keys/:keyId/revoke
 */
const revokeKey = asyncHandler(async (req, res) => {
  await revokeAPIKey(req.params.keyId, req.params.projectId);

  res.json({
    success: true,
    data: { message: 'API key revoked successfully.' },
  });
});

/**
 * DELETE /api/projects/:projectId/api-keys/:keyId
 */
const deleteKey = asyncHandler(async (req, res) => {
  await deleteAPIKey(req.params.keyId, req.params.projectId);

  res.json({
    success: true,
    data: { message: 'API key deleted successfully.' },
  });
});

module.exports = { createAPIKey, getAPIKeys, revokeKey, deleteKey };
