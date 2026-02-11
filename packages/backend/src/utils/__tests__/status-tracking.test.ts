import { PrismaClient } from '@prisma/client';
import {
  recordStatusChange,
  getEntityStatusHistory,
  aggregateStatusCounts,
  calculateTimeElapsed,
  getWaitingVenuesWithTimeElapsed,
  filterVenuesByStatus,
  filterStudentBodiesByStatus,
  EntityStatus,
  EntityType,
} from '../status-tracking';

const prisma = new PrismaClient();

describe('Status Tracking Utilities', () => {
  let testVenueId: string;
  let testEventId: string;

  beforeAll(async () => {
    // Create test venue
    const venue = await prisma.venue.create({
      data: {
        name: 'Test Venue',
        status: 'REQUESTED',
        lastContactDate: new Date(),
      },
    });
    testVenueId = venue.id;

    // Create test event
    const event = await prisma.event.create({
      data: {
        name: 'Test Event',
        type: 'hackathon',
        date: new Date('2026-06-01'),
      },
    });
    testEventId = event.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.statusHistory.deleteMany({
      where: { entityId: testVenueId },
    });
    await prisma.eventVenue.deleteMany({
      where: { venueId: testVenueId },
    });
    await prisma.venue.delete({
      where: { id: testVenueId },
    });
    await prisma.event.delete({
      where: { id: testEventId },
    });
    await prisma.$disconnect();
  });

  describe('recordStatusChange', () => {
    it('should record a status change in history', async () => {
      const result = await recordStatusChange(
        testVenueId,
        'venue',
        'REQUESTED',
        'WAITING',
        'Sent initial inquiry'
      );

      expect(result).toBeDefined();
      expect(result.entityId).toBe(testVenueId);
      expect(result.entityType).toBe('venue');
      expect(result.previousStatus).toBe('REQUESTED');
      expect(result.newStatus).toBe('WAITING');
      expect(result.notes).toBe('Sent initial inquiry');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should record status change with null previous status', async () => {
      const result = await recordStatusChange(
        testVenueId,
        'venue',
        null,
        'REQUESTED'
      );

      expect(result.previousStatus).toBeNull();
      expect(result.newStatus).toBe('REQUESTED');
    });

    it('should record status change without notes', async () => {
      const result = await recordStatusChange(
        testVenueId,
        'venue',
        'WAITING',
        'CONFIRMED'
      );

      expect(result.notes).toBeNull();
    });
  });

  describe('getEntityStatusHistory', () => {
    beforeAll(async () => {
      // Create some history entries
      await recordStatusChange(testVenueId, 'venue', null, 'REQUESTED');
      await recordStatusChange(
        testVenueId,
        'venue',
        'REQUESTED',
        'WAITING'
      );
      await recordStatusChange(
        testVenueId,
        'venue',
        'WAITING',
        'CONFIRMED'
      );
    });

    it('should retrieve status history for an entity', async () => {
      const history = await getEntityStatusHistory(testVenueId, 'venue');

      expect(history.length).toBeGreaterThan(0);
      expect(history[0].entityId).toBe(testVenueId);
      expect(history[0].entityType).toBe('venue');
    });

    it('should return history in descending order by timestamp', async () => {
      const history = await getEntityStatusHistory(testVenueId, 'venue');

      for (let i = 0; i < history.length - 1; i++) {
        expect(history[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          history[i + 1].timestamp.getTime()
        );
      }
    });

    it('should return empty array for entity with no history', async () => {
      const history = await getEntityStatusHistory(
        '00000000-0000-0000-0000-000000000000',
        'venue'
      );

      expect(history).toEqual([]);
    });
  });

  describe('aggregateStatusCounts', () => {
    let venue1Id: string;
    let venue2Id: string;
    let venue3Id: string;

    beforeAll(async () => {
      // Create test venues with different statuses
      const v1 = await prisma.venue.create({
        data: {
          name: 'Venue 1',
          status: 'REQUESTED',
          lastContactDate: new Date(),
        },
      });
      venue1Id = v1.id;

      const v2 = await prisma.venue.create({
        data: {
          name: 'Venue 2',
          status: 'WAITING',
          lastContactDate: new Date(),
        },
      });
      venue2Id = v2.id;

      const v3 = await prisma.venue.create({
        data: {
          name: 'Venue 3',
          status: 'CONFIRMED',
          lastContactDate: new Date(),
        },
      });
      venue3Id = v3.id;
    });

    afterAll(async () => {
      await prisma.venue.deleteMany({
        where: {
          id: { in: [venue1Id, venue2Id, venue3Id] },
        },
      });
    });

    it('should aggregate status counts across all entities', async () => {
      const summary = await aggregateStatusCounts();

      expect(summary).toBeDefined();
      expect(summary.venues).toBeDefined();
      expect(summary.studentBodies).toBeDefined();
      expect(summary.stakeholders).toBeDefined();
      expect(summary.total).toBeDefined();

      // Verify counts are numbers
      expect(typeof summary.venues.requested).toBe('number');
      expect(typeof summary.venues.waiting).toBe('number');
      expect(typeof summary.venues.confirmed).toBe('number');
      expect(typeof summary.venues.needsAction).toBe('number');
      expect(typeof summary.venues.rejected).toBe('number');
    });

    it('should calculate total counts correctly', async () => {
      const summary = await aggregateStatusCounts();

      const calculatedTotal =
        summary.venues.requested +
        summary.venues.waiting +
        summary.venues.confirmed +
        summary.venues.needsAction +
        summary.venues.rejected +
        summary.studentBodies.requested +
        summary.studentBodies.waiting +
        summary.studentBodies.confirmed +
        summary.studentBodies.needsAction +
        summary.studentBodies.rejected +
        summary.stakeholders.requested +
        summary.stakeholders.waiting +
        summary.stakeholders.confirmed +
        summary.stakeholders.needsAction +
        summary.stakeholders.rejected;

      const reportedTotal =
        summary.total.requested +
        summary.total.waiting +
        summary.total.confirmed +
        summary.total.needsAction +
        summary.total.rejected;

      expect(reportedTotal).toBe(calculatedTotal);
    });

    it('should aggregate status counts for a specific event', async () => {
      // Associate venues with event
      await prisma.eventVenue.create({
        data: {
          eventId: testEventId,
          venueId: venue1Id,
        },
      });

      await prisma.eventVenue.create({
        data: {
          eventId: testEventId,
          venueId: venue2Id,
        },
      });

      const summary = await aggregateStatusCounts(testEventId);

      expect(summary.venues.requested).toBeGreaterThanOrEqual(1);
      expect(summary.venues.waiting).toBeGreaterThanOrEqual(1);

      // Clean up
      await prisma.eventVenue.deleteMany({
        where: { eventId: testEventId },
      });
    });

    it('should throw error for non-existent event', async () => {
      await expect(
        aggregateStatusCounts('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Event not found');
    });
  });

  describe('calculateTimeElapsed', () => {
    it('should calculate hours and days elapsed correctly', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      const result = calculateTimeElapsed(twoDaysAgo);

      expect(result.hoursElapsed).toBe(48);
      expect(result.daysElapsed).toBe(2);
    });

    it('should handle recent timestamps', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const result = calculateTimeElapsed(twoHoursAgo);

      expect(result.hoursElapsed).toBe(2);
      expect(result.daysElapsed).toBe(0);
    });

    it('should handle timestamps from weeks ago', () => {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      const result = calculateTimeElapsed(tenDaysAgo);

      expect(result.hoursElapsed).toBe(240);
      expect(result.daysElapsed).toBe(10);
    });
  });

  describe('getWaitingVenuesWithTimeElapsed', () => {
    let waitingVenueId: string;

    beforeAll(async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const venue = await prisma.venue.create({
        data: {
          name: 'Waiting Venue',
          status: 'WAITING',
          lastContactDate: twoDaysAgo,
        },
      });
      waitingVenueId = venue.id;
    });

    afterAll(async () => {
      await prisma.venue.delete({
        where: { id: waitingVenueId },
      });
    });

    it('should return waiting venues with time elapsed', async () => {
      const results = await getWaitingVenuesWithTimeElapsed();

      expect(results.length).toBeGreaterThan(0);
      const waitingVenue = results.find((r) => r.entityId === waitingVenueId);
      expect(waitingVenue).toBeDefined();
      expect(waitingVenue?.entityType).toBe('venue');
      expect(waitingVenue?.hoursElapsed).toBeGreaterThanOrEqual(48);
      expect(waitingVenue?.daysElapsed).toBeGreaterThanOrEqual(2);
    });

    it('should not include venues with other statuses', async () => {
      const results = await getWaitingVenuesWithTimeElapsed();

      results.forEach((result) => {
        expect(result.entityType).toBe('venue');
      });

      // Verify by checking the database
      const allResults = await prisma.venue.findMany({
        where: {
          id: { in: results.map((r) => r.entityId) },
        },
      });

      allResults.forEach((venue) => {
        expect(venue.status).toBe('WAITING');
      });
    });
  });

  describe('filterVenuesByStatus', () => {
    let requestedVenueId: string;
    let confirmedVenueId: string;

    beforeAll(async () => {
      const v1 = await prisma.venue.create({
        data: {
          name: 'Requested Venue',
          status: 'REQUESTED',
          lastContactDate: new Date(),
        },
      });
      requestedVenueId = v1.id;

      const v2 = await prisma.venue.create({
        data: {
          name: 'Confirmed Venue',
          status: 'CONFIRMED',
          lastContactDate: new Date(),
        },
      });
      confirmedVenueId = v2.id;
    });

    afterAll(async () => {
      await prisma.venue.deleteMany({
        where: {
          id: { in: [requestedVenueId, confirmedVenueId] },
        },
      });
    });

    it('should filter venues by REQUESTED status', async () => {
      const results = await filterVenuesByStatus('REQUESTED');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((venue) => {
        expect(venue.status).toBe('REQUESTED');
      });
    });

    it('should filter venues by CONFIRMED status', async () => {
      const results = await filterVenuesByStatus('CONFIRMED');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((venue) => {
        expect(venue.status).toBe('CONFIRMED');
      });
    });

    it('should return empty array for status with no venues', async () => {
      // First clean up any REJECTED venues
      await prisma.venue.deleteMany({
        where: { status: 'REJECTED' },
      });

      const results = await filterVenuesByStatus('REJECTED');
      expect(results).toEqual([]);
    });
  });

  describe('filterStudentBodiesByStatus', () => {
    let studentBodyId: string;

    beforeAll(async () => {
      studentBodyId = '11111111-1111-1111-1111-111111111111';
      await prisma.eventStudentBody.create({
        data: {
          eventId: testEventId,
          studentBodyId,
          studentBodyType: 'university',
          status: 'WAITING',
        },
      });
    });

    afterAll(async () => {
      await prisma.eventStudentBody.deleteMany({
        where: {
          eventId: testEventId,
          studentBodyId,
        },
      });
    });

    it('should filter student bodies by status for an event', async () => {
      const results = await filterStudentBodiesByStatus(
        testEventId,
        'WAITING'
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach((sb) => {
        expect(sb.eventId).toBe(testEventId);
        expect(sb.status).toBe('WAITING');
      });
    });

    it('should return empty array for status with no student bodies', async () => {
      const results = await filterStudentBodiesByStatus(
        testEventId,
        'REJECTED'
      );

      expect(results).toEqual([]);
    });
  });
});
