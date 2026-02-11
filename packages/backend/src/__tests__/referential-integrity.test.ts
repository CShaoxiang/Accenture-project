import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';

// Feature: idea-hub-talent-acquisition, Property 2: Referential Integrity Enforcement
// Validates: Requirements 14.2

describe('Property 2: Referential Integrity Enforcement', () => {
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

  // Arbitrary for generating non-existent UUIDs
  const nonExistentUuidArbitrary = fc.uuid();

  it('should reject Event creation with non-existent Company reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentCompanyId) => {
        // Attempt to create event with non-existent company
        await expect(
          prisma.event.create({
            data: {
              name: 'Test Event',
              type: 'hackathon',
              date: new Date('2026-06-01'),
              companyId: nonExistentCompanyId,
            },
          })
        ).rejects.toThrow();

        // Verify no event was created
        const eventCount = await prisma.event.count();
        expect(eventCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject Task creation with non-existent Event reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentEventId) => {
        // Attempt to create task with non-existent event
        await expect(
          prisma.task.create({
            data: {
              eventId: nonExistentEventId,
              title: 'Test Task',
              priority: 1,
            },
          })
        ).rejects.toThrow();

        // Verify no task was created
        const taskCount = await prisma.task.count();
        expect(taskCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject Club creation with non-existent University reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentUniversityId) => {
        // Attempt to create club with non-existent university
        await expect(
          prisma.club.create({
            data: {
              universityId: nonExistentUniversityId,
              name: 'Test Club',
            },
          })
        ).rejects.toThrow();

        // Verify no club was created
        const clubCount = await prisma.club.count();
        expect(clubCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject SkillsGap creation with non-existent Company reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentCompanyId) => {
        // Attempt to create skills gap with non-existent company
        await expect(
          prisma.skillsGap.create({
            data: {
              companyId: nonExistentCompanyId,
              skill: 'TypeScript',
              priority: 'high',
            },
          })
        ).rejects.toThrow();

        // Verify no skills gap was created
        const skillsGapCount = await prisma.skillsGap.count();
        expect(skillsGapCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject PreScreeningSession creation with non-existent Candidate reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentCandidateId) => {
        // Attempt to create pre-screening session with non-existent candidate
        await expect(
          prisma.preScreeningSession.create({
            data: {
              candidateId: nonExistentCandidateId,
              eventId: '00000000-0000-0000-0000-000000000000', // Will also fail, but candidate check comes first
              status: 'invited',
              expiresAt: new Date('2026-12-31'),
            },
          })
        ).rejects.toThrow();

        // Verify no session was created
        const sessionCount = await prisma.preScreeningSession.count();
        expect(sessionCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject EventVenue junction creation with non-existent Event reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentEventId) => {
        // Create a valid venue first
        const venue = await prisma.venue.create({
          data: {
            name: 'Test Venue',
            status: 'REQUESTED',
          },
        });

        // Attempt to create junction with non-existent event
        await expect(
          prisma.eventVenue.create({
            data: {
              eventId: nonExistentEventId,
              venueId: venue.id,
            },
          })
        ).rejects.toThrow();

        // Verify no junction was created
        const junctionCount = await prisma.eventVenue.count();
        expect(junctionCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject EventVenue junction creation with non-existent Venue reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentVenueId) => {
        // Create a valid event first
        const event = await prisma.event.create({
          data: {
            name: 'Test Event',
            type: 'hackathon',
            date: new Date('2026-06-01'),
          },
        });

        // Attempt to create junction with non-existent venue
        await expect(
          prisma.eventVenue.create({
            data: {
              eventId: event.id,
              venueId: nonExistentVenueId,
            },
          })
        ).rejects.toThrow();

        // Verify no junction was created
        const junctionCount = await prisma.eventVenue.count();
        expect(junctionCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject EventStudentBody junction creation with non-existent Event reference', async () => {
    await fc.assert(
      fc.asyncProperty(nonExistentUuidArbitrary, async (nonExistentEventId) => {
        // Attempt to create junction with non-existent event
        await expect(
          prisma.eventStudentBody.create({
            data: {
              eventId: nonExistentEventId,
              studentBodyId: '00000000-0000-0000-0000-000000000001',
              studentBodyType: 'university',
              status: 'REQUESTED',
            },
          })
        ).rejects.toThrow();

        // Verify no junction was created
        const junctionCount = await prisma.eventStudentBody.count();
        expect(junctionCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain database consistency after failed foreign key constraint', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonExistentUuidArbitrary,
        fc.string({ minLength: 1, maxLength: 255 }),
        async (nonExistentCompanyId, eventName) => {
          // Get initial counts
          const initialEventCount = await prisma.event.count();
          const initialCompanyCount = await prisma.company.count();

          // Attempt to create event with non-existent company (should fail)
          try {
            await prisma.event.create({
              data: {
                name: eventName,
                type: 'hackathon',
                date: new Date('2026-06-01'),
                companyId: nonExistentCompanyId,
              },
            });
          } catch (error) {
            // Expected to fail
          }

          // Verify counts remain unchanged (database consistency maintained)
          const finalEventCount = await prisma.event.count();
          const finalCompanyCount = await prisma.company.count();

          expect(finalEventCount).toBe(initialEventCount);
          expect(finalCompanyCount).toBe(initialCompanyCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
