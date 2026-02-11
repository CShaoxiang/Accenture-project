# Design Document: Idea Hub Talent Acquisition Platform

## Overview

The Idea Hub is a full-stack enterprise talent acquisition platform that streamlines event planning and candidate sourcing for Hackathons, Bootcamps, and networking events with universities. The system combines traditional event management capabilities with AI-powered features including intelligent task generation, company-university matching, predictive talent sourcing, dynamic skill mapping, and automated pre-screening.

The architecture follows a modern three-tier pattern with a React/Next.js frontend, Node.js/Express backend with RESTful API, PostgreSQL database, and integration with external services (GitHub, Kaggle, LLMs, n8n workflows).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│              (React/Next.js SPA)                            │
│  - Dashboard  - Venue Management  - Task Checklists        │
│  - Company Profiles  - University Matching                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/REST API
┌─────────────────────▼───────────────────────────────────────┐
│                   Backend Layer                             │
│              (Node.js/Express API)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Event      │  │   Venue      │  │   Matching   │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Reminder   │  │   Task Gen   │  │   Screening  │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Data Layer                                 │
│              (PostgreSQL Database)                          │
│  - Events  - Venues  - Companies  - Universities           │
│  - Candidates  - Status History  - Tasks                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                External Integrations                        │
│  - GitHub API  - Kaggle API  - Venue APIs                  │
│  - LLM (OpenAI/Anthropic)  - n8n Webhooks                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with Next.js 14 for SSR and routing
- TypeScript for type safety
- TailwindCSS for styling
- React Query for data fetching and caching
- Recharts for dashboard visualizations
- Axios for API communication

**Backend:**
- Node.js 20+ with Express.js
- TypeScript for type safety
- PostgreSQL 15+ for relational data
- Prisma ORM for database access
- Bull for job queues (reminders, scraping)
- JWT for authentication
- Winston for logging

**External Services:**
- OpenAI GPT-4 or Anthropic Claude for LLM features
- n8n for workflow automation
- GitHub REST API v3
- Kaggle API
- Cheerio/Puppeteer for web scraping

## Components and Interfaces

### Frontend Components

#### 1. Dashboard Component
```typescript
interface DashboardProps {
  events: Event[]
  statusSummary: StatusSummary
  reminders: Reminder[]
}

interface StatusSummary {
  requested: number
  waiting: number
  confirmed: number
  needsAction: number
  rejected: number
}

// Displays event overview, status distribution charts, and reminder queue
```

#### 2. Venue Management Component
```typescript
interface VenueSearchProps {
  onSearch: (criteria: VenueSearchCriteria) => void
  results: Venue[]
}

interface VenueSearchCriteria {
  location?: string
  capacity?: { min: number; max: number }
  minRating?: number
  amenities?: string[]
}

interface Venue {
  id: string
  name: string
  location: string
  capacity: number
  rating: number
  amenities: string[]
  contactInfo: ContactInfo
  status: EntityStatus
}
```

#### 3. Company Profile Component
```typescript
interface CompanyProfileProps {
  profile: CompanyProfile | null
  onSave: (profile: CompanyProfile) => void
}

interface CompanyProfile {
  id: string
  name: string
  industry: string[]
  techStack: string[]
  culture: string
  hiringNeeds: HiringNeed[]
}

interface HiringNeed {
  role: string
  skills: string[]
  level: 'junior' | 'mid' | 'senior'
  priority: 'low' | 'medium' | 'high'
}
```

#### 4. University Matching Component
```typescript
interface UniversityMatchingProps {
  companyId: string
  recommendations: UniversityRecommendation[]
  onDrillDown: (universityId: string) => void
}

interface UniversityRecommendation {
  university: University
  alignmentScore: number
  reasoning: string
  clubs: ClubRecommendation[]
}

interface ClubRecommendation {
  club: Club
  alignmentScore: number
  focusAreas: string[]
  memberCount: number
  activityLevel: 'low' | 'medium' | 'high'
}
```

#### 5. Task Checklist Component
```typescript
interface TaskChecklistProps {
  eventId: string
  tasks: GeneratedTask[]
  onComplete: (taskId: string) => void
  onRefresh: () => void
}

interface GeneratedTask {
  id: string
  title: string
  description: string
  explanation: string
  priority: number
  dependencies: string[]
  completed: boolean
}
```

#### 6. Candidate Sourcing Component
```typescript
interface CandidateSourcingProps {
  eventId: string
  candidates: CandidateRecommendation[]
  onSaveToPool: (candidateId: string) => void
}

interface CandidateRecommendation {
  candidate: Candidate
  relevanceScore: number
  skills: string[]
  notableProjects: Project[]
  platforms: ('github' | 'kaggle' | 'forum')[]
}
```

### Backend Services

