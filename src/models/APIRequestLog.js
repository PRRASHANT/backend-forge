const mongoose = require('mongoose');

const apiRequestLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    collectionSlug: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
    path: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // milliseconds
      required: true,
    },
    apiKeyPrefix: {
      type: String,
      default: null,
    },
    isError: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

apiRequestLogSchema.index({ project: 1, createdAt: -1 });
apiRequestLogSchema.index({ project: 1, method: 1 });

module.exports = mongoose.model('APIRequestLog', apiRequestLogSchema);
