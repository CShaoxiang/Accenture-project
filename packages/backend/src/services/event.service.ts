import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateEventDTO {
  name: string;
  type: 'hackathon' | 'bootcamp' | 'networking';
  date: string;
  description?: string;
  goals?: string[];
  companyId?: string;
}

export interface UpdateEventDTO {
  name?: string;
  type?: 'hackathon' | 'bootcamp' | 'networking';
  date?: string;
  description?: string;
  goals?: string[];
}

export interface EventFilters {
  type?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export class EventService {
  async createEvent(data: CreateEventDTO) {
    const event = await prisma.event.create({
      data: {
        name: data.name,
        type: data.type,
        date: new Date(data.date),
        description: data.description,
        goals: data.goals || [],
        companyId: data.companyId,
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
        tasks: {
          orderBy: {
            priority: 'asc',
          },
        },
      },
    });

    return event;
  }

  async listEvents(filters: EventFilters = {}) {
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
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

  async updateEvent(id: string, data: UpdateEventDTO) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.goals !== undefined) updateData.goals = data.goals;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
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

  async deleteEvent(id: string) {
    await prisma.event.delete({
      where: { id },
    });
  }

  async associateVenue(eventId: string, venueId: string) {
    await prisma.eventVenue.create({
      data: {
        eventId,
        venueId,
      },
    });
  }

  async dissociateVenue(eventId: string, venueId: string) {
    await prisma.eventVenue.delete({
      where: {
        eventId_venueId: {
          eventId,
          venueId,
        },
      },
    });
  }

  async getEventStatus(eventId: string) {
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
      return null;
    }

    const venueStatusCount = this.countByStatus(event.venues.map((ev) => ev.venue.status));
    const studentBodyStatusCount = this.countByStatus(event.studentBodies.map((sb) => sb.status));

    return {
      eventId,
      venues: venueStatusCount,
      studentBodies: studentBodyStatusCount,
      stakeholders: { requested: 0, waiting: 0, confirmed: 0, needsAction: 0, rejected: 0 },
    };
  }

  private countByStatus(statuses: string[]) {
    return {
      requested: statuses.filter((s) => s === 'REQUESTED').length,
      waiting: statuses.filter((s) => s === 'WAITING').length,
      confirmed: statuses.filter((s) => s === 'CONFIRMED').length,
      needsAction: statuses.filter((s) => s === 'NEEDS_ACTION').length,
      rejected: statuses.filter((s) => s === 'REJECTED').length,
    };
  }
}

export const eventService = new EventService();