#### 1. Event Service
```typescript
class EventService {
  async createEvent(data: CreateEventDTO): Promise<Event>
  async getEvent(id: string): Promise<Event>
  async updateEvent(id: string, data: UpdateEventDTO): Promise<Event>
  async listEvents(filters: EventFilters): Promise<Event[]>
  async associateVenue(eventId: string, venueId: string): Promise<void>
  async associateStudentBody(eventId: string, studentBodyId: string): Promise<void>
  async getEventStatus(eventId: string): Promise<EventStatusReport>
}

interface CreateEventDTO {
  name: string
  type: 'hackathon' | 'bootcamp' | 'networking'
  date: Date
  description: string
  goals: string[]
}

interface EventStatusReport {
  eventId: string
  venues: EntityStatusCount
  studentBodies: EntityStatusCount
  stakeholders: EntityStatusCount
}

interface EntityStatusCount {
  requested: number
  waiting: number
  confirmed: number
  needsAction: number
  rejected: number
}
```

#### 2. Venue Service
```typescript
class VenueService {
  async searchVenues(criteria: VenueSearchCriteria): Promise<Venue[]>
  async getVenue(id: string): Promise<Venue>
  async createVenue(data: CreateVenueDTO): Promise<Venue>
  async updateVenue(id: string, data: UpdateVenueDTO): Promise<Venue>
  async updateVenueStatus(id: string, status: EntityStatus): Promise<Venue>
  async getVenueHistory(id: string): Promise<StatusHistory[]>
  async integrateExternalVenueAPI(apiKey: string): Promise<Venue[]>
}

type EntityStatus = 'REQUESTED' | 'WAITING' | 'CONFIRMED' | 'NEEDS_ACTION' | 'REJECTED'

interface StatusHistory {
  id: string
  entityId: string
  entityType: 'venue' | 'student_body' | 'stakeholder'
  previousStatus: EntityStatus
  newStatus: EntityStatus
  timestamp: Date
  notes?: string
}
```

#### 3. Reminder Service
```typescript
class ReminderService {
  async detectOverdueEntities(thresholdHours: number): Promise<OverdueEntity[]>
  async generateReminderDraft(entityId: string, entityType: string): Promise<ReminderDraft>
  async approveAndSendReminder(draftId: string): Promise<void>
  async schedulePeriodicNotifications(userId: string, interval: string): Promise<void>
  async getRemindersForUser(userId: string): Promise<Reminder[]>
}

interface OverdueEntity {
  entityId: string
  entityType: 'venue' | 'student_body' | 'stakeholder'
  name: string
  status: EntityStatus
  lastContactDate: Date
  hoursOverdue: number
}

interface ReminderDraft {
  id: string
  entityId: string
  entityType: string
  subject: string
  body: string
  generatedAt: Date
  approved: boolean
}
```

#### 4. Task Generation Service
```typescript
class TaskGenerationService {
  async generateTaskChecklist(eventId: string): Promise<GeneratedTask[]>
  async analyzeEventStage(eventId: string): Promise<EventStage>
  async callLLMForTasks(context: EventContext): Promise<LLMTaskResponse>
  async updateTaskStatus(taskId: string, completed: boolean): Promise<void>
  async regenerateTasksIfNeeded(eventId: string): Promise<GeneratedTask[]>
}

interface EventContext {
  eventType: 'hackathon' | 'bootcamp' | 'networking'
  eventDate: Date
  venueStatus: EntityStatusCount
  studentBodyStatus: EntityStatusCount
  stakeholderStatus: EntityStatusCount
  completedTasks: string[]
}

interface EventStage {
  stage: 'planning' | 'outreach' | 'confirmation' | 'execution' | 'followup'
  daysUntilEvent: number
  readinessScore: number
}

interface LLMTaskResponse {
  tasks: Array<{
    title: string
    description: string
    explanation: string
    priority: number
    dependencies: string[]
  }>
}
```

#### 5. Matching Service
```typescript
class MatchingService {
  async calculateUniversityAlignment(companyId: string): Promise<UniversityRecommendation[]>
  async getClubsForUniversity(universityId: string, companyId: string): Promise<ClubRecommendation[]>
  async callLLMForMatching(company: CompanyProfile, university: University): Promise<MatchingResult>
  async recalculateOnProfileUpdate(companyId: string): Promise<void>
}

interface MatchingResult {
  alignmentScore: number
  reasoning: string
  keyFactors: string[]
}

interface University {
  id: string
  name: string
  location: string
  programs: string[]
  strengths: string[]
  industryPartnerships: string[]
}

interface Club {
  id: string
  universityId: string
  name: string
  focusAreas: string[]
  memberCount: number
  activityLevel: 'low' | 'medium' | 'high'
  recentProjects: string[]
}
```

