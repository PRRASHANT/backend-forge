const mongoose = require('mongoose');
const APIRequestLog = require('../models/APIRequestLog');

/**
 * Record a runtime API request asynchronously (fire-and-forget).
 */
function logRequest({ project, collectionSlug, method, path, statusCode, duration, apiKeyPrefix, isError }) {
  // Don't await — fire and forget to avoid blocking responses
  APIRequestLog.create({
    project,
    collectionSlug: collectionSlug || null,
    method,
    path,
    statusCode,
    duration,
    apiKeyPrefix: apiKeyPrefix || null,
    isError: isError || false,
  }).catch((err) => {
    console.error('Failed to log request:', err.message);
  });
}

/**
 * Fetch paginated logs for a project.
 */
async function getLogs(projectId, { page = 1, limit = 50, method, collectionSlug } = {}) {
  const query = { project: projectId };

  if (method) query.method = method.toUpperCase();
  if (collectionSlug) query.collectionSlug = collectionSlug;

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [logs, total] = await Promise.all([
    APIRequestLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    APIRequestLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
}

/**
 * Get analytics data for a project from actual log data.
 */
async function getAnalytics(projectId) {
  // Cast to ObjectId for aggregation pipelines (which don't auto-cast like Mongoose queries)
  const pid = new mongoose.Types.ObjectId(projectId);

  const [
    totalRequests,
    successfulRequests,
    failedRequests,
    methodBreakdown,
    collectionBreakdown,
    avgDuration,
    statusBreakdown,
    recentRequests,
  ] = await Promise.all([
    APIRequestLog.countDocuments({ project: pid }),
    APIRequestLog.countDocuments({ project: pid, isError: false }),
    APIRequestLog.countDocuments({ project: pid, isError: true }),
    APIRequestLog.aggregate([
      { $match: { project: pid } },
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    APIRequestLog.aggregate([
      { $match: { project: pid, collectionSlug: { $ne: null } } },
      { $group: { _id: '$collectionSlug', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    APIRequestLog.aggregate([
      { $match: { project: pid } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
    ]),
    APIRequestLog.aggregate([
      { $match: { project: pid } },
      { $group: { _id: '$statusCode', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    APIRequestLog.find({ project: pid })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) : '0.0',
    averageResponseTime: avgDuration[0] ? Math.round(avgDuration[0].avgDuration) : 0,
    requestsByMethod: methodBreakdown.reduce((acc, m) => {
      acc[m._id] = m.count;
      return acc;
    }, {}),
    requestsByCollection: collectionBreakdown.reduce((acc, c) => {
      acc[c._id] = c.count;
      return acc;
    }, {}),
    statusCodeDistribution: statusBreakdown.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
    recentRequests,
  };
}

module.exports = { logRequest, getLogs, getAnalytics };
