# Docker Setup Guide

This project can now be run entirely using Docker Compose, which manages the database, server, and client applications.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Build and start all services:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Client (Frontend): http://localhost:3000
   - Server (Backend API): http://localhost:3001
   - PostgreSQL Database: localhost:5432

## Docker Compose Services

The `docker-compose.yml` file defines three services:

### 1. **postgres** (Database)

- Image: `postgres:16`
- Port: `5432`
- Credentials:
  - User: `dev`
  - Password: `devpass`
  - Database: `auth_db`
- Includes health checks to ensure the database is ready before starting dependent services

### 2. **server** (Express Backend)

- Built from `./server/Dockerfile`
- Port: `3001`
- Automatically runs Prisma migrations on startup
- Hot-reload enabled via volume mounting
- Waits for the database to be healthy before starting

### 3. **client** (Vite React Frontend)

- Built from `./client/Dockerfile`
- Port: `3000`
- Hot-reload enabled via volume mounting
- Proxies API requests to the server service

## Common Commands

### Start all services (detached mode)

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (clears database data)

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres
```

### Rebuild services after code changes

```bash
docker-compose up --build
```

### Restart a specific service

```bash
docker-compose restart server
```

### Execute commands in a running container

```bash
# Access server container shell
docker-compose exec server sh

# Run Prisma Studio
docker-compose exec server npx prisma studio

# Run Prisma migrations
docker-compose exec server npx prisma migrate dev
```

## Development Workflow

### Hot Reload

Both the client and server support hot reload:

- Changes to client code will automatically refresh the browser
- Changes to server code will automatically restart the server

### Database Migrations

Migrations are automatically applied when the server starts. To create a new migration:

```bash
docker-compose exec server npx prisma migrate dev --name your_migration_name
```

### Accessing Prisma Studio

To view and edit database data:

```bash
docker-compose exec server npx prisma studio
```

Then open http://localhost:5555 in your browser.

## Environment Variables

Environment variables are configured in the `docker-compose.yml` file:

### Server Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 3001)

### Client Environment Variables

- `VITE_API_URL`: Backend API URL (uses Docker service name `server`)

To customize these, you can:

1. Edit the `docker-compose.yml` file directly
2. Create a `.env` file in the root directory (see `.env.example`)

## Troubleshooting

### Port Already in Use

If you get an error about ports already being in use:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill the process or stop your local dev servers
```

### Database Connection Issues

If the server can't connect to the database:

```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart the postgres service
docker-compose restart postgres
```

### Container Won't Start

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

### Node Modules Issues

If you encounter issues with node_modules:

```bash
# Remove node_modules volumes and rebuild
docker-compose down -v
docker-compose up --build
```

## Switching Between Docker and Local Development

### Using Docker (Current Setup)

```bash
docker-compose up
```

### Using Local Development

1. Stop Docker services:

   ```bash
   docker-compose down
   ```

2. Start only the database:

   ```bash
   docker-compose up postgres -d
   ```

3. Update the server's DATABASE_URL to use `localhost` instead of `postgres`:

   ```
   DATABASE_URL=postgresql://dev:devpass@localhost:5432/auth_db
   ```

4. Run the local dev servers:
   ```bash
   npm start
   ```

## Production Considerations

This Docker setup is optimized for development. For production:

1. Create separate `Dockerfile.prod` files that:

   - Build the application
   - Use multi-stage builds
   - Run as non-root user
   - Use production dependencies only

2. Update `docker-compose.prod.yml` to:

   - Remove volume mounts
   - Use environment variables from `.env` files
   - Add proper security configurations
   - Use production-ready database credentials

3. Consider using:
   - Docker secrets for sensitive data
   - Reverse proxy (nginx) for serving the client
   - Container orchestration (Kubernetes, Docker Swarm)