#### 6. Talent Sourcing Service
```typescript
class TalentSourcingService {
  async sourceCandidates(eventId: string): Promise<CandidateRecommendation[]>
  async crawlGitHub(searchCriteria: GitHubSearchCriteria): Promise<GitHubProfile[]>
  async crawlKaggle(searchCriteria: KaggleSearchCriteria): Promise<KaggleProfile[]>
  async scrapeForums(forumUrls: string[], keywords: string[]): Promise<ForumProfile[]>
  async analyzeTechnicalFootprint(profile: CandidateProfile): Promise<TechnicalAnalysis>
  async rankCandidates(candidates: Candidate[], eventGoals: string[]): Promise<CandidateRecommendation[]>
  async saveCandidateToPool(candidateId: string, poolId: string): Promise<void>
}

interface GitHubSearchCriteria {
  languages: string[]
  topics: string[]
  minStars?: number
  minContributions?: number
}

interface GitHubProfile {
  username: string
  name: string
  bio: string
  repositories: Repository[]
  contributions: number
  languages: string[]
}

interface TechnicalAnalysis {
  primarySkills: string[]
  secondarySkills: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  specializations: string[]
  notableAchievements: string[]
}
```

#### 7. Skills Mapping Service (n8n Integration)
```typescript
class SkillsMappingService {
  async ingestSkillsGapData(webhookPayload: SkillsGapWebhookPayload): Promise<void>
  async parseSkillsGapData(data: any): Promise<SkillsGap[]>
  async calculateSkillsMatchScore(candidateId: string): Promise<SkillsMatchResult>
  async prioritizeCandidatesBySkillsGap(candidateIds: string[]): Promise<PrioritizedCandidate[]>
  async recalculateOnSkillsGapUpdate(): Promise<void>
}

interface SkillsGapWebhookPayload {
  timestamp: Date
  source: string
  skillsGaps: SkillsGap[]
}

interface SkillsGap {
  skill: string
  proficiencyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
  priority: 'low' | 'medium' | 'high' | 'critical'
  currentCount: number
  targetCount: number
  gap: number
}

interface SkillsMatchResult {
  candidateId: string
  overallScore: number
  matchedGaps: Array<{
    skill: string
    gapPriority: string
    candidateProficiency: string
    contribution: number
  }>
}

interface PrioritizedCandidate {
  candidateId: string
  skillsMatchScore: number
  addressedGaps: SkillsGap[]
  rank: number
}
```

#### 8. Pre-Screening Service
```typescript
class PreScreeningService {
  async offerPreScreening(candidateId: string, eventId: string): Promise<PreScreeningInvitation>
  async generateScreeningQuestions(eventType: string, requiredSkills: string[]): Promise<ScreeningQuestion[]>
  async conductChatScreening(sessionId: string, candidateResponse: string): Promise<ChatResponse>
  async evaluateResponse(question: string, response: string, expectedConcepts: string[]): Promise<ResponseEvaluation>
  async generateScreeningReport(sessionId: string): Promise<PreScreeningReport>
  async providePreparatoryResources(candidateId: string, weaknesses: string[]): Promise<Resource[]>
}

interface PreScreeningInvitation {
  invitationId: string
  candidateId: string
  eventId: string
  expiresAt: Date
  sessionUrl: string
}

interface ScreeningQuestion {
  id: string
  question: string
  category: 'technical' | 'problem_solving' | 'communication'
  difficulty: 'easy' | 'medium' | 'hard'
  expectedConcepts: string[]
  followUpQuestions: string[]
}

interface ChatResponse {
  message: string
  nextQuestion?: ScreeningQuestion
  sessionComplete: boolean
}

interface ResponseEvaluation {
  questionId: string
  score: number
  correctConcepts: string[]
  missedConcepts: string[]
  depthOfUnderstanding: 'surface' | 'moderate' | 'deep'
}

interface PreScreeningReport {
  sessionId: string
  candidateId: string
  overallScore: number
  recommendation: 'pass' | 'fail' | 'borderline'
  strengths: string[]
  weaknesses: string[]
  detailedEvaluations: ResponseEvaluation[]
  generatedAt: Date
}

interface Resource {
  title: string
  type: 'article' | 'video' | 'course' | 'documentation'
  url: string
  relevantTo: string[]
}
```

### API Endpoints

#### Event Endpoints
```
POST   /api/v1/events                    - Create event
GET    /api/v1/events                    - List events (with filters)
GET    /api/v1/events/:id                - Get event details
PUT    /api/v1/events/:id                - Update event
DELETE /api/v1/events/:id                - Delete event
GET    /api/v1/events/:id/status         - Get event status report
POST   /api/v1/events/:id/venues         - Associate venue
POST   /api/v1/events/:id/student-bodies - Associate student body
```

