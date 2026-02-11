import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, optionalAuth } from '../auth.middleware';
import { authService } from '../../services/auth.service';

jest.mock('../../services/auth.service');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token and attach user to request', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (authService.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required. Please provide a valid token.',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic some-token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required. Please provide a valid token.',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (authService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid or expired token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token. Please login again.',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      (authService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid or expired token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should allow access if user has required role', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      const middleware = authorize('admin', 'recruiter');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access if user has one of multiple allowed roles', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      const middleware = authorize('admin', 'recruiter', 'coordinator');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'viewer',
      };

      const middleware = authorize('admin', 'recruiter');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions. You do not have access to this resource.',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const middleware = authorize('admin');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should attach user if valid token provided', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (authService.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user if no token provided', () => {
      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user if invalid token provided', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (authService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
