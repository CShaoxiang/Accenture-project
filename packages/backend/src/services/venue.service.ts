import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type EntityStatus = 'REQUESTED' | 'WAITING' | 'CONFIRMED' | 'NEEDS_ACTION' | 'REJECTED';

export interface VenueSearchCriteria {
  location?: string;
  capacity?: { min?: number; max?: number };
  minRating?: number;
  amenities?: string[];
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  contactPerson?: string;
  [key: string]: any;
}

export interface CreateVenueDTO {
  name: string;
  location?: string;
  capacity?: number;
  rating?: number;
  amenities?: string[];
  contactInfo?: ContactInfo;
  status?: EntityStatus;
}

export interface UpdateVenueDTO {
  name?: string;
  location?: string;
  capacity?: number;
  rating?: number;
  amenities?: string[];
  contactInfo?: ContactInfo;
}

export class VenueService {
  private readonly validStatuses: EntityStatus[] = [
    'REQUESTED',
    'WAITING',
    'CONFIRMED',
    'NEEDS_ACTION',
    'REJECTED',
  ];

  async searchVenues(criteria: VenueSearchCriteria = {}) {
    const { location, capacity, minRating, amenities } = criteria;

    interface WhereClause {
      location?: { contains: string; mode: 'insensitive' };
      capacity?: { gte?: number; lte?: number };
      rating?: { gte: number };
    }

    const where: WhereClause = {};

    // Location filter (case-insensitive partial match)
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Capacity range filter
    if (capacity) {
      where.capacity = {};
      if (capacity.min !== undefined) {
        where.capacity.gte = capacity.min;
      }
      if (capacity.max !== undefined) {
        where.capacity.lte = capacity.max;
      }
    }

    // Minimum rating filter
    if (minRating !== undefined) {
      where.rating = {
        gte: minRating,
      };
    }

    let venues = await prisma.venue.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
    });

    // Filter by amenities (client-side filtering since JSON field)
    if (amenities && amenities.length > 0) {
      venues = venues.filter((venue) => {
        if (!venue.amenities) return false;
        const venueAmenities = venue.amenities as string[];
        return amenities.every((amenity) =>
          venueAmenities.some(
            (va) => va.toLowerCase() === amenity.toLowerCase()
          )
        );
      });
    }

    return venues;
  }

  async getVenue(id: string) {
    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      throw new Error('Venue not found');
    }

    return venue;
  }

  async createVenue(data: CreateVenueDTO) {
    const {
      name,
      location,
      capacity,
      rating,
      amenities,
      contactInfo,
      status = 'REQUESTED',
    } = data;

    // Validate status
    if (!this.validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${this.validStatuses.join(', ')}`
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      throw new Error('Rating must be between 0 and 5');
    }

    // Create venue
    const venue = await prisma.venue.create({
      data: {
        name,
        location,
        capacity,
        rating,
        amenities: amenities || [],
        contactInfo: contactInfo || {},
        status,
        lastContactDate: new Date(),
      },
    });

    // Record initial status in history
    await prisma.statusHistory.create({
      data: {
        entityId: venue.id,
        entityType: 'venue',
        previousStatus: null,
        newStatus: status,
        notes: 'Initial venue creation',
      },
    });

    return venue;
  }

  async updateVenue(id: string, data: UpdateVenueDTO) {
    // Check if venue exists
    const existingVenue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!existingVenue) {
      throw new Error('Venue not found');
    }

    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
      throw new Error('Rating must be between 0 and 5');
    }

    // Update venue
    const venue = await prisma.venue.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.amenities !== undefined && { amenities: data.amenities }),
        ...(data.contactInfo !== undefined && { contactInfo: data.contactInfo }),
      },
    });

    return venue;
  }

  async updateVenueStatus(id: string, status: EntityStatus, notes?: string) {
    // Check if venue exists
    const existingVenue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!existingVenue) {
      throw new Error('Venue not found');
    }

    // Validate status
    if (!this.validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${this.validStatuses.join(', ')}`
      );
    }

    const previousStatus = existingVenue.status;

    // Update venue status and last contact date
    const venue = await prisma.venue.update({
      where: { id },
      data: {
        status,
        lastContactDate: new Date(),
      },
    });

    // Record status change in history
    await prisma.statusHistory.create({
      data: {
        entityId: id,
        entityType: 'venue',
        previousStatus,
        newStatus: status,
        notes,
      },
    });

    return venue;
  }

  async getVenueHistory(id: string) {
    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      throw new Error('Venue not found');
    }

    // Get status history
    const history = await prisma.statusHistory.findMany({
      where: {
        entityId: id,
        entityType: 'venue',
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return history;
  }
}

export const venueService = new VenueService();
