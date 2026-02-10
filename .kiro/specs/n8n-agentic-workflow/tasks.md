# Implementation Plan: n8n-based Agentic Workflow System

## Overview

This implementation plan breaks down the n8n-based agentic workflow system into discrete coding tasks. The approach follows an incremental development strategy: infrastructure setup → basic integration → agentic workflow pattern → async mode → security → observability → example use case. Each task builds on previous work, with checkpoints to validate progress.

The implementation uses TypeScript with Next.js for the web application, providing both frontend and API routes in a unified framework. The n8n engine runs in Docker with PostgreSQL for persistence.

## Tasks

- [ ] 1. Set up project infrastructure and Docker environment
  - Create project directory structure with app/ and automation/ folders
  - Create docker-compose.yml with n8n, Postgres, and webapp services
  - Configure environment variables and secrets management
  - Create Next.js application with TypeScript in app/ folder
  - Set up database schema for request tracking
  - Create README with setup instructions in automation/ folder
  - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Implement request tracking database layer
  - [ ] 2.1 Create database schema and migrations
    - Define agent_requests table with all required fields
    - Create indexes for userId, status, and createdAt
    - Write migration scripts
    - _Requirements: 11.1, 11.2_
  
  - [ ] 2.2 Implement Request Tracker service
    - Create TypeScript interfaces for AgentRequest data model
    - Implement createRequest, updateRequest, getRequest, queryRequests methods
    - Add database connection pooling
    - _Requirements: 6.7, 11.2_
  
  - [ ]* 2.3 Write property test for request persistence
    - **Property 23: Request data persistence round-trip**
    - **Validates: Requirements 11.2**
  
  - [ ]* 2.4 Write unit tests for Request Tracker
    - Test CRUD operations with specific examples
    - Test query filtering by userId, taskType, status
    - Test edge cases (non-existent requestId, invalid status transitions)
    - _Requirements: 11.2, 11.5_

- [ ] 3. Implement web application backend API endpoints
  - [ ] 3.1 Create POST /api/agent/run endpoint
    - Implement request validation and input normalization
    - Generate unique requestId using UUID
    - Store initial request with QUEUED status
    - Return response with requestId
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 3.2 Create GET /api/agent/status/:requestId endpoint
    - Implement requestId lookup in database
    - Return current status and results if available
    - Handle non-existent requestId with 404
    - _Requirements: 6.5_
  
  - [ ]* 3.3 Write property test for unique request ID generation
    - **Property 10: Unique request ID generation**
    - **Validates: Requirements 6.2**
  
  - [ ]* 3.4 Write property test for initial status
    - **Property 11: Initial status is QUEUED**
    - **Validates: Requirements 6.3**
  
  - [ ]* 3.5 Write unit tests for API endpoints
    - Test /api/agent/run with valid and invalid payloads
    - Test /api/agent/status with existing and non-existing IDs
    - Test error responses (400, 404)
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 4. Set up n8n webhook trigger and basic workflow
  - [ ] 4.1 Create n8n webhook workflow
    - Create new workflow in n8n with webhook trigger at /webhook/agent/run
    - Configure webhook to accept POST requests with JSON body
    - Add Function node to validate incoming payload structure
    - Add Respond to Webhook node for synchronous response
    - Export workflow JSON to automation/workflows/basic-agent.json
    - _Requirements: 3.1, 3.2_
  
  - [ ] 4.2 Implement webhook authentication in n8n
    - Configure webhook node with Header Auth
    - Add Function node to validate Bearer token or HMAC signature
    - Return 401 for invalid authentication
    - _Requirements: 5.1, 5.5_
  
  - [ ]* 4.3 Write property test for webhook payload acceptance
    - **Property 1: Valid webhook payloads are accepted**
    - **Validates: Requirements 3.2, 4.1**
  
  - [ ]* 4.4 Write property test for authentication validation
    - **Property 9: Authentication validation**
    - **Validates: Requirements 5.1, 5.5**
  
  - [ ]* 4.5 Write unit tests for webhook trigger
    - Test webhook endpoint exists and responds
    - Test authentication with valid and invalid tokens
    - Test HTTPS enforcement
    - _Requirements: 3.1, 5.1, 5.4, 5.5_

