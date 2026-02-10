# Design Document: n8n-based Agentic Workflow System

## Overview

This system provides a web application that integrates with n8n as a workflow orchestration engine to handle agentic AI tasks. Users submit requests through a web interface, which triggers n8n workflows that orchestrate LLM calls, tool execution, data fetching, and approvals. The architecture supports both synchronous and asynchronous execution modes with comprehensive security, observability, and error handling.

The system follows a microservices-inspired architecture where the web application handles user interaction and state management, while n8n handles workflow orchestration and execution. Communication between components uses webhooks with authentication, and the system maintains a clear separation of concerns between presentation, business logic, and workflow execution.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    User[User Browser]
    WebApp[Web Application<br/>Next.js/React]
    API[Backend API<br/>/api/agent/run]
    DB[(Database<br/>Request Tracker)]
    N8N[n8n Engine<br/>Docker Container]
    Postgres[(Postgres<br/>n8n Persistence)]
    LLM[LLM Provider<br/>OpenAI/Anthropic]
    External[External APIs<br/>Tools & Services]
    Callback[Callback Handler<br/>/api/n8n/callback]
    
    User -->|Submit Request| WebApp
    WebApp -->|POST /api/agent/run| API
    API -->|Store Status| DB
    API -->|Webhook POST| N8N
    N8N -->|Persist Workflows| Postgres
    N8N -->|Plan & Reflect| LLM
    N8N -->|Execute Tools| External
    N8N -->|Async Results| Callback
    Callback -->|Update Status| DB
    Callback -->|Notify| WebApp
    WebApp -->|Poll/WebSocket| API
    API -->|Query Status| DB
```

### Component Architecture

**Web Application Layer:**
- Frontend: React/Next.js with polling or WebSocket support
- Backend API: Express/FastAPI or Next.js API routes
- Request Tracker: Database service for job status management
- Callback Handler: Endpoint for receiving n8n results

**Workflow Orchestration Layer:**
- n8n Engine: Docker container running n8n
- Postgres: Persistence for n8n workflows and execution history
- Webhook Trigger: Entry point at /agent/run

**Integration Layer:**
- LLM Provider: OpenAI or Anthropic API
- External Tools: HTTP APIs, databases, third-party services
- File Storage: Optional S3/local storage for uploads

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Stack            │
│                                         │
│  ┌──────────────┐    ┌──────────────┐ │
│  │   n8n        │───▶│  Postgres    │ │
│  │   :5678      │    │   :5432      │ │
│  └──────────────┘    └──────────────┘ │
│         │                               │
└─────────┼───────────────────────────────┘
          │
          │ HTTP/Webhook
          │
┌─────────▼───────────────────────────────┐
│      Web Application Server             │
│                                         │
│  ┌──────────────┐    ┌──────────────┐ │
│  │  Next.js/    │───▶│  Database    │ │
│  │  Express     │    │  (Optional)  │ │
│  │  :3000       │    └──────────────┘ │
│  └──────────────┘                      │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Web Application Backend API

**Endpoint: POST /api/agent/run**

Request Contract:
```typescript
interface AgentRunRequest {
  userId: string;
  taskType: string;
  payload: Record<string, any>;
  mode?: 'sync' | 'async';  // Default: 'async'
}
```

Response Contract (Async):
```typescript
interface AgentRunResponse {
  requestId: string;
  status: 'QUEUED';
  message: string;
}
```

Response Contract (Sync):
```typescript
interface AgentRunResponse {
  requestId: string;
  status: 'COMPLETED' | 'FAILED';
  result?: any;
  error?: string;
}
```

**Endpoint: GET /api/agent/status/:requestId**

Response Contract:
```typescript
interface AgentStatusResponse {
  requestId: string;
  userId: string;
  taskType: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  result?: any;
  error?: string;
}
```

**Endpoint: POST /api/n8n/callback**

Request Contract:
```typescript
interface N8nCallbackRequest {
  requestId: string;
  status: 'COMPLETED' | 'FAILED';
  result?: any;
  error?: string;
  signature: string;  // HMAC signature for verification
}
```

### 2. n8n Webhook Endpoint

**Endpoint: POST /webhook/agent/run**

Request Contract:
```typescript
interface N8nWebhookRequest {
  requestId: string;
  userId: string;
  taskType: string;
  payload: Record<string, any>;
  callbackUrl?: string;  // For async mode
  auth: string;  // Bearer token or HMAC signature
}
```

Response Contract (Sync):
```typescript
interface N8nWebhookResponse {
  requestId: string;
  status: 'COMPLETED' | 'FAILED';
  result?: any;
  error?: string;
}
```

Response Contract (Async):
```typescript
interface N8nWebhookResponse {
  requestId: string;
  status: 'ACCEPTED';
  message: string;
}
```

### 3. Agent Workflow Pattern

The n8n workflow follows this structure:

```
1. Webhook Trigger
   ↓
