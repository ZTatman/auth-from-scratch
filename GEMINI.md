# Project Overview

This is a full-stack "self-rolled" authentication example project. It demonstrates how to implement user registration, login, and session management using JWT tokens without relying on third-party authentication providers (like Auth0 or Passport.js).

The project is organized as a monorepo using **NPM Workspaces**:
- **`client/`**: React frontend built with Vite, Tailwind CSS, and Shadcn UI.
- **`server/`**: Express backend using Prisma ORM with PostgreSQL.
- **`packages/shared-types/`**: A shared library containing TypeScript interfaces and Zod schemas used by both the frontend and backend to ensure type safety and consistent validation.

## Key Technologies
- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn UI, React Router.
- **Backend**: Node.js, Express, Prisma ORM, JWT (`jsonwebtoken`), `bcryptjs`.
- **Database**: PostgreSQL (containerized).
- **Tooling**: Docker & Docker Compose, TypeScript, ESLint, Prettier.

# Building and Running

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose

### Development Mode (Recommended)
The easiest way to run the entire stack is using Docker Compose from the root directory:
```bash
docker-compose up --build
```
This starts:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Database: `postgres:5432`

### Manual Setup
If running locally without Docker for the services:
1. **Install dependencies**: `npm install` (runs across all workspaces).
2. **Environment**: Create `server/.env` based on `DATABASE_URL` and `JWT_SECRET`.
3. **Database**: 
   ```bash
   cd server
   npx prisma migrate dev
   ```
4. **Start Development Servers**:
   ```bash
   npm start
   ```

### Testing & Linting
- **Linting**: `npm run format` (formats both client and server).
- **Prisma Studio**: `cd server && npx prisma studio` to view the database UI.

# Architecture & Conventions

### Authentication Flow
1. **Registration**: User submits credentials -> Server hashes password with `bcrypt` -> User stored in Postgres.
2. **Login**: User submits credentials -> Server verifies hash -> Server issues a JWT.
3. **Session**: The JWT is stored in the browser's `localStorage` (demonstration purposes) and sent via the `Authorization: Bearer <token>` header for protected requests.
4. **Validation**: The server uses a custom `authenticateToken` middleware (`server/middleware/auth.ts`) to verify JWTs.

### Frontend Patterns
- **API Client**: A centralized `ApiClient` (`client/src/lib/api-client.ts`) handles all HTTP requests and automatically injects the auth token.
- **State Management**: `UserContext` (`client/src/components/UserContext/UserContext.tsx`) manages the global authentication state.
- **Hooks**: Custom hooks in `client/src/hooks/` (e.g., `useUser`, `useAuth`) encapsulate logic for interacting with the auth state and API.

### Backend Patterns
- **Repositories**: Database logic is encapsulated in repository classes (`server/db/repositories/`) rather than being directly in routes.
- **Type Safety**: Shared Zod schemas (`packages/shared-types/src/validation.ts`) are used for request body validation on the server and form validation on the client.
- **Response Utility**: Standardized response shapes are managed via `server/utils/response.ts`.

### Project Structure
- `.github/workflows/`: CI/CD pipelines for testing and CodeQL.
- `server/generated/prisma/`: Custom output location for the Prisma Client.
- `client/src/components/AuthPage/`: Contains interactive debugging tools like `JWTDecoder` and `RequestInspector` to help visualize the auth flow.
