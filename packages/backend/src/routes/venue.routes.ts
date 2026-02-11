import { Router, Request, Response } from 'express';
import { venueService } from '../services/venue.service';

const router = Router();

// POST /api/v1/venues - Create venue
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, location, capacity, rating, amenities, contactInfo, status } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Missing required field: name',
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({
        error: 'Rating must be between 0 and 5',
      });
    }

    const venue = await venueService.createVenue({
      name,
      location,
      capacity,
      rating,
      amenities,
      contactInfo,
      status,
    });

    res.status(201).json(venue);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/venues - Search venues
router.get('/', async (req: Request, res: Response) => {
  try {
    const { location, minCapacity, maxCapacity, minRating, amenities } = req.query;

    interface SearchCriteria {
      location?: string;
      capacity?: { min?: number; max?: number };
      minRating?: number;
      amenities?: string[];
    }

    const criteria: SearchCriteria = {};

    if (location) {
      criteria.location = location as string;
    }

    if (minCapacity || maxCapacity) {
      criteria.capacity = {};
      if (minCapacity) {
        const min = parseInt(minCapacity as string, 10);
        if (isNaN(min)) {
          return res.status(400).json({
            error: 'Invalid minCapacity value',
          });
        }
        criteria.capacity.min = min;
      }
      if (maxCapacity) {
        const max = parseInt(maxCapacity as string, 10);
        if (isNaN(max)) {
          return res.status(400).json({
            error: 'Invalid maxCapacity value',
          });
        }
        criteria.capacity.max = max;
      }
    }

    if (minRating) {
      const rating = parseFloat(minRating as string);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({
          error: 'Invalid minRating value. Must be between 0 and 5',
        });
      }
      criteria.minRating = rating;
    }

    if (amenities) {
      // Handle both single string and comma-separated string
      if (typeof amenities === 'string') {
        criteria.amenities = amenities.split(',').map((a) => a.trim());
      } else if (Array.isArray(amenities)) {
        criteria.amenities = amenities as string[];
      }
    }

    const venues = await venueService.searchVenues(criteria);

    res.status(200).json(venues);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/venues/:id - Get venue details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const venue = await venueService.getVenue(id);

    res.status(200).json(venue);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Venue not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/v1/venues/:id - Update venue
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, rating, amenities, contactInfo } = req.body;

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({
        error: 'Rating must be between 0 and 5',
      });
    }

    interface UpdateData {
      name?: string;
      location?: string;
      capacity?: number;
      rating?: number;
      amenities?: string[];
      contactInfo?: any;
    }

    const updateData: UpdateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (rating !== undefined) updateData.rating = rating;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;

    const venue = await venueService.updateVenue(id, updateData);

    res.status(200).json(venue);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Venue not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/venues/:id/status - Update status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({
        error: 'Missing required field: status',
      });
    }

    // Validate status value
    const validStatuses = ['REQUESTED', 'WAITING', 'CONFIRMED', 'NEEDS_ACTION', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const venue = await venueService.updateVenueStatus(id, status, notes);

    res.status(200).json(venue);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Venue not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/venues/:id/history - Get status history
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const history = await venueService.getVenueHistory(id);

    res.status(200).json(history);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Venue not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
