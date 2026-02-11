import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface OverdueEntity {
  entityId: string;
  entityType: 'venue' | 'student_body' | 'stakeholder';
  name: string;
  status: string;
  lastContactDate: Date | null;
  daysOverdue: number;
}

export interface ReminderDraft {
  id: string;
  entityId: string;
  entityType: string;
  subject: string;
  body: string;
  generatedAt: Date;
}

export class ReminderService {
  /**
   * Detect entities that have been in WAITING status longer than the threshold
   * @param thresholdDays Number of days before an entity is considered overdue
   */
  async detectOverdueEntities(thresholdDays: number = 7): Promise<OverdueEntity[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const overdueEntities: OverdueEntity[] = [];

    // Check venues
    const overdueVenues = await prisma.venue.findMany({
      where: {
        status: 'WAITING',
        OR: [
          { lastContactDate: { lt: thresholdDate } },
          { lastContactDate: null },
        ],
      },
    });

    for (const venue of overdueVenues) {
      const daysOverdue = venue.lastContactDate
        ? Math.floor((Date.now() - venue.lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // Large number if never contacted

      overdueEntities.push({
        entityId: venue.id,
        entityType: 'venue',
        name: venue.name,
        status: venue.status,
        lastContactDate: venue.lastContactDate,
        daysOverdue,
      });
    }

    // Check student bodies (from event associations)
    const overdueStudentBodies = await prisma.eventStudentBody.findMany({
      where: {
        status: 'WAITING',
      },
    });

    // For student bodies, we need to calculate days overdue from status history
    for (const studentBody of overdueStudentBodies) {
      const lastStatusChange = await prisma.statusHistory.findFirst({
        where: {
          entityId: studentBody.studentBodyId,
          entityType: 'student_body',
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      const lastContactDate = lastStatusChange?.timestamp || null;
      const daysOverdue = lastContactDate
        ? Math.floor((Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (!lastContactDate || lastContactDate < thresholdDate) {
        overdueEntities.push({
          entityId: studentBody.studentBodyId,
          entityType: 'student_body',
          name: `Student Body ${studentBody.studentBodyId.substring(0, 8)}`, // Placeholder name
          status: studentBody.status,
          lastContactDate,
          daysOverdue,
        });
      }
    }

    // Sort by days overdue (most overdue first)
    return overdueEntities.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  /**
   * Generate a reminder draft for an entity
   */
  async generateReminderDraft(
    entityId: string,
    entityType: 'venue' | 'student_body' | 'stakeholder'
  ): Promise<ReminderDraft> {
    let entityName = 'Unknown';
    let lastContactDate: Date | null = null;

    // Fetch entity details
    if (entityType === 'venue') {
      const venue = await prisma.venue.findUnique({ where: { id: entityId } });
      if (venue) {
        entityName = venue.name;
        lastContactDate = venue.lastContactDate;
      }
    }

    // Generate draft content
    const subject = `Follow-up: ${entityName}`;
    const body = this.generateReminderBody(entityName, entityType, lastContactDate);

    // Create reminder record
    const reminder = await prisma.reminder.create({
      data: {
        entityId,
        entityType,
        draftSubject: subject,
        draftBody: body,
        approved: false,
      },
    });

    return {
      id: reminder.id,
      entityId: reminder.entityId,
      entityType: reminder.entityType,
      subject: reminder.draftSubject || subject,
      body: reminder.draftBody || body,
      generatedAt: reminder.createdAt,
    };
  }

  /**
   * Mark an entity as contacted (update last contact date)
   */
  async markAsContacted(
    entityId: string,
    entityType: 'venue' | 'student_body' | 'stakeholder'
  ): Promise<void> {
    const now = new Date();

    if (entityType === 'venue') {
      await prisma.venue.update({
        where: { id: entityId },
        data: { lastContactDate: now },
      });
    }

    // Record status history
    await prisma.statusHistory.create({
      data: {
        entityId,
        entityType,
        previousStatus: 'WAITING',
        newStatus: 'WAITING',
        notes: 'Marked as contacted via reminder queue',
      },
    });
  }

  /**
   * Approve and send a reminder (for now, just marks as approved)
   */
  async approveReminder(reminderId: string): Promise<void> {
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) {
      throw new Error('Reminder not found');
    }

    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        approved: true,
        sentAt: new Date(),
      },
    });

    // Update entity last contact date
    await this.markAsContacted(
      reminder.entityId,
      reminder.entityType as 'venue' | 'student_body' | 'stakeholder'
    );
  }

  private generateReminderBody(
    entityName: string,
    entityType: string,
    lastContactDate: Date | null
  ): string {
    const lastContactText = lastContactDate
      ? `We last contacted you on ${lastContactDate.toLocaleDateString()}.`
      : 'We have not yet received a response from you.';

    return `Dear ${entityName} team,

${lastContactText}

We wanted to follow up regarding our previous inquiry about hosting a talent acquisition event. We would appreciate an update on your availability and interest.

Please let us know if you have any questions or need additional information.

Best regards,
Talent Acquisition Team`;
  }
}

export const reminderService = new ReminderService();
