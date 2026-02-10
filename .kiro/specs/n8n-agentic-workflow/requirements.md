# Requirements Document

## Introduction

This document specifies the requirements for an n8n-based agentic workflow system that enables users to submit requests through a web application, which triggers n8n workflows to orchestrate LLM calls, tool execution, data fetching, and approvals. The system provides both synchronous and asynchronous execution modes with comprehensive observability and security features.

## Glossary

- **Web_App**: The frontend and backend application that provides the user interface and API endpoints
- **n8n_Engine**: The workflow orchestration engine running in Docker that executes agentic workflows
- **Webhook_Endpoint**: The n8n webhook trigger that receives requests from the Web_App
- **Request_Tracker**: The component that manages job status and execution state
- **Callback_Handler**: The backend endpoint that receives results from n8n_Engine
- **LLM_Provider**: External AI service (OpenAI/Anthropic) used for planning and reflection
- **Tool_Executor**: The n8n component that performs HTTP requests, database queries, and API integrations
- **Agent_Workflow**: The n8n workflow pattern that includes validation, planning, execution, reflection, and output formatting

## Requirements

### Requirement 1: Project Structure and Technology Stack

**User Story:** As a developer, I want a well-organized project structure with clear separation between web application and automation components, so that I can easily navigate and maintain the codebase.

#### Acceptance Criteria

1. THE System SHALL organize code into an app/ folder for web application components and an automation/ folder for n8n configuration
2. THE Web_App SHALL use Next.js with API routes OR React with Express/FastAPI as the technology stack
3. THE automation/ folder SHALL contain n8n configuration files, documentation, and workflow examples
4. THE System SHALL provide clear documentation for the project structure in the automation/ folder

### Requirement 2: n8n Engine Deployment

**User Story:** As a system administrator, I want n8n deployed in a containerized environment with persistent storage, so that workflows are reliable and maintainable.

#### Acceptance Criteria

1. THE n8n_Engine SHALL run in a Docker container managed by docker-compose
2. THE n8n_Engine SHALL use Postgres as the persistence layer for workflow data
3. THE System SHALL provide a docker-compose configuration that includes n8n_Engine and Postgres services
4. THE System SHALL support local development environment setup for n8n_Engine
5. THE docker-compose configuration SHALL define appropriate volume mounts for data persistence

### Requirement 3: Webhook Entry Point

**User Story:** As a web application, I want to trigger n8n workflows through a webhook endpoint, so that I can initiate agentic tasks programmatically.

#### Acceptance Criteria

1. THE n8n_Engine SHALL expose a webhook trigger at the path /agent/run
2. WHEN a request is received at /agent/run, THE Webhook_Endpoint SHALL accept a JSON payload containing requestId, userId, taskType, payload, callbackUrl, and auth fields
3. THE Webhook_Endpoint SHALL support synchronous response mode for requests expected to complete within 10-20 seconds
4. THE Webhook_Endpoint SHALL support asynchronous response mode for long-running requests
5. WHEN operating in synchronous mode, THE Webhook_Endpoint SHALL return results directly in the HTTP response
6. WHEN operating in asynchronous mode, THE Webhook_Endpoint SHALL return an acknowledgment immediately and invoke the callbackUrl when processing completes

### Requirement 4: Agentic Workflow Pattern

**User Story:** As a workflow designer, I want a structured pattern for agentic workflows, so that all agent tasks follow consistent processing steps.

#### Acceptance Criteria

1. THE Agent_Workflow SHALL validate and normalize input data as the first step
2. WHEN inputs are validated, THE Agent_Workflow SHALL invoke the LLM_Provider to generate an execution plan
3. THE Agent_Workflow SHALL identify required tools and check for missing data during the planning step
4. WHEN the plan is generated, THE Tool_Executor SHALL execute the identified tools including HTTP requests, database queries, and API integrations
5. WHEN tool execution completes, THE Agent_Workflow SHALL invoke the LLM_Provider to perform reflection and quality validation
6. THE Agent_Workflow SHALL format the output according to the specified format
7. WHEN output formatting completes, THE Agent_Workflow SHALL return results or invoke the callback endpoint

### Requirement 5: Security and Authentication

**User Story:** As a security engineer, I want robust authentication and network protection for webhook endpoints, so that only authorized requests can trigger workflows.

#### Acceptance Criteria

1. THE Webhook_Endpoint SHALL authenticate incoming requests using Bearer token, HMAC signature, or Basic Auth
2. THE System SHALL support reverse proxy configuration for network protection
3. THE System SHALL support IP allowlisting for the Webhook_Endpoint
4. THE System SHALL enforce HTTPS for all webhook communications
5. WHEN an unauthenticated request is received, THE Webhook_Endpoint SHALL reject it with an appropriate error response

### Requirement 6: Web Application Integration

