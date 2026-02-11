import { Request, Response, NextFunction } from 'express';
import {
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
} from '../permission.middleware';
import { Permission } from '../../utils/permissions';

describe('Permission Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('requirePermission', () => {
    it('should allow access if user has required permission', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      const middleware = requirePermission(Permission.CREATE_EVENT);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access if user lacks required permission', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'viewer',
      };

      const middleware = requirePermission(Permission.CREATE_EVENT);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: `Insufficient permissions. Required permission: ${Permission.CREATE_EVENT}`,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const middleware = requirePermission(Permission.CREATE_EVENT);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('requireAllPermissions', () => {
    it('should allow access if user has all required permissions', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      const middleware = requireAllPermissions(
        Permission.CREATE_EVENT,
        Permission.READ_VENUE,
        Permission.UPDATE_COMPANY
      );
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access if user is missing any permission', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      const middleware = requireAllPermissions(Permission.CREATE_EVENT, Permission.DELETE_USER);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions. You do not have all required permissions.',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const middleware = requireAllPermissions(Permission.CREATE_EVENT);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('requireAnyPermission', () => {
    it('should allow access if user has at least one required permission', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'viewer',
      };

      const middleware = requireAnyPermission(Permission.READ_EVENT, Permission.CREATE_EVENT);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access if user has none of the required permissions', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'viewer',
      };

      const middleware = requireAnyPermission(Permission.CREATE_EVENT, Permission.DELETE_USER);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions. You do not have any of the required permissions.',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const middleware = requireAnyPermission(Permission.READ_EVENT);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
