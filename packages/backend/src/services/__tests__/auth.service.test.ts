import { AuthService } from '../auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock bcrypt
jest.mock('bcrypt');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;

  beforeEach(() => {
    authService = new AuthService();
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'recruiter',
      };

      const mockUser = {
        id: 'user-123',
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.register(registerData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          passwordHash: 'hashed-password',
          name: registerData.name,
          role: registerData.role,
        },
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if user already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerData.email,
      });

      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should use default role "recruiter" if not provided', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser = {
        id: 'user-123',
        email: registerData.email,
        name: registerData.name,
        role: 'recruiter',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      await authService.register(registerData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'recruiter',
        }),
      });
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        name: 'Test User',
        role: 'recruiter',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.login(loginData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        passwordHash: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify a valid token', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => authService.verifyToken('invalid-token')).toThrow('Invalid or expired token');
    });

    it('should throw error for expired token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => authService.verifyToken('expired-token')).toThrow('Invalid or expired token');
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'recruiter',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.getUserById('user-123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.getUserById('nonexistent-id')).rejects.toThrow('User not found');
    });
  });
});
