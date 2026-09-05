const mongoose = require('mongoose');
const validator = require('validator');
const { FIELD_TYPES } = require('../utils/constants');
const { AppError } = require('../utils/errors');

// In-memory model cache: key = `${projectId}_${collectionId}`
const modelCache = new Map();

/**
 * Build a Mongoose schema definition from an array of field definitions.
 */
function buildSchemaDefinition(fields) {
  const schemaDef = {};

  for (const field of fields) {
    schemaDef[field.name] = buildFieldDefinition(field);
  }

  return schemaDef;
}

/**
 * Convert a single field definition to a Mongoose schema type config.
 */
function buildFieldDefinition(field) {
  const def = {};

  switch (field.type) {
    case 'string':
      def.type = String;
      if (field.minLength) def.minlength = field.minLength;
      if (field.maxLength) def.maxlength = field.maxLength;
      if (field.trim) def.trim = true;
      if (field.enumValues && field.enumValues.length > 0) {
        def.enum = field.enumValues;
      }
      break;

    case 'number':
      def.type = Number;
      if (field.min != null) def.min = field.min;
      if (field.max != null) def.max = field.max;
      break;

    case 'integer':
      // Stored as Number, validated as integer at runtime
      def.type = Number;
      if (field.min != null) def.min = field.min;
      if (field.max != null) def.max = field.max;
      def.validate = {
        validator: function (v) {
          return v == null || Number.isInteger(v);
        },
        message: `${field.name} must be an integer`,
      };
      break;

    case 'boolean':
      def.type = Boolean;
      break;

    case 'date':
      def.type = Date;
      break;

    case 'email':
      def.type = String;
      def.lowercase = true;
      def.trim = true;
      def.validate = {
        validator: function (v) {
          return v == null || v === '' || validator.isEmail(v);
        },
        message: `${field.name} must be a valid email address`,
      };
      break;

    case 'url':
      def.type = String;
      def.trim = true;
      def.validate = {
        validator: function (v) {
          return v == null || v === '' || validator.isURL(v);
        },
        message: `${field.name} must be a valid URL`,
      };
      break;

    case 'enum':
      def.type = String;
      if (field.enumValues && field.enumValues.length > 0) {
        def.enum = field.enumValues;
      }
      break;

    case 'array':
      if (field.itemType === 'string') {
        def.type = [String];
      } else if (field.itemType === 'number') {
        def.type = [Number];
      } else if (field.itemType === 'boolean') {
        def.type = [Boolean];
      } else if (field.itemType === 'date') {
        def.type = [Date];
      } else {
        def.type = [mongoose.Schema.Types.Mixed];
      }
      break;

    case 'object':
      def.type = mongoose.Schema.Types.Mixed;
      break;

    case 'reference':
      def.type = mongoose.Schema.Types.ObjectId;
      break;

    case 'decimal':
      def.type = mongoose.Schema.Types.Decimal128;
      if (field.min != null) def.min = field.min;
      if (field.max != null) def.max = field.max;
      break;

    default:
      def.type = mongoose.Schema.Types.Mixed;
  }

  if (field.required) def.required = [true, `${field.name} is required`];
  if (field.default !== undefined && field.default !== null) def.default = field.default;

  return def;
}

/**
 * Get or create a dynamic Mongoose model for a project's collection.
 * Uses caching to avoid recompiling models on every request.
 */
function getDynamicModel(projectId, collectionId, fields) {
  const cacheKey = `${projectId}_${collectionId}`;
  const MAX_CACHE_SIZE = 1000;

  if (modelCache.has(cacheKey)) {
    // Refresh to make it most-recently-used
    const model = modelCache.get(cacheKey);
    modelCache.delete(cacheKey);
    modelCache.set(cacheKey, model);
    return model;
  }

  const schemaDef = buildSchemaDefinition(fields);
  const schema = new mongoose.Schema(schemaDef, {
    timestamps: true,
    strict: true,
    collection: `data_${projectId}_${collectionId}`,
  });

  // Use the cache key as the model name to avoid OverwriteModelError
  const modelName = `DynModel_${projectId}_${collectionId}`;

  // Check if model already exists in mongoose (e.g., after hot reload)
  let model;
  try {
    model = mongoose.model(modelName);
  } catch {
    model = mongoose.model(modelName, schema);
  }

  // Bounded eviction: if we exceed size, remove the oldest (first in Map)
  if (modelCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = modelCache.keys().next().value;
    modelCache.delete(oldestKey);
  }

  modelCache.set(cacheKey, model);
  return model;
}

/**
 * Invalidate the cached model when a schema is updated.
 */