**User Story:** As a frontend developer, I want backend endpoints that handle workflow orchestration and status tracking, so that users can submit requests and monitor progress.

#### Acceptance Criteria

1. THE Web_App SHALL provide a backend endpoint at /api/agent/run that accepts user requests
2. WHEN a request is received at /api/agent/run, THE Web_App SHALL generate a unique requestId
3. THE Web_App SHALL store the initial job status as QUEUED in the Request_Tracker
4. WHEN the requestId is generated, THE Web_App SHALL invoke the n8n_Engine Webhook_Endpoint with the request payload
5. THE Web_App SHALL support frontend polling for job status updates
6. THE Web_App SHALL support WebSocket connections for real-time job status updates
7. THE Request_Tracker SHALL maintain job status values: QUEUED, RUNNING, COMPLETED, and FAILED

### Requirement 7: Callback Endpoint

**User Story:** As a backend developer, I want an endpoint that receives workflow results from n8n, so that I can update job status and notify users.

#### Acceptance Criteria

1. THE Web_App SHALL provide a Callback_Handler endpoint at /api/n8n/callback
2. WHEN the Callback_Handler receives a request, THE Web_App SHALL verify the signature or token
3. WHEN signature verification succeeds, THE Callback_Handler SHALL update the job status in the Request_Tracker
4. THE Callback_Handler SHALL extract results from the callback payload and store them
5. WHEN the database is updated, THE Callback_Handler SHALL send notifications to connected frontend clients
6. WHEN signature verification fails, THE Callback_Handler SHALL reject the request with an error response

### Requirement 8: Observability and Monitoring

**User Story:** As a system operator, I want comprehensive logging and monitoring capabilities, so that I can track request execution and diagnose issues.

#### Acceptance Criteria

1. THE Request_Tracker SHALL log requestId, userId, status, and timestamps for all requests
2. THE System SHALL log input payloads and output results for each request
3. THE n8n_Engine SHALL maintain execution logs for all workflow runs
4. THE System SHALL support error notifications through Slack or Discord integrations
5. WHEN a workflow fails, THE System SHALL send an error notification with relevant context
6. THE System SHALL provide queryable logs for debugging and auditing purposes

### Requirement 9: LLM Provider Integration

**User Story:** As a workflow designer, I want seamless integration with LLM providers, so that workflows can leverage AI capabilities for planning and reflection.

#### Acceptance Criteria

1. THE Agent_Workflow SHALL support OpenAI as an LLM_Provider
2. THE Agent_Workflow SHALL support Anthropic as an LLM_Provider
3. THE System SHALL store LLM_Provider API credentials securely in n8n_Engine configuration
4. WHEN the planning step executes, THE Agent_Workflow SHALL send the input context to the LLM_Provider and receive a structured plan
5. WHEN the reflection step executes, THE Agent_Workflow SHALL send the execution results to the LLM_Provider and receive quality validation feedback

### Requirement 10: Tool Execution Capabilities

**User Story:** As a workflow designer, I want the ability to execute various tools and integrations, so that workflows can interact with external systems and data sources.

#### Acceptance Criteria

1. THE Tool_Executor SHALL support HTTP requests to external APIs
2. THE Tool_Executor SHALL support database queries to relational databases
3. THE Tool_Executor SHALL support custom API integrations configured in n8n_Engine
4. WHEN a tool execution fails, THE Tool_Executor SHALL capture the error and include it in the workflow context
5. THE Tool_Executor SHALL pass tool execution results to subsequent workflow steps

### Requirement 11: Data Storage and Persistence

**User Story:** As a backend developer, I want persistent storage for request tracking and results, so that users can retrieve historical data.

#### Acceptance Criteria

1. THE System SHALL provide a database for storing request metadata and results
2. THE Request_Tracker SHALL persist requestId, userId, taskType, status, timestamps, input payload, and output results
3. THE System SHALL support file storage for uploaded files referenced in requests
4. WHEN a request includes file uploads, THE System SHALL store files and reference them by URL or identifier
5. THE System SHALL support querying historical requests by userId, taskType, status, and date range

### Requirement 12: Example Use Case Implementation

**User Story:** As a user, I want to submit event planning requests and receive comprehensive event plans, so that I can organize events efficiently.

#### Acceptance Criteria

1. THE Web_App SHALL accept event planning requests with event type, date, budget, and notes
2. WHEN an event planning request is received, THE Agent_Workflow SHALL query venue APIs for available venues
3. THE Agent_Workflow SHALL query vendor databases for relevant vendors
4. THE Agent_Workflow SHALL generate a timeline for the event using the LLM_Provider
5. THE Agent_Workflow SHALL generate a budget breakdown based on the provided budget
6. WHEN all data is collected, THE Agent_Workflow SHALL validate the quality of the generated plan
7. THE Agent_Workflow SHALL return a structured event plan containing venues, vendors, timeline, and budget breakdown
