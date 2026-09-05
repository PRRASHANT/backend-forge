const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

const projectMembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.VIEWER,
    },
  },
  { timestamps: true }
);

// One membership per user per project
projectMembershipSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('ProjectMembership', projectMembershipSchema);
