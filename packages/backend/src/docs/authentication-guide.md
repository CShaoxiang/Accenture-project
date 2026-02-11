# Authentication and Authorization Guide

## Overview

The Idea Hub platform uses JWT-based authentication with role-based access control (RBAC) and fine-grained permission management.

## User Roles

- **Admin**: Full system access, can manage users and all resources
- **Recruiter**: Can manage events, venues, companies, candidates, tasks, and reminders
- **Coordinator**: Can read and update events, venues, and tasks
- **Viewer**: Read-only access to all resources

## Authentication Flow

### 1. User Registration

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "recruiter"  // Optional, defaults to "recruiter"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "recruiter"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response: Same as registration

### 3. Get Current User

```bash
GET /api/v1/auth/me
Authorization: Bearer <token>
```

## Using Authentication in Routes

### Basic Authentication

Require any authenticated user:

```typescript
import { authenticate } from '../middleware/auth.middleware';

router.get('/profile', authenticate, (req, res) => {
  // req.user contains { userId, email, role }
  res.json({ user: req.user });
});
```

### Role-Based Authorization

Restrict access to specific roles:

```typescript
import { authenticate, authorize } from '../middleware/auth.middleware';

// Only admins and recruiters
router.post('/events', 
  authenticate, 
  authorize('admin', 'recruiter'),
  (req, res) => {
    // Handle event creation
  }
);
```

### Permission-Based Authorization

Use fine-grained permissions:

```typescript
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { Permission } from '../utils/permissions';

router.post('/events',
  authenticate,
  requirePermission(Permission.CREATE_EVENT),
  (req, res) => {
    // Handle event creation
  }
);
```

### Multiple Permissions

Require all permissions:

```typescript
import { requireAllPermissions } from '../middleware/permission.middleware';

router.delete('/events/:id',
  authenticate,
  requireAllPermissions(Permission.DELETE_EVENT, Permission.READ_EVENT),
  (req, res) => {
    // Handle event deletion
  }
);
```

Require any permission:

```typescript
import { requireAnyPermission } from '../middleware/permission.middleware';

router.get('/dashboard',
  authenticate,
  requireAnyPermission(Permission.READ_EVENT, Permission.READ_VENUE),
  (req, res) => {
    // Handle dashboard view
  }
);
```

### Optional Authentication

Allow both authenticated and unauthenticated access:

```typescript
import { optionalAuth } from '../middleware/auth.middleware';

router.get('/public-events',
  optionalAuth,
  (req, res) => {
    // req.user will be present if authenticated, undefined otherwise
    const isAuthenticated = !!req.user;
    // Return different data based on authentication status
  }
);
```

## Permission System

### Available Permissions

Events:
- `Permission.CREATE_EVENT`
- `Permission.READ_EVENT`
- `Permission.UPDATE_EVENT`
- `Permission.DELETE_EVENT`

Venues:
- `Permission.CREATE_VENUE`
- `Permission.READ_VENUE`
- `Permission.UPDATE_VENUE`
- `Permission.DELETE_VENUE`

Companies:
- `Permission.CREATE_COMPANY`
- `Permission.READ_COMPANY`
- `Permission.UPDATE_COMPANY`
- `Permission.DELETE_COMPANY`

Candidates:
- `Permission.CREATE_CANDIDATE`
- `Permission.READ_CANDIDATE`
- `Permission.UPDATE_CANDIDATE`
- `Permission.DELETE_CANDIDATE`

Tasks:
- `Permission.CREATE_TASK`
- `Permission.READ_TASK`
- `Permission.UPDATE_TASK`
- `Permission.DELETE_TASK`

Reminders:
- `Permission.CREATE_REMINDER`
- `Permission.READ_REMINDER`
- `Permission.APPROVE_REMINDER`

Users:
- `Permission.CREATE_USER`
- `Permission.READ_USER`
- `Permission.UPDATE_USER`
- `Permission.DELETE_USER`

### Programmatic Permission Checks

```typescript
import { hasPermission, canPerformAction } from '../utils/permissions';
import { Permission } from '../utils/permissions';

// Check specific permission
if (hasPermission(user.role, Permission.CREATE_EVENT)) {
  // User can create events
}

// Check action on resource
if (canPerformAction(user.role, 'create', 'event')) {
  // User can create events
}
```

## Error Responses

### 401 Unauthorized
- Missing or invalid token
- Expired token

```json
{
  "error": "Invalid or expired token. Please login again."
}
```

### 403 Forbidden
- User lacks required role or permission

```json
{
  "error": "Insufficient permissions. You do not have access to this resource."
}
```

## Security Best Practices

1. **Token Storage**: Store JWT tokens securely (httpOnly cookies or secure storage)
2. **Token Expiration**: Tokens expire after 24 hours by default
3. **Password Requirements**: Minimum 6 characters (enforced at API level)
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Set `JWT_SECRET` to a strong random value in production

## Environment Configuration

```env
JWT_SECRET="your-strong-secret-key-here"
JWT_EXPIRES_IN="24h"  # Optional, defaults to 24h
```