- [ ] 5. Integrate web app with n8n webhook
  - [ ] 5.1 Implement n8n webhook client in web app
    - Create service to call n8n webhook endpoint
    - Add authentication header (Bearer token or HMAC)
    - Handle connection errors and timeouts
    - _Requirements: 6.4_
  
  - [ ] 5.2 Connect /api/agent/run to n8n webhook
    - After storing request, invoke n8n webhook
    - Pass requestId, userId, taskType, payload, auth
    - Handle sync vs async mode based on request parameter
    - _Requirements: 6.4_
  
  - [ ]* 5.3 Write property test for n8n invocation
    - **Property 12: Request triggers n8n webhook**
    - **Validates: Requirements 6.4**
  
  - [ ]* 5.4 Write unit tests for webhook integration
    - Test successful webhook invocation
    - Test webhook failure handling
    - Test timeout scenarios
    - _Requirements: 6.4_

- [ ] 6. Checkpoint - Ensure basic flow works
  - Verify end-to-end: Submit request → Store in DB → Call n8n → Receive response
  - Test with curl or Postman
  - Check n8n execution logs
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement LLM provider integration in n8n
  - [ ] 7.1 Create LLM planning node
    - Add HTTP Request node for OpenAI API
    - Configure credentials in n8n
    - Create Function node to format planning prompt
    - Parse LLM response into structured plan
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [ ] 7.2 Create LLM reflection node
    - Add HTTP Request node for quality validation
    - Create Function node to format reflection prompt with execution results
    - Parse LLM response into validation feedback
    - _Requirements: 9.5_
  
  - [ ] 7.3 Add Anthropic support
    - Add alternative HTTP Request nodes for Anthropic API
    - Configure Anthropic credentials
    - Add Switch node to route to correct LLM provider
    - _Requirements: 9.2_
  
  - [ ]* 7.4 Write property test for LLM planning
    - **Property 19: LLM planning receives context**
    - **Validates: Requirements 9.4**
  
  - [ ]* 7.5 Write property test for LLM reflection
    - **Property 20: LLM reflection receives results**
    - **Validates: Requirements 9.5**
  
  - [ ]* 7.6 Write unit tests for LLM integration
    - Test OpenAI integration with mocked responses
    - Test Anthropic integration with mocked responses
    - Test error handling for API failures
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [ ] 8. Implement agentic workflow pattern in n8n
  - [ ] 8.1 Build validation and normalization step
    - Add Function node to validate required fields
    - Normalize data formats (dates, numbers, strings)
    - Set workflow status to RUNNING
    - _Requirements: 4.1_
  
  - [ ] 8.2 Build planning step
    - Connect to LLM planning node
    - Extract required tools from plan
    - Check for missing data
    - Store plan in workflow context
    - _Requirements: 4.2, 4.3_
  
  - [ ] 8.3 Build tool execution step
    - Add Switch node to route based on required tools
    - Create HTTP Request nodes for external APIs
    - Create Database Query nodes for data fetching
    - Aggregate tool results in Function node
    - _Requirements: 4.4, 10.1, 10.2, 10.3_
  
  - [ ] 8.4 Build reflection step
    - Connect to LLM reflection node
    - Validate output quality
    - Store reflection feedback in context
    - _Requirements: 4.5_
  
  - [ ] 8.5 Build output formatting step
    - Add Function node to format results according to task type
    - Validate output structure
    - _Requirements: 4.6_
  
  - [ ]* 8.6 Write property tests for workflow steps
    - **Property 4: Workflow invokes LLM for planning**
    - **Property 5: Tool execution follows planning**
    - **Property 6: Workflow invokes LLM for reflection**
    - **Property 7: Output formatting compliance**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**
  
  - [ ]* 8.7 Write unit tests for workflow pattern
    - Test validation with valid and invalid inputs
    - Test planning with various task types
    - Test tool execution with mocked APIs
    - Test reflection with various results
    - Test output formatting
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 9. Implement tool executor with error handling
  - [ ] 9.1 Add error handling to tool execution nodes
    - Configure error workflows for each tool node
    - Capture error details in workflow context
    - Continue workflow execution after tool failures
    - _Requirements: 10.4_
  
  - [ ] 9.2 Implement result passing between steps
    - Ensure tool results are available in subsequent nodes
    - Use workflow variables to pass data
    - _Requirements: 10.5_
  
  - [ ]* 9.3 Write property test for tool error handling
    - **Property 21: Tool failures are captured**
    - **Validates: Requirements 10.4**
  
  - [ ]* 9.4 Write property test for result passing
    - **Property 22: Tool results are passed forward**
    - **Validates: Requirements 10.5**
  
  - [ ]* 9.5 Write unit tests for tool executor
    - Test HTTP tool with successful response
    - Test HTTP tool with error response
    - Test database tool with successful query
    - Test database tool with connection error
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [ ] 10. Checkpoint - Ensure agentic workflow works
  - Test complete workflow with LLM planning and reflection
  - Verify tool execution and error handling
  - Check workflow execution logs in n8n
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement synchronous and asynchronous modes
  - [ ] 11.1 Add sync mode support
    - Configure Respond to Webhook node to return results directly
    - Set timeout to 20 seconds
    - Return formatted results in response body
    - _Requirements: 3.3, 3.5_
  
  - [ ] 11.2 Add async mode support
    - Add Switch node to detect async mode (presence of callbackUrl)
    - Return immediate acknowledgment for async requests
    - Store callbackUrl in workflow context
    - _Requirements: 3.4, 3.6_
  
  - [ ]* 11.3 Write property test for sync mode
    - **Property 2: Synchronous requests return results directly**
    - **Validates: Requirements 3.5**
  
  - [ ]* 11.4 Write unit tests for sync and async modes
    - Test sync mode with fast-completing workflow
    - Test async mode returns immediate acknowledgment
    - Test sync mode timeout handling
    - _Requirements: 3.3, 3.4, 3.5_

