# auth-from-scratch

A full-stack authentication system built from scratch with React, Express, Prisma, and PostgreSQL.

## Overview

This project demonstrates how to build a complete authentication system without relying on third-party auth libraries. It includes user registration, login, password hashing with bcryptjs, and JWT-based authentication for protected routes.

## Features

- Custom authentication from the ground up
- Clean React UI with Tailwind CSS
- Real-time activity log for auth events
- Random credential generator for quick testing
- Copy-to-clipboard for generated credentials
- Password hashing with bcryptjs
- TypeScript on frontend and backend
- Docker Compose setup for database, server, and client

## Tech Stack

Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Query

Backend
- Express 5 + TypeScript
- Prisma ORM
- PostgreSQL
- bcryptjs
- jsonwebtoken

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
├── server/                 # Express backend
│   ├── db/
│   ├── prisma/
│   └── server.ts
├── packages/
│   └── shared-types/
├── docker-compose.yml
└── package.json
```

## Getting Started

Prerequisites
- Node.js 18+
- Docker Desktop
- npm

### Option 1: Docker Compose

Run the full stack with Docker Compose:

```bash
docker-compose up --build
```

Services started:
- Client at http://localhost:3000
- API at http://localhost:3001
- Postgres at localhost:5432

For more details, see `DOCKER_SETUP.md` and `DOCKER_QUICK_REFERENCE.md`.

### Option 2: Local Development

1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

2. Start Postgres

```bash
docker-compose up postgres -d
```

3. Create `server/.env`

```env
DATABASE_URL=postgresql://dev:devpass@localhost:5432/auth_db
JWT_SECRET=your-secret-jwt-key-change-this-in-production
PORT=3001
```

4. Run migrations

```bash
cd server
npm run prisma:migrate
```

5. Start the dev servers

```bash
npm run start
```

## Usage

- Open the app at http://localhost:3000
- Register a new account or use the random credential generator
- Log in to receive a JWT token
- Protected routes read the token from the `Authorization: Bearer <token>` header

## API Endpoints

POST `/api/register`

```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

POST `/api/login`

```json
{
  "username": "string",
  "password": "string"
}
```

GET `/api/profile`

Requires an `Authorization: Bearer <token>` header.

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

## Scripts

Root
- `npm run start` runs client and server in watch mode
- `npm run build` builds client and server
- `npm run format` formats client and server

Client
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run format`
- `npm run preview`

Server
- `npm run start`
- `npm run dev`
- `npm run build`
- `npm run format`
- `npm run prisma:migrate`
- `npm run prisma:studio`

## Work In Progress

- Cookie-based auth
- Refresh tokens
- Logout
- Remember me
- Dual-mode auth education: compare JWT in localStorage vs httpOnly cookie sessions with clear production guidance

## License

MIT

## Acknowledgments

Built as a demonstration of fundamental authentication concepts without relying on third-party auth libraries.
