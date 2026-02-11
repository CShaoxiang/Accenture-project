# Implementation Plan: Idea Hub Talent Acquisition Platform

## Overview

This implementation plan breaks down the Idea Hub platform into incremental coding tasks. The approach follows a bottom-up strategy: database and core services first, then API endpoints, followed by frontend components, and finally advanced AI features. Each task builds on previous work, with checkpoints to validate progress.

The implementation uses TypeScript throughout, with React/Next.js for the frontend and Node.js/Express for the backend, PostgreSQL for data persistence, and integrations with external services (GitHub, Kaggle, LLMs, n8n).

## Tasks

### Phase 1: Project Setup and Core Infrastructure

- [ ] 1. Initialize project structure and dependencies
  - Create monorepo structure with frontend and backend workspaces
  - Set up TypeScript configuration for both projects
  - Install core dependencies (Express, Prisma, React, Next.js, TailwindCSS)
  - Configure ESLint and Prettier for code quality
  - Set up testing frameworks (Jest, fast-check for property tests)
  - _Requirements: 18.1_

- [ ] 2. Set up database schema and Prisma ORM
  - [ ] 2.1 Create Prisma schema with all tables from design
    - Define models for events, venues, companies, universities, clubs, candidates
    - Define models for tasks, reminders, skills_gaps, pre_screening_sessions
    - Define junction tables and status_history
    - Add indexes for performance
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 2.2 Write property test for database round-trip persistence
    - **Property 1: Entity Round-Trip Persistence**
    - **Validates: Requirements 1.3, 1.5, 8.1, 8.3, 11.1**
  
  - [ ]* 2.3 Write property test for referential integrity
    - **Property 2: Referential Integrity Enforcement**
    - **Validates: Requirements 14.2**

- [ ] 3. Implement authentication and authorization system
  - [ ] 3.1 Create User model and authentication service
    - Implement JWT-based authentication
    - Create login and registration endpoints
    - Implement password hashing with bcrypt
    - _Requirements: 12.1, 12.2_
  
  - [ ] 3.2 Implement session management and RBAC
    - Create session middleware for Express
    - Implement role-based access control
    - Add permission checking utilities
    - _Requirements: 12.4, 12.5, 12.6_
  
  - [ ]* 3.3 Write property tests for authentication
    - **Property 28: Unauthenticated Access Rejection**
    - **Property 29: Credential Validation**
    - **Property 30: Session Creation on Authentication**
    - **Property 31: Role-Based Access Control**
    - **Property 32: Session Expiration Enforcement**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**

- [ ] 4. Checkpoint - Ensure database and auth tests pass
  - Ensure all tests pass, ask the user if questions arise.


### Phase 2: Core Event and Venue Management

- [ ] 5. Implement Event Service and API endpoints
  - [ ] 5.1 Create EventService with CRUD operations
    - Implement createEvent, getEvent, updateEvent, listEvents
    - Implement event-entity associations (venues, student bodies)
    - Add event status reporting functionality
    - _Requirements: 11.1, 11.3, 11.4, 11.5_
  
  - [ ] 5.2 Create Event API endpoints
    - POST /api/v1/events - Create event
    - GET /api/v1/events - List events with filters
    - GET /api/v1/events/:id - Get event details
    - PUT /api/v1/events/:id - Update event
    - GET /api/v1/events/:id/status - Get status report
    - _Requirements: 11.1, 18.1, 18.2_
  
  - [ ]* 5.3 Write property tests for event management
    - **Property 25: Event Type Validation**
    - **Property 26: Event Initialization**
    - **Property 27: Entity Association Persistence**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5**
  
  - [ ]* 5.4 Write unit tests for event API endpoints
    - Test event creation with valid and invalid data
    - Test event filtering and pagination
    - Test error responses (400, 404)
    - _Requirements: 11.1, 18.3_

