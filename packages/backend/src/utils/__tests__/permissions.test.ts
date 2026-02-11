import {
  Role,
  Permission,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissionsForRole,
  canPerformAction,
} from '../permissions';

describe('Permissions Utility', () => {
  describe('hasPermission', () => {
    it('should return true if admin has any permission', () => {
      expect(hasPermission(Role.ADMIN, Permission.CREATE_EVENT)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.DELETE_USER)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.READ_VENUE)).toBe(true);
    });

    it('should return true if recruiter has event permissions', () => {
      expect(hasPermission(Role.RECRUITER, Permission.CREATE_EVENT)).toBe(true);
      expect(hasPermission(Role.RECRUITER, Permission.READ_EVENT)).toBe(true);
      expect(hasPermission(Role.RECRUITER, Permission.UPDATE_EVENT)).toBe(true);
      expect(hasPermission(Role.RECRUITER, Permission.DELETE_EVENT)).toBe(true);
    });

    it('should return false if recruiter tries to delete users', () => {
      expect(hasPermission(Role.RECRUITER, Permission.DELETE_USER)).toBe(false);
    });

    it('should return true if coordinator can read and update events', () => {
      expect(hasPermission(Role.COORDINATOR, Permission.READ_EVENT)).toBe(true);
      expect(hasPermission(Role.COORDINATOR, Permission.UPDATE_EVENT)).toBe(true);
    });

    it('should return false if coordinator tries to create events', () => {
      expect(hasPermission(Role.COORDINATOR, Permission.CREATE_EVENT)).toBe(false);
      expect(hasPermission(Role.COORDINATOR, Permission.DELETE_EVENT)).toBe(false);
    });

    it('should return true if viewer can read resources', () => {
      expect(hasPermission(Role.VIEWER, Permission.READ_EVENT)).toBe(true);
      expect(hasPermission(Role.VIEWER, Permission.READ_VENUE)).toBe(true);
      expect(hasPermission(Role.VIEWER, Permission.READ_COMPANY)).toBe(true);
    });

    it('should return false if viewer tries to modify resources', () => {
      expect(hasPermission(Role.VIEWER, Permission.CREATE_EVENT)).toBe(false);
      expect(hasPermission(Role.VIEWER, Permission.UPDATE_EVENT)).toBe(false);
      expect(hasPermission(Role.VIEWER, Permission.DELETE_EVENT)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(hasPermission('invalid-role', Permission.READ_EVENT)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions', () => {
      expect(
        hasAllPermissions(Role.ADMIN, [Permission.CREATE_EVENT, Permission.DELETE_USER])
      ).toBe(true);

      expect(
        hasAllPermissions(Role.RECRUITER, [
          Permission.CREATE_EVENT,
          Permission.READ_VENUE,
          Permission.UPDATE_COMPANY,
        ])
      ).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      expect(
        hasAllPermissions(Role.RECRUITER, [Permission.CREATE_EVENT, Permission.DELETE_USER])
      ).toBe(false);

      expect(
        hasAllPermissions(Role.VIEWER, [Permission.READ_EVENT, Permission.UPDATE_EVENT])
      ).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      expect(hasAllPermissions(Role.VIEWER, [])).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one permission', () => {
      expect(
        hasAnyPermission(Role.RECRUITER, [Permission.CREATE_EVENT, Permission.DELETE_USER])
      ).toBe(true);

      expect(
        hasAnyPermission(Role.VIEWER, [Permission.READ_EVENT, Permission.UPDATE_EVENT])
      ).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      expect(
        hasAnyPermission(Role.VIEWER, [Permission.CREATE_EVENT, Permission.DELETE_USER])
      ).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(hasAnyPermission(Role.ADMIN, [])).toBe(false);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return all permissions for admin', () => {
      const permissions = getPermissionsForRole(Role.ADMIN);
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain(Permission.CREATE_EVENT);
      expect(permissions).toContain(Permission.DELETE_USER);
    });

    it('should return recruiter permissions', () => {
      const permissions = getPermissionsForRole(Role.RECRUITER);
      expect(permissions).toContain(Permission.CREATE_EVENT);
      expect(permissions).toContain(Permission.APPROVE_REMINDER);
      expect(permissions).not.toContain(Permission.DELETE_USER);
    });

    it('should return viewer permissions', () => {
      const permissions = getPermissionsForRole(Role.VIEWER);
      expect(permissions).toContain(Permission.READ_EVENT);
      expect(permissions).not.toContain(Permission.CREATE_EVENT);
      expect(permissions).not.toContain(Permission.UPDATE_EVENT);
    });

    it('should return empty array for invalid role', () => {
      const permissions = getPermissionsForRole('invalid-role');
      expect(permissions).toEqual([]);
    });
  });

  describe('canPerformAction', () => {
    it('should return true if user can create events', () => {
      expect(canPerformAction(Role.RECRUITER, 'create', 'event')).toBe(true);
      expect(canPerformAction(Role.ADMIN, 'create', 'event')).toBe(true);
    });

    it('should return false if user cannot create events', () => {
      expect(canPerformAction(Role.VIEWER, 'create', 'event')).toBe(false);
      expect(canPerformAction(Role.COORDINATOR, 'create', 'event')).toBe(false);
    });

    it('should return true if user can read resources', () => {
      expect(canPerformAction(Role.VIEWER, 'read', 'event')).toBe(true);
      expect(canPerformAction(Role.COORDINATOR, 'read', 'venue')).toBe(true);
    });

    it('should return true if user can update resources', () => {
      expect(canPerformAction(Role.RECRUITER, 'update', 'event')).toBe(true);
      expect(canPerformAction(Role.COORDINATOR, 'update', 'task')).toBe(true);
    });

    it('should return false if user cannot delete resources', () => {
      expect(canPerformAction(Role.VIEWER, 'delete', 'event')).toBe(false);
      expect(canPerformAction(Role.COORDINATOR, 'delete', 'venue')).toBe(false);
    });
  });
});
