# Idea Hub Talent Acquisition Platform

Enterprise talent acquisition platform for planning and managing recruitment events (Hackathons, Bootcamps, Networking events).

## Project Structure

This is a monorepo containing:

- `packages/backend` - Node.js/Express API with TypeScript
- `packages/frontend` - Next.js React application with TypeScript

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis (for job queues)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cd packages/backend
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
cd packages/backend
npm run prisma:migrate
```

4. Start development servers:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

## Technology Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- Bull for job queues
- Jest with fast-check for testing

### Frontend
- React 18 with Next.js 14
- TypeScript
- TailwindCSS
- React Query
- Recharts for visualizations
- Jest with fast-check for testing

## Testing

Run tests with:
```bash
npm test
```

Property-based tests use fast-check for comprehensive validation.
