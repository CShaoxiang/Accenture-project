import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type EntityStatus = 'REQUESTED' | 'WAITING' | 'CONFIRMED' | 'NEEDS_ACTION' | 'REJECTED';

export type EntityType = 'venue' | 'student_body' | 'stakeholder';

export interface StatusHistoryEntry {
  id: string;
  entityId: string;
  entityType: EntityType;
  previousStatus: string | null;
  newStatus: string;
  notes: string | null;
  timestamp: Date;
}

export interface EntityStatusCount {
  requested: number;
  waiting: number;
  confirmed: number;
  needsAction: number;
  rejected: number;
}

export interface DashboardStatusSummary {
  venues: EntityStatusCount;
  studentBodies: EntityStatusCount;
  stakeholders: EntityStatusCount;
  total: EntityStatusCount;
}

export interface TimeElapsedResult {
  entityId: string;
  entityType: EntityType;
  lastContactDate: Date;
  hoursElapsed: number;
  daysElapsed: number;
}

/**
 * Records a status change in the status history table
 * Validates: Requirements 3.2
 */
export async function recordStatusChange(
  entityId: string,
  entityType: EntityType,
  previousStatus: string | null,
  newStatus: EntityStatus,
  notes?: string
): Promise<StatusHistoryEntry> {
  const historyEntry = await prisma.statusHistory.create({
    data: {
      entityId,
      entityType,
      previousStatus,
      newStatus,
      notes: notes || null,
    },
  });

  return historyEntry;
}

/**
 * Retrieves status history for a specific entity
 * Validates: Requirements 2.3
 */
export async function getEntityStatusHistory(
  entityId: string,
  entityType: EntityType
): Promise<StatusHistoryEntry[]> {
  const history = await prisma.statusHistory.findMany({
    where: {
      entityId,
      entityType,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  return history;
}

/**
 * Aggregates status counts for dashboard display
 * Validates: Requirements 3.3
 */
export async function aggregateStatusCounts(
  eventId?: string
): Promise<DashboardStatusSummary> {
  // Initialize counts
  const venueStatusCount: EntityStatusCount = {
    requested: 0,
    waiting: 0,
    confirmed: 0,
    needsAction: 0,
    rejected: 0,
  };

  const studentBodyStatusCount: EntityStatusCount = {
    requested: 0,
    waiting: 0,
    confirmed: 0,
    needsAction: 0,
    rejected: 0,
  };

  const stakeholderStatusCount: EntityStatusCount = {
    requested: 0,
    waiting: 0,
    confirmed: 0,
    needsAction: 0,
    rejected: 0,
  };

  // If eventId is provided, aggregate for that event only
  if (eventId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venues: {
          include: {
            venue: true,
          },
        },
        studentBodies: true,
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Count venue statuses
    event.venues.forEach((eventVenue) => {
      incrementStatusCount(venueStatusCount, eventVenue.venue.status);
    });

    // Count student body statuses
    event.studentBodies.forEach((studentBody) => {
      incrementStatusCount(studentBodyStatusCount, studentBody.status);
    });
  } else {
    // Aggregate across all entities
    const venues = await prisma.venue.findMany();
    venues.forEach((venue) => {
      incrementStatusCount(venueStatusCount, venue.status);
    });

    const studentBodies = await prisma.eventStudentBody.findMany();
    studentBodies.forEach((studentBody) => {
      incrementStatusCount(studentBodyStatusCount, studentBody.status);
    });

    // Stakeholders would be counted here when implemented
  }

  // Calculate total counts
  const totalStatusCount: EntityStatusCount = {
    requested:
      venueStatusCount.requested +
      studentBodyStatusCount.requested +
      stakeholderStatusCount.requested,
    waiting:
      venueStatusCount.waiting +
      studentBodyStatusCount.waiting +
      stakeholderStatusCount.waiting,
    confirmed:
      venueStatusCount.confirmed +
      studentBodyStatusCount.confirmed +
      stakeholderStatusCount.confirmed,
    needsAction:
      venueStatusCount.needsAction +
      studentBodyStatusCount.needsAction +
      stakeholderStatusCount.needsAction,
    rejected:
      venueStatusCount.rejected +
      studentBodyStatusCount.rejected +
      stakeholderStatusCount.rejected,
  };

  return {
    venues: venueStatusCount,
    studentBodies: studentBodyStatusCount,
    stakeholders: stakeholderStatusCount,
    total: totalStatusCount,
  };
}

/**
 * Helper function to increment status count based on status string
 */
function incrementStatusCount(counts: EntityStatusCount, status: string): void {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case 'REQUESTED':
      counts.requested++;
      break;
    case 'WAITING':
      counts.waiting++;
      break;
    case 'CONFIRMED':
      counts.confirmed++;
      break;
    case 'NEEDS_ACTION':
      counts.needsAction++;
      break;
    case 'REJECTED':
      counts.rejected++;
      break;
  }
}

/**
 * Calculates time elapsed since last contact for an entity
 * Validates: Requirements 2.4
 */
export function calculateTimeElapsed(lastContactDate: Date): {
  hoursElapsed: number;
  daysElapsed: number;
} {
  const now = new Date();
  const diffMs = now.getTime() - lastContactDate.getTime();
  const hoursElapsed = diffMs / (1000 * 60 * 60);
  const daysElapsed = diffMs / (1000 * 60 * 60 * 24);

  return {
    hoursElapsed: Math.floor(hoursElapsed),
    daysElapsed: Math.floor(daysElapsed),
  };
}

/**
 * Gets time elapsed for all venues with WAITING status
 * Validates: Requirements 2.4, 4.2
 */
export async function getWaitingVenuesWithTimeElapsed(): Promise<TimeElapsedResult[]> {
  const waitingVenues = await prisma.venue.findMany({
    where: {
      status: 'WAITING',
      lastContactDate: {
        not: null,
      },
    },
  });

  return waitingVenues.map((venue) => {
    const { hoursElapsed, daysElapsed } = calculateTimeElapsed(
      venue.lastContactDate!
    );
    return {
      entityId: venue.id,
      entityType: 'venue' as EntityType,
      lastContactDate: venue.lastContactDate!,
      hoursElapsed,
      daysElapsed,
    };
  });
}

/**
 * Gets time elapsed for all student bodies with WAITING status
 * Validates: Requirements 2.4, 4.2
 */
export async function getWaitingStudentBodiesWithTimeElapsed(
  eventId?: string
): Promise<TimeElapsedResult[]> {
  const where: any = {
    status: 'WAITING',
  };

  if (eventId) {
    where.eventId = eventId;
  }

  const waitingStudentBodies = await prisma.eventStudentBody.findMany({
    where,
  });

  // Note: EventStudentBody doesn't have lastContactDate in current schema
  // This would need to be added or tracked separately
  // For now, returning empty array as placeholder
  return [];
}

/**
 * Filters entities by status
 * Validates: Requirements 3.5
 */
export async function filterVenuesByStatus(
  status: EntityStatus
): Promise<any[]> {
  return await prisma.venue.findMany({
    where: {
      status,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

/**
 * Filters student bodies by status for a specific event
 * Validates: Requirements 3.5
 */
export async function filterStudentBodiesByStatus(
  eventId: string,
  status: EntityStatus
): Promise<any[]> {
  return await prisma.eventStudentBody.findMany({
    where: {
      eventId,
      status,
    },
  });
}
