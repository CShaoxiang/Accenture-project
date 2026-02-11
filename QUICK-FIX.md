# Quick Fix - Database Not Ready Error

You're seeing: "Authentication failed against database server"

This happens because PostgreSQL container needs more time to start.

## Solution 1: Run start-all.bat Again (Easiest)

The containers are now created and will start faster:

```bash
stop-all.bat
start-all.bat
```

The second time is much faster because Docker doesn't need to download images!

## Solution 2: Manual Steps (Most Reliable)

### 1. Containers are already running, just wait
```bash
# Check if they're healthy
docker-compose ps
```

Wait until you see "healthy" status for both containers.

### 2. Setup database (in packages/backend folder)
```bash
cd packages\backend
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Start backend (same terminal)
```bash
npm run dev
```

### 4. Start frontend (NEW terminal)
```bash
cd packages\frontend
npm run dev
```

### 5. Open browser
http://localhost:3000

## Why This Happened

On first run, Docker needs to:
1. Download PostgreSQL image (takes time)
2. Download Redis image (takes time)
3. Create containers
4. Start PostgreSQL (takes 10-20 seconds to be ready)

The script tried to connect before PostgreSQL was fully ready.

## Next Time

After the first successful run, everything will be much faster because:
- Images are already downloaded
- Containers are already created
- Just need to start them (2-3 seconds)

## Check Container Health

```bash
# See if containers are running and healthy
docker-compose ps

# Check PostgreSQL specifically
docker exec ideahub-postgres pg_isready -U postgres
```

Should say: "accepting connections"