- [ ] 6. Implement Venue Service and API endpoints
  - [ ] 6.1 Create VenueService with search and management
    - Implement searchVenues with criteria filtering
    - Implement createVenue, getVenue, updateVenue
    - Implement updateVenueStatus with history tracking
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.1, 2.2_
  
  - [ ] 6.2 Create Venue API endpoints
    - POST /api/v1/venues - Create venue
    - GET /api/v1/venues - Search venues
    - GET /api/v1/venues/:id - Get venue details
    - PUT /api/v1/venues/:id - Update venue
    - PATCH /api/v1/venues/:id/status - Update status
    - GET /api/v1/venues/:id/history - Get status history
    - _Requirements: 1.1, 1.3, 2.2, 2.3, 18.1_
  
  - [ ]* 6.3 Write property tests for venue functionality
    - **Property 3: Venue Search Criteria Matching**
    - **Property 5: Status Transition Recording**
    - **Property 6: Status Value Validation**
    - **Validates: Requirements 1.1, 2.2, 3.1, 3.2**
  
  - [ ]* 6.4 Write unit tests for venue search edge cases
    - Test empty search results
    - Test search with multiple criteria
    - Test invalid status transitions
    - _Requirements: 1.1, 2.2_

- [ ] 7. Implement status tracking and dashboard data
  - [ ] 7.1 Create status tracking utilities
    - Implement status history recording
    - Implement status aggregation for dashboard
    - Add time elapsed calculation utilities
    - _Requirements: 3.2, 3.3, 2.4_
  
  - [ ]* 7.2 Write property tests for status tracking
    - **Property 7: Dashboard Status Aggregation**
    - **Property 4: Entity Filtering Correctness**
    - **Validates: Requirements 3.3, 3.5, 6.2, 13.1, 13.4**

- [ ] 8. Checkpoint - Ensure core services tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Reminder System

- [ ] 9. Implement Reminder Service
  - [ ] 9.1 Create ReminderService with detection logic
    - Implement detectOverdueEntities with threshold checking
    - Implement generateReminderDraft with LLM integration
    - Implement approveAndSendReminder with timestamp updates
    - Add reminder queue management
    - _Requirements: 4.1, 4.2, 4.4, 5.1, 5.2, 5.4, 5.5_
  
  - [ ] 9.2 Create Reminder API endpoints
    - GET /api/v1/reminders - Get reminders for user
    - GET /api/v1/reminders/overdue - Get overdue entities
    - POST /api/v1/reminders/:id/generate - Generate draft
    - POST /api/v1/reminders/:id/approve - Approve and send
    - _Requirements: 4.1, 5.1, 5.5, 18.1_
  
  - [ ]* 9.3 Write property tests for reminder system
    - **Property 8: Overdue Entity Detection**
    - **Property 9: Reminder Draft Content Completeness**
    - **Property 10: Reminder Approval Safety**
    - **Validates: Requirements 4.1, 4.2, 4.3, 5.2, 5.4, 5.5**
  
  - [ ]* 9.4 Write unit tests for reminder edge cases
    - Test threshold boundary conditions
    - Test draft generation with missing data
    - Test approval workflow
    - _Requirements: 4.1, 5.5_

- [ ] 10. Set up Bull queue for periodic reminder checks
  - Configure Bull with Redis for job queuing
  - Create scheduled job for overdue entity detection
  - Implement job handlers for reminder processing
  - _Requirements: 6.1_

- [ ] 11. Checkpoint - Ensure reminder system tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Company Profiles and University Matching

- [ ] 12. Implement Company Service
  - [ ] 12.1 Create CompanyService with profile management
    - Implement createCompany, getCompany, updateCompany
    - Add profile validation for required fields
    - Implement trigger for matching on profile save/update
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [ ] 12.2 Create Company API endpoints
    - POST /api/v1/companies - Create company profile
    - GET /api/v1/companies/:id - Get company profile
    - PUT /api/v1/companies/:id - Update company profile
    - _Requirements: 8.1, 8.3, 18.1_
  
  - [ ]* 12.3 Write property tests for company profiles
    - **Property 15: Company Profile Validation**
    - **Property 16: Profile Update Triggers Matching**
    - **Validates: Requirements 8.2, 8.5, 9.6**

