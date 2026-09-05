const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'API key name is required'],
      trim: true,
      maxlength: [100, 'Key name must not exceed 100 characters'],
    },
    // First 12 chars of the raw key for identification/lookup
    prefix: {
      type: String,
      required: true,
    },
    // bcrypt hash of the full key
    keyHash: {
      type: String,
      required: true,
    },
    keyType: {
      type: String,
      enum: ['secret', 'public'],
      default: 'secret',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

apiKeySchema.index({ prefix: 1, isActive: 1 });
apiKeySchema.index({ project: 1, isActive: 1 });

module.exports = mongoose.model('APIKey', apiKeySchema);