2. Validate & Normalize
   ↓
3. Set Status to RUNNING
   ↓
4. LLM Planning Step
   ↓
5. Tool Execution (parallel/sequential)
   ↓
6. LLM Reflection Step
   ↓
7. Format Output
   ↓
8. Return or Callback
```

**Workflow Node Types:**

- **Webhook Trigger**: Receives incoming requests
- **Function Node**: Validates and normalizes input
- **HTTP Request Node**: Calls LLM provider for planning
- **Switch Node**: Routes based on required tools
- **HTTP Request Nodes**: Execute external API calls
- **Database Nodes**: Query databases
- **Function Node**: Aggregates tool results
- **HTTP Request Node**: Calls LLM provider for reflection
- **Function Node**: Formats final output
- **HTTP Request Node**: Sends callback (async mode)
- **Respond to Webhook**: Returns result (sync mode)

### 4. Request Tracker Database Schema

```sql
CREATE TABLE agent_requests (
  request_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  input_payload JSONB NOT NULL,
  output_result JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 5. Authentication and Security

**Webhook Authentication Options:**

1. **Bearer Token** (Simplest):
```
Authorization: Bearer <secret-token>
```

2. **HMAC Signature** (Most Secure):
```
X-Signature: sha256=<hmac-sha256-hex>
```
Computed as: `HMAC-SHA256(secret, request_body)`

3. **Basic Auth**:
```
Authorization: Basic <base64(username:password)>
```

**Implementation in n8n:**
- Use "Webhook" node with "Header Auth" option
- Store credentials in n8n credentials manager
- Validate in first Function node of workflow

**Callback Security:**
- Web app generates HMAC signature when calling n8n
- n8n includes same signature in callback
- Callback handler verifies signature before processing

### 6. LLM Provider Integration

**Planning Prompt Structure:**
```typescript
interface PlanningPrompt {
  system: string;  // Role and instructions
  user: string;    // Task description and context
}

// Example:
{
  system: "You are a planning agent. Analyze the task and generate a structured execution plan.",
  user: `Task: ${taskType}
Input: ${JSON.stringify(payload)}
Generate a plan with: 1) Required tools, 2) Execution steps, 3) Expected outputs`
}
```

**Planning Response Structure:**
```typescript
interface PlanningResponse {
  tools: string[];  // ['venue_api', 'vendor_db', 'timeline_generator']
  steps: Array<{
    step: number;
    action: string;
    tool: string;
    parameters: Record<string, any>;
  }>;
  missingData: string[];  // Fields needed but not provided
}
```

**Reflection Prompt Structure:**
```typescript
interface ReflectionPrompt {
  system: string;
  user: string;  // Includes original task, plan, and execution results
}

// Example:
{
  system: "You are a quality assurance agent. Validate the execution results.",
  user: `Task: ${taskType}
Plan: ${JSON.stringify(plan)}
Results: ${JSON.stringify(toolResults)}
Validate: 1) Completeness, 2) Accuracy, 3) Format correctness`
}
```

**Reflection Response Structure:**
```typescript
interface ReflectionResponse {
  valid: boolean;
  issues: string[];
  suggestions: string[];
  confidence: number;  // 0-1
}
```

### 7. Tool Executor Interface

**Tool Registry:**
```typescript
interface ToolDefinition {
  name: string;
  type: 'http' | 'database' | 'function';
  config: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    query?: string;
    connection?: string;
  };
}

// Example tools:
const tools: Record<string, ToolDefinition> = {
  venue_api: {
    name: 'venue_api',
    type: 'http',
    config: {
      url: 'https://api.venues.com/search',
      method: 'GET',
      headers: { 'Authorization': 'Bearer {{credentials}}' }
    }
  },
  vendor_db: {
    name: 'vendor_db',
    type: 'database',
    config: {
      query: 'SELECT * FROM vendors WHERE category = $1',
      connection: 'postgres_main'
    }
  }
};
```