- [ ] 13. Implement Matching Service with LLM integration
  - [ ] 13.1 Create MatchingService with alignment calculation
    - Implement calculateUniversityAlignment with LLM calls
    - Implement getClubsForUniversity with scoring
    - Add caching for matching results
    - Implement recalculation on profile updates
    - _Requirements: 9.1, 9.2, 9.4, 9.6_
  
  - [ ] 13.2 Create University and Matching API endpoints
    - GET /api/v1/companies/:id/universities - Get recommendations
    - GET /api/v1/universities/:id/clubs - Get club recommendations
    - _Requirements: 9.1, 9.4, 18.1_
  
  - [ ]* 13.3 Write property tests for matching
    - **Property 17: University Alignment Score Completeness**
    - **Property 18: University Ranking by Alignment**
    - **Property 19: Recommendation Content Completeness**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.5**
  
  - [ ]* 13.4 Write unit tests for matching edge cases
    - Test matching with no universities
    - Test matching with incomplete company profiles
    - Test LLM failure fallback
    - _Requirements: 9.1, 16.3_

- [ ] 14. Checkpoint - Ensure matching system tests pass
  - Ensure all tests pass, ask the user if questions arise.


### Phase 5: Task Generation System

- [ ] 15. Implement Task Generation Service with LLM
  - [ ] 15.1 Create TaskGenerationService
    - Implement analyzeEventStage based on entity statuses
    - Implement callLLMForTasks with context building
    - Add task parsing and validation
    - Implement fallback logic for LLM failures
    - Add task dependency resolution
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 16.1, 16.2, 16.3_
  
  - [ ] 15.2 Create Task API endpoints
    - GET /api/v1/events/:id/tasks - Get task checklist
    - POST /api/v1/events/:id/tasks/generate - Generate tasks
    - PATCH /api/v1/tasks/:id - Update task status
    - _Requirements: 7.6, 18.1_
  
  - [ ]* 15.3 Write property tests for task generation
    - **Property 11: Event Type Task Adaptation**
    - **Property 12: Task Explanation Completeness**
    - **Property 13: Task Dependency Ordering**
    - **Property 14: Task Completion Updates Checklist**
    - **Validates: Requirements 7.2, 7.3, 7.5, 7.6**
  
  - [ ]* 15.4 Write property tests for LLM integration
    - **Property 36: LLM Request Context Completeness**
    - **Property 37: LLM Response Validation**
    - **Property 38: LLM Fallback on Invalid Response**
    - **Property 39: LLM Call Rate Limiting**
    - **Validates: Requirements 16.1, 16.2, 16.3, 16.5**
  
  - [ ]* 15.5 Write unit tests for task generation edge cases
    - Test task generation with no entities
    - Test task generation near event date
    - Test LLM timeout handling
    - _Requirements: 7.1, 16.3_

- [ ] 16. Checkpoint - Ensure task generation tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Talent Sourcing System

- [ ] 17. Implement external API integrations
  - [ ] 17.1 Create GitHub API integration
    - Implement GitHub client with authentication
    - Implement user profile and repository fetching
    - Add contribution analysis
    - Implement rate limiting and caching
    - _Requirements: 15.2, 15.5, 15.6_
  
  - [ ] 17.2 Create Kaggle API integration
    - Implement Kaggle client with authentication
    - Implement user profile and competition fetching
    - Add rate limiting and caching
    - _Requirements: 15.3, 15.5, 15.6_
  
  - [ ] 17.3 Implement web scraping for forums
    - Create scraper with Cheerio/Puppeteer
    - Implement robots.txt checking
    - Add forum data extraction
    - Implement error handling for blocked scraping
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [ ]* 17.4 Write property tests for external integrations
    - **Property 33: External API Error Handling**
    - **Property 34: API Response Caching**
    - **Property 35: API Rate Limit Compliance**
    - **Property 40: Robots.txt Compliance**
    - **Property 41: Forum Data Extraction**
    - **Property 42: Scraping Error Graceful Handling**
    - **Validates: Requirements 15.4, 15.5, 15.6, 17.2, 17.3, 17.4**

