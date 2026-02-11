import { Router, Request, Response } from 'express';
import { eventService } from '../services/event.service';

const router = Router();

// POST /api/v1/events - Create event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, date, description, goals, companyId } = req.body;

    // Validate required fields
    if (!name || !type || !date) {
      return res.status(400).json({
        error: 'Missing required fields: name, type, and date are required',
      });
    }

    // Validate event type
    const validTypes = ['hackathon', 'bootcamp', 'networking'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid event type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Parse date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
      });
    }

    const event = await eventService.createEvent({
      name,
      type,
      date: eventDate,
      description,
      goals,
      companyId,
    });

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/events - List events with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, companyId, startDate, endDate } = req.query;

    interface EventFiltersQuery {
      type?: 'hackathon' | 'bootcamp' | 'networking';
      companyId?: string;
      startDate?: Date;
      endDate?: Date;
    }

    const filters: EventFiltersQuery = {};

    if (type) {
      const validTypes = ['hackathon', 'bootcamp', 'networking'];
      if (!validTypes.includes(type as string)) {
        return res.status(400).json({
          error: `Invalid event type. Must be one of: ${validTypes.join(', ')}`,
        });
      }
      filters.type = type as 'hackathon' | 'bootcamp' | 'networking';
    }

    if (companyId) {
      filters.companyId = companyId as string;
    }

    if (startDate) {
      const parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid startDate format',
        });
      }
      filters.startDate = parsedStartDate;
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid endDate format',
        });
      }
      filters.endDate = parsedEndDate;
    }

    const events = await eventService.listEvents(filters);

    res.status(200).json(events);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/events/:id - Get event details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await eventService.getEvent(id);

    res.status(200).json(event);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/v1/events/:id - Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, date, description, goals, companyId } = req.body;

    // Validate event type if provided
    if (type) {
      const validTypes = ['hackathon', 'bootcamp', 'networking'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid event type. Must be one of: ${validTypes.join(', ')}`,
        });
      }
    }

    // Parse date if provided
    let eventDate;
    if (date) {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format',
        });
      }
    }

    interface UpdateData {
      name?: string;
      type?: 'hackathon' | 'bootcamp' | 'networking';
      date?: Date;
      description?: string;
      goals?: string[];
      companyId?: string;
    }

    const updateData: UpdateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type as 'hackathon' | 'bootcamp' | 'networking';
    if (eventDate !== undefined) updateData.date = eventDate;
    if (description !== undefined) updateData.description = description;
    if (goals !== undefined) updateData.goals = goals;
    if (companyId !== undefined) updateData.companyId = companyId;

    const event = await eventService.updateEvent(id, updateData);

    res.status(200).json(event);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/events/:id/status - Get event status report
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const statusReport = await eventService.getEventStatus(id);

    res.status(200).json(statusReport);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/events/:id/venues - Associate venue with event
router.post('/:id/venues', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { venueId } = req.body;

    if (!venueId) {
      return res.status(400).json({
        error: 'Missing required field: venueId',
      });
    }

    await eventService.associateVenue(id, venueId);

    res.status(201).json({ message: 'Venue associated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'Event not found' ||
        error.message === 'Venue not found'
      ) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Venue is already associated with this event') {
        return res.status(409).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/events/:id/student-bodies - Associate student body with event
router.post('/:id/student-bodies', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentBodyId, studentBodyType, status } = req.body;

    if (!studentBodyId || !studentBodyType) {
      return res.status(400).json({
        error: 'Missing required fields: studentBodyId and studentBodyType',
      });
    }

    await eventService.associateStudentBody(
      id,
      studentBodyId,
      studentBodyType,
      status
    );

    res.status(201).json({ message: 'Student body associated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Student body is already associated with this event') {
        return res.status(409).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
