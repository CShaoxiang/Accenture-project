import { Router, Request, Response } from 'express';
import { eventService } from '../services/event.service';

const router = Router();

// Create event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, date, description, goals, companyId } = req.body;

    if (!name || !type || !date) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name, type, and date are required',
      });
    }

    if (!['hackathon', 'bootcamp', 'networking'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid event type',
        message: 'type must be one of: hackathon, bootcamp, networking',
      });
    }

    const event = await eventService.createEvent({
      name,
      type,
      date,
      description,
      goals,
      companyId,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// List events with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, companyId, startDate, endDate } = req.query;

    const events = await eventService.listEvents({
      type: type as string,
      companyId: companyId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json(events);
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Failed to list events' });
  }
});

// Get event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await eventService.getEvent(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, date, description, goals } = req.body;

    if (type && !['hackathon', 'bootcamp', 'networking'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid event type',
        message: 'type must be one of: hackathon, bootcamp, networking',
      });
    }

    const event = await eventService.updateEvent(id, {
      name,
      type,
      date,
      description,
      goals,
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await eventService.deleteEvent(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get event status report
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const status = await eventService.getEventStatus(id);

    if (!status) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Error getting event status:', error);
    res.status(500).json({ error: 'Failed to get event status' });
  }
});

// Associate venue with event
router.post('/:id/venues', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { venueId } = req.body;

    if (!venueId) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'venueId is required',
      });
    }

    await eventService.associateVenue(id, venueId);

    res.status(201).json({ message: 'Venue associated successfully' });
  } catch (error) {
    console.error('Error associating venue:', error);
    res.status(500).json({ error: 'Failed to associate venue' });
  }
});

// Dissociate venue from event
router.delete('/:id/venues/:venueId', async (req: Request, res: Response) => {
  try {
    const { id, venueId } = req.params;

    await eventService.dissociateVenue(id, venueId);

    res.status(204).send();
  } catch (error) {
    console.error('Error dissociating venue:', error);
    res.status(500).json({ error: 'Failed to dissociate venue' });
  }
});

export default router;
