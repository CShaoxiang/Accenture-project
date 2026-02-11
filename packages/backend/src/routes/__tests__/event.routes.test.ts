import request from 'supertest';
import express from 'express';
import eventRoutes from '../event.routes';
import { eventService } from '../../services/event.service';

// Mock the event service
jest.mock('../../services/event.service');

const app = express();
app.use(express.json());
app.use('/api/v1/events', eventRoutes);

describe('Event Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/events', () => {
    it('should create an event with valid data', async () => {
      const mockEvent = {
        id: '123',
        name: 'Tech Hackathon',
        type: 'hackathon',
        date: new Date('2024-12-01'),
        description: 'A coding competition',
        goals: ['Find talent', 'Build community'],
        companyId: 'company-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: null,
        venues: [],
        studentBodies: [],
        tasks: [],
      };

      (eventService.createEvent as jest.Mock).mockResolvedValue(mockEvent);

      const response = await request(app)
        .post('/api/v1/events')
        .send({
          name: 'Tech Hackathon',
          type: 'hackathon',
          date: '2024-12-01',
          description: 'A coding competition',
          goals: ['Find talent', 'Build community'],
          companyId: 'company-123',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('123');
      expect(response.body.name).toBe('Tech Hackathon');
      expect(response.body.type).toBe('hackathon');
      expect(eventService.createEvent).toHaveBeenCalledWith({
        name: 'Tech Hackathon',
        type: 'hackathon',
        date: new Date('2024-12-01'),
        description: 'A coding competition',
        goals: ['Find talent', 'Build community'],
        companyId: 'company-123',
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app).post('/api/v1/events').send({
        name: 'Tech Hackathon',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 when event type is invalid', async () => {
      const response = await request(app).post('/api/v1/events').send({
        name: 'Tech Hackathon',
        type: 'invalid-type',
        date: '2024-12-01',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid event type');
    });

    it('should return 400 when date format is invalid', async () => {
      const response = await request(app).post('/api/v1/events').send({
        name: 'Tech Hackathon',
        type: 'hackathon',
        date: 'invalid-date',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid date format');
    });
  });

  describe('GET /api/v1/events', () => {
    it('should list all events', async () => {
      const mockEvents = [
        {
          id: '123',
          name: 'Tech Hackathon',
          type: 'hackathon',
          date: new Date('2024-12-01'),
          description: 'A coding competition',
          goals: ['Find talent'],
          companyId: 'company-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          company: null,
          venues: [],
          studentBodies: [],
          tasks: [],
        },
      ];

      (eventService.listEvents as jest.Mock).mockResolvedValue(mockEvents);

      const response = await request(app).get('/api/v1/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('123');
      expect(response.body[0].name).toBe('Tech Hackathon');
      expect(eventService.listEvents).toHaveBeenCalledWith({});
    });

    it('should filter events by type', async () => {
      const mockEvents = [
        {
          id: '123',
          name: 'Tech Hackathon',
          type: 'hackathon',
          date: new Date('2024-12-01'),
          description: 'A coding competition',
          goals: ['Find talent'],
          companyId: 'company-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          company: null,
          venues: [],
          studentBodies: [],
          tasks: [],
        },
      ];

      (eventService.listEvents as jest.Mock).mockResolvedValue(mockEvents);

      const response = await request(app).get('/api/v1/events?type=hackathon');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('hackathon');
      expect(eventService.listEvents).toHaveBeenCalledWith({ type: 'hackathon' });
    });

    it('should return 400 when event type filter is invalid', async () => {
      const response = await request(app).get('/api/v1/events?type=invalid-type');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid event type');
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('should get event by id', async () => {
      const mockEvent = {
        id: '123',
        name: 'Tech Hackathon',
        type: 'hackathon',
        date: new Date('2024-12-01'),
        description: 'A coding competition',
        goals: ['Find talent'],
        companyId: 'company-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: null,
        venues: [],
        studentBodies: [],
        tasks: [],
      };

      (eventService.getEvent as jest.Mock).mockResolvedValue(mockEvent);

      const response = await request(app).get('/api/v1/events/123');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('123');
      expect(response.body.name).toBe('Tech Hackathon');
      expect(eventService.getEvent).toHaveBeenCalledWith('123');
    });

    it('should return 404 when event not found', async () => {
      (eventService.getEvent as jest.Mock).mockRejectedValue(
        new Error('Event not found')
      );

      const response = await request(app).get('/api/v1/events/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });
  });

  describe('PUT /api/v1/events/:id', () => {
    it('should update event with valid data', async () => {
      const mockEvent = {
        id: '123',
        name: 'Updated Hackathon',
        type: 'hackathon',
        date: new Date('2024-12-01'),
        description: 'Updated description',
        goals: ['Find talent'],
        companyId: 'company-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: null,
        venues: [],
        studentBodies: [],
        tasks: [],
      };

      (eventService.updateEvent as jest.Mock).mockResolvedValue(mockEvent);

      const response = await request(app).put('/api/v1/events/123').send({
        name: 'Updated Hackathon',
        description: 'Updated description',
      });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('123');
      expect(response.body.name).toBe('Updated Hackathon');
      expect(response.body.description).toBe('Updated description');
    });

    it('should return 404 when event not found', async () => {
      (eventService.updateEvent as jest.Mock).mockRejectedValue(
        new Error('Event not found')
      );

      const response = await request(app).put('/api/v1/events/999').send({
        name: 'Updated Hackathon',
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });

    it('should return 400 when event type is invalid', async () => {
      const response = await request(app).put('/api/v1/events/123').send({
        type: 'invalid-type',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid event type');
    });
  });

  describe('GET /api/v1/events/:id/status', () => {
    it('should get event status report', async () => {
      const mockStatusReport = {
        eventId: '123',
        venues: {
          requested: 2,
          waiting: 1,
          confirmed: 3,
          needsAction: 0,
          rejected: 1,
        },
        studentBodies: {
          requested: 5,
          waiting: 2,
          confirmed: 8,
          needsAction: 1,
          rejected: 0,
        },
        stakeholders: {
          requested: 0,
          waiting: 0,
          confirmed: 0,
          needsAction: 0,
          rejected: 0,
        },
      };

      (eventService.getEventStatus as jest.Mock).mockResolvedValue(mockStatusReport);

      const response = await request(app).get('/api/v1/events/123/status');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStatusReport);
      expect(eventService.getEventStatus).toHaveBeenCalledWith('123');
    });

    it('should return 404 when event not found', async () => {
      (eventService.getEventStatus as jest.Mock).mockRejectedValue(
        new Error('Event not found')
      );

      const response = await request(app).get('/api/v1/events/999/status');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });
  });

  describe('POST /api/v1/events/:id/venues', () => {
    it('should associate venue with event', async () => {
      (eventService.associateVenue as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/events/123/venues')
        .send({ venueId: 'venue-123' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Venue associated successfully');
      expect(eventService.associateVenue).toHaveBeenCalledWith('123', 'venue-123');
    });

    it('should return 400 when venueId is missing', async () => {
      const response = await request(app).post('/api/v1/events/123/venues').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required field');
    });

    it('should return 404 when event not found', async () => {
      (eventService.associateVenue as jest.Mock).mockRejectedValue(
        new Error('Event not found')
      );

      const response = await request(app)
        .post('/api/v1/events/999/venues')
        .send({ venueId: 'venue-123' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });

    it('should return 409 when venue already associated', async () => {
      (eventService.associateVenue as jest.Mock).mockRejectedValue(
        new Error('Venue is already associated with this event')
      );

      const response = await request(app)
        .post('/api/v1/events/123/venues')
        .send({ venueId: 'venue-123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Venue is already associated with this event');
    });
  });

  describe('POST /api/v1/events/:id/student-bodies', () => {
    it('should associate student body with event', async () => {
      (eventService.associateStudentBody as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/events/123/student-bodies')
        .send({
          studentBodyId: 'university-123',
          studentBodyType: 'university',
          status: 'REQUESTED',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Student body associated successfully');
      expect(eventService.associateStudentBody).toHaveBeenCalledWith(
        '123',
        'university-123',
        'university',
        'REQUESTED'
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/events/123/student-bodies')
        .send({ studentBodyId: 'university-123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 404 when event not found', async () => {
      (eventService.associateStudentBody as jest.Mock).mockRejectedValue(
        new Error('Event not found')
      );

      const response = await request(app)
        .post('/api/v1/events/999/student-bodies')
        .send({
          studentBodyId: 'university-123',
          studentBodyType: 'university',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found');
    });
  });
});