- [ ] 12. Implement callback handler endpoint
  - [ ] 12.1 Create POST /api/n8n/callback endpoint
    - Accept requestId, status, result, error, signature in payload
    - Implement HMAC signature verification
    - Return 401 for invalid signatures
    - _Requirements: 7.1, 7.2, 7.6_
  
  - [ ] 12.2 Implement callback processing logic
    - Update request status in database
    - Store results or error message
    - Set completedAt timestamp
    - _Requirements: 7.3, 7.4_
  
  - [ ] 12.3 Add callback invocation to n8n workflow
    - Add HTTP Request node to call callback URL
    - Generate HMAC signature for callback payload
    - Include requestId, status, result/error in payload
    - Add retry logic for callback failures
    - _Requirements: 3.6, 4.7_
  
  - [ ]* 12.4 Write property test for callback signature validation
    - **Property 13: Callback signature validation**
    - **Validates: Requirements 7.2, 7.6**
  
  - [ ]* 12.5 Write property test for callback processing
    - **Property 14: Valid callbacks update status**
    - **Property 15: Callback results are stored**
    - **Validates: Requirements 7.3, 7.4**
  
  - [ ]* 12.6 Write property test for async callback flow
    - **Property 3: Asynchronous requests trigger callbacks**
    - **Property 8: Workflow completion triggers response or callback**
    - **Validates: Requirements 3.6, 4.7**
  
  - [ ]* 12.7 Write unit tests for callback handler
    - Test callback with valid signature
    - Test callback with invalid signature
    - Test status update logic
    - Test result storage
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 13. Implement real-time status updates
  - [ ] 13.1 Add WebSocket support to web app
    - Set up WebSocket server in Next.js
    - Implement connection management
    - Create subscription mechanism for requestId
    - _Requirements: 6.6_
  
  - [ ] 13.2 Implement status update notifications
    - Trigger WebSocket messages on status changes
    - Send notifications to subscribed clients
    - Include requestId, status, result in message
    - _Requirements: 7.5_
  
  - [ ] 13.3 Add polling endpoint as fallback
    - Ensure GET /api/agent/status/:requestId supports polling
    - Add appropriate cache headers
    - _Requirements: 6.5_
  
  - [ ]* 13.4 Write property test for notifications
    - **Property 16: Status updates trigger notifications**
    - **Validates: Requirements 7.5**
  
  - [ ]* 13.5 Write unit tests for real-time updates
    - Test WebSocket connection and subscription
    - Test notification delivery
    - Test polling endpoint
    - _Requirements: 6.5, 6.6, 7.5_

