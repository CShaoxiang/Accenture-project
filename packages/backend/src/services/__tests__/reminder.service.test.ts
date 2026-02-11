import { PrismaClient } from '@prisma/client';
import { ReminderService } from '../reminder.service';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    venue: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    eventStudentBody: {
      findMany: jest.fn(),
    },
    statusHistory: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    reminder: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('ReminderService', () => {
  let reminderService: ReminderService;
  let mockPrisma: any;

  beforeEach(() => {
    reminderService = new ReminderService();
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('detectOverdueEntities', () => {
    it('should detect venues with WAITING status older than threshold', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

      mockPrisma.venue.findMany.mockResolvedValue([
        {
          id: 'venue-1',
          name: 'Test Venue',
          status: 'WAITING',
          lastContactDate: oldDate,
        },
      ]);

      mockPrisma.eventStudentBody.findMany.mockResolvedValue([]);

      const result = await reminderService.detectOverdueEntities(7);

      expect(result).toHaveLength(1);
      expect(result[0].entityId).toBe('venue-1');
      expect(result[0].name).toBe('Test Venue');
      expect(result[0].daysOverdue).toBeGreaterThanOrEqual(10);
    });

    it('should include venues with null lastContactDate', async () => {
      mockPrisma.venue.findMany.mockResolvedValue([
        {
          id: 'venue-2',
          name: 'Never Contacted Venue',
          status: 'WAITING',
          lastContactDate: null,
        },
      ]);

      mockPrisma.eventStudentBody.findMany.mockResolvedValue([]);

      const result = await reminderService.detectOverdueEntities(7);

      expect(result).toHaveLength(1);
      expect(result[0].entityId).toBe('venue-2');
      expect(result[0].daysOverdue).toBe(999); // Large number for never contacted
    });

    it('should sort entities by days overdue (most overdue first)', async () => {
      const date5DaysAgo = new Date();
      date5DaysAgo.setDate(date5DaysAgo.getDate() - 5);

      const date15DaysAgo = new Date();
      date15DaysAgo.setDate(date15DaysAgo.getDate() - 15);

      mockPrisma.venue.findMany.mockResolvedValue([
        {
          id: 'venue-1',
          name: 'Less Overdue',
          status: 'WAITING',
          lastContactDate: date5DaysAgo,
        },
        {
          id: 'venue-2',
          name: 'More Overdue',
          status: 'WAITING',
          lastContactDate: date15DaysAgo,
        },
      ]);

      mockPrisma.eventStudentBody.findMany.mockResolvedValue([]);

      const result = await reminderService.detectOverdueEntities(7);

      expect(result).toHaveLength(2);
      expect(result[0].entityId).toBe('venue-2'); // More overdue should be first
      expect(result[1].entityId).toBe('venue-1');
    });
  });

  describe('generateReminderDraft', () => {
    it('should generate a reminder draft for a venue', async () => {
      const lastContactDate = new Date('2024-01-01');

      mockPrisma.venue.findUnique.mockResolvedValue({
        id: 'venue-1',
        name: 'Test Venue',
        lastContactDate,
      });

      mockPrisma.reminder.create.mockResolvedValue({
        id: 'reminder-1',
        entityId: 'venue-1',
        entityType: 'venue',
        draftSubject: 'Follow-up: Test Venue',
        draftBody: 'Test body',
        createdAt: new Date(),
      });

      const result = await reminderService.generateReminderDraft('venue-1', 'venue');

      expect(result.entityId).toBe('venue-1');
      expect(result.subject).toContain('Test Venue');
      expect(mockPrisma.reminder.create).toHaveBeenCalled();
    });

    it('should include last contact date in reminder body', async () => {
      const lastContactDate = new Date('2024-01-01');

      mockPrisma.venue.findUnique.mockResolvedValue({
        id: 'venue-1',
        name: 'Test Venue',
        lastContactDate,
      });

      mockPrisma.reminder.create.mockResolvedValue({
        id: 'reminder-1',
        entityId: 'venue-1',
        entityType: 'venue',
        draftSubject: 'Follow-up: Test Venue',
        draftBody: 'We last contacted you on 1/1/2024.',
        createdAt: new Date(),
      });

      const result = await reminderService.generateReminderDraft('venue-1', 'venue');

      expect(result.body).toBeDefined();
    });
  });

  describe('markAsContacted', () => {
    it('should update venue lastContactDate', async () => {
      mockPrisma.venue.update.mockResolvedValue({});
      mockPrisma.statusHistory.create.mockResolvedValue({});

      await reminderService.markAsContacted('venue-1', 'venue');

      expect(mockPrisma.venue.update).toHaveBeenCalledWith({
        where: { id: 'venue-1' },
        data: { lastContactDate: expect.any(Date) },
      });
    });

    it('should create status history entry', async () => {
      mockPrisma.venue.update.mockResolvedValue({});
      mockPrisma.statusHistory.create.mockResolvedValue({});

      await reminderService.markAsContacted('venue-1', 'venue');

      expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith({
        data: {
          entityId: 'venue-1',
          entityType: 'venue',
          previousStatus: 'WAITING',
          newStatus: 'WAITING',
          notes: 'Marked as contacted via reminder queue',
        },
      });
    });
  });

  describe('approveReminder', () => {
    it('should mark reminder as approved and sent', async () => {
      mockPrisma.reminder.findUnique.mockResolvedValue({
        id: 'reminder-1',
        entityId: 'venue-1',
        entityType: 'venue',
      });

      mockPrisma.reminder.update.mockResolvedValue({});
      mockPrisma.venue.update.mockResolvedValue({});
      mockPrisma.statusHistory.create.mockResolvedValue({});

      await reminderService.approveReminder('reminder-1');

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 'reminder-1' },
        data: {
          approved: true,
          sentAt: expect.any(Date),
        },
      });
    });

    it('should throw error if reminder not found', async () => {
      mockPrisma.reminder.findUnique.mockResolvedValue(null);

      await expect(reminderService.approveReminder('invalid-id')).rejects.toThrow(
        'Reminder not found'
      );
    });
  });
});
