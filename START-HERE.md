# 🚀 START HERE - Idea Hub Setup

## What You Need
1. **Docker Desktop** - Download from https://www.docker.com/products/docker-desktop/
2. **Node.js 20+** - Already installed ✅

## Setup Steps (5 minutes)

### Step 1: Install and Start Docker Desktop
- Download and install Docker Desktop (if not already installed)
- **Open Docker Desktop** from Start Menu
- **Wait for it to fully start** (1-2 minutes)
- Look for the whale icon in your system tray (bottom right)
- Hover over it - it should say "Docker Desktop is running"

### Step 1.5: Verify Docker is Running
Double-click: **`check-docker.bat`**

You should see: ✅ Docker Desktop is running!

If not, go back to Step 1 and make sure Docker Desktop is open and running.

### Step 2: Start Everything
Double-click: **`start-all.bat`**

This single script will:
- ✅ Start PostgreSQL database in Docker
- ✅ Start Redis in Docker
- ✅ Create database tables
- ✅ Start backend server (http://localhost:3001)
- ✅ Start frontend app (http://localhost:3000)

### Step 3: Open Your Browser
Go to: **http://localhost:3000**

### Step 4: Create Your Account
1. Click "Sign up"
2. Fill in your details
3. Click "Sign up" button
4. You're in! 🎉

## What You'll See

A beautiful dashboard with:
- 📊 Stats cards (Events, Venues, Candidates, Reminders)
- 📈 Status overview
- ⚡ Quick action buttons
- Your name in the top right corner

## Stop Everything

Double-click: **`stop-all.bat`**

## Troubleshooting

### "Docker is not running"
- Make sure Docker Desktop is started
- Look for the whale icon in your system tray

### "Port already in use"
- Close any other apps using ports 3000, 3001, 5432, or 6379
- Or restart your computer

### Still having issues?
1. Run `stop-all.bat`
2. Close Docker Desktop
3. Restart Docker Desktop
4. Run `start-all.bat` again

## Next Time You Want to Start

Just run: **`start-all.bat`**

Your data is saved in Docker volumes, so your account and data persist!

## Files You Created

- ✅ `docker-compose.yml` - Database configuration
- ✅ `packages/backend/.env` - Backend settings
- ✅ `packages/frontend/.env.local` - Frontend settings
- ✅ `start-all.bat` - One-click startup
- ✅ `stop-all.bat` - One-click shutdown

## That's It!

You're ready to test the authentication and dashboard! 🚀
