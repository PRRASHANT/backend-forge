const CollectionDefinition = require('../models/CollectionDefinition');
const { AppError, asyncHandler } = require('../utils/errors');
const { FIELD_TYPES, RESERVED_COLLECTION_NAMES } = require('../utils/constants');
const { invalidateModel } = require('../services/schemaEngine');

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate field definitions before saving.
 */
function validateFields(fields) {
  const errors = [];

  if (!Array.isArray(fields) || fields.length === 0) {
    return ['At least one field is required.'];
  }

  if (fields.length > 50) {
    return ['Maximum 50 fields per collection.'];
  }

  const fieldNames = new Set();

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    if (!field.name || typeof field.name !== 'string') {
      errors.push(`Field ${i + 1}: name is required.`);
      continue;
    }

    // Validate field name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
      errors.push(`Field "${field.name}": name must start with a letter and contain only letters, numbers, and underscores.`);
    }

    // Prevent reserved field names
    const reserved = ['_id', '__v', 'createdAt', 'updatedAt'];
    if (reserved.includes(field.name)) {
      errors.push(`Field "${field.name}": "${field.name}" is a reserved field name.`);
    }

    // Check duplicates
    if (fieldNames.has(field.name)) {
      errors.push(`Field "${field.name}": duplicate field name.`);
    }
    fieldNames.add(field.name);

    // Validate type
    if (!field.type || !FIELD_TYPES.includes(field.type)) {
      errors.push(`Field "${field.name}": type must be one of: ${FIELD_TYPES.join(', ')}`);
      continue;
    }

    // Type-specific validations
    if (field.type === 'enum' && (!field.enumValues || !Array.isArray(field.enumValues) || field.enumValues.length === 0)) {
      errors.push(`Field "${field.name}": enum type requires enumValues array.`);
    }

    if (field.type === 'array' && field.itemType && !FIELD_TYPES.includes(field.itemType)) {
      errors.push(`Field "${field.name}": itemType must be a valid field type.`);
    }

    if (field.minLength != null && field.maxLength != null && field.minLength > field.maxLength) {
      errors.push(`Field "${field.name}": minLength cannot be greater than maxLength.`);
    }

    if (field.min != null && field.max != null && field.min > field.max) {
      errors.push(`Field "${field.name}": min cannot be greater than max.`);
    }
  }

  return errors;
}

/**
 * POST /api/projects/:projectId/collections
 */
const createCollection = asyncHandler(async (req, res) => {
  const { name, fields } = req.body;

  if (!name) {
    throw new AppError('Collection name is required.', 400);
  }

  const slug = slugify(name);
  if (!slug) {
    throw new AppError('Collection name must contain at least one alphanumeric character.', 400);
  }

  // Check reserved names
  if (RESERVED_COLLECTION_NAMES.includes(slug)) {
    throw new AppError(`"${name}" is a reserved name and cannot be used as a collection name.`, 400);
  }

  // Validate fields
  const fieldErrors = validateFields(fields);
  if (fieldErrors.length > 0) {
    throw new AppError(fieldErrors.join(' '), 422);
  }

  // Check for existing collection in this project
  const existing = await CollectionDefinition.findOne({
    project: req.params.projectId,
    slug,
  });
  if (existing) {
    throw new AppError(`A collection named "${name}" already exists in this project.`, 409);
  }

  const collection = await CollectionDefinition.create({
    project: req.params.projectId,
    name,
    slug,
    fields,
  });

  res.status(201).json({
    success: true,
    data: { collection },
  });
});

/**
 * GET /api/projects/:projectId/collections
 */
const listCollections = asyncHandler(async (req, res) => {
  const collections = await CollectionDefinition.find({
    project: req.params.projectId,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { collections },
  });
});

/**
 * GET /api/projects/:projectId/collections/:collectionId
 */
const getCollection = asyncHandler(async (req, res) => {
  const collection = await CollectionDefinition.findOne({
    _id: req.params.collectionId,
    project: req.params.projectId,
  });

  if (!collection) {
    throw new AppError('Collection not found.', 404);
  }

  res.json({
    success: true,
    data: { collection },
  });
});

/**
 * PATCH /api/projects/:projectId/collections/:collectionId
 */
const updateCollection = asyncHandler(async (req, res) => {
  const { name, fields } = req.body;

  const collection = await CollectionDefinition.findOne({
    _id: req.params.collectionId,
    project: req.params.projectId,
  });

  if (!collection) {
    throw new AppError('Collection not found.', 404);
  }

  if (name) {
    const newSlug = slugify(name);
    if (RESERVED_COLLECTION_NAMES.includes(newSlug)) {
      throw new AppError(`"${name}" is a reserved name.`, 400);
    }

    // Check for slug conflict
    const conflict = await CollectionDefinition.findOne({
      project: req.params.projectId,
      slug: newSlug,
      _id: { $ne: collection._id },
    });
    if (conflict) {
      throw new AppError(`A collection named "${name}" already exists in this project.`, 409);
    }

    // Invalidate old model cache before renaming
    invalidateModel(req.params.projectId, collection._id);

    collection.name = name;
    collection.slug = newSlug;
  }

  if (fields) {
    const fieldErrors = validateFields(fields);
    if (fieldErrors.length > 0) {
      throw new AppError(fieldErrors.join(' '), 422);
    }
    collection.fields = fields;

    // Invalidate model cache to rebuild with new schema
    invalidateModel(req.params.projectId, collection._id);
  }

  await collection.save();

  res.json({
    success: true,
    data: { collection },
  });
});

/**
 * DELETE /api/projects/:projectId/collections/:collectionId
 */
const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await CollectionDefinition.findOne({
    _id: req.params.collectionId,
    project: req.params.projectId,
  });

  if (!collection) {
    throw new AppError('Collection not found.', 404);
  }

  // Invalidate model cache
  invalidateModel(req.params.projectId, collection._id);

  // Drop the dynamic MongoDB collection if it exists
  const mongoose = require('mongoose');
  const collName = `data_${req.params.projectId}_${collection._id}`;
  try {
    await mongoose.connection.db.dropCollection(collName);
  } catch {
    // Collection might not exist yet — that's fine
  }

  await CollectionDefinition.deleteOne({ _id: collection._id });

  res.json({
    success: true,
    data: { message: 'Collection deleted successfully.' },
  });
});

module.exports = {
  createCollection,
  listCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  validateFields,
};
