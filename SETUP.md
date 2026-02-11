# Idea Hub Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis (for job queues)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend Environment

```bash
# Copy the example env file
copy packages\backend\.env.example packages\backend\.env

# Edit packages/backend/.env and update:
# - DATABASE_URL with your PostgreSQL connection string
# - JWT_SECRET with a secure random string
```

### 3. Configure Frontend Environment

```bash
# Copy the example env file
copy packages\frontend\.env.local.example packages\frontend\.env.local

# The default API URL (http://localhost:3001/api/v1) should work for local development
```

### 4. Set Up Database

```bash
# Generate Prisma client
cd packages/backend
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Go back to root
cd ../..
```

### 5. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
npm run dev
```

## Access the Application

1. Open your browser to http://localhost:3000
2. Click "Sign up" to create a new account
3. Fill in your details and register
4. You'll be automatically logged in and redirected to the dashboard

## Troubleshooting

### PowerShell Execution Policy Error

If you see an error about execution policies when running npm commands, run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Connection Error

Make sure PostgreSQL is running and the DATABASE_URL in `.env` is correct:

```
DATABASE_URL="postgresql://username:password@localhost:5432/ideahub?schema=public"
```

### Port Already in Use

If port 3000 or 3001 is already in use:
- Backend: Change PORT in `packages/backend/.env`
- Frontend: Use `npm run dev -- -p 3002` to run on a different port

## Default Credentials

After registration, you can create multiple accounts for testing. Each account is isolated.

## Next Steps

After logging in, you can:
- View the dashboard with status overview
- Create events (functionality to be implemented)
- Search venues (functionality to be implemented)
- Source candidates (functionality to be implemented)
