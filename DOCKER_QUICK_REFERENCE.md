# Docker Quick Reference

## 🚀 Quick Start

```bash
# Start everything
docker-compose up --build

# Start in background (detached)
docker-compose up -d
```

Access:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Database**: localhost:5432

## 🛑 Stop & Clean

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Stop specific service
docker-compose stop server
```

## 📋 Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 server
```

## 🔄 Restart

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart server
```

## 🔧 Execute Commands

```bash
# Open shell in server container
docker-compose exec server sh

# Run Prisma commands
docker-compose exec server npx prisma studio
docker-compose exec server npx prisma migrate dev --name migration_name

# Open shell in client container
docker-compose exec client sh
```

## 🏗️ Build

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build server

# Rebuild and start
docker-compose up --build
```

## 🔍 Status & Info

```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Inspect service
docker-compose config
```

## 🗄️ Database

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U dev -d auth_db

# Backup database
docker-compose exec postgres pg_dump -U dev auth_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U dev auth_db < backup.sql
```

## 🧹 Cleanup

```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

## 🐛 Troubleshooting

```bash
# Port already in use - find process
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up

# View service health
docker-compose ps
```

## 💡 Tips

- Use `-d` flag to run in background: `docker-compose up -d`
- Use `--build` to rebuild images: `docker-compose up --build`
- Use `-f` with logs to follow in real-time: `docker-compose logs -f`
- Press `Ctrl+C` to stop services running in foreground
- Use `docker-compose down -v` to completely reset (⚠️ deletes data)