- [ ] 14. Checkpoint - Ensure async flow works end-to-end
  - Test async request submission
  - Verify immediate acknowledgment
  - Verify callback invocation after workflow completion
  - Test WebSocket notifications
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement observability and logging
  - [ ] 15.1 Add request metadata logging
    - Log all fields on request creation
    - Log status transitions
    - Log input payloads and output results
    - Add timestamps for all events
    - _Requirements: 8.1, 8.2_
  
  - [ ] 15.2 Implement error notification system
    - Create notification service for Slack/Discord
    - Configure webhook URLs in environment
    - Format error notifications with context
    - _Requirements: 8.4_
  
  - [ ] 15.3 Add error notification triggers
    - Trigger on workflow failures
    - Trigger on authentication failures (after threshold)
    - Trigger on system errors
    - Include requestId, error message, timestamp
    - _Requirements: 8.5_
  
  - [ ] 15.4 Implement log querying
    - Add query endpoint for historical requests
    - Support filtering by userId, taskType, status, date range
    - Return paginated results
    - _Requirements: 8.6, 11.5_
  
  - [ ]* 15.5 Write property test for request logging
    - **Property 17: Request metadata logging**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 15.6 Write property test for error notifications
    - **Property 18: Workflow failures trigger notifications**
    - **Validates: Requirements 8.5**
  
  - [ ]* 15.7 Write unit tests for observability
    - Test logging of all request fields
    - Test error notification delivery
    - Test log querying with various filters
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6_

- [ ] 16. Implement file upload support
  - [ ] 16.1 Add file storage configuration
    - Set up local filesystem storage for development
    - Configure S3/MinIO for production (optional)
    - Create file upload endpoint
    - _Requirements: 11.3_
  
  - [ ] 16.2 Implement file upload handling
    - Accept multipart/form-data in /api/agent/run
    - Store uploaded files
    - Generate file URLs or identifiers
    - Include file references in request payload
    - _Requirements: 11.4_
  
  - [ ]* 16.3 Write property test for file uploads
    - **Property 24: File uploads are stored and referenced**
    - **Validates: Requirements 11.4**
  
  - [ ]* 16.4 Write unit tests for file uploads
    - Test file upload and storage
    - Test file reference in request data
    - Test file retrieval
    - _Requirements: 11.3, 11.4_

- [ ] 17. Implement event planning example use case
  - [ ] 17.1 Create event planning data models
    - Define EventPlanningRequest interface
    - Define EventPlanningResult interface
    - Create TypeScript types for venues, vendors, timeline, budget
    - _Requirements: 12.1_
  
  - [ ] 17.2 Create event planning n8n workflow
    - Create new workflow for taskType='event_planning'
    - Add venue API integration node
    - Add vendor database query node
    - Configure LLM to generate timeline and budget breakdown
    - Format output as EventPlanningResult
    - Export to automation/workflows/event-planning.json
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [ ] 17.3 Create frontend UI for event planning
    - Build form to accept event type, date, budget, notes
    - Submit to /api/agent/run with taskType='event_planning'
    - Display status updates in real-time
    - Render event plan results (venues, vendors, timeline, budget)
    - _Requirements: 12.1_
  
  - [ ]* 17.4 Write unit tests for event planning workflow
    - Test with various event types
    - Test venue API integration
    - Test vendor database queries
    - Test timeline generation
    - Test budget breakdown
    - Test quality validation
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [ ] 18. Final integration and testing
  - [ ] 18.1 Run all property-based tests
    - Execute all 24 property tests with 100+ iterations
    - Verify all properties pass
    - Fix any failures
  
  - [ ] 18.2 Run all unit tests
    - Execute complete unit test suite
    - Verify coverage >80%
    - Fix any failures
  
  - [ ] 18.3 Perform end-to-end integration testing
    - Test complete user journey for event planning
    - Test sync and async modes
    - Test error scenarios
    - Test concurrent requests
    - Verify logs and notifications
  
  - [ ] 18.4 Create deployment documentation
    - Document environment variables
    - Document deployment steps
    - Document monitoring and troubleshooting
    - Add to automation/README.md

- [ ] 19. Final checkpoint - Complete system validation
  - Verify all requirements are implemented
  - Verify all tests pass
  - Verify documentation is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: infrastructure → integration → features → observability
- TypeScript provides type safety across the entire stack
- Next.js simplifies deployment by combining frontend and backend in one framework
