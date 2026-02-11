# Idea Hub Frontend

Next.js 14 frontend application for the Idea Hub talent acquisition platform.

## Setup Complete

Task 24 has been completed with the following implementations:

### 1. React Query Configuration
- **Location**: `src/providers/QueryProvider.tsx`
- Configured with sensible defaults (1-minute stale time, no window focus refetch)
- Integrated into root layout for global availability

### 2. API Client with Axios
- **Location**: `src/lib/api-client.ts`
- Base URL configuration via environment variable
- Automatic JWT token injection in request headers
- Response interceptor for 401 handling (auto-redirect to login)
- Token management methods (set, clear, get)

### 3. Authentication Context and Hooks
- **Context**: `src/contexts/AuthContext.tsx`
  - User state management
  - Login, logout, and register methods
  - Auto-check authentication on mount
  - Loading state handling
  
- **Hooks**: `src/hooks/useAuthMutation.ts`
  - `useLogin()` - Login mutation with React Query
  - `useRegister()` - Registration mutation with React Query

### 4. Routing Structure
- **Home** (`/`) - Auto-redirects to dashboard or login based on auth state
- **Login** (`/login`) - Authentication page with form
- **Dashboard** (`/dashboard`) - Protected route with navigation

### 5. Example API Hooks
- **Events**: `src/hooks/useEvents.ts`
  - `useEvents()` - Fetch all events
  - `useEvent(id)` - Fetch single event
  - `useCreateEvent()` - Create event mutation
  - `useUpdateEvent(id)` - Update event mutation

- **Venues**: `src/hooks/useVenues.ts`
  - `useVenues(criteria)` - Search venues with criteria
  - `useVenue(id)` - Fetch single venue
  - `useUpdateVenueStatus(id)` - Update venue status

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (redirects)
│   ├── login/             # Login page
│   └── dashboard/         # Dashboard page
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── providers/             # Provider components
│   └── QueryProvider.tsx  # React Query provider
├── hooks/                 # Custom React hooks
│   ├── useAuthMutation.ts # Auth mutations
│   ├── useEvents.ts       # Event API hooks
│   └── useVenues.ts       # Venue API hooks
└── lib/                   # Utilities
    └── api-client.ts      # Axios API client
```

## Key Features

### Authentication Flow
1. User visits any page
2. AuthContext checks for stored token
3. If authenticated, allows access; otherwise redirects to login
4. Login sets token in localStorage and updates context
5. All API requests automatically include auth token

### API Integration
- Centralized Axios instance with interceptors
- Automatic token management
- Error handling with auto-logout on 401
- React Query for caching and state management

### Type Safety
- Full TypeScript support with strict mode
- Typed API responses
- Typed hook parameters and return values

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Next Steps

The frontend is now ready for:
- Implementing remaining UI components (Task 25+)
- Connecting to backend API endpoints
- Adding more feature-specific pages and components
- Writing integration tests for authentication flow
