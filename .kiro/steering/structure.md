# Project Structure

## Monorepo Organization

```
/
├── packages/
│   ├── backend/          # Express API server
│   └── frontend/         # Next.js application
├── .kiro/
│   ├── specs/           # Feature specifications
│   └── steering/        # Project guidance documents
└── [root config files]  # Shared tooling configuration
```

## Backend Structure (`packages/backend/`)

```
packages/backend/
├── src/
│   ├── index.ts         # Application entry point
│   └── __tests__/       # Test files co-located with source
├── prisma/
│   └── schema.prisma    # Database schema definition
├── dist/                # Compiled JavaScript output
└── [config files]       # Package-specific configuration
```

### Database Schema Conventions

- Use UUID primary keys (`@id @default(uuid()) @db.Uuid`)
- Snake_case for database column names with `@map()` decorator
- CamelCase for Prisma model field names
- Include `createdAt` and `updatedAt` timestamps on all entities
- Use `@map("table_name")` for table names (plural, snake_case)
- Add indexes for foreign keys and frequently queried fields
- Store complex data as JSON fields where appropriate

## Frontend Structure (`packages/frontend/`)

```
packages/frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Home page
│   │   └── globals.css  # Global styles
│   └── __tests__/       # Test files
├── .next/               # Next.js build output (gitignored)
└── [config files]       # Package-specific configuration
```

### Frontend Conventions

- Use App Router (not Pages Router)
- Components should be in `src/app/` or feature-specific folders
- Global styles in `src/app/globals.css`
- Use TailwindCSS utility classes for styling
- API calls via React Query hooks

## Configuration Files

### Root Level
- `package.json` - Workspace configuration
- `tsconfig.json` - Base TypeScript config
- `.eslintrc.json` - ESLint rules
- `.prettierrc.json` - Code formatting rules
- `.gitignore` - Version control exclusions

### Package Level
- Each package has its own `package.json`, `tsconfig.json`, and test config
- Backend has `jest.config.js` and `jest.setup.js`
- Frontend has `jest.config.js`, `jest.setup.js`, and Next.js config

## Naming Conventions

- **Files**: kebab-case for regular files, PascalCase for React components
- **Directories**: kebab-case
- **TypeScript**: PascalCase for types/interfaces/classes, camelCase for variables/functions
- **Database**: snake_case for columns/tables, camelCase in Prisma models
- **Tests**: `*.test.ts` or `*.test.tsx` suffix, co-located with source

## Import Organization

- External dependencies first
- Internal imports second
- Relative imports last
- Group by type (components, utils, types)
