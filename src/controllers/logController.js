const { asyncHandler } = require('../utils/errors');
const { getLogs, getAnalytics } = require('../services/logService');

/**
 * GET /api/projects/:projectId/logs
 */
const getProjectLogs = asyncHandler(async (req, res) => {
  const { page, limit, method, collectionSlug } = req.query;

  const result = await getLogs(req.params.projectId, {
    page,
    limit,
    method,
    collectionSlug,
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/projects/:projectId/analytics
 */
const getProjectAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getAnalytics(req.params.projectId);

  res.json({
    success: true,
    data: { analytics },
  });
});

module.exports = { getProjectLogs, getProjectAnalytics };
