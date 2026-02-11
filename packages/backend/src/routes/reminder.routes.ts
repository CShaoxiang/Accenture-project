import { Router, Request, Response } from 'express';
import { reminderService } from '../services/reminder.service';

const router = Router();

/**
 * GET /api/v1/reminders/overdue
 * Get all overdue entities that need follow-up
 */
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const thresholdDays = req.query.thresholdDays
      ? parseInt(req.query.thresholdDays as string, 10)
      : 7;

    const overdueEntities = await reminderService.detectOverdueEntities(thresholdDays);
    res.json(overdueEntities);
  } catch (error) {
    console.error('Error fetching overdue entities:', error);
    res.status(500).json({ error: 'Failed to fetch overdue entities' });
  }
});

/**
 * POST /api/v1/reminders/generate
 * Generate a reminder draft for an entity
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { entityId, entityType } = req.body;

    if (!entityId || !entityType) {
      return res.status(400).json({ error: 'entityId and entityType are required' });
    }

    if (!['venue', 'student_body', 'stakeholder'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entityType' });
    }

    const reminderDraft = await reminderService.generateReminderDraft(entityId, entityType);
    res.json(reminderDraft);
  } catch (error) {
    console.error('Error generating reminder draft:', error);
    res.status(500).json({ error: 'Failed to generate reminder draft' });
  }
});

/**
 * POST /api/v1/reminders/:id/approve
 * Approve and send a reminder
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await reminderService.approveReminder(id);
    res.json({ success: true, message: 'Reminder approved and sent' });
  } catch (error) {
    console.error('Error approving reminder:', error);
    res.status(500).json({ error: 'Failed to approve reminder' });
  }
});

/**
 * POST /api/v1/reminders/mark-contacted
 * Mark an entity as contacted without generating a reminder
 */
router.post('/mark-contacted', async (req: Request, res: Response) => {
  try {
    const { entityId, entityType } = req.body;

    if (!entityId || !entityType) {
      return res.status(400).json({ error: 'entityId and entityType are required' });
    }

    if (!['venue', 'student_body', 'stakeholder'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entityType' });
    }

    await reminderService.markAsContacted(entityId, entityType);
    res.json({ success: true, message: 'Entity marked as contacted' });
  } catch (error) {
    console.error('Error marking entity as contacted:', error);
    res.status(500).json({ error: 'Failed to mark entity as contacted' });
  }
});

export default router;
