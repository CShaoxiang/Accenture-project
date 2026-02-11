import { Router, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { eventId, entityType, status } = req.query;

    const filters: {
      eventId?: string;
      entityType?: 'venue' | 'student_body' | 'stakeholder';
      status?: string;
    } = {};

    if (eventId && typeof eventId === 'string') {
      filters.eventId = eventId;
    }

    if (entityType && typeof entityType === 'string') {
      if (['venue', 'student_body', 'stakeholder'].includes(entityType)) {
        filters.entityType = entityType as 'venue' | 'student_body' | 'stakeholder';
      }
    }

    if (status && typeof status === 'string') {
      filters.status = status;
    }

    const dashboardData = await dashboardService.getDashboardData(filters);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
