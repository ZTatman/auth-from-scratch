# AGENTS.md

This document provides guidelines for AI agents working on this codebase.

## Project Overview

This is a Vite + Express monorepo with authentication. It consists of:

- `client/`: React frontend with TypeScript, Vite, React Query, Tailwind CSS
- `server/`: Express backend with TypeScript, Prisma ORM, JWT auth
- `packages/shared-types/`: Shared TypeScript types between client and server

## Build Commands

### Root Level (runs both server and client)

```bash
npm run start      # Start dev servers (concurrently)
npm run build      # Build both server and client
npm run format     # Format server and client code
```

### Client

```bash
cd client
npm run dev        # Start Vite dev server
npm run build      # Type-check and build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Server

```bash
cd server
npm run start      # Run with tsx (no watch)
npm run dev        # Run with tsx watch mode
npm run build      # Type-check with tsc
npm run format     # Format with Prettier
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio UI
```

### Single Test Commands

This project uses ESLint for linting (no test framework currently). Run lint on specific files:

```bash
cd client && npx eslint src/App.tsx src/api/index.ts
```

## Code Style Guidelines

### TypeScript

- Strict mode is enabled (`strict: true` in tsconfig)
- Use explicit types for function parameters and return types
- Use discriminated unions for success/error responses (see shared-types)
- Enable `noUnusedLocals` and `noUnusedParameters`

### Import Organization (React components)

Organize imports in this order:

```typescript
// 1. React/Framework imports
import { useState } from "react";

// 2. Types
import type { LoginResponse } from "@app/shared-types";
import type { LoginForm } from "./types";

// 3. API / Hooks
import { loginUser } from "./api";
import { useUser } from "./hooks";

// 4. Components
import { NavigationBar } from "./components/NavigationBar/NavigationBar";

// 5. Styles
import "./App.css";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `NavigationBar`, `AuthForm`)
- **Component Folders**: PascalCase matching the component (e.g., `UserContext/UserContext.tsx`)
- **Functions/Variables**: camelCase (e.g., `loginUser`, `activityLog`)
- **Constants**: SCREAMING_SNAKE_CASE for config constants (e.g., `JWT_SECRET`, `PORT`)
- **Files**: PascalCase for components (e.g., `ProfileCard.tsx`), kebab-case for utilities (e.g., `api-client.ts`)
- **Exports**: Use named exports for all components and utilities

### JSDoc Comments

Document all non-trivial functions with JSDoc:

```typescript
/**
 * Validate that a password meets required complexity rules.
 *
 * @param password - The password to validate
 * @returns An empty string if valid; otherwise a message describing the failed requirement
 */
function validatePassword(password: string): string { ... }
```

### Error Handling

**Server (Express)**:

- Wrap route handlers in try/catch
- Log errors with `console.error(error)`
- Return consistent error format:
  ```typescript
  res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Unknown error occurred",
  });
  ```

**Client (API)**:

- Handle network errors in try/catch
- Return errors in same format as server:
  ```typescript
  const errorResponse: ErrorResponse = {
    success: false,
    message: error instanceof Error ? error.message : "Unknown error occurred",
  };
  return errorResponse;
  ```
- Always check `response.ok` before parsing JSON

### Response Format

Use discriminated unions for API responses:

```typescript
type SuccessResponse<T> = { success: true; message: string; data: T };
type ErrorResponse = { success: false; message: string; requirement?: string };
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### React Patterns

- Use functional components with hooks
- Extract reusable logic into custom hooks (see `useUser`)
- Use TypeScript discriminated unions for conditional rendering
- Prefer composition over context for simple shared state
- Group related components in directories with an `index.ts`

### Tailwind CSS

- Use utility classes directly in JSX
- No custom CSS classes unless necessary
- Organize classes logically (layout, spacing, colors, etc.)

### Database (Prisma)

- Use the repository pattern (see `server/db/repositories/userRepository.ts`)
- Keep Prisma client instantiation in `server/db/client.ts`
- Run `npm run postinstall` after installing dependencies to generate Prisma client

### Security

- Never log sensitive data (passwords, tokens)
- Use constant-time comparison for password checks
- Return generic error messages for auth failures (prevent enumeration)
- Validate all user input on the server

### Formatting

- Prettier is configured with 2-space indent, no tabs
- Run `npm run format` before committing
- Tailwind CSS plugin is enabled for Prettier