**Tool Execution Result:**
```typescript
interface ToolResult {
  tool: string;
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}
```

### 8. Frontend Integration

**Polling Implementation:**
```typescript
async function pollStatus(requestId: string): Promise<AgentStatusResponse> {
  const maxAttempts = 60;  // 5 minutes with 5-second intervals
  const interval = 5000;
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/agent/status/${requestId}`);
    const status = await response.json();
    
    if (status.status === 'COMPLETED' || status.status === 'FAILED') {
      return status;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for result');
}
```

**WebSocket Implementation:**
```typescript
interface WebSocketMessage {
  type: 'status_update';
  requestId: string;
  status: string;
  result?: any;
  error?: string;
}

// Client:
const ws = new WebSocket('ws://localhost:3000/ws');
ws.send(JSON.stringify({ type: 'subscribe', requestId }));

ws.onmessage = (event) => {
  const message: WebSocketMessage = JSON.parse(event.data);
  if (message.type === 'status_update') {
    updateUI(message);
  }
};
```

## Data Models

### AgentRequest
```typescript
interface AgentRequest {
  requestId: string;
  userId: string;
  taskType: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  inputPayload: Record<string, any>;
  outputResult?: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### WorkflowExecution
```typescript
interface WorkflowExecution {
  executionId: string;
  requestId: string;
  workflowId: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  plan?: PlanningResponse;
  toolResults?: ToolResult[];
  reflection?: ReflectionResponse;
  n8nExecutionId: string;  // Reference to n8n's internal execution ID
}
```

### EventPlanningRequest (Example Use Case)
```typescript
interface EventPlanningRequest {
  eventType: string;  // 'conference', 'wedding', 'corporate'
  date: string;       // ISO date
  budget: number;
  attendees?: number;
  location?: string;
  notes?: string;
}
```

### EventPlanningResult (Example Use Case)
```typescript
interface EventPlanningResult {
  venues: Array<{
    name: string;
    capacity: number;
    price: number;
    availability: boolean;
    amenities: string[];
  }>;
  vendors: Array<{
    name: string;
    category: string;
    price: number;
    rating: number;
  }>;
  timeline: Array<{
    time: string;
    activity: string;
    duration: number;
  }>;
  budgetBreakdown: {
    venue: number;
    catering: number;
    entertainment: number;
    decorations: number;
    miscellaneous: number;
    total: number;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Valid webhook payloads are accepted

*For any* valid JSON payload containing requestId, userId, taskType, payload, callbackUrl, and auth fields, the webhook endpoint should accept the request and not return a validation error.

**Validates: Requirements 3.2, 4.1**

### Property 2: Synchronous requests return results directly

*For any* request with mode='sync' that completes within the timeout period, the webhook endpoint should return the execution results directly in the HTTP response body.

**Validates: Requirements 3.5**

### Property 3: Asynchronous requests trigger callbacks

*For any* request with mode='async', the webhook endpoint should return an immediate acknowledgment and subsequently invoke the provided callbackUrl with the execution results.

**Validates: Requirements 3.6**

### Property 4: Workflow invokes LLM for planning

*For any* validated input, the agent workflow should invoke the LLM provider with the input context and receive a structured execution plan before proceeding to tool execution.

**Validates: Requirements 4.2, 4.3**

### Property 5: Tool execution follows planning

*For any* generated execution plan, the tool executor should execute all identified tools in the plan and collect their results.

**Validates: Requirements 4.4**

### Property 6: Workflow invokes LLM for reflection

*For any* completed tool execution, the agent workflow should invoke the LLM provider with the execution results and receive quality validation feedback.

**Validates: Requirements 4.5**

### Property 7: Output formatting compliance

*For any* workflow execution, the final output should conform to the specified output format for the given task type.

**Validates: Requirements 4.6**

### Property 8: Workflow completion triggers response or callback

*For any* completed workflow execution, the system should either return results in the HTTP response (sync mode) or invoke the callback URL (async mode), but not both.

**Validates: Requirements 4.7**

### Property 9: Authentication validation

*For any* incoming webhook request, the system should accept requests with valid authentication (Bearer token, HMAC signature, or Basic Auth) and reject requests with invalid or missing authentication.

**Validates: Requirements 5.1, 5.5**

### Property 10: Unique request ID generation

*For any* request submitted to /api/agent/run, the system should generate a unique requestId that does not collide with any existing requestId in the system.

**Validates: Requirements 6.2**

### Property 11: Initial status is QUEUED

*For any* new request submitted to /api/agent/run, the initial status stored in the Request_Tracker should be 'QUEUED'.

**Validates: Requirements 6.3**

### Property 12: Request triggers n8n webhook

*For any* request submitted to /api/agent/run, the system should invoke the n8n webhook endpoint with the request payload.

**Validates: Requirements 6.4**

### Property 13: Callback signature validation

*For any* callback request to /api/n8n/callback, the system should verify the signature or token, accepting valid signatures and rejecting invalid ones.

**Validates: Requirements 7.2, 7.6**

### Property 14: Valid callbacks update status

*For any* callback with a valid signature, the system should update the job status in the Request_Tracker to match the status provided in the callback payload.

**Validates: Requirements 7.3**

### Property 15: Callback results are stored

*For any* callback with a valid signature, the system should extract the results from the callback payload and store them in the Request_Tracker associated with the requestId.

**Validates: Requirements 7.4**

### Property 16: Status updates trigger notifications

*For any* successful status update in the Request_Tracker, the system should send notifications to all connected frontend clients subscribed to that requestId.

**Validates: Requirements 7.5**

### Property 17: Request metadata logging

*For any* request processed by the system, the Request_Tracker should log the requestId, userId, taskType, status, timestamps, input payload, and output results.

**Validates: Requirements 8.1, 8.2**

### Property 18: Workflow failures trigger notifications

*For any* workflow execution that fails, the system should send an error notification through the configured notification channel (Slack/Discord) with relevant context including requestId, error message, and failure timestamp.

**Validates: Requirements 8.5**

### Property 19: LLM planning receives context

*For any* planning step execution, the agent workflow should send the complete input context to the LLM provider and receive a structured plan containing tools, steps, and missing data checks.

**Validates: Requirements 9.4**

### Property 20: LLM reflection receives results

*For any* reflection step execution, the agent workflow should send the execution results to the LLM provider and receive quality validation feedback containing validity status, issues, and suggestions.

**Validates: Requirements 9.5**

### Property 21: Tool failures are captured

*For any* tool execution that fails, the tool executor should capture the error details and include them in the workflow context for subsequent steps.

**Validates: Requirements 10.4**

### Property 22: Tool results are passed forward

*For any* successful tool execution, the tool executor should pass the execution results to subsequent workflow steps in the execution context.

**Validates: Requirements 10.5**

### Property 23: Request data persistence round-trip

*For any* request submitted to the system, storing the request data and then retrieving it by requestId should return equivalent data for all fields (requestId, userId, taskType, status, timestamps, input payload, output results).

**Validates: Requirements 11.2**

### Property 24: File uploads are stored and referenced

*For any* request that includes file uploads, the system should store the files and include URL or identifier references to them in the stored request data.

**Validates: Requirements 11.4**

## Error Handling

### Error Categories

**1. Input Validation Errors**
- Missing required fields (requestId, userId, taskType, payload)
- Invalid field types or formats
- Malformed JSON payloads
- Response: 400 Bad Request with detailed error message

**2. Authentication Errors**
- Missing authentication credentials
- Invalid Bearer token
- Invalid HMAC signature
- Expired credentials
- Response: 401 Unauthorized with error message

**3. Workflow Execution Errors**
- LLM provider API failures
- Tool execution failures (HTTP errors, database errors)
- Timeout errors (sync mode exceeds time limit)
- Response: 500 Internal Server Error (sync) or callback with error status (async)

**4. Resource Not Found Errors**
- Invalid requestId in status queries
- Missing workflow configuration
- Response: 404 Not Found with error message

**5. Rate Limiting Errors**
- Too many requests from a single user
- LLM provider rate limits exceeded
- Response: 429 Too Many Requests with retry-after header

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    requestId?: string;
    timestamp: string;
  };
}
```

### Error Handling in n8n Workflows

**Error Node Pattern:**
```
Main Workflow Path
    ↓
[On Error] → Error Handler Node
              ↓
              Log Error
              ↓
              Send Notification
              ↓
              Format Error Response
              ↓
              Return/Callback with Error
```

**Retry Logic:**
- LLM API calls: 3 retries with exponential backoff (1s, 2s, 4s)
- HTTP tool calls: 2 retries with 1s delay
- Database queries: 2 retries with 500ms delay
- Callback invocations: 3 retries with exponential backoff (2s, 4s, 8s)

**Timeout Configuration:**
- Sync mode: 20 seconds total timeout
- Async mode: 5 minutes total timeout
- Individual LLM calls: 30 seconds
- Individual tool calls: 10 seconds

### Error Logging

All errors should be logged with:
- Timestamp
- Request ID
- User ID
- Error type and message
- Stack trace (for system errors)
- Input context
- Workflow execution state

### Error Notifications

**Notification Triggers:**
- Any workflow execution failure
- Authentication failures (after 5 consecutive failures from same source)
- System errors (database connection failures, n8n unavailability)
- Rate limit violations

**Notification Content:**
```typescript
interface ErrorNotification {
  severity: 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  requestId?: string;
  userId?: string;
  timestamp: string;
  stackTrace?: string;
}
```

## Testing Strategy

### Dual Testing Approach

This system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of valid and invalid inputs
- Edge cases (empty payloads, missing fields, boundary values)
- Error conditions (authentication failures, timeout scenarios)
- Integration points (webhook calls, database operations, LLM API calls)
- Example use case (event planning workflow)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Invariants that must be maintained across all executions
- Round-trip properties (data persistence, serialization)

### Property-Based Testing Configuration

**Testing Library Selection:**
- **TypeScript/JavaScript**: fast-check
- **Python**: Hypothesis
- **Go**: gopter

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: n8n-agentic-workflow, Property {number}: {property_text}`

### Unit Testing Strategy

**Web Application Backend:**
- Test /api/agent/run endpoint with valid and invalid requests
- Test /api/agent/status/:requestId with existing and non-existing IDs
- Test /api/n8n/callback with valid and invalid signatures
- Test database operations (create, read, update)
- Test WebSocket connection and message broadcasting
- Mock n8n webhook calls to avoid external dependencies

**n8n Workflow Testing:**
- Test webhook trigger with various payloads
- Test validation and normalization logic
- Test LLM integration with mocked responses
- Test tool execution with mocked external APIs
- Test error handling and retry logic
- Test callback invocation

**Integration Testing:**
- End-to-end test: Submit request → n8n execution → callback → status update
- Test sync mode with fast-completing workflows
- Test async mode with long-running workflows
- Test authentication flow
- Test error notification delivery

### Property-Based Testing Strategy

Each correctness property should be implemented as a property-based test:

**Example Property Test (TypeScript with fast-check):**
```typescript
import fc from 'fast-check';

// Feature: n8n-agentic-workflow, Property 10: Unique request ID generation
test('Property 10: All generated request IDs are unique', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        userId: fc.string(),
        taskType: fc.string(),
        payload: fc.object()
      }), { minLength: 10, maxLength: 100 }),
      async (requests) => {
        const requestIds = new Set<string>();
        
        for (const req of requests) {
          const response = await fetch('/api/agent/run', {
            method: 'POST',
            body: JSON.stringify(req)
          });
          const data = await response.json();
          
          // Check uniqueness
          expect(requestIds.has(data.requestId)).toBe(false);
          requestIds.add(data.requestId);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Example Property Test (Python with Hypothesis):**
```python
from hypothesis import given, strategies as st

# Feature: n8n-agentic-workflow, Property 23: Request data persistence round-trip
@given(st.builds(
    dict,
    userId=st.text(min_size=1),
    taskType=st.text(min_size=1),
    payload=st.dictionaries(st.text(), st.text())
))
def test_property_23_persistence_round_trip(request_data):
    # Submit request
    response = client.post('/api/agent/run', json=request_data)
    request_id = response.json()['requestId']
    
    # Retrieve request
    stored = client.get(f'/api/agent/status/{request_id}').json()
    
    # Verify round-trip
    assert stored['userId'] == request_data['userId']
    assert stored['taskType'] == request_data['taskType']
    assert stored['inputPayload'] == request_data['payload']
```

### Test Coverage Goals

- Unit test coverage: >80% for web application code
- Property test coverage: All 24 correctness properties implemented
- Integration test coverage: All critical user flows
- Error path coverage: All error categories tested

### Testing Environment

**Local Development:**
- Docker Compose with test database
- Mocked LLM provider responses
- Mocked external tool APIs
- In-memory n8n instance for fast testing

**CI/CD Pipeline:**
- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests before deployment
- Generate coverage reports

### Manual Testing Checklist

- [ ] Submit event planning request through web UI
- [ ] Verify status updates in real-time (polling or WebSocket)
- [ ] Test authentication with valid and invalid tokens
- [ ] Test sync mode with fast workflow
- [ ] Test async mode with long workflow
- [ ] Trigger error scenarios and verify notifications
- [ ] Test with multiple concurrent requests
- [ ] Verify logs in n8n execution history
- [ ] Test file upload functionality
- [ ] Query historical requests

## Implementation Notes

### Technology Stack Recommendations

**Web Application:**
- **Next.js** (Recommended): Provides both frontend and API routes in one framework, simplifies deployment
- **Alternative**: React + Express (more flexibility, separate frontend/backend)

**Database:**
- **PostgreSQL** (Recommended): Already required for n8n, can reuse for request tracking
- **Alternative**: MongoDB for flexible schema, separate from n8n database

**Real-time Communication:**
- **WebSockets** (Recommended): Better for real-time updates, lower latency
- **Alternative**: Server-Sent Events (SSE) for simpler one-way communication

**File Storage:**
- **Local filesystem** (Development): Simple, no external dependencies
- **S3/MinIO** (Production): Scalable, reliable, industry standard

### Development Workflow

1. **Phase 1: Infrastructure Setup**
   - Set up Docker Compose with n8n and Postgres
   - Create basic Next.js application structure
   - Set up database schema for request tracking

2. **Phase 2: Basic Webhook Integration**
   - Implement /api/agent/run endpoint
   - Create simple n8n webhook workflow
   - Test end-to-end communication

3. **Phase 3: Agentic Workflow Pattern**
   - Implement LLM integration in n8n
   - Build validation, planning, execution, reflection steps
   - Add tool executor nodes

4. **Phase 4: Async Mode and Callbacks**
   - Implement callback handler endpoint
   - Add callback invocation to n8n workflow
   - Test async execution flow

5. **Phase 5: Security and Observability**
   - Add authentication to webhooks
   - Implement logging and monitoring
   - Set up error notifications

6. **Phase 6: Example Use Case**
   - Build event planning workflow
   - Create frontend UI for event planning
   - Test complete user journey

### Deployment Considerations

**Docker Compose Production Setup:**
```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    restart: always
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  webapp:
    build: ./app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - N8N_WEBHOOK_URL=http://n8n:5678/webhook/agent/run
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/webapp
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
    depends_on:
      - postgres
      - n8n

volumes:
  n8n_data:
  postgres_data:
```

**Environment Variables:**
- `N8N_USER`, `N8N_PASSWORD`: n8n basic auth credentials
- `POSTGRES_USER`, `POSTGRES_PASSWORD`: Database credentials
- `WEBHOOK_SECRET`: Shared secret for HMAC signature verification
- `OPENAI_API_KEY`: OpenAI API key for LLM calls
- `ANTHROPIC_API_KEY`: Anthropic API key for LLM calls
- `SLACK_WEBHOOK_URL`: Slack webhook for error notifications

**Scaling Considerations:**
- n8n can be scaled horizontally with queue mode (requires Redis)
- Web application can be scaled horizontally behind a load balancer
- Database should use connection pooling
- Consider rate limiting at the API gateway level

### Security Best Practices

1. **Never expose n8n directly to the internet** - always use reverse proxy
2. **Use HTTPS in production** - configure SSL certificates
3. **Rotate webhook secrets regularly** - implement secret rotation mechanism
4. **Implement rate limiting** - prevent abuse and DoS attacks
5. **Validate all inputs** - never trust client data
6. **Use environment variables for secrets** - never commit secrets to git
7. **Implement audit logging** - track all authentication attempts
8. **Use least privilege principle** - limit database and API permissions
