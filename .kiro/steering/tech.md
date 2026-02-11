# Technology Stack

## Architecture

Monorepo with npm workspaces containing backend API and frontend application.

## Backend Stack

- **Runtime**: Node.js 20+
- **Framework**: Express
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Job Queue**: Bull (requires Redis)
- **Testing**: Jest with fast-check for property-based testing
- **Dev Tools**: tsx for hot reload

## Frontend Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS with PostCSS
- **State Management**: React Query (@tanstack/react-query)
- **Charts**: Recharts
- **Testing**: Jest with React Testing Library and fast-check

## Code Quality

- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier (single quotes, 100 char width, 2 space tabs)
- **Type Checking**: TypeScript strict mode enabled

## Common Commands

### Root Level (runs across all packages)
```bash
npm install              # Install all dependencies
npm run dev             # Start all dev servers
npm run build           # Build all packages
npm test                # Run all tests
npm run lint            # Lint all packages
npm run format          # Format code with Prettier
```

### Backend Specific
```bash
cd packages/backend
npm run dev             # Start dev server with hot reload
npm run build           # Compile TypeScript
npm run start           # Run production build
npm test                # Run tests once
npm test:watch          # Run tests in watch mode
npm run lint            # Lint backend code
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
```

### Frontend Specific
```bash
cd packages/frontend
npm run dev             # Start Next.js dev server
npm run build           # Build for production
npm run start           # Start production server
npm test                # Run tests once
npm test:watch          # Run tests in watch mode
npm run lint            # Lint frontend code
```

## Environment Setup

1. Copy `packages/backend/.env.example` to `packages/backend/.env`
2. Configure DATABASE_URL for PostgreSQL
3. Ensure Redis is running for job queues
4. Run `npm run prisma:migrate` to set up database schema

## Testing Philosophy

- Use Jest for unit and integration tests
- Use fast-check for property-based testing to validate correctness properties
- Tests should be co-located with source files using `.test.ts` or `.test.tsx` suffix
- Run tests without watch mode in CI/CD (Jest runs once by default, no `--run` flag needed)

### Jest CLI Rules (CRITICAL)

**Jest does NOT support `--run` flag.** This is a common hallucination pattern.

Valid Jest flags:
- `--runInBand` - Run tests serially (required for database tests)
- `--watch` - Watch mode for development
- `--coverage` - Generate coverage report
- `--verbose` - Detailed test output
- `--testNamePattern` - Filter tests by name

Running specific tests:
```bash
npm test -- auth.service.test.ts                    # Run specific file
npm test -- auth.service.test.ts --runInBand        # Run serially (for DB tests)
npm test -- auth.service.test.ts --verbose          # With detailed output
npm test -- --testNamePattern="should validate"     # Filter by test name
```

### Test Execution Policy

**For property-based tests or database tests:**
- ALWAYS use `--runInBand` to prevent race conditions
- NEVER use `--watch` in automated contexts
- Ensure database migrations are applied before running tests
- Check `package.json` scripts before suggesting commands

**CLI Safety Rules:**
1. Always inspect `package.json` scripts first before suggesting commands
2. Only use flags officially supported by the tool version in use
3. Never invent CLI flags - if unsure, check tool documentation
4. If a command fails due to unknown flag, remove the flag and retry properly
5. Do not repeat a failed command without modification

**Error Reflection Rule:**
- If a command fails, explicitly explain why it failed
- Do not re-run the same command without changes
- Adjust based on the actual error message
- Validate against official CLI documentation patterns
