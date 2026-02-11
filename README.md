# Idea Hub - Talent Acquisition Platform

Enterprise platform for planning and managing recruitment events (Hackathons, Bootcamps, Networking events).

## 🚀 Quick Start (Docker)

### Prerequisites
- Node.js 20+
- Docker Desktop

### One-Command Startup

Simply double-click or run:
```bash
start-all.bat
```

This will:
1. Start PostgreSQL and Redis in Docker
2. Set up the database schema
3. Start the backend server (port 3001)
4. Start the frontend server (port 3000)

Then open your browser to **http://localhost:3000**

### Stop Everything
```bash
stop-all.bat
```

## 📋 Manual Setup (Alternative)

### 1. Start Docker Services
```bash
docker-compose up -d
```

### 2. Setup Backend
```bash
cd packages/backend
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 3. Setup Frontend (new terminal)
```bash
cd packages/frontend
npm run dev
```

## 🎯 First Time Usage

1. Open http://localhost:3000
2. Click "Sign up"
3. Create your account:
   - Full Name: Your name
   - Email: your@email.com
   - Password: (min 6 characters)
4. You'll be logged in automatically and see the dashboard!

## 🏗️ Project Structure

```
/
├── packages/
│   ├── backend/          # Express API (port 3001)
│   │   ├── src/
│   │   │   ├── services/     # Business logic
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── middleware/   # Auth, etc.
│   │   │   └── index.ts      # Entry point
│   │   └── prisma/
│   │       └── schema.prisma # Database schema
│   └── frontend/         # Next.js app (port 3000)
│       └── src/
│           ├── app/          # Pages (App Router)
│           ├── contexts/     # React contexts
│           └── lib/          # API client
├── docker-compose.yml    # PostgreSQL + Redis
└── start-all.bat        # One-click startup
```

## 🔧 Technology Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (via Prisma ORM)
- Redis (for job queues)
- JWT authentication
- bcrypt for password hashing

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- TailwindCSS
- React Query
- Axios

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login

### Health Check
- `GET /health` - Server status

## 🎨 Features Implemented

✅ User authentication (register/login)
✅ JWT token-based sessions
✅ Protected routes
✅ Dashboard with stats overview
✅ Responsive UI with TailwindCSS
✅ Docker setup for databases

## 🔜 Coming Soon

- Event creation and management
- Venue search and tracking
- Company profile management
- Candidate sourcing
- Task generation with AI
- Automated reminders

## 🐛 Troubleshooting

### Docker not starting
```bash
# Check if Docker Desktop is running
docker --version

# Restart Docker Desktop if needed
```

### Port already in use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill the process or change ports in .env files
```

### Database connection error
```bash
# Restart Docker containers
docker-compose restart

# Check container status
docker-compose ps
```

### Reset everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Start fresh
start-all.bat
```

## 📝 Environment Variables

**Backend** (`packages/backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ideahub?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3001
```

**Frontend** (`packages/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
cd packages/backend && npm test

# Frontend tests
cd packages/frontend && npm test
```

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Setup Guide](SETUP.md)
- [PostgreSQL Setup](setup-postgres.md)

## 🤝 Development

```bash
# Install dependencies
npm install

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## 📄 License

Private - Enterprise Talent Acquisition Platform
