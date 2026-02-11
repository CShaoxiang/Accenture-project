# Step-by-Step Manual Setup

The containers are running! Now let's set up the database and start the servers manually.

## Current Status
✅ Docker containers are running and healthy
✅ PostgreSQL is accepting connections
✅ Redis is running

## Step 1: Open Command Prompt (Not PowerShell)

**Important:** Use Command Prompt (cmd.exe), not PowerShell, to avoid execution policy issues.

1. Press `Windows + R`
2. Type `cmd`
3. Press Enter

## Step 2: Navigate to Backend Folder

```cmd
cd C:\Users\deepa\OneDrive\Desktop\clon2\Accenture-project\packages\backend
```

## Step 3: Generate Prisma Client

```cmd
npx prisma generate
```

You should see: "Generated Prisma Client"

## Step 4: Run Database Migration

```cmd
npx prisma migrate dev --name init
```

You should see: "Your database is now in sync with your schema"

If you see an authentication error, wait 10 seconds and try again.

## Step 5: Start Backend Server

```cmd
npm run dev
```

You should see: "Backend server running on port 3001"

**Keep this window open!**

## Step 6: Open Another Command Prompt

Open a NEW Command Prompt window (repeat Step 1)

## Step 7: Navigate to Frontend Folder

```cmd
cd C:\Users\deepa\OneDrive\Desktop\clon2\Accenture-project\packages\frontend
```

## Step 8: Start Frontend Server

```cmd
npm run dev
```

You should see: "Ready on http://localhost:3000"

**Keep this window open too!**

## Step 9: Open Your Browser

Go to: **http://localhost:3000**

You should see the login page!

## Step 10: Create Your Account

1. Click "Sign up"
2. Fill in your details
3. Click "Sign up"
4. You're in! 🎉

## To Stop Everything

1. Press `Ctrl+C` in both Command Prompt windows
2. Run: `docker-compose down`

## Alternative: Fix PowerShell Execution Policy

If you want to use PowerShell, run this as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then you can use PowerShell normally.

## Troubleshooting

### "Authentication failed" in Step 4

Wait 10 more seconds and try again. The container might still be initializing.

### Backend won't start in Step 5

Make sure Step 4 completed successfully first.

### Can't see the login page

Make sure both backend (Step 5) and frontend (Step 8) are running.
