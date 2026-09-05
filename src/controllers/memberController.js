const ProjectMembership = require('../models/ProjectMembership');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../utils/errors');
const { ROLES, ROLE_HIERARCHY } = require('../utils/constants');

/**
 * GET /api/projects/:projectId/members
 */
const listMembers = asyncHandler(async (req, res) => {
  const members = await ProjectMembership.find({ project: req.params.projectId })
    .populate('user', 'name email')
    .lean();

  res.json({
    success: true,
    data: { members },
  });
});

/**
 * POST /api/projects/:projectId/members
 * Add a member to the project.
 */
const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  if (!email) {
    throw new AppError('Member email is required.', 400);
  }

  const validRoles = [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.VIEWER];
  if (!role || !validRoles.includes(role)) {
    throw new AppError(`Role must be one of: ${validRoles.join(', ')}`, 400);
  }

  // Cannot assign owner role
  if (role === ROLES.OWNER) {
    throw new AppError('Cannot assign owner role through member invitation.', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('No user found with that email.', 404);
  }

  // Check if already a member
  const existingMembership = await ProjectMembership.findOne({
    user: user._id,
    project: req.params.projectId,
  });
  if (existingMembership) {
    throw new AppError('User is already a member of this project.', 409);
  }

  const membership = await ProjectMembership.create({
    user: user._id,
    project: req.params.projectId,
    role,
  });

  await membership.populate('user', 'name email');

  res.status(201).json({
    success: true,
    data: { membership },
  });
});

/**
 * PATCH /api/projects/:projectId/members/:memberId
 * Update a member's role.
 */
const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.VIEWER];

  if (!role || !validRoles.includes(role)) {
    throw new AppError(`Role must be one of: ${validRoles.join(', ')}`, 400);
  }

  const membership = await ProjectMembership.findOne({
    _id: req.params.memberId,
    project: req.params.projectId,
  });

  if (!membership) {
    throw new AppError('Membership not found.', 404);
  }

  // Cannot change owner's role
  if (membership.role === ROLES.OWNER) {
    throw new AppError('Cannot change the owner\'s role.', 403);
  }

  membership.role = role;
  await membership.save();
  await membership.populate('user', 'name email');

  res.json({
    success: true,
    data: { membership },
  });
});

/**
 * DELETE /api/projects/:projectId/members/:memberId
 * Remove a member from the project.
 */
const removeMember = asyncHandler(async (req, res) => {
  const membership = await ProjectMembership.findOne({
    _id: req.params.memberId,
    project: req.params.projectId,
  });

  if (!membership) {
    throw new AppError('Membership not found.', 404);
  }

  // Cannot remove the owner
  if (membership.role === ROLES.OWNER) {
    throw new AppError('Cannot remove the project owner.', 403);
  }

  await ProjectMembership.deleteOne({ _id: membership._id });

  res.json({
    success: true,
    data: { message: 'Member removed successfully.' },
  });
});

module.exports = { listMembers, addMember, updateMemberRole, removeMember };
