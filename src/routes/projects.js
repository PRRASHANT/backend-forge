const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { PERMISSIONS } = require('../utils/constants');
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const {
  createCollection,
  listCollections,
  getCollection,
  updateCollection,
  deleteCollection,
} = require('../controllers/collectionController');
const {
  createAPIKey,
  getAPIKeys,
  revokeKey,
  deleteKey,
} = require('../controllers/apiKeyController');
const {
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
} = require('../controllers/memberController');
const {
  getProjectLogs,
  getProjectAnalytics,
} = require('../controllers/logController');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Project CRUD
router.post('/', createProject);
router.get('/', listProjects);

// Project-specific routes with RBAC
router.get('/:projectId', authorize(PERMISSIONS.VIEW_PROJECT), getProject);
router.patch('/:projectId', authorize(PERMISSIONS.UPDATE_PROJECT), updateProject);
router.delete('/:projectId', authorize(PERMISSIONS.DELETE_PROJECT), deleteProject);

// Collections
router.post('/:projectId/collections', authorize(PERMISSIONS.MANAGE_COLLECTIONS), createCollection);
router.get('/:projectId/collections', authorize(PERMISSIONS.VIEW_PROJECT), listCollections);
router.get('/:projectId/collections/:collectionId', authorize(PERMISSIONS.VIEW_PROJECT), getCollection);
router.patch('/:projectId/collections/:collectionId', authorize(PERMISSIONS.MANAGE_COLLECTIONS), updateCollection);
router.delete('/:projectId/collections/:collectionId', authorize(PERMISSIONS.MANAGE_COLLECTIONS), deleteCollection);

// API Keys
router.post('/:projectId/api-keys', authorize(PERMISSIONS.MANAGE_API_KEYS), createAPIKey);
router.get('/:projectId/api-keys', authorize(PERMISSIONS.MANAGE_API_KEYS), getAPIKeys);
router.patch('/:projectId/api-keys/:keyId/revoke', authorize(PERMISSIONS.MANAGE_API_KEYS), revokeKey);
router.delete('/:projectId/api-keys/:keyId', authorize(PERMISSIONS.MANAGE_API_KEYS), deleteKey);

// Members
router.get('/:projectId/members', authorize(PERMISSIONS.VIEW_PROJECT), listMembers);
router.post('/:projectId/members', authorize(PERMISSIONS.MANAGE_MEMBERS), addMember);
router.patch('/:projectId/members/:memberId', authorize(PERMISSIONS.MANAGE_MEMBERS), updateMemberRole);
router.delete('/:projectId/members/:memberId', authorize(PERMISSIONS.MANAGE_MEMBERS), removeMember);

// Logs and Analytics
router.get('/:projectId/logs', authorize(PERMISSIONS.VIEW_LOGS), getProjectLogs);
router.get('/:projectId/analytics', authorize(PERMISSIONS.VIEW_ANALYTICS), getProjectAnalytics);

module.exports = router;
