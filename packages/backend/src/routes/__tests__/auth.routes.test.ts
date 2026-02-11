import request from 'supertest';
import express from 'express';
import authRoutes from '../auth.routes';
import { authService } from '../../services/auth.service';

// Mock the auth service
jest.mock('../../services/auth.service');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'recruiter',
        },
        token: 'mock-jwt-token',
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: undefined,
      });
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid email format');
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: '12345',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Password must be at least 6 characters');
    });

    it('should return 409 if user already exists', async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new Error('User with this email already exists')
      );

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'recruiter',
        },
        token: 'mock-jwt-token',
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 401 for invalid credentials', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'recruiter',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'recruiter',
      };

      (authService.verifyToken as jest.Mock).mockReturnValue(mockPayload);
      (authService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(authService.getUserById).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 if token format is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 for invalid token', async () => {
      (authService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid or expired token');
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });
});