- [ ] 18. Implement Talent Sourcing Service
  - [ ] 18.1 Create TalentSourcingService
    - Implement sourceCandidates with multi-platform crawling
    - Implement analyzeTechnicalFootprint for skill extraction
    - Implement rankCandidates by relevance
    - Add candidate pool management
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_
  
  - [ ] 18.2 Create Talent Sourcing API endpoints
    - POST /api/v1/events/:id/source-candidates - Initiate sourcing
    - GET /api/v1/events/:id/candidates - Get recommendations
    - POST /api/v1/candidates/:id/save-to-pool - Save to pool
    - _Requirements: 10.1, 10.6, 18.1_
  
  - [ ]* 18.3 Write property tests for talent sourcing
    - **Property 20: Multi-Platform Candidate Sourcing**
    - **Property 21: Technical Footprint Extraction**
    - **Property 22: Candidate Relevance Ranking**
    - **Property 23: Candidate Recommendation Content**
    - **Property 24: Candidate Pool Persistence**
    - **Validates: Requirements 10.1, 10.2, 10.4, 10.5, 10.6**
  
  - [ ]* 18.4 Write unit tests for sourcing edge cases
    - Test sourcing with API failures
    - Test sourcing with no results
    - Test ranking with equal scores
    - _Requirements: 10.1, 10.4_

- [ ] 19. Checkpoint - Ensure talent sourcing tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: Skills Mapping (n8n Integration)

- [ ] 20. Implement Skills Mapping Service
  - [ ] 20.1 Create SkillsMappingService
    - Implement webhook endpoint for n8n integration
    - Implement parseSkillsGapData from webhook payload
    - Implement calculateSkillsMatchScore for candidates
    - Implement prioritizeCandidatesBySkillsGap
    - Add recalculation on skills gap updates
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.7_
  
  - [ ] 20.2 Create Skills Mapping API endpoints
    - POST /api/v1/webhooks/skills-gap - n8n webhook endpoint
    - GET /api/v1/candidates/:id/skills-match - Get match score
    - GET /api/v1/events/:id/prioritized-candidates - Get prioritized list
    - _Requirements: 19.1, 19.3, 19.5, 18.1_
  
  - [ ]* 20.3 Write property tests for skills mapping
    - **Property 46: Skills Gap Webhook Ingestion**
    - **Property 47: Skills Match Score Calculation**
    - **Property 48: Candidate Prioritization by Skills Gap**
    - **Property 49: Skills Gap Display in Candidate Details**
    - **Property 50: Skills Gap Update Triggers Recalculation**
    - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7**
  
  - [ ]* 20.4 Write unit tests for skills mapping edge cases
    - Test webhook with invalid payload
    - Test matching with no skills gaps
    - Test prioritization with tied scores
    - _Requirements: 19.1, 19.4_

- [ ] 21. Checkpoint - Ensure skills mapping tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8: Pre-Screening System

- [ ] 22. Implement Pre-Screening Service with AI Agent
  - [ ] 22.1 Create PreScreeningService
    - Implement offerPreScreening with invitation generation
    - Implement generateScreeningQuestions based on event/skills
    - Implement conductChatScreening with LLM conversation
    - Implement evaluateResponse for technical accuracy
    - Implement generateScreeningReport with recommendations
    - Add preparatory resource suggestions
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.8_
  
  - [ ] 22.2 Create Pre-Screening API endpoints
    - POST /api/v1/candidates/:id/pre-screening/invite - Send invitation
    - POST /api/v1/pre-screening/:sessionId/chat - Submit response
    - GET /api/v1/pre-screening/:sessionId/report - Get report
    - GET /api/v1/pre-screening/:sessionId/resources - Get resources
    - _Requirements: 20.1, 20.5, 20.8, 18.1_
  
  - [ ]* 22.3 Write property tests for pre-screening
    - **Property 51: Pre-Screening Invitation Offering**
    - **Property 52: Screening Question Generation**
    - **Property 53: Conversational Assessment Flow**
    - **Property 54: Response Evaluation Accuracy**
    - **Property 55: Screening Report Generation**
    - **Property 56: Failed Screening Feedback**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.8**
  
  - [ ]* 22.4 Write unit tests for pre-screening edge cases
    - Test session expiration
    - Test incomplete sessions
    - Test evaluation with ambiguous responses
    - _Requirements: 20.3, 20.4_

