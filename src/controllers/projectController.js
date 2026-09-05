const Project = require('../models/Project');
const ProjectMembership = require('../models/ProjectMembership');
const CollectionDefinition = require('../models/CollectionDefinition');
const APIKey = require('../models/APIKey');
const APIRequestLog = require('../models/APIRequestLog');
const { AppError, asyncHandler } = require('../utils/errors');
const { ROLES } = require('../utils/constants');

/**
 * Slugify a project name for use as a URL-safe identifier.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * POST /api/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new AppError('Project name is required.', 400);
  }

  const slug = slugify(name);
  if (!slug) {
    throw new AppError('Project name must contain at least one alphanumeric character.', 400);
  }

  const project = await Project.create({
    name,
    slug,
    description: description || '',
    owner: req.user._id,
  });

  // Create owner membership
  await ProjectMembership.create({
    user: req.user._id,
    project: project._id,
    role: ROLES.OWNER,
  });

  res.status(201).json({
    success: true,
    data: { project },
  });
});

/**
 * GET /api/projects
 * List all projects the authenticated user has access to.
 */
const listProjects = asyncHandler(async (req, res) => {
  const memberships = await ProjectMembership.find({ user: req.user._id })
    .populate('project')
    .lean();

  const projects = memberships
    .filter((m) => m.project) // filter out deleted projects
    .map((m) => ({
      ...m.project,
      role: m.role,
    }));

  res.json({
    success: true,
    data: { projects },
  });
});

/**
 * GET /api/projects/:projectId
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // Count collections and members for overview
  const [collectionsCount, membersCount, apiKeysCount] = await Promise.all([
    CollectionDefinition.countDocuments({ project: project._id }),
    ProjectMembership.countDocuments({ project: project._id }),
    APIKey.countDocuments({ project: project._id, isActive: true }),
  ]);

  res.json({
    success: true,
    data: {
      project,
      stats: { collectionsCount, membersCount, apiKeysCount },
      role: req.membership.role,
    },
  });
});

/**
 * PATCH /api/projects/:projectId
 */
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  if (name) {
    project.name = name;
    project.slug = slugify(name);
  }
  if (description !== undefined) {
    project.description = description;
  }

  await project.save();

  res.json({
    success: true,
    data: { project },
  });
});

/**
 * DELETE /api/projects/:projectId
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // Cleanup: delete all related data
  await Promise.all([
    ProjectMembership.deleteMany({ project: project._id }),
    CollectionDefinition.deleteMany({ project: project._id }),
    APIKey.deleteMany({ project: project._id }),
    APIRequestLog.deleteMany({ project: project._id }),
  ]);

  await Project.deleteOne({ _id: project._id });

  res.status(200).json({
    success: true,
    data: { message: 'Project deleted successfully.' },
  });
});

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
