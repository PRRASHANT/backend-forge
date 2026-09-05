const CollectionDefinition = require('../models/CollectionDefinition');
const { AppError, asyncHandler } = require('../utils/errors');
const { getDynamicModel, validateData } = require('../services/schemaEngine');
const { logRequest } = require('../services/logService');

/**
 * Resolve the collection definition for a runtime request.
 * Attaches the collection definition and dynamic model to req.
 */
async function resolveCollection(req) {
  const { collectionSlug } = req.params;
  const projectId = req.project._id;

  const collectionDef = await CollectionDefinition.findOne({
    project: projectId,
    slug: collectionSlug,
  });

  if (!collectionDef) {
    throw new AppError(`Collection "${collectionSlug}" not found.`, 404);
  }

  return collectionDef;
}

/**
 * Middleware to log runtime requests with timing.
 */
function runtimeLogger(req, res, next) {
  req._startTime = Date.now();

  // Hook into response finish to log
  const originalSend = res.json.bind(res);
  res.json = function (body) {
    const duration = Date.now() - req._startTime;
    logRequest({
      project: req.project._id,
      collectionSlug: req.params.collectionSlug || null,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      apiKeyPrefix: req.apiKeyPrefix,
      isError: res.statusCode >= 400,
    });
    return originalSend(body);
  };

  next();
}

/**
 * POST /api/v1/:projectId/:collectionSlug
 * Create a document.
 */
const createDocument = asyncHandler(async (req, res) => {
  const collectionDef = await resolveCollection(req);
  const Model = getDynamicModel(req.project._id, collectionDef._id, collectionDef.fields);

  // Validate request data
  const errors = validateData(req.body, collectionDef.fields, false);
  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 422);
  }

  // Only allow defined fields
  const data = {};
  for (const field of collectionDef.fields) {
    if (req.body[field.name] !== undefined) {
      data[field.name] = req.body[field.name];
    }
  }

  const doc = await Model.create(data);

  res.status(201).json({
    success: true,
    data: { document: doc },
  });
});

/**
 * GET /api/v1/:projectId/:collectionSlug
 * List documents with pagination.
 */
const listDocuments = asyncHandler(async (req, res) => {
  const collectionDef = await resolveCollection(req);
  const Model = getDynamicModel(req.project._id, collectionDef._id, collectionDef.fields);

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  // Safe sort: only allow sorting on defined fields and timestamps
  const allowedSortFields = new Set([...collectionDef.fields.map(f => f.name), 'createdAt', 'updatedAt', '_id']);
  const requestedSort = req.query.sortBy || 'createdAt';
  const sortField = allowedSortFields.has(requestedSort) ? requestedSort : 'createdAt';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;

  // Simple filtering: only allow filtering on defined fields (reject operator objects)
  const filter = {};
  for (const field of collectionDef.fields) {
    if (req.query[field.name] !== undefined && typeof req.query[field.name] === 'string') {
      filter[field.name] = req.query[field.name];
    }
  }

  const [documents, total] = await Promise.all([
    Model.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).lean(),
    Model.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * GET /api/v1/:projectId/:collectionSlug/:documentId
 * Get a single document.
 */
const getDocument = asyncHandler(async (req, res) => {
  const collectionDef = await resolveCollection(req);
  const Model = getDynamicModel(req.project._id, collectionDef._id, collectionDef.fields);

  const doc = await Model.findById(req.params.documentId);
  if (!doc) {
    throw new AppError('Document not found.', 404);
  }

  res.json({
    success: true,
    data: { document: doc },
  });
});

/**
 * PATCH /api/v1/:projectId/:collectionSlug/:documentId
 * Update a document.
 */
const updateDocument = asyncHandler(async (req, res) => {
  const collectionDef = await resolveCollection(req);
  const Model = getDynamicModel(req.project._id, collectionDef._id, collectionDef.fields);

  // Validate request data (isUpdate = true)
  const errors = validateData(req.body, collectionDef.fields, true);
  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 422);
  }

  // Only allow defined fields
  const data = {};
  for (const field of collectionDef.fields) {
    if (req.body[field.name] !== undefined) {
      data[field.name] = req.body[field.name];
    }
  }

  const doc = await Model.findByIdAndUpdate(req.params.documentId, data, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!doc) {
    throw new AppError('Document not found.', 404);
  }

  res.json({
    success: true,
    data: { document: doc },
  });
});

/**
 * DELETE /api/v1/:projectId/:collectionSlug/:documentId
 * Delete a document.
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const collectionDef = await resolveCollection(req);
  const Model = getDynamicModel(req.project._id, collectionDef._id, collectionDef.fields);

  const doc = await Model.findByIdAndDelete(req.params.documentId);
  if (!doc) {
    throw new AppError('Document not found.', 404);
  }

  res.json({
    success: true,
    data: { message: 'Document deleted successfully.' },
  });
});

module.exports = {
  runtimeLogger,
  createDocument,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
};
