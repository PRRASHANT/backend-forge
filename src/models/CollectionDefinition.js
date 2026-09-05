const mongoose = require('mongoose');
const { FIELD_TYPES } = require('../utils/constants');

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: FIELD_TYPES,
    },
    required: {
      type: Boolean,
      default: false,
    },
    default: {
      type: mongoose.Schema.Types.Mixed,
    },
    // String options
    minLength: Number,
    maxLength: Number,
    trim: { type: Boolean, default: false },
    // Number/integer/decimal options
    min: Number,
    max: Number,
    // Enum options
    enumValues: [String],
    // Array options
    itemType: {
      type: String,
      enum: FIELD_TYPES,
    },
    minItems: Number,
    maxItems: Number,
    // Reference options
    refCollection: String,
    // Email
    unique: { type: Boolean, default: false },
  },
  { _id: false }
);

const collectionDefinitionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      minlength: [2, 'Collection name must be at least 2 characters'],
      maxlength: [64, 'Collection name must not exceed 64 characters'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    fields: {
      type: [fieldSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'Collection must have at least one field',
      },
    },
  },
  { timestamps: true }
);

// Unique collection slug per project
collectionDefinitionSchema.index({ project: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('CollectionDefinition', collectionDefinitionSchema);
