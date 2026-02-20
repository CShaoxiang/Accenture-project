# Agent Backend - Phase 2: Backend Core (FastAPI + Observability)

## Overview

This is a production-ready FastAPI service implementing:

✅ **Multi-tenant JWT authentication** with cryptographic signature verification
✅ **Tenant isolation** at database level
✅ **Observability** with structured logging
✅ **Agent task execution framework** with status tracking
✅ **RESTful API** with proper error handling

## Architecture

```
┌─────────────────────────────────────────┐
│      Client (with JWT Token)            │
└────────────────┬────────────────────────┘
                 │ Authorization: Bearer <token>
                 ▼
        ┌────────────────────┐
        │  FastAPI Router    │
        └────────┬───────────┘
                 │
        ┌────────▼──────────────────┐
        │ JWT Middleware             │
        │ - Verify signature         │
        │ - Extract tenant_id        │
        │ - Validate tenant in DB    │
        └────────┬──────────────────┘
                 │
        ┌────────▼──────────────────┐
        │ Route Handler              │
        │ - Tenant context injected  │
        │ - User context available   │
        └────────┬──────────────────┘
                 │
        ┌────────▼──────────────────┐
        │ Database (Tenant-scoped)   │
        │ - Tenants table            │
        │ - Users (tenant_id FK)     │
        │ - AgentTasks (tenant_id FK)│
        └────────────────────────────┘
```

## Key Features

### 1. **JWT Authentication (Secure)**
- ✅ Full JWT signature verification (was disabled before)
- ✅ Token expiration validation
- ✅ tenant_id and user_id extraction from token
- ✅ Bearer token from Authorization header

### 2. **Multi-Tenant Architecture**
- ✅ Tenant table with unique tenant_id
- ✅ Automatic tenant context injection via middleware
- ✅ Tenant-scoped queries (tenant isolation)
- ✅ No cross-tenant data leakage

### 3. **Observability & Logging**
- ✅ Structured logging for all requests/responses
- ✅ Request timing measurements
- ✅ Error logging with stack traces
- ✅ Audit trail for authentication events

### 4. **Agent Framework**
- ✅ AgentTask model for task execution
- ✅ Create tasks: `POST /agent/task`
- ✅ Query tasks: `GET /agent/task/{task_id}`
- ✅ Task status tracking (pending, running, completed, failed)
- ✅ Input/output data storage (JSON)

## Setup & Installation

### 1. Install Dependencies
```powershell
cd d:\repo-Accenture-project\agent-backend
pip install -r requirements.txt
```

### 2. Configure Environment
```powershell
# Copy template
Copy-Item .env.example .env

# Edit .env with your values:
# - DATABASE_URL (SQLite for dev, PostgreSQL for prod)
# - JWT_SECRET (use a strong random string!)
```

