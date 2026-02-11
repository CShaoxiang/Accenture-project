import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';

// Feature: idea-hub-talent-acquisition, Property 1: Entity Round-Trip Persistence
// Validates: Requirements 1.3, 1.5, 8.1, 8.3, 11.1

describe('Property 1: Entity Round-Trip Persistence', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/idea_hub_test?schema=public',
        },
      },
    });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.statusHistory.deleteMany();
    await prisma.eventVenue.deleteMany();
    await prisma.eventStudentBody.deleteMany();
    await prisma.task.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.preScreeningSession.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.club.deleteMany();
    await prisma.university.deleteMany();
    await prisma.skillsGap.deleteMany();
    await prisma.event.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.company.deleteMany();
  });

  // Arbitraries (generators) for entity data
  const venueArbitrary = fc.record({
    name: fc.string({ minLength: 1, maxLength: 255 }),
    location: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
    capacity: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined }),
    rating: fc.option(fc.double({ min: 0, max: 5, noNaN: true }).map(r => Math.round(r * 100) / 100), { nil: undefined }),
    amenities: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 })), { nil: undefined }),
    contactInfo: fc.option(
      fc.record({
        email: fc.emailAddress(),
        phone: fc.string({ minLength: 10, maxLength: 15 }),
      }),
      { nil: undefined }
    ),
    status: fc.constantFrom('REQUESTED', 'WAITING', 'CONFIRMED', 'NEEDS_ACTION', 'REJECTED'),
    lastContactDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') }), { nil: undefined }),
  });

  const companyArbitrary = fc.record({
    name: fc.string({ minLength: 1, maxLength: 255 }),
    industry: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 })), { nil: undefined }),
    techStack: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 })), { nil: undefined }),
    culture: fc.option(fc.string({ minLength: 1, maxLength: 1000 }), { nil: undefined }),
    hiringNeeds: fc.option(
      fc.array(
        fc.record({
          role: fc.string({ minLength: 1, maxLength: 100 }),
          skills: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
          level: fc.constantFrom('junior', 'mid', 'senior'),
          priority: fc.constantFrom('low', 'medium', 'high'),
        })
      ),
      { nil: undefined }
    ),
  });

  const eventArbitrary = (companyId: string | null) =>
    fc.record({
      name: fc.string({ minLength: 1, maxLength: 255 }),
      type: fc.constantFrom('hackathon', 'bootcamp', 'networking'),
      date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      description: fc.option(fc.string({ minLength: 1, maxLength: 1000 }), { nil: undefined }),
      goals: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 })), { nil: undefined }),
      companyId: fc.constant(companyId),
    });

  const universityArbitrary = fc.record({
    name: fc.string({ minLength: 1, maxLength: 255 }),
    location: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
    programs: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 })), { nil: undefined }),
    strengths: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 })), { nil: undefined }),
    industryPartnerships: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 })), { nil: undefined }),
  });

  const candidateArbitrary = fc.record({
    name: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
    email: fc.option(fc.emailAddress(), { nil: undefined }),
    platforms: fc.option(
      fc.array(
        fc.record({
          platform: fc.constantFrom('github', 'kaggle', 'forum'),
          username: fc.string({ minLength: 1, maxLength: 100 }),
          profileUrl: fc.webUrl(),
        })
      ),
      { nil: undefined }
    ),
    skills: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 })), { nil: undefined }),
    experienceLevel: fc.option(fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert'), { nil: undefined }),
    notableProjects: fc.option(
      fc.array(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 1, maxLength: 500 }),
        })
      ),
      { nil: undefined }
    ),
    relevanceScore: fc.option(fc.double({ min: 0, max: 100, noNaN: true }).map(r => Math.round(r * 100) / 100), { nil: undefined }),
    skillsMatchScore: fc.option(fc.double({ min: 0, max: 100, noNaN: true }).map(r => Math.round(r * 100) / 100), { nil: undefined }),
    preScreeningStatus: fc.option(fc.constantFrom('not_invited', 'invited', 'in_progress', 'completed'), { nil: undefined }),
  });

  // Helper function to compare entities (ignoring timestamps and IDs)
  const compareEntities = (original: any, retrieved: any, fieldsToCompare: string[]) => {
    for (const field of fieldsToCompare) {
      const originalValue = original[field];
      const retrievedValue = retrieved[field];

      // Handle dates
      if (originalValue instanceof Date && retrievedValue instanceof Date) {
        expect(originalValue.getTime()).toBe(retrievedValue.getTime());
      }
      // Handle null/undefined - Prisma converts undefined to null in DB
      else if (originalValue === null || originalValue === undefined) {
        expect(retrievedValue === null || retrievedValue === undefined).toBe(true);
      }
      // Handle objects (JSON fields)
      else if (typeof originalValue === 'object' && originalValue !== null) {
        expect(retrievedValue).toEqual(originalValue);
      }
      // Handle primitives
      else {
        expect(retrievedValue).toBe(originalValue);
      }
    }
  };

  it('should persist and retrieve Venue entities with all fields preserved', async () => {
    await fc.assert(
      fc.asyncProperty(venueArbitrary, async (venueData) => {
        // Store venue to database
        const created = await prisma.venue.create({
          data: venueData,
        });

        // Retrieve venue from database
        const retrieved = await prisma.venue.findUnique({
          where: { id: created.id },
        });

        // Verify entity was retrieved
        expect(retrieved).not.toBeNull();

        // Compare all fields
        const fieldsToCompare = [
          'name',
          'location',
          'capacity',
          'rating',
          'amenities',
          'contactInfo',
          'status',
          'lastContactDate',
        ];
        compareEntities(venueData, retrieved, fieldsToCompare);
      }),
      { numRuns: 100 }
    );
  });

  it('should persist and retrieve Company entities with all fields preserved', async () => {
    await fc.assert(
      fc.asyncProperty(companyArbitrary, async (companyData) => {
        // Store company to database
        const created = await prisma.company.create({
          data: companyData,
        });

        // Retrieve company from database
        const retrieved = await prisma.company.findUnique({
          where: { id: created.id },
        });

        // Verify entity was retrieved
        expect(retrieved).not.toBeNull();

        // Compare all fields
        const fieldsToCompare = ['name', 'industry', 'techStack', 'culture', 'hiringNeeds'];
        compareEntities(companyData, retrieved, fieldsToCompare);
      }),
      { numRuns: 100 }
    );
  });

  it('should persist and retrieve Event entities with all fields preserved', async () => {
    await fc.assert(
      fc.asyncProperty(companyArbitrary, eventArbitrary(null), async (companyData, eventData) => {
        // Create company first (optional foreign key)
        let companyId: string | null = null;
        if (Math.random() > 0.5) {
          const company = await prisma.company.create({ data: companyData });
          companyId = company.id;
        }

        // Generate event data with optional company reference
        const eventDataWithCompany = { ...eventData, companyId };

        // Store event to database
        const created = await prisma.event.create({
          data: eventDataWithCompany,
        });

        // Retrieve event from database
        const retrieved = await prisma.event.findUnique({
          where: { id: created.id },
        });

        // Verify entity was retrieved
        expect(retrieved).not.toBeNull();

        // Compare all fields
        const fieldsToCompare = ['name', 'type', 'date', 'description', 'goals', 'companyId'];
        compareEntities(eventDataWithCompany, retrieved, fieldsToCompare);
      }),
      { numRuns: 100 }
    );
  });

  it('should persist and retrieve University entities with all fields preserved', async () => {
    await fc.assert(
      fc.asyncProperty(universityArbitrary, async (universityData) => {
        // Store university to database
        const created = await prisma.university.create({
          data: universityData,
        });

        // Retrieve university from database
        const retrieved = await prisma.university.findUnique({
          where: { id: created.id },
        });

        // Verify entity was retrieved
        expect(retrieved).not.toBeNull();

        // Compare all fields
        const fieldsToCompare = ['name', 'location', 'programs', 'strengths', 'industryPartnerships'];
        compareEntities(universityData, retrieved, fieldsToCompare);
      }),
      { numRuns: 100 }
    );
  });

  it('should persist and retrieve Candidate entities with all fields preserved', async () => {
    await fc.assert(
      fc.asyncProperty(candidateArbitrary, async (candidateData) => {
        // Store candidate to database
        const created = await prisma.candidate.create({
          data: candidateData,
        });

        // Retrieve candidate from database
        const retrieved = await prisma.candidate.findUnique({
          where: { id: created.id },
        });

        // Verify entity was retrieved
        expect(retrieved).not.toBeNull();

        // Compare all fields
        const fieldsToCompare = [
          'name',
          'email',
          'platforms',
          'skills',
          'experienceLevel',
          'notableProjects',
          'relevanceScore',
          'skillsMatchScore',
          'preScreeningStatus',
        ];
        compareEntities(candidateData, retrieved, fieldsToCompare);
      }),
      { numRuns: 100 }
    );
  });
});
