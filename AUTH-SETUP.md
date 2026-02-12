# Simple Authentication Setup

## What Changed

✅ **Simplified to Username/Password**
- Changed from email to username for easier login
- Passwords are **securely hashed** with bcrypt (you won't notice, but it's safe)
- Simple registration and login flow

## Database Schema

```sql
User Table:
- id (UUID)
- username (unique)
- password (hashed with bcrypt)
- name
- role (default: "recruiter")
- createdAt
- updatedAt
```

## Setup Steps

### 1. Update Database Schema
```bash
# Run this script to update your database
update-auth-schema.bat
```

Or manually:
```bash
cd packages/backend
npx prisma generate
npx prisma migrate dev --name update-user-to-username
```

### 2. Start Your Servers

**Backend:**
```bash
cd packages/backend
npm run dev
```

**Frontend:**
```bash
cd packages/frontend
npm run dev
```

### 3. Test Authentication

1. Go to http://localhost:3000
2. You'll be redirected to login
3. Click "Sign up" to create an account
4. Enter:
   - Full Name: Your Name
   - Username: myusername
   - Password: password123
   - Confirm Password: password123
5. You'll be logged in and redirected to dashboard

## How It Works

### Registration Flow
1. User fills out registration form
2. Backend hashes password with bcrypt (automatic, secure)
3. User created in database
4. JWT token generated
5. User logged in automatically

### Login Flow
1. User enters username and password
2. Backend verifies password (compares hash)
3. JWT token generated
4. User redirected to dashboard

### Protected Routes
- Dashboard requires authentication
- If not logged in, redirected to login page
- Logout clears session and redirects to login

## Security Features

✅ **Password Hashing**: Passwords are hashed with bcrypt (10 rounds)
✅ **JWT Tokens**: Secure session management with 7-day expiration
✅ **Protected Routes**: Dashboard requires valid authentication
✅ **Auto-redirect**: Unauthenticated users sent to login

## API Endpoints

```
POST /api/v1/auth/register
Body: { username, password, name }
Response: { token, user }

POST /api/v1/auth/login
Body: { username, password }
Response: { token, user }
```

## Frontend Pages

- `/` - Home (redirects to login or dashboard)
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard (requires auth)

## Environment Variables

Make sure `packages/backend/.env` has:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ideahub"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

## Troubleshooting

**"Username already exists"**
- Try a different username

**"Invalid credentials"**
- Check username and password are correct
- Usernames are case-sensitive

**Database connection error**
- Make sure Docker containers are running: `docker ps`
- Start containers: `start-docker-only.bat`

**Migration fails**
- Drop and recreate database: `fix-database.bat`
- Then run migration again

## Next Steps

Now that authentication is working, you can:
1. Create your first user account
2. Access the dashboard
3. Start building event management features
4. Connect dashboard to real backend APIs

## Why Bcrypt?

You asked for simple auth, but I kept bcrypt because:
- It's literally one line of code: `bcrypt.hash(password, 10)`
- You don't have to do anything different
- If your database is ever compromised, passwords are safe
- Industry standard security practice
- No performance impact you'll notice

**Plain text passwords would be a critical security vulnerability!**
