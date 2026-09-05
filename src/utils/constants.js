/**
 * RBAC roles and permissions for project membership.
 */
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  VIEWER: 'viewer',
};

// Ordered from most to least privileged
const ROLE_HIERARCHY = [ROLES.OWNER, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.VIEWER];

const PERMISSIONS = {
  DELETE_PROJECT: 'delete_project',
  TRANSFER_OWNERSHIP: 'transfer_ownership',
  MANAGE_MEMBERS: 'manage_members',
  MANAGE_API_KEYS: 'manage_api_keys',
  MANAGE_COLLECTIONS: 'manage_collections',
  USE_API_EXPLORER: 'use_api_explorer',
  VIEW_LOGS: 'view_logs',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_PROJECT: 'view_project',
  UPDATE_PROJECT: 'update_project',
};

const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.MANAGE_API_KEYS,
    PERMISSIONS.MANAGE_COLLECTIONS,
    PERMISSIONS.USE_API_EXPLORER,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.UPDATE_PROJECT,
  ],
  [ROLES.DEVELOPER]: [
    PERMISSIONS.MANAGE_COLLECTIONS,
    PERMISSIONS.USE_API_EXPLORER,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PROJECT,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PROJECT,
  ],
};

function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.includes(permission) : false;
}

// Reserved collection names that cannot be used
const RESERVED_COLLECTION_NAMES = [
  'users', 'user', 'admin', 'admins', 'system', 'config',
  'api', 'auth', 'login', 'register', 'health', 'status',
  'log', 'logs', 'analytics', 'settings', 'project', 'projects',
  'collection', 'collections', 'key', 'keys', 'member', 'members',
];

// Supported field types
const FIELD_TYPES = [
  'string', 'number', 'integer', 'boolean', 'date',
  'email', 'url', 'enum', 'array', 'object',
  'reference', 'decimal',
];

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  RESERVED_COLLECTION_NAMES,
  FIELD_TYPES,
};