- [ ] 23. Checkpoint - Ensure pre-screening tests pass
  - Ensure all tests pass, ask the user if questions arise.


### Phase 9: Frontend - Core Components

- [ ] 24. Set up Next.js frontend project
  - Initialize Next.js with TypeScript and TailwindCSS
  - Configure React Query for data fetching
  - Set up API client with Axios
  - Create authentication context and hooks
  - Set up routing structure
  - _Requirements: 18.1_

- [ ] 25. Implement authentication UI
  - [ ] 25.1 Create login and registration pages
    - Build login form with validation
    - Build registration form with validation
    - Implement authentication flow with JWT
    - Add error handling and user feedback
    - _Requirements: 12.1, 12.2_
  
  - [ ]* 25.2 Write integration tests for auth UI
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test session persistence
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 26. Implement Dashboard Component
  - [ ] 26.1 Create dashboard layout and status cards
    - Build event summary cards
    - Create status distribution visualizations with Recharts
    - Add entity status breakdown by type
    - Implement filter controls
    - _Requirements: 13.1, 13.3, 13.4_
  
  - [ ] 26.2 Add reminder queue display
    - Create overdue entity list
    - Add quick action buttons
    - Implement real-time updates
    - _Requirements: 4.4_
  
  - [ ]* 26.3 Write integration tests for dashboard
    - Test dashboard data loading
    - Test filter functionality
    - Test status card rendering
    - _Requirements: 13.1, 13.4_

- [ ] 27. Implement Event Management UI
  - [ ] 27.1 Create event list and detail pages
    - Build event list with filtering
    - Create event detail view with entity associations
    - Add event creation form
    - Add event editing functionality
    - _Requirements: 11.1, 11.4, 11.5_
  
  - [ ] 27.2 Add event status visualization
    - Create status timeline component
    - Add entity status cards
    - Implement status update controls
    - _Requirements: 3.3, 11.5_
  
  - [ ]* 27.3 Write integration tests for event UI
    - Test event creation flow
    - Test event editing
    - Test entity association
    - _Requirements: 11.1, 11.4_

- [ ] 28. Checkpoint - Ensure frontend core tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 10: Frontend - Venue and Company Management

- [ ] 29. Implement Venue Management UI
  - [ ] 29.1 Create venue search and list components
    - Build venue search form with criteria
    - Create venue list with filtering
    - Add venue detail cards
    - Implement status update controls
    - _Requirements: 1.1, 1.4, 2.2_
  
  - [ ] 29.2 Add venue outreach tracking
    - Create outreach history timeline
    - Add contact logging form
    - Display time elapsed since last contact
    - _Requirements: 2.3, 2.4_
  
  - [ ]* 29.3 Write integration tests for venue UI
    - Test venue search with various criteria
    - Test status updates
    - Test outreach tracking
    - _Requirements: 1.1, 2.2_

- [ ] 30. Implement Company Profile UI
  - [ ] 30.1 Create company profile form
    - Build profile creation form
    - Add tech stack multi-select
    - Add hiring needs editor
    - Implement profile validation
    - _Requirements: 8.1, 8.2_
  
  - [ ] 30.2 Create university matching display
    - Build university recommendation cards
    - Add alignment score visualization
    - Create club drill-down view
    - Display matching reasoning
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 30.3 Write integration tests for company UI
    - Test profile creation
    - Test profile validation
    - Test university recommendations display
    - _Requirements: 8.1, 8.2, 9.1_

- [ ] 31. Checkpoint - Ensure venue and company UI tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 11: Frontend - Advanced Features

