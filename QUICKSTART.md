# Quick Start Guide - Idea Hub

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js 20+ installed (`node --version`)
- ✅ PostgreSQL 15+ installed and running
- ✅ A database named `ideahub` created in PostgreSQL

## Step 1: Install PostgreSQL (if not installed)

### Quick Install:
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. Open **pgAdmin 4** and create a database named `ideahub`

**OR use Docker:**
```bash
docker run --name ideahub-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ideahub -p 5432:5432 -d postgres:15
```

## Step 2: Update Database Password (if needed)

If you used a different PostgreSQL password, edit `packages/backend/.env`:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ideahub?schema=public"
```

## Step 3: Start the Backend

**Option A - Using the batch file (easiest):**
```bash
start-backend.bat
```

**Option B - Manual commands:**
```bash
cd packages/backend
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

You should see: `Backend server running on port 3001`

## Step 4: Start the Frontend

Open a **NEW terminal window** and run:

**Option A - Using the batch file:**
```bash
start-frontend.bat
```

**Option B - Manual commands:**
```bash
cd packages/frontend
npm run dev
```

You should see: `Ready on http://localhost:3000`

## Step 5: Test the Application

1. Open your browser to: **http://localhost:3000**
2. You'll be redirected to the login page
3. Click **"Sign up"** (bottom of the form)
4. Create an account:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
5. Click **"Sign up"**
6. You should see the **Dashboard** with your name in the top right!

## What You'll See

The dashboard includes:
- 📊 4 stat cards (Events, Venues, Candidates, Reminders) - all showing 0 for now
- 📈 Status overview section
- ⚡ Quick actions buttons
- 🔔 Recent activity section
- 🚪 Logout button in the top right

## Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Verify the database `ideahub` exists
- Check the password in `packages/backend/.env`

### "Port 3001 already in use"
- Stop any other process using port 3001
- Or change PORT in `packages/backend/.env`

### "Port 3000 already in use"
- Stop any other process using port 3000
- Or run: `npm run dev -- -p 3002` in the frontend folder

### PowerShell execution policy error
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Next Steps

After logging in, you can:
- Explore the dashboard interface
- Test the logout functionality
- Create additional user accounts
- The backend API is ready at: http://localhost:3001/api/v1

## API Endpoints Available

- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login
- `GET /health` - Check backend status

## Need Help?

Check the logs in both terminal windows for any error messages.
