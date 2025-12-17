# Docker Deployment Guide

This guide explains how to deploy the RPG Blog application using Docker and Docker Compose.

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

To verify your installation:
```bash
docker --version
docker compose version
```

**Note**: This guide uses `docker compose` (modern syntax). If you have an older Docker installation, use `docker-compose` (with hyphen) instead.

## Quick Start

### 1. Clone and Navigate to Project
```bash
cd /path/to/rpg-assignment
```

### 2. Configure Environment Variables (Optional)
Copy the example environment file and customize if needed:
```bash
cp .env.example .env
```

Edit `.env` to set your custom values:
- `DB_USERNAME`: Database username (default: postgres)
- `DB_PASSWORD`: Database password (default: postgres)
- `DB_NAME`: Database name (default: rpg_blog)
- `JWT_SECRET`: Secret key for JWT tokens (⚠️ change in production!)
- `VITE_API_URL`: Backend API URL (default: http://localhost:3200/graphql)

### 3. Build and Start All Services
Run this single command to start everything:
```bash
docker compose up --build
```

This will:
- Build the backend Docker image
- Build the frontend Docker image
- Pull PostgreSQL image
- Start all three services (database, backend, frontend)
- Create a Docker network for inter-service communication
- Set up a persistent volume for database data

### 4. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3200/graphql
- **Database**: localhost:5432

## Services

### 1. PostgreSQL Database (`postgres`)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Volume**: `postgres_data` (persistent storage)
- **Health Check**: Ensures database is ready before backend starts

### 2. Backend (NestJS) (`backend`)
- **Port**: 3200
- **Depends on**: PostgreSQL (waits for health check)
- **Environment**: Configured via environment variables

### 3. Frontend (Vue 3) (`frontend`)
- **Port**: 80
- **Depends on**: Backend
- **Server**: Nginx (production-optimized)

## Common Commands

### Start Services (Detached Mode)
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### Stop Services and Remove Volumes
⚠️ This will delete all database data!
```bash
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Rebuild Services
If you make code changes:
```bash
docker compose up --build
```

Or rebuild specific service:
```bash
docker compose build backend
docker compose up -d backend
```

### Check Service Status
```bash
docker compose ps
```

### Execute Commands in Containers
```bash
# Access backend shell
docker compose exec backend sh

# Access database
docker compose exec postgres psql -U postgres -d rpg_blog
```

## Development vs Production

### Development
For development, continue using the local setup:
```bash
# Backend
cd backend
yarn install
yarn start:dev

# Frontend
cd frontend
yarn install
yarn dev
```

### Production
Use Docker Compose for production deployments:
```bash
docker compose up -d
```

## Troubleshooting

### Port Already in Use
If port 80, 3200, or 5432 is already in use, you can change the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Map to different host port
```

### Database Connection Issues
1. Check if PostgreSQL is healthy:
```bash
docker compose ps
```

2. Check backend logs:
```bash
docker compose logs backend
```

3. Verify database is accessible:
```bash
docker compose exec postgres pg_isready -U postgres
```

### Frontend Can't Connect to Backend
1. Check VITE_API_URL in your `.env` file
2. Ensure backend is running:
```bash
docker compose ps backend
```

3. Check if backend is accessible:
```bash
curl http://localhost:3200/graphql
```

### Build Failures
If builds fail, try cleaning Docker cache:
```bash
docker compose build --no-cache
```

### Permission Issues
If you encounter permission issues with volumes:
```bash
docker compose down -v
docker volume prune
docker compose up --build
```

## Advanced Configuration

### Custom Network Configuration
The services communicate via a Docker network called `rpg-network`. All services can reach each other using their service names (e.g., `backend`, `postgres`).

### Database Persistence
Database data is stored in a Docker volume named `postgres_data`. This persists even when containers are stopped or removed.

To backup the database:
```bash
docker compose exec postgres pg_dump -U postgres rpg_blog > backup.sql
```

To restore from backup:
```bash
cat backup.sql | docker compose exec -T postgres psql -U postgres -d rpg_blog
```

### Environment Variables in Docker
The frontend uses runtime environment variable injection. The `env-config.js` file is generated when the container starts, allowing you to change the API URL without rebuilding the image.

## Production Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Update `DB_PASSWORD` to a secure password
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `FRONTEND_URL` for CORS
- [ ] Set up HTTPS/SSL certificates (use reverse proxy like Nginx or Traefik)
- [ ] Configure proper logging and monitoring
- [ ] Set up automated backups for PostgreSQL
- [ ] Review and adjust resource limits in docker-compose.yml
- [ ] Enable Docker restart policies (already set to `unless-stopped`)

## Cleaning Up

To completely remove all containers, networks, and volumes:
```bash
docker compose down -v --rmi all
```

This will:
- Stop and remove containers
- Remove networks
- Remove volumes (⚠️ deletes database data!)
- Remove built images

## Support

For issues or questions about the application itself, refer to the main README.md file.
