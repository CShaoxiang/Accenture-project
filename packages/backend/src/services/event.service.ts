import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateEventDTO {
  name: string;
  type: 'hackathon' | 'bootcamp' | 'networking';
  date: Date;
  description?: string;
  goals?: string[];
  companyId?: string;
}

export interface UpdateEventDTO {
  name?: string;
  type?: 'hackathon' | 'bootcamp' | 'networking';
  date?: Date;
  description?: string;
  goals?: string[];
  companyId?: string;
}

export interface EventFilters {
  type?: 'hackathon' | 'bootcamp' | 'networking';
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EntityStatusCount {
  requested: number;
  waiting: number;
  confirmed: number;
  needsAction: number;
  rejected: number;
}

export interface EventStatusReport {
  eventId: string;
  venues: EntityStatusCount;
  studentBodies: EntityStatusCount;
  stakeholders: EntityStatusCount;
}

export class EventService {
  async createEvent(data: CreateEventDTO) {
    const { name, type, date, description, goals, companyId } = data;

    // Validate event type
    const validTypes = ['hackathon', 'bootcamp', 'networking'];
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid event type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    // Create event with empty collections
    const event = await prisma.event.create({
      data: {
        name,
        type,
        date,
        description,
        goals: goals || [],
        companyId,
      },
      include: {
        company: true,
        venues: {
          include: {
            venue: true,
          },
        },
        studentBodies: true,
        tasks: true,
      },
    });

    return event;
  }

  async getEvent(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        company: true,
        venues: {
          include: {
            venue: true,
          },
        },
        studentBodies: true,
        tasks: true,
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async updateEvent(id: string, data: UpdateEventDTO) {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Validate event type if provided
    if (data.type) {
      const validTypes = ['hackathon', 'bootcamp', 'networking'];
      if (!validTypes.includes(data.type)) {
        throw new Error(
          `Invalid event type. Must be one of: ${validTypes.join(', ')}`
        );
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.date && { date: data.date }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.goals && { goals: data.goals }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
      },
      include: {
        company: true,
        venues: {
          include: {
            venue: true,
          },
        },
        studentBodies: true,
        tasks: true,
      },
    });

    return event;
  }

  async listEvents(filters: EventFilters = {}) {
    const { type, companyId, startDate, endDate } = filters;

    interface WhereClause {
      type?: string;
      companyId?: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const where: WhereClause = {};

    if (type) {
      where.type = type;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        company: true,
        venues: {
          include: {
            venue: true,
          },
        },
        studentBodies: true,
        tasks: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return events;
  }

  async associateVenue(eventId: string, venueId: string) {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      throw new Error('Venue not found');
    }

    // Check if association already exists
    const existingAssociation = await prisma.eventVenue.findUnique({
      where: {
        eventId_venueId: {
          eventId,
          venueId,
        },
      },
    });

    if (existingAssociation) {
      throw new Error('Venue is already associated with this event');
    }

    // Create association
    await prisma.eventVenue.create({
      data: {
        eventId,
        venueId,
      },
    });
  }

  async associateStudentBody(
    eventId: string,
    studentBodyId: string,
    studentBodyType: string,
    status: string = 'REQUESTED'
  ) {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Validate status
    const validStatuses = ['REQUESTED', 'WAITING', 'CONFIRMED', 'NEEDS_ACTION', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    // Check if association already exists
    const existingAssociation = await prisma.eventStudentBody.findUnique({
      where: {
        eventId_studentBodyId: {
          eventId,
          studentBodyId,
        },
      },
    });

    if (existingAssociation) {
      throw new Error('Student body is already associated with this event');
    }

    // Create association
    await prisma.eventStudentBody.create({
      data: {
        eventId,
        studentBodyId,
        studentBodyType,
        status,
      },
    });
  }

  async getEventStatus(eventId: string): Promise<EventStatusReport> {
    // Check if event exists
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
    const venueStatusCount: EntityStatusCount = {
      requested: 0,
      waiting: 0,
      confirmed: 0,
      needsAction: 0,
      rejected: 0,
    };

    event.venues.forEach((eventVenue) => {
      const status = eventVenue.venue.status.toLowerCase();
      if (status === 'requested') venueStatusCount.requested++;
      else if (status === 'waiting') venueStatusCount.waiting++;
      else if (status === 'confirmed') venueStatusCount.confirmed++;
      else if (status === 'needs_action') venueStatusCount.needsAction++;
      else if (status === 'rejected') venueStatusCount.rejected++;
    });

    // Count student body statuses
    const studentBodyStatusCount: EntityStatusCount = {
      requested: 0,
      waiting: 0,
      confirmed: 0,
      needsAction: 0,
      rejected: 0,
    };

    event.studentBodies.forEach((studentBody) => {
      const status = studentBody.status.toLowerCase();
      if (status === 'requested') studentBodyStatusCount.requested++;
      else if (status === 'waiting') studentBodyStatusCount.waiting++;
      else if (status === 'confirmed') studentBodyStatusCount.confirmed++;
      else if (status === 'needs_action') studentBodyStatusCount.needsAction++;
      else if (status === 'rejected') studentBodyStatusCount.rejected++;
    });

    // For stakeholders, we'll return zeros for now as they're not in the schema yet
    const stakeholderStatusCount: EntityStatusCount = {
      requested: 0,
      waiting: 0,
      confirmed: 0,
      needsAction: 0,
      rejected: 0,
    };

    return {
      eventId,
      venues: venueStatusCount,
      studentBodies: studentBodyStatusCount,
      stakeholders: stakeholderStatusCount,
    };
  }
}

export const eventService = new EventService();