#### Venue Endpoints
```
POST   /api/v1/venues                    - Create venue
GET    /api/v1/venues                    - Search venues
GET    /api/v1/venues/:id                - Get venue details
PUT    /api/v1/venues/:id                - Update venue
PATCH  /api/v1/venues/:id/status         - Update venue status
GET    /api/v1/venues/:id/history        - Get status history
```

#### Company & Matching Endpoints
```
POST   /api/v1/companies                 - Create company profile
GET    /api/v1/companies/:id             - Get company profile
PUT    /api/v1/companies/:id             - Update company profile
GET    /api/v1/companies/:id/universities - Get university recommendations
GET    /api/v1/universities/:id/clubs    - Get club recommendations
```

#### Task Endpoints
```
GET    /api/v1/events/:id/tasks          - Get task checklist
POST   /api/v1/events/:id/tasks/generate - Generate new tasks
PATCH  /api/v1/tasks/:id                 - Update task status
```

#### Reminder Endpoints
```
GET    /api/v1/reminders                 - Get reminders for user
GET    /api/v1/reminders/overdue         - Get overdue entities
POST   /api/v1/reminders/:id/generate    - Generate reminder draft
POST   /api/v1/reminders/:id/approve     - Approve and send reminder
```

#### Talent Sourcing Endpoints
```
POST   /api/v1/events/:id/source-candidates - Initiate talent sourcing
GET    /api/v1/events/:id/candidates        - Get candidate recommendations
POST   /api/v1/candidates/:id/save-to-pool  - Save candidate to pool
```

#### Skills Mapping Endpoints (n8n Webhook)
```
POST   /api/v1/webhooks/skills-gap       - Ingest skills gap data (n8n)
GET    /api/v1/candidates/:id/skills-match - Get skills match score
GET    /api/v1/events/:id/prioritized-candidates - Get prioritized candidates
```

#### Pre-Screening Endpoints
```
POST   /api/v1/candidates/:id/pre-screening/invite - Send pre-screening invitation
POST   /api/v1/pre-screening/:sessionId/chat       - Submit chat response
GET    /api/v1/pre-screening/:sessionId/report     - Get screening report
GET    /api/v1/pre-screening/:sessionId/resources  - Get preparatory resources
```

## Data Models

### Core Entities

```typescript
// Event
interface Event {
  id: string
  name: string
  type: 'hackathon' | 'bootcamp' | 'networking'
  date: Date
  description: string
  goals: string[]
  companyId: string
  createdAt: Date
  updatedAt: Date
  venues: EventVenue[]
  studentBodies: EventStudentBody[]
  stakeholders: EventStakeholder[]
  tasks: Task[]
}

// Venue
interface Venue {
  id: string
  name: string
  location: string
  capacity: number
  rating: number
  amenities: string[]
  contactInfo: ContactInfo
  status: EntityStatus
  lastContactDate: Date
  createdAt: Date
  updatedAt: Date
}

// Company
interface Company {
  id: string
  name: string
  industry: string[]
  techStack: string[]
  culture: string
  hiringNeeds: HiringNeed[]
  createdAt: Date
  updatedAt: Date
}

// University
interface University {
  id: string
  name: string
  location: string
  programs: string[]
  strengths: string[]
  industryPartnerships: string[]
  clubs: Club[]
  createdAt: Date
  updatedAt: Date
}

// Candidate
interface Candidate {
  id: string
  name: string
  email?: string
  platforms: CandidatePlatform[]
  skills: string[]
  experienceLevel: string
  notableProjects: Project[]
  relevanceScore?: number
  skillsMatchScore?: number
  preScreeningStatus?: 'not_invited' | 'invited' | 'in_progress' | 'completed'
  preScreeningReport?: PreScreeningReport
  createdAt: Date
  updatedAt: Date
}

interface CandidatePlatform {
  platform: 'github' | 'kaggle' | 'forum'
  username: string
  profileUrl: string
  data: any // Platform-specific data
}

// Task
interface Task {
  id: string
  eventId: string
  title: string
  description: string
  explanation: string
  priority: number
  dependencies: string[]
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Reminder
interface Reminder {
  id: string
  entityId: string
  entityType: 'venue' | 'student_body' | 'stakeholder'
  draftSubject: string
  draftBody: string
  approved: boolean
  sentAt?: Date
  createdAt: Date
}

// Skills Gap
interface SkillsGapEntry {
  id: string
  companyId: string
  skill: string
  proficiencyLevel: string
  priority: string
  currentCount: number
  targetCount: number
  gap: number
  createdAt: Date
  updatedAt: Date
}

// Pre-Screening Session
interface PreScreeningSession {
  id: string
  candidateId: string
  eventId: string
  status: 'invited' | 'in_progress' | 'completed' | 'expired'
  questions: ScreeningQuestion[]
  responses: ScreeningResponse[]
  report?: PreScreeningReport
  startedAt?: Date
  completedAt?: Date
  expiresAt: Date
  createdAt: Date
}

interface ScreeningResponse {
  questionId: string
  response: string
  evaluation: ResponseEvaluation
  timestamp: Date
}
```

