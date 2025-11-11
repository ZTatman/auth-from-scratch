# auth-from-scratch

A full-stack authentication system built from scratch with React, Express, Prisma, and PostgreSQL.

## Overview

---

This project demonstrates how to build a complete authentication system without relying on third-party auth libraries. It includes user registration, login, password hashing with bcrypt, and session management using JWT tokens.

## Features

- 🔐 **Custom Authentication** - Self-rolled auth implementation from the ground up
- 🎨 **Modern UI** - Clean React interface with Tailwind CSS
- 🔄 **Real-time Activity Log** - Track authentication events as they happen
- 🎲 **Random Credential Generator** - Generate test credentials with one click
- 📋 **Copy to Clipboard** - Easy credential copying for testing
- 🔒 **Secure Password Handling** - Bcrypt hashing with proper salt rounds
- 🎯 **TypeScript Throughout** - Full type safety on frontend and backend
- 🐳 **Docker Support** - PostgreSQL database via Docker Compose

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Fetch API** for HTTP requests

### Backend

- **Express.js** with TypeScript
- **Prisma ORM** for database management
- **PostgreSQL** database
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT tokens
- **cookie-parser** for session management

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ActivityLog/
│   │   │   ├── AuthForm/
│   │   │   ├── CopyButton/
│   │   │   ├── GenerateCredentialsSection/
│   │   │   └── ToggleSwitch/
│   │   ├── api/           # API client functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── App.tsx        # Main app component
│   └── package.json
│
├── server/                # Express backend
│   ├── db/
│   │   ├── client.ts      # Prisma client
│   │   └── repositories/  # Database repositories
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   └── server.ts          # Express server
│
├── docker-compose.yml     # PostgreSQL container
└── package.json           # Root package.json for scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ZTatman/auth-from-scratch.git
   cd auth-from-scratch
   ```

2. **Install dependencies**

   ```bash
   cd client && npm install
   cd server && npm install
   npm install
   ```

3. **Start PostgreSQL database**

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**

   ```bash
   cd server
   npx prisma migrate deploy
   cd ../
   ```

5. **Start the development servers**

   ```bash
   npm run dev
   ```

   This will start:

   - Frontend on `http://localhost:5173`
   - Backend on `http://localhost:3000`

## Usage

### Register a New User

1. Navigate to `http://localhost:5173`
2. Toggle to "Register" mode
3. Enter a username and password (min 6 characters)
4. Or click "Generate random credentials" for test credentials
5. Click "Register"

### Login

1. Toggle to "Login" mode
2. Enter your credentials
3. Click "Login"

### Activity Log

The activity log at the bottom shows:

- Registration attempts and results
- Login attempts and results
- Error messages with requirements
- JWT tokens (for debugging)

## Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Endpoints

### POST `/api/register`

Register a new user

```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

### POST `/api/login`

Login an existing user

```json
{
  "username": "string",
  "password": "string"
}
```

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens generated on login
- ✅ Password confirmation on registration
- ✅ Unique username constraints
- ✅ Input validation and sanitization
- ✅ TypeScript for type safety

## Work in Progress

This project is actively being developed. Features currently in progress or planned:

- 🚧 **Session Management** - Implementing proper session handling
- 🚧 **HTTP-only Cookies** - Secure cookie-based authentication
- 🚧 **Protected Routes** - Frontend route protection for authenticated users
- 🚧 **Token Refresh** - Automatic token refresh mechanism
- 🚧 **Logout Functionality** - Proper session termination
- 🚧 **Remember Me** - Persistent login option

**Current State:** The application generates JWT tokens but does not yet implement full session management or use cookies. Tokens are currently returned in the response body for demonstration purposes.

## Development

### Available Scripts

```bash
# Install all dependencies (root, client, server)
npm install

# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:client

# Start only backend
npm run dev:server

# Build for production
npm run build

# Run Prisma Studio (database GUI)
cd server && npx prisma studio
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/authdb"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

## Contributing

This is a learning project, but contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

MIT License - feel free to use this project for learning or as a starting point for your own applications.

## Acknowledgments

Built as a demonstration of fundamental authentication concepts without relying on third-party auth libraries like Passport.js or Auth0.

---

**Note:** This is an educational project. For production applications, consider using established authentication solutions and following additional security best practices.