function invalidateModel(projectId, collectionId) {
  const cacheKey = `${projectId}_${collectionId}`;
  if (modelCache.has(cacheKey)) {
    modelCache.delete(cacheKey);
    // Also delete from mongoose's model registry
    const modelName = `DynModel_${projectId}_${collectionId}`;
    try {
      mongoose.deleteModel(modelName);
    } catch {
      // Model might not exist
    }
  }
}

/**
 * Validate request data against field definitions BEFORE Mongoose.
 * Returns array of error messages.
 */
function validateData(data, fields, isUpdate = false) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return ['Request body must be a JSON object'];
  }

  // Collect known field names
  const knownFields = new Set(fields.map((f) => f.name));

  // Check for unknown fields
  for (const key of Object.keys(data)) {
    if (!knownFields.has(key)) {
      errors.push(`Unknown field: ${key}`);
    }
  }

  for (const field of fields) {
    const value = data[field.name];
    const isPresent = value !== undefined && value !== null;

    // Required check (only for create, not update)
    if (!isUpdate && field.required && !isPresent) {
      errors.push(`${field.name} is required`);
      continue;
    }

    // Skip validation if not present
    if (!isPresent) continue;

    // Type-specific validation
    const typeErrors = validateFieldType(field, value);
    errors.push(...typeErrors);
  }

  return errors;
}

function validateFieldType(field, value) {
  const errors = [];

  switch (field.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${field.name} must be a string`);
        break;
      }
      if (field.minLength && value.length < field.minLength) {
        errors.push(`${field.name} must be at least ${field.minLength} characters`);
      }
      if (field.maxLength && value.length > field.maxLength) {
        errors.push(`${field.name} must not exceed ${field.maxLength} characters`);
      }
      if (field.enumValues && field.enumValues.length > 0 && !field.enumValues.includes(value)) {
        errors.push(`${field.name} must be one of: ${field.enumValues.join(', ')}`);
      }
      break;

    case 'number':
    case 'decimal':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${field.name} must be a number`);
        break;
      }
      if (field.min != null && value < field.min) {
        errors.push(`${field.name} must be at least ${field.min}`);
      }
      if (field.max != null && value > field.max) {
        errors.push(`${field.name} must not exceed ${field.max}`);
      }
      break;

    case 'integer':
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        errors.push(`${field.name} must be an integer`);
        break;
      }
      if (field.min != null && value < field.min) {
        errors.push(`${field.name} must be at least ${field.min}`);
      }
      if (field.max != null && value > field.max) {
        errors.push(`${field.name} must not exceed ${field.max}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${field.name} must be a boolean`);
      }
      break;

    case 'date':
      if (typeof value === 'string') {
        const d = new Date(value);
        if (isNaN(d.getTime())) {
          errors.push(`${field.name} must be a valid date`);
        }
      } else if (!(value instanceof Date)) {
        errors.push(`${field.name} must be a valid date string`);
      }
      break;

    case 'email':
      if (typeof value !== 'string' || !validator.isEmail(value)) {
        errors.push(`${field.name} must be a valid email address`);
      }
      break;

    case 'url':
      if (typeof value !== 'string' || !validator.isURL(value)) {
        errors.push(`${field.name} must be a valid URL`);
      }
      break;

    case 'enum':
      if (typeof value !== 'string') {
        errors.push(`${field.name} must be a string`);
      } else if (field.enumValues && field.enumValues.length > 0 && !field.enumValues.includes(value)) {
        errors.push(`${field.name} must be one of: ${field.enumValues.join(', ')}`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${field.name} must be an array`);
        break;
      }
      if (field.minItems != null && value.length < field.minItems) {
        errors.push(`${field.name} must have at least ${field.minItems} items`);
      }
      if (field.maxItems != null && value.length > field.maxItems) {
        errors.push(`${field.name} must have at most ${field.maxItems} items`);
      }
      break;

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${field.name} must be an object`);
      }
      break;

    case 'reference':
      if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
        errors.push(`${field.name} must be a valid ObjectId`);
      }
      break;
  }

  return errors;
}

/**
 * Clear entire model cache. Used in tests.
 */
function clearModelCache() {
  for (const [key] of modelCache) {
    const parts = key.split('_');
    const modelName = `DynModel_${key}`;
    try {
      mongoose.deleteModel(modelName);
    } catch {
      // ignore
    }
  }
  modelCache.clear();
}

module.exports = {
  getDynamicModel,
  invalidateModel,
  validateData,
  buildSchemaDefinition,
  clearModelCache,
  modelCache,
};