- [ ] 32. Implement Task Checklist UI
  - [ ] 32.1 Create task checklist component
    - Build task list with priority ordering
    - Add task completion controls
    - Display task explanations
    - Add task regeneration button
    - _Requirements: 7.3, 7.5, 7.6_
  
  - [ ]* 32.2 Write integration tests for task UI
    - Test task display
    - Test task completion
    - Test task regeneration
    - _Requirements: 7.6_

- [ ] 33. Implement Reminder Management UI
  - [ ] 33.1 Create reminder queue and draft review
    - Build overdue entity queue
    - Create reminder draft preview
    - Add approval controls
    - Implement send confirmation
    - _Requirements: 4.4, 5.3, 5.4_
  
  - [ ]* 33.2 Write integration tests for reminder UI
    - Test draft generation
    - Test approval workflow
    - Test send confirmation
    - _Requirements: 5.4, 5.5_

- [ ] 34. Implement Talent Sourcing UI
  - [ ] 34.1 Create candidate sourcing interface
    - Build sourcing initiation form
    - Create candidate recommendation cards
    - Add relevance score display
    - Implement save to pool functionality
    - _Requirements: 10.1, 10.4, 10.5, 10.6_
  
  - [ ] 34.2 Add skills gap integration display
    - Show skills match scores
    - Display addressed skills gaps
    - Add prioritized candidate view
    - _Requirements: 19.4, 19.5, 19.6_
  
  - [ ]* 34.3 Write integration tests for sourcing UI
    - Test candidate sourcing flow
    - Test save to pool
    - Test skills gap display
    - _Requirements: 10.1, 10.6, 19.5_

- [ ] 35. Implement Pre-Screening UI
  - [ ] 35.1 Create pre-screening invitation interface
    - Build invitation sending form
    - Create screening report display
    - Add strengths/weaknesses visualization
    - Display preparatory resources
    - _Requirements: 20.1, 20.5, 20.6, 20.8_
  
  - [ ]* 35.2 Write integration tests for pre-screening UI
    - Test invitation sending
    - Test report display
    - Test resource suggestions
    - _Requirements: 20.1, 20.5_

- [ ] 36. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 12: API Error Handling and Polish

- [ ] 37. Implement comprehensive error handling
  - [ ] 37.1 Add global error middleware
    - Create error handler for all error types
    - Implement error logging with Winston
    - Add error response formatting
    - _Requirements: 18.2, 18.3_
  
  - [ ]* 37.2 Write property tests for API error handling
    - **Property 43: HTTP Status Code Correctness**
    - **Property 44: Malformed Request Error Response**
    - **Property 45: Pagination Correctness**
    - **Validates: Requirements 18.2, 18.3, 18.4**

- [ ] 38. Add API documentation
  - Generate OpenAPI/Swagger documentation
  - Add request/response examples
  - Document authentication requirements
  - _Requirements: 18.5_

- [ ] 39. Implement monitoring and logging
  - Set up application logging
  - Add performance monitoring
  - Implement error tracking
  - Create health check endpoints
  - _Requirements: 14.3_

- [ ] 40. Final integration testing and polish
  - [ ] 40.1 Run full end-to-end test suite
    - Test complete user workflows
    - Test all API integrations
    - Verify all property tests pass
    - _Requirements: All_
  
  - [ ] 40.2 Performance optimization
    - Optimize database queries
    - Add caching where appropriate
    - Optimize frontend bundle size
    - _Requirements: 15.5_
  
  - [ ] 40.3 Security audit
    - Review authentication implementation
    - Check for SQL injection vulnerabilities
    - Verify input validation
    - Test rate limiting
    - _Requirements: 12.1, 12.5, 15.6_

- [ ] 41. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: infrastructure → services → API → frontend
- External integrations (GitHub, Kaggle, LLM, n8n) are mocked during testing and configured with real credentials for production
- All property tests should be tagged with: `Feature: idea-hub-talent-acquisition, Property N: [property text]`
