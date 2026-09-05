const ProjectMembership = require('../models/ProjectMembership');
const { AppError } = require('../utils/errors');
const { hasPermission } = require('../utils/constants');

/**
 * Middleware factory: checks that the authenticated user has the specified
 * permission on the project identified by req.params.projectId.
 * Attaches req.membership with the user's role.
 */
function authorize(permission) {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        throw new AppError('Project ID is required.', 400);
      }

      const membership = await ProjectMembership.findOne({
        user: req.user._id,
        project: projectId,
      });

      if (!membership) {
        throw new AppError('You do not have access to this project.', 403);
      }

      if (!hasPermission(membership.role, permission)) {
        throw new AppError('You do not have permission to perform this action.', 403);
      }

      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authorize };
