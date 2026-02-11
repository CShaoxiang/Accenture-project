import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StatusSummary {
  requested: number;
  waiting: number;
  confirmed: number;
  needsAction: number;
  rejected: number;
}

export interface EntityStatusBreakdown {
  venues: StatusSummary;
  studentBodies: StatusSummary;
  stakeholders: StatusSummary;
}

export interface EventSummary {
  id: string;
  name: string;
  type: string;
  date: Date;
  statusSummary: StatusSummary;
}

export interface DashboardData {
  eventSummaries: EventSummary[];
  overallStatus: StatusSummary;
  entityBreakdown: EntityStatusBreakdown;
}

export class DashboardService {
  async getDashboardData(filters?: {
    eventId?: string;
    entityType?: 'venue' | 'student_body' | 'stakeholder';
    status?: string;
  }): Promise<DashboardData> {
    const events = await prisma.event.findMany({
      where: filters?.eventId ? { id: filters.eventId } : undefined,
      include: {
        eventVenues: {
          include: {
            venue: true,
          },
        },
        eventStudentBodies: true,
      },
    });

    const eventSummaries: EventSummary[] = events.map((event) => {
      const venueStatuses = event.eventVenues.map((ev) => ev.venue.status);
      const studentBodyStatuses = event.eventStudentBodies.map((esb) => esb.status);
      const allStatuses = [...venueStatuses, ...studentBodyStatuses];

      return {
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        statusSummary: this.calculateStatusSummary(allStatuses),
      };
    });

    // Get all venues
    const venues = await prisma.venue.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
    });

    // Get all student bodies from event associations
    const studentBodies = await prisma.eventStudentBody.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
    });

    const venueStatusSummary = this.calculateStatusSummary(venues.map((v) => v.status));
    const studentBodyStatusSummary = this.calculateStatusSummary(
      studentBodies.map((sb) => sb.status)
    );

    // For now, stakeholders summary is empty (not yet implemented)
    const stakeholderStatusSummary: StatusSummary = {
      requested: 0,
      waiting: 0,
      confirmed: 0,
      needsAction: 0,
      rejected: 0,
    };

    const entityBreakdown: EntityStatusBreakdown = {
      venues: venueStatusSummary,
      studentBodies: studentBodyStatusSummary,
      stakeholders: stakeholderStatusSummary,
    };

    const overallStatus = this.combineStatusSummaries([
      venueStatusSummary,
      studentBodyStatusSummary,
      stakeholderStatusSummary,
    ]);

    return {
      eventSummaries,
      overallStatus,
      entityBreakdown,
    };
  }

  private calculateStatusSummary(statuses: string[]): StatusSummary {
    return {
      requested: statuses.filter((s) => s === 'REQUESTED').length,
      waiting: statuses.filter((s) => s === 'WAITING').length,
      confirmed: statuses.filter((s) => s === 'CONFIRMED').length,
      needsAction: statuses.filter((s) => s === 'NEEDS_ACTION').length,
      rejected: statuses.filter((s) => s === 'REJECTED').length,
    };
  }

  private combineStatusSummaries(summaries: StatusSummary[]): StatusSummary {
    return summaries.reduce(
      (acc, summary) => ({
        requested: acc.requested + summary.requested,
        waiting: acc.waiting + summary.waiting,
        confirmed: acc.confirmed + summary.confirmed,
        needsAction: acc.needsAction + summary.needsAction,
        rejected: acc.rejected + summary.rejected,
      }),
      {
        requested: 0,
        waiting: 0,
        confirmed: 0,
        needsAction: 0,
        rejected: 0,
      }
    );
  }
}

export const dashboardService = new DashboardService();