### Database Schema (PostgreSQL)

```sql
-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('hackathon', 'bootcamp', 'networking')),
  date TIMESTAMP NOT NULL,
  description TEXT,
  goals JSONB,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INTEGER,
  rating DECIMAL(3,2),
  amenities JSONB,
  contact_info JSONB,
  status VARCHAR(50) NOT NULL CHECK (status IN ('REQUESTED', 'WAITING', 'CONFIRMED', 'NEEDS_ACTION', 'REJECTED')),
  last_contact_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry JSONB,
  tech_stack JSONB,
  culture TEXT,
  hiring_needs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Universities table
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  programs JSONB,
  strengths JSONB,
  industry_partnerships JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clubs table
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id),
  name VARCHAR(255) NOT NULL,
  focus_areas JSONB,
  member_count INTEGER,
  activity_level VARCHAR(50) CHECK (activity_level IN ('low', 'medium', 'high')),
  recent_projects JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255),
  platforms JSONB,
  skills JSONB,
  experience_level VARCHAR(50),
  notable_projects JSONB,
  relevance_score DECIMAL(5,2),
  skills_match_score DECIMAL(5,2),
  pre_screening_status VARCHAR(50) CHECK (pre_screening_status IN ('not_invited', 'invited', 'in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  explanation TEXT,
  priority INTEGER,
  dependencies JSONB,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  draft_subject VARCHAR(255),
  draft_body TEXT,
  approved BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skills gaps table
CREATE TABLE skills_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  skill VARCHAR(255) NOT NULL,
  proficiency_level VARCHAR(50),
  priority VARCHAR(50),
  current_count INTEGER,
  target_count INTEGER,
  gap INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pre-screening sessions table
CREATE TABLE pre_screening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id),
  event_id UUID REFERENCES events(id),
  status VARCHAR(50) CHECK (status IN ('invited', 'in_progress', 'completed', 'expired')),
  questions JSONB,
  responses JSONB,
  report JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Status history table
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Junction tables
CREATE TABLE event_venues (
  event_id UUID REFERENCES events(id),
  venue_id UUID REFERENCES venues(id),
  PRIMARY KEY (event_id, venue_id)
);

CREATE TABLE event_student_bodies (
  event_id UUID REFERENCES events(id),
  student_body_id UUID NOT NULL,
  student_body_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  PRIMARY KEY (event_id, student_body_id)
);

-- Indexes for performance
CREATE INDEX idx_events_company ON events(company_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX idx_tasks_event ON tasks(event_id);
CREATE INDEX idx_status_history_entity ON status_history(entity_id, entity_type);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, several redundant properties were identified:

**Redundancies Eliminated:**
1. Requirements 4.1 and 4.3 both test reminder detection - combined into single property
2. Requirement 14.1 is a general persistence property already covered by specific entity round-trip tests (1.3, 8.1, 11.1)
3. Multiple "display/show" requirements (1.2, 9.3, 9.5, 10.5) test similar field presence - can be combined per entity type
4. Status update properties (2.2, 3.2) can be combined into a general status tracking property
5. Filter properties (3.5, 13.4) test similar functionality - can be combined

**Properties Retained:**
- Core CRUD operations with round-trip validation
- Business logic properties (matching, scoring, ranking)
- Integration properties (API calls, webhooks, LLM)
- Security properties (authentication, authorization)
- Error handling properties (validation, graceful degradation)

### Core Data Persistence Properties

**Property 1: Entity Round-Trip Persistence**
*For any* valid entity (venue, event, company, university, candidate), storing it to the database and then retrieving it should produce an equivalent entity with all fields preserved.
**Validates: Requirements 1.3, 1.5, 8.1, 8.3, 11.1**

**Property 2: Referential Integrity Enforcement**
*For any* attempt to create an association with a non-existent entity, the system should reject the operation and maintain database consistency.
**Validates: Requirements 14.2**

### Search and Filter Properties

**Property 3: Venue Search Criteria Matching**
*For any* venue search criteria and backing venue data, all returned venues should match all specified criteria (location, capacity range, minimum rating, amenities).
**Validates: Requirements 1.1**

**Property 4: Entity Filtering Correctness**
*For any* collection of entities and filter criteria (status, type, event), all returned entities should match the filter and no matching entities should be excluded.
**Validates: Requirements 3.5, 13.4**

### Status Tracking Properties

**Property 5: Status Transition Recording**
*For any* entity status update, the system should record the change in status history with timestamp, previous status, and new status.
**Validates: Requirements 2.2, 3.2**

**Property 6: Status Value Validation**
*For any* entity type (venue, student body, stakeholder), the system should accept all valid status values (REQUESTED, WAITING, CONFIRMED, NEEDS_ACTION, REJECTED) and reject invalid values.
**Validates: Requirements 3.1**

**Property 7: Dashboard Status Aggregation**
*For any* set of entities with various statuses, the dashboard summary should correctly count entities by status type and the sum should equal the total number of entities.
**Validates: Requirements 3.3, 6.2, 13.1**

### Reminder and Notification Properties

**Property 8: Overdue Entity Detection**
*For any* configured threshold and set of entities with WAITING status, the reminder detection should flag exactly those entities where time elapsed since last contact exceeds the threshold.
**Validates: Requirements 4.1, 4.2, 4.3**

**Property 9: Reminder Draft Content Completeness**
*For any* generated reminder draft, it should contain the entity name, last contact date, and event details in the draft body.
**Validates: Requirements 5.2**

**Property 10: Reminder Approval Safety**
*For any* reminder draft, it should not be sent unless explicitly approved, and after approval the entity's last contact timestamp should be updated.
**Validates: Requirements 5.4, 5.5**

### Task Generation Properties

**Property 11: Event Type Task Adaptation**
*For any* two events with different types (Hackathon vs Bootcamp vs Networking) but similar status, the generated task checklists should differ in content to reflect event-specific requirements.
**Validates: Requirements 7.2**

**Property 12: Task Explanation Completeness**
*For any* generated task, it should include a non-empty explanation field describing why the task is recommended.
**Validates: Requirements 7.3**

**Property 13: Task Dependency Ordering**
*For any* generated task checklist, if task A depends on task B, then task B should appear before task A in the ordered list.
**Validates: Requirements 7.5**

**Property 14: Task Completion Updates Checklist**
*For any* task marked as complete, the task's completed status should be persisted and the completion timestamp should be recorded.
**Validates: Requirements 7.6**

### Company Profile and Matching Properties

**Property 15: Company Profile Validation**
*For any* company profile submission missing required fields (name, industry, tech stack, hiring needs), the system should reject it with a validation error.
**Validates: Requirements 8.2**

**Property 16: Profile Update Triggers Matching**
*For any* company profile update, the system should initiate university alignment recalculation for that company.
**Validates: Requirements 8.5, 9.6**

**Property 17: University Alignment Score Completeness**
*For any* company profile, running the matching algorithm should produce alignment scores for all universities in the database.
**Validates: Requirements 9.1**

**Property 18: University Ranking by Alignment**
*For any* set of university recommendations, they should be ordered by alignment score in descending order (highest alignment first).
**Validates: Requirements 9.2**

**Property 19: Recommendation Content Completeness**
*For any* university recommendation, it should include alignment score, reasoning text, and a list of relevant clubs with their details (focus areas, member count, activity level).
**Validates: Requirements 9.3, 9.5**

### Talent Sourcing Properties

**Property 20: Multi-Platform Candidate Sourcing**
*For any* talent sourcing request, the system should query all configured platforms (GitHub, Kaggle, forums) and aggregate results from all sources.
**Validates: Requirements 10.1**

**Property 21: Technical Footprint Extraction**
*For any* candidate profile from external platforms, the system should extract skills, projects, and contributions into structured fields.
**Validates: Requirements 10.2**

**Property 22: Candidate Relevance Ranking**
*For any* set of candidate recommendations, they should be ordered by relevance score in descending order (most relevant first).
**Validates: Requirements 10.4**

**Property 23: Candidate Recommendation Content**
*For any* candidate recommendation, it should include skills list, notable projects, relevance score, and platform sources.
**Validates: Requirements 10.5**

**Property 24: Candidate Pool Persistence**
*For any* candidate saved to a talent pool, retrieving the pool should include that candidate with all details preserved.
**Validates: Requirements 10.6**

### Event Management Properties

**Property 25: Event Type Validation**
*For any* event creation request with a type not in {Hackathon, Bootcamp, Networking}, the system should reject it with a validation error.
**Validates: Requirements 11.2**

**Property 26: Event Initialization**
*For any* newly created event, it should have empty collections for venues, student bodies, and stakeholders.
**Validates: Requirements 11.3**

**Property 27: Entity Association Persistence**
*For any* venue, student body, or stakeholder associated with an event, retrieving the event should include that entity in the appropriate collection.
**Validates: Requirements 11.4, 11.5**

### Authentication and Authorization Properties

**Property 28: Unauthenticated Access Rejection**
*For any* API request without valid authentication credentials, the system should return a 401 Unauthorized response.
**Validates: Requirements 12.1**

**Property 29: Credential Validation**
*For any* authentication attempt with invalid credentials, the system should reject access and return an error message.
**Validates: Requirements 12.2, 12.3**

**Property 30: Session Creation on Authentication**
*For any* successful authentication, the system should create a session with permissions matching the user's role.
**Validates: Requirements 12.4**

**Property 31: Role-Based Access Control**
*For any* user attempting to access a feature, the system should allow access only if the user's role has the required permission.
**Validates: Requirements 12.5**

**Property 32: Session Expiration Enforcement**
*For any* API request with an expired session token, the system should return a 401 Unauthorized response requiring re-authentication.
**Validates: Requirements 12.6**

### External Integration Properties

**Property 33: External API Error Handling**
*For any* external API call that fails, the system should retry with exponential backoff and eventually return a graceful error if all retries fail.
**Validates: Requirements 15.4**

**Property 34: API Response Caching**
*For any* external API request, if a cached response exists and is not expired, the system should return the cached response without making a new API call.
**Validates: Requirements 15.5**

**Property 35: API Rate Limit Compliance**
*For any* sequence of external API calls, the system should enforce rate limits and delay requests as needed to stay within limits.
**Validates: Requirements 15.6**

### LLM Integration Properties

**Property 36: LLM Request Context Completeness**
*For any* LLM request for task generation, the request payload should include event type, event date, and entity status counts.
**Validates: Requirements 16.1**

**Property 37: LLM Response Validation**
*For any* LLM response, the system should validate that it contains properly formatted tasks with required fields (title, description, explanation) before using it.
**Validates: Requirements 16.2**

**Property 38: LLM Fallback on Invalid Response**
*For any* invalid or incomplete LLM response, the system should either request regeneration or use fallback task generation logic.
**Validates: Requirements 16.3**

**Property 39: LLM Call Rate Limiting**
*For any* sequence of task generation requests, the system should limit LLM API calls to stay within configured cost thresholds.
**Validates: Requirements 16.5**

### Web Scraping Properties

**Property 40: Robots.txt Compliance**
*For any* forum scraping request, the system should check robots.txt and skip scraping paths that are disallowed.
**Validates: Requirements 17.2**

**Property 41: Forum Data Extraction**
*For any* forum page HTML, the system should extract usernames, technical topics, and contribution indicators into structured fields.
**Validates: Requirements 17.3**

**Property 42: Scraping Error Graceful Handling**
*For any* forum that blocks scraping attempts, the system should log the error and continue with other sources without failing the entire sourcing operation.
**Validates: Requirements 17.4**

### API Design Properties

**Property 43: HTTP Status Code Correctness**
*For any* API request, the system should return appropriate HTTP status codes: 200 for success, 400 for bad request, 401 for unauthorized, 404 for not found, 500 for server error.
**Validates: Requirements 18.2**

**Property 44: Malformed Request Error Response**
*For any* API request with malformed data (invalid JSON, missing required fields), the system should return a 400 error with a descriptive error message.
**Validates: Requirements 18.3**

**Property 45: Pagination Correctness**
*For any* paginated API endpoint, requesting page N with size S should return at most S items, and the total count should match the actual number of items across all pages.
**Validates: Requirements 18.4**

### Skills Mapping Properties (n8n Integration)

**Property 46: Skills Gap Webhook Ingestion**
*For any* valid skills gap webhook payload sent to the n8n endpoint, the system should parse and store all skills gaps with their proficiency levels and priorities.
**Validates: Requirements 19.1, 19.2**

**Property 47: Skills Match Score Calculation**
*For any* candidate and current skills gaps, the system should calculate a skills match score that increases when the candidate has skills matching high-priority gaps.
**Validates: Requirements 19.3**

**Property 48: Candidate Prioritization by Skills Gap**
*For any* set of candidates, those with skills matching high-priority gaps should be ranked higher than those matching only low-priority gaps.
**Validates: Requirements 19.4, 19.5**

**Property 49: Skills Gap Display in Candidate Details**
*For any* candidate with a skills match score, retrieving candidate details should show which specific skills gaps the candidate addresses.
**Validates: Requirements 19.6**

**Property 50: Skills Gap Update Triggers Recalculation**
*For any* skills gap data update via webhook, the system should recalculate skills match scores for all candidates.
**Validates: Requirements 19.7**

### Pre-Screening Properties

**Property 51: Pre-Screening Invitation Offering**
*For any* candidate invited to an event, the invitation should include an optional pre-screening session offer with a unique session URL.
**Validates: Requirements 20.1**

**Property 52: Screening Question Generation**
*For any* pre-screening session, the system should generate questions relevant to the event type and required skills.
**Validates: Requirements 20.2**

**Property 53: Conversational Assessment Flow**
*For any* pre-screening session, the AI agent should conduct a multi-turn conversation with follow-up questions based on candidate responses.
**Validates: Requirements 20.3**

**Property 54: Response Evaluation Accuracy**
*For any* candidate response during pre-screening, the system should evaluate it for technical accuracy and identify correct and missed concepts.
**Validates: Requirements 20.4**

**Property 55: Screening Report Generation**
*For any* completed pre-screening session, the system should generate a report with overall score, pass/fail recommendation, strengths, and weaknesses.
**Validates: Requirements 20.5, 20.6**

**Property 56: Failed Screening Feedback**
*For any* candidate who fails pre-screening, the system should provide specific feedback on weaknesses and suggest relevant preparatory resources.
**Validates: Requirements 20.8**

## Error Handling

### Error Categories

**1. Validation Errors**
- Invalid input data (missing required fields, wrong data types)
- Business rule violations (invalid status transitions, invalid event types)
- Response: 400 Bad Request with descriptive error message

**2. Authentication/Authorization Errors**
- Missing or invalid credentials
- Expired sessions
- Insufficient permissions
- Response: 401 Unauthorized or 403 Forbidden

**3. Resource Not Found Errors**
- Requested entity does not exist
- Response: 404 Not Found with entity type and ID

**4. External Service Errors**
- API call failures (GitHub, Kaggle, venue APIs)
- LLM service unavailable
- n8n webhook delivery failures
- Response: Retry with exponential backoff, fallback to cached data or default behavior, 503 Service Unavailable if critical

**5. Database Errors**
- Connection failures
- Query timeouts
- Constraint violations
- Response: Log error, return 500 Internal Server Error, trigger alerts

**6. Rate Limiting Errors**
- Too many requests to external APIs
- LLM cost threshold exceeded
- Response: Queue requests, delay execution, return 429 Too Many Requests

### Error Handling Strategies

**Graceful Degradation:**
- If GitHub API fails, continue with Kaggle and forum data
- If LLM task generation fails, use rule-based fallback
- If one university matching fails, continue with others

**Retry Logic:**
- Exponential backoff for transient failures: 1s, 2s, 4s, 8s, 16s
- Maximum 5 retry attempts
- Circuit breaker pattern for repeated failures

**User Feedback:**
- Clear error messages explaining what went wrong
- Actionable suggestions for resolution
- Error codes for support reference

**Logging and Monitoring:**
- Log all errors with context (user ID, request ID, timestamp)
- Track error rates and patterns
- Alert on critical errors (database down, authentication service unavailable)

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests:**
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, special characters)
- Error conditions (invalid inputs, missing data, service failures)
- Integration points between components
- Focus on concrete scenarios that are easy to understand and debug

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Minimum 100 iterations per property test
- Focus on invariants, round-trip properties, and business rules
- Each property test references its design document property

### Property-Based Testing Configuration

**Framework Selection:**
- TypeScript/JavaScript: fast-check
- Python: Hypothesis
- Java: jqwik

**Test Configuration:**
```typescript
// Example property test configuration
describe('Property 1: Entity Round-Trip Persistence', () => {
  it('should preserve all fields when storing and retrieving venues', () => {
    fc.assert(
      fc.property(venueArbitrary, async (venue) => {
        const stored = await venueService.createVenue(venue);
        const retrieved = await venueService.getVenue(stored.id);
        expect(retrieved).toEqual(stored);
      }),
      { numRuns: 100 } // Minimum 100 iterations
    );
  });
});