### 3. Run the Service
```powershell
python main.py
# or with uvicorn directly:
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Access API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
```
GET /health
Response: {"status": "healthy", "service": "agent-backend", "timestamp": "2026-02-20T..."}
```

### Register Tenant (Admin Only)
```
POST /auth/register-tenant?tenant_name=Accenture&api_key=secret123
Response: {
  "status": "success",
  "tenant_id": "uuid-xxx",
  "message": "Tenant 'Accenture' registered successfully"
}
```

### Create JWT Token
```
POST /auth/token?tenant_id=uuid-xxx&user_id=1&username=john
Response: {
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Create Agent Task
```
POST /agent/task
Authorization: Bearer <token>
Content-Type: application/json

{
  "task_name": "process_invoice",
  "input_data": {
    "invoice_id": 123,
    "amount": 5000
  }
}

Response: {
  "task_id": 1,
  "status": "pending",
  "created_at": "2026-02-20T10:30:45.123456"
}
```

### Get Task Status
```
GET /agent/task/1
Authorization: Bearer <token>

Response: {
  "task_id": 1,
  "task_name": "process_invoice",
  "status": "pending",
  "input_data": {"invoice_id": 123, "amount": 5000},
  "output_data": null,
  "created_at": "2026-02-20T10:30:45.123456",
  "completed_at": null,
  "error_message": null
}
```

## Testing Multi-Tenant Isolation

```python
# Example test scenario:
# 1. Register two tenants
# 2. Create tasks for each tenant with different tokens
# 3. Verify each tenant only sees their own tasks

import requests
import json

BASE_URL = "http://localhost:8000"

# Register Tenant A
resp_a = requests.post(f"{BASE_URL}/auth/register-tenant", 
    params={"tenant_name": "CompanyA", "api_key": "key_a"})
tenant_a = resp_a.json()["tenant_id"]

# Register Tenant B
resp_b = requests.post(f"{BASE_URL}/auth/register-tenant",
    params={"tenant_name": "CompanyB", "api_key": "key_b"})
tenant_b = resp_b.json()["tenant_id"]

# Get tokens
token_a = requests.post(f"{BASE_URL}/auth/token",
    params={"tenant_id": tenant_a, "user_id": 1, "username": "user_a"}).json()["access_token"]

token_b = requests.post(f"{BASE_URL}/auth/token",
    params={"tenant_id": tenant_b, "user_id": 1, "username": "user_b"}).json()["access_token"]

# Create task in Tenant A
task_a = requests.post(f"{BASE_URL}/agent/task",
    headers={"Authorization": f"Bearer {token_a}"},
    json={"task_name": "task_a", "input_data": {"test": "a"}}).json()

# Create task in Tenant B
task_b = requests.post(f"{BASE_URL}/agent/task",
    headers={"Authorization": f"Bearer {token_b}"},
    json={"task_name": "task_b", "input_data": {"test": "b"}}).json()

# Verify isolation: Tenant A user can only see task_a
print("Tenant A sees task_a:", 
    requests.get(f"{BASE_URL}/agent/task/{task_a['task_id']}",
    headers={"Authorization": f"Bearer {token_a}"}).status_code == 200)  # ✅ 200

print("Tenant A cannot see task_b:", 
    requests.get(f"{BASE_URL}/agent/task/{task_b['task_id']}",
    headers={"Authorization": f"Bearer {token_a}"}).status_code == 404)  # ✅ 404
```

## Security Features

| Feature | Status | Notes |
|---------|--------|-------|
| JWT Signature Verification | ✅ | Full cryptographic verification |
| Token Expiration | ✅ | 24-hour default expiry |
| Tenant Isolation | ✅ | Foreign key constraints + query filters |
| Bearer Token Parsing | ✅ | HTTPBearer dependency |
| CORS Support | ✅ | Configurable origins |
| Request Logging | ✅ | All requests/responses logged |
| Error Handling | ✅ | Graceful error responses |

## Logging Examples

```
2026-02-20 10:30:45,123 - root - INFO - [REQUEST] POST /agent/task | Client: 127.0.0.1
2026-02-20 10:30:45,234 - root - INFO - Agent task created: 1 (tenant=uuid-xxx, task=process_invoice)
2026-02-20 10:30:45,235 - root - INFO - [RESPONSE] POST /agent/task | Status: 200 | Duration: 0.112s
2026-02-20 10:30:46,000 - root - INFO - [REQUEST] GET /agent/task/1 | Client: 127.0.0.1
2026-02-20 10:30:46,050 - root - INFO - [RESPONSE] GET /agent/task/1 | Status: 200 | Duration: 0.050s
```

## Database Schema

```sql
-- Tenants
CREATE TABLE tenants (
    id INTEGER PRIMARY KEY,
    tenant_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    api_key VARCHAR UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Users (Tenant-scoped)
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    username VARCHAR,
    email VARCHAR UNIQUE,
    hashed_password VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agent Tasks (Tenant-scoped)
CREATE TABLE agent_tasks (
    id INTEGER PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    task_name VARCHAR,
    status VARCHAR DEFAULT 'pending',
    input_data TEXT,  -- JSON
    output_data TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    error_message VARCHAR
);
```

## Next Steps (Phase 2.5 - Advanced Observability)

1. **Metrics Collection**
   - Prometheus metrics endpoint
   - Task execution metrics
   - Tenant-specific metrics

2. **Structured Logging**
   - JSON logging format
   - Log aggregation ready
   - Performance metrics

3. **Agent Execution Engine**
   - Background task processing (Celery/Bull)
   - Webhook callbacks for task completion
   - Rate limiting per tenant

4. **Database Migrations**
   - Alembic migrations
   - Schema versioning

## Troubleshooting

**Token Verification Fails**
- Ensure JWT_SECRET in .env matches the secret used to create the token
- Check token hasn't expired (24-hour window)

**Tenant Not Found**
- Verify tenant was registered via `/auth/register-tenant`
- Ensure tenant_id in token matches registered tenant_id

**Queries Returning No Results**
- Tenant isolation is working (only see your tenant's data)
- Check tenant_id matches your token's tenant_id

## Files Modified

- ✅ `database.py` - SessionLocal, connection pooling
- ✅ `models.py` - Tenant, User, AgentTask models
- ✅ `middleware.py` - JWT verification, tenant context
- ✅ `main.py` - Complete FastAPI app with observability
- ✅ `requirements.txt` - Dependencies
- ✅ `.env.example` - Configuration template

---

**Status**: Phase 2 Complete ✅  
**Next**: Phase 2.5 - Advanced Agent Execution & Monitoring
