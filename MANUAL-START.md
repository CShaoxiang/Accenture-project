# Manual Startup Guide

If `start-all.bat` has issues, follow these manual steps:

## Step 1: Start Docker Containers

```bash
docker-compose up -d
```

Wait 30 seconds for containers to fully start.

## Step 2: Verify Containers are Running

```bash
docker-compose ps
```

You should see:
- `ideahub-postgres` - Up - healthy
- `ideahub-redis` - Up - healthy

If not healthy yet, wait another 10 seconds and check again.

## Step 3: Setup Backend Database

Open a terminal in `packages/backend`:

```bash
cd packages/backend
npx prisma generate
npx prisma migrate dev --name init
```

You should see: "Your database is now in sync with your schema."

## Step 4: Start Backend Server

In the same terminal (packages/backend):

```bash
npm run dev
```

You should see: "Backend server running on port 3001"

**Keep this terminal open!**

## Step 5: Start Frontend Server

Open a **NEW terminal** in `packages/frontend`:

```bash
cd packages/frontend
npm run dev
```

You should see: "Ready on http://localhost:3000"

**Keep this terminal open too!**

## Step 6: Open Browser

Go to: **http://localhost:3000**

## To Stop Everything

1. Press `Ctrl+C` in both terminal windows
2. Run: `docker-compose down`

## Troubleshooting

### "Authentication failed" error in Step 3

The PostgreSQL container isn't ready yet. Wait 10 more seconds and try again.

You can check if it's ready:
```bash
docker exec ideahub-postgres pg_isready -U postgres
```

Should output: "accepting connections"

### Backend won't start

Make sure you completed Step 3 successfully first.

### Frontend shows connection error

Make sure the backend (Step 4) is running first.