// Tag format for traceability
// Feature: idea-hub-talent-acquisition, Property 1: Entity Round-Trip Persistence
```

**Generator Strategies:**
- Generate valid entities with random but realistic data
- Generate edge cases (empty strings, maximum lengths, special characters)
- Generate invalid inputs for validation testing
- Generate various status combinations for workflow testing

### Test Coverage Goals

**Unit Test Coverage:**
- 80%+ code coverage for business logic
- 100% coverage for critical paths (authentication, data persistence)
- All error handling branches tested

**Property Test Coverage:**
- All 56 correctness properties implemented as property tests
- Each acceptance criterion marked "testable: yes - property" has a corresponding test
- Integration tests for external service interactions (with mocks)

### Testing Priorities

**Phase 1 (MVP):**
- Core CRUD operations (Properties 1-4)
- Authentication and authorization (Properties 28-32)
- Status tracking (Properties 5-7)
- Event management (Properties 25-27)

**Phase 2 (Core Features):**
- Reminder system (Properties 8-10)
- Task generation (Properties 11-14)
- Company matching (Properties 15-19)
- Talent sourcing (Properties 20-24)

**Phase 3 (Advanced AI Features):**
- Skills mapping (Properties 46-50)
- Pre-screening (Properties 51-56)
- LLM integration (Properties 36-39)
- Web scraping (Properties 40-42)

### Continuous Integration

- Run all unit tests on every commit
- Run property tests on pull requests
- Run integration tests nightly
- Monitor test execution time and optimize slow tests
- Fail builds on test failures or coverage drops
