import { Request, Response, NextFunction } from 'express';
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission } from '../utils/permissions';

/**
 * Middleware factory to check if user has a specific permission
 * @param permission - Required permission
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: `Insufficient permissions. Required permission: ${permission}`,
      });
    }

    next();
  };
};

/**
 * Middleware factory to check if user has all specified permissions
 * @param permissions - Array of required permissions
 */
export const requireAllPermissions = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!hasAllPermissions(req.user.role, permissions)) {
      return res.status(403).json({
        error: 'Insufficient permissions. You do not have all required permissions.',
      });
    }

    next();
  };
};

/**
 * Middleware factory to check if user has any of the specified permissions
 * @param permissions - Array of permissions (user needs at least one)
 */
export const requireAnyPermission = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({
        error: 'Insufficient permissions. You do not have any of the required permissions.',
      });
    }

    next();
  };
};
