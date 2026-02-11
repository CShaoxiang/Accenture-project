/**
 * Role definitions for the system
 */
export enum Role {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  COORDINATOR = 'coordinator',
  VIEWER = 'viewer',
}

/**
 * Permission definitions for various actions
 */
export enum Permission {
  // Event permissions
  CREATE_EVENT = 'create:event',
  READ_EVENT = 'read:event',
  UPDATE_EVENT = 'update:event',
  DELETE_EVENT = 'delete:event',

  // Venue permissions
  CREATE_VENUE = 'create:venue',
  READ_VENUE = 'read:venue',
  UPDATE_VENUE = 'update:venue',
  DELETE_VENUE = 'delete:venue',

  // Company permissions
  CREATE_COMPANY = 'create:company',
  READ_COMPANY = 'read:company',
  UPDATE_COMPANY = 'update:company',
  DELETE_COMPANY = 'delete:company',

  // Candidate permissions
  CREATE_CANDIDATE = 'create:candidate',
  READ_CANDIDATE = 'read:candidate',
  UPDATE_CANDIDATE = 'update:candidate',
  DELETE_CANDIDATE = 'delete:candidate',

  // Task permissions
  CREATE_TASK = 'create:task',
  READ_TASK = 'read:task',
  UPDATE_TASK = 'update:task',
  DELETE_TASK = 'delete:task',

  // Reminder permissions
  CREATE_REMINDER = 'create:reminder',
  READ_REMINDER = 'read:reminder',
  APPROVE_REMINDER = 'approve:reminder',

  // User management permissions
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
}

/**
 * Role-based permission mapping
 * Defines which permissions each role has
 */
const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission),
  ],
  [Role.RECRUITER]: [
    // Recruiters can manage events, venues, companies, candidates, tasks, and reminders
    Permission.CREATE_EVENT,
    Permission.READ_EVENT,
    Permission.UPDATE_EVENT,
    Permission.DELETE_EVENT,
    Permission.CREATE_VENUE,
    Permission.READ_VENUE,
    Permission.UPDATE_VENUE,
    Permission.CREATE_COMPANY,
    Permission.READ_COMPANY,
    Permission.UPDATE_COMPANY,
    Permission.CREATE_CANDIDATE,
    Permission.READ_CANDIDATE,
    Permission.UPDATE_CANDIDATE,
    Permission.CREATE_TASK,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.CREATE_REMINDER,
    Permission.READ_REMINDER,
    Permission.APPROVE_REMINDER,
    Permission.READ_USER,
  ],
  [Role.COORDINATOR]: [
    // Coordinators can read and update events, venues, and tasks
    Permission.READ_EVENT,
    Permission.UPDATE_EVENT,
    Permission.READ_VENUE,
    Permission.UPDATE_VENUE,
    Permission.READ_COMPANY,
    Permission.READ_CANDIDATE,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.READ_REMINDER,
    Permission.READ_USER,
  ],
  [Role.VIEWER]: [
    // Viewers can only read data
    Permission.READ_EVENT,
    Permission.READ_VENUE,
    Permission.READ_COMPANY,
    Permission.READ_CANDIDATE,
    Permission.READ_TASK,
    Permission.READ_REMINDER,
  ],
};

/**
 * Check if a role has a specific permission
 * @param role - User's role
 * @param permission - Permission to check
 * @returns true if role has permission, false otherwise
 */
export const hasPermission = (role: string, permission: Permission): boolean => {
  const roleEnum = role as Role;
  const permissions = rolePermissions[roleEnum];

  if (!permissions) {
    return false;
  }

  return permissions.includes(permission);
};

/**
 * Check if a role has all of the specified permissions
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has all permissions, false otherwise
 */
export const hasAllPermissions = (role: string, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

/**
 * Check if a role has any of the specified permissions
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has at least one permission, false otherwise
 */
export const hasAnyPermission = (role: string, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 * @param role - User's role
 * @returns Array of permissions for the role
 */
export const getPermissionsForRole = (role: string): Permission[] => {
  const roleEnum = role as Role;
  return rolePermissions[roleEnum] || [];
};

/**
 * Check if a user can perform an action on a resource
 * @param userRole - User's role
 * @param action - Action to perform (create, read, update, delete)
 * @param resource - Resource type (event, venue, company, etc.)
 * @returns true if user can perform action, false otherwise
 */
export const canPerformAction = (
  userRole: string,
  action: 'create' | 'read' | 'update' | 'delete',
  resource: string
): boolean => {
  const permission = `${action}:${resource}` as Permission;
  return hasPermission(userRole, permission);
};
