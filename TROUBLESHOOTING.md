# Troubleshooting Guide

## Error: "Docker Desktop is unable to start"

This means Docker Desktop is not running on your computer.

### Solution:

1. **Open Docker Desktop**
   - Press Windows key
   - Type "Docker Desktop"
   - Click to open it

2. **Wait for Docker to Start**
   - You'll see a whale icon in your system tray (bottom right)
   - Wait until the icon stops animating
   - Hover over it - it should say "Docker Desktop is running"
   - This can take 1-2 minutes

3. **Verify Docker is Running**
   - Double-click `check-docker.bat`
   - It should say "✅ Docker Desktop is running!"

4. **Run the Startup Script Again**
   - Double-click `start-all.bat`

## Error: "Authentication failed against database"

This happens when Docker containers aren't fully ready yet.

### Solution:

1. **Stop everything**
   ```bash
   stop-all.bat
   ```

2. **Start Docker containers manually and wait**
   ```bash
   docker-compose up -d
   ```

3. **Wait 15 seconds**, then check if containers are running:
   ```bash
   docker-compose ps
   ```
   
   You should see:
   - `ideahub-postgres` - running
   - `ideahub-redis` - running

4. **Now run the backend setup**
   ```bash
   cd packages\backend
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```

5. **In a new terminal, start frontend**
   ```bash
   cd packages\frontend
   npm run dev
   ```

## Error: "Port already in use"

### For Port 3000 (Frontend):
```bash
# Find what's using it
netstat -ano | findstr :3000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

### For Port 3001 (Backend):
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### For Port 5432 (PostgreSQL):
```bash
# Stop the Docker container
docker-compose down

# Start it again
docker-compose up -d
```

## Docker Desktop Won't Start

### Solution 1: Restart Docker Desktop
1. Right-click Docker Desktop icon in system tray
2. Click "Quit Docker Desktop"
3. Wait 10 seconds
4. Start Docker Desktop again

### Solution 2: Restart Your Computer
Sometimes Docker needs a fresh start after installation.

### Solution 3: Check WSL 2
Docker Desktop on Windows uses WSL 2. Make sure it's enabled:

```powershell
# Run in PowerShell as Administrator
wsl --update
wsl --set-default-version 2
```

## Complete Reset

If nothing works, do a complete reset:

1. **Stop everything**
   ```bash
   stop-all.bat
   ```

2. **Remove all Docker data**
   ```bash
   docker-compose down -v
   ```

3. **Restart Docker Desktop**
   - Quit Docker Desktop
   - Start it again
   - Wait for it to fully start

4. **Start fresh**
   ```bash
   start-all.bat
   ```

## Check Container Logs

If containers are running but something's wrong:

```bash
# View all logs
docker-compose logs

# View PostgreSQL logs
docker-compose logs postgres

# View Redis logs
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f
```

## Manual Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Check container status
docker-compose ps

# Remove everything including data
docker-compose down -v
```

## Still Having Issues?

1. Make sure Docker Desktop is installed: https://www.docker.com/products/docker-desktop/
2. Make sure you have Node.js 20+: `node --version`
3. Try running `check-docker.bat` to verify Docker status
4. Check the error messages carefully - they usually tell you what's wrong

## Quick Checklist

- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running (whale icon in system tray)
- [ ] Waited at least 1 minute after starting Docker Desktop
- [ ] Ran `check-docker.bat` and it shows ✅
- [ ] No other apps using ports 3000, 3001, 5432, 6379
- [ ] Node.js 20+ is installed
