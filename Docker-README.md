# Shesha Framework - Local Development Setup

This Docker setup is designed for **developers working on Shesha locally**. It provides a containerized environment to simplify local development and testing with a single `docker-compose.yml` file that includes all services.

## File Overview

- `docker-compose.yml` - **Complete Development Environment** - All services with flexible configuration
- `.env` - Environment variables for database names, ports, and configuration
- `generate-dev-certs.sh` - Script to generate development HTTPS certificates
- `shesha-core/Dockerfile` - Builds the Shesha API application for development
- `shesha-core/src/Shesha.Web.Host/appsettings.Docker.json` - Docker-specific API configuration
- `shesha-reactjs/Dockerfile.dev` - Development build with hot reload for React frontend
- `shesha-starter/database/Dockerfile` - SQL Server container with automatic database import
- `shesha-starter/database/import-db.sh` - Database import script for BACPAC files
- `shesha-functional-tests/database/Dockerfile` - SQL Server container for functional tests
- `shesha-functional-tests/database/import-db.sh` - Database import script for functional tests

## Quick Start

### Default Setup (External SQL Server)

If you already have SQL Server running locally (recommended for most developers):

```bash
# Start all services - uses your existing SQL Server on localhost:1433
docker-compose up -d

# Start from scratch
sudo docker-compose up --build

# Watch logs in real-time
docker-compose logs -f

# Stop when done developing
docker-compose down
```

**What you get:**
- Shesha React Frontend: http://localhost:3000
- Shesha API: http://localhost:21021 and https://localhost:44362
- Uses your existing SQL Server on localhost:1433
- Development environment with source code mounting and hot reload

### Full Isolated Setup (All Services Containerized)

Perfect for new developers or when you want a clean, isolated setup:

1. **Comment out the external SQL connection** in `docker-compose.yml`:
   ```yaml
   # Comment this line in shesha-api service:
   # - ConnectionStrings__Default=Server=host.docker.internal,1433;...

   # Uncomment this line:
   - ConnectionStrings__Default=Server=shesha-database,1433;...

   # Also uncomment the depends_on section in shesha-api
   ```

2. **Update frontend API host** in `docker-compose.yml`:
   ```yaml
   # Comment this line in shesha-frontend service:
   # - NEXT_APP_API_HOST=http://localhost:21021

   # Uncomment this line:
   - NEXT_APP_API_HOST=http://shesha-api:21021
   ```

3. **Start the complete environment**:
   ```bash
   docker-compose up -d
   ```

**What you get:**
- Shesha React Frontend: http://localhost:3000
- Shesha API: http://localhost:21021 and https://localhost:44362
- Fresh SQL Server: localhost:1433 (isolated from other projects)
- Automatic database import from backup files
- Complete isolated development environment with hot reload

## Customizing Your Setup

You can comment out services you don't need in `docker-compose.yml`:

### Frontend-only Development
```yaml
# Comment out these services:
# shesha-api:
#   ...
# shesha-database:
#   ...
```

### Backend-only Development
```yaml
# Comment out this service:
# shesha-frontend:
#   ...
```

### API-only Development (External Database)
```yaml
# Comment out these services:
# shesha-frontend:
#   ...
# shesha-database:
#   ...
```

## Database Import

The development setup includes SQL Server containers that:
1. **shesha-starter/database/**: Creates development databases using `import-db.sh`
2. **shesha-functional-tests/database/**: Creates functional test databases using `import-db.sh`
3. Automatically copies database backup files (`.bacpac` and `.backup`) from respective database folders
4. Provides import script capabilities through dedicated Dockerfiles

### Manual Database Import

If you need to manually import the BACPAC file:

```bash
# Connect to the database container
docker exec -it shesha-sqlserver-dev bash

# Use sqlcmd to connect
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P @123Shesha

# Your database is ready at: Functional-main-0
```

## Local Development Features

### Development Environment Settings

The containers are configured for local development:

```yaml
# Shesha Frontend (Development Mode with Hot Reload)
NODE_ENV: "development"
NEXT_TELEMETRY_DISABLED: 1

# Shesha API (Development Mode)
ASPNETCORE_ENVIRONMENT: "Development"  # Enables detailed error pages
ASPNETCORE_URLS: "http://0.0.0.0:21021;https://0.0.0.0:44362"
restart: "no"  # Won't auto-restart during development

# SQL Server (Developer Edition)
MSSQL_PID: "Developer"  # Free developer edition
MSSQL_SA_PASSWORD: "@123Shesha"  # Default dev password
```

### Source Code Mounting

All services include source code mounting for easier development:
- Changes to source code are reflected in the container
- Hot reload for React frontend
- No need to rebuild images during development
- Useful for debugging and testing

### Port Mappings

- **3000**: Shesha React Frontend (Next.js development server)
- **21021**: Shesha API HTTP port
- **44362**: Shesha API HTTPS port
- **1433**: SQL Server (external - uses existing)
- **1433**: SQL Server (containerized - new isolated instance)

### HTTPS Support (Built-in)

**HTTPS certificates are automatically generated using the included script:**

```bash
# Generate development certificates (run once)
./generate-dev-certs.sh

# Then start the services - HTTPS certificates are built-in
docker-compose up -d
```

**Access points:**
- React Frontend: http://localhost:3000
- API HTTP: http://localhost:21021
- API HTTPS: https://localhost:44362 (self-signed certificate)

> **Note**: The HTTPS certificate is self-signed for development purposes. Your browser will show a security warning - this is normal for local development.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Make sure no other services are using ports 3000, 21021, 44362, or 1433/1433
   - Use `docker ps` to check running containers

2. **SQL Server connection issues**
   - Ensure the SQL Server container is fully started before the API
   - Check connection string matches your setup
   - Verify SQL Server accepts the SA password

3. **Architecture compatibility issues (Apple Silicon Macs)**
   - SQL Server container may show AMD64 warnings on Apple Silicon Macs
   - This is expected behavior - SQL Server runs in emulation mode
   - Performance may be slower but functionality is preserved
   - Alternative: Use external SQL Server or Azure SQL Database for better performance

4. **Build issues**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild images: `docker-compose build --no-cache`

### Checking Service Status

```bash
# Check running containers
docker ps

# Check frontend logs
docker logs shesha-reactjs-dev

# Check API logs
docker logs shesha-core-dev

# Check database logs (if using containerized database)
docker logs shesha-sqlserver-dev

# Test frontend connectivity
curl -I http://localhost:3000

# Test API connectivity
curl -I http://localhost:21021
```

### Database Connection Testing

```bash
# Test from host machine (external SQL Server)
sqlcmd -S localhost,1433 -U sa -P @123Shesha -Q "SELECT name FROM sys.databases"

# Test from host machine (containerized SQL Server)
sqlcmd -S localhost,1433 -U sa -P @123Shesha -Q "SELECT name FROM sys.databases"

# Test frontend from container
docker exec -it shesha-reactjs-dev curl -I http://localhost:3000

# Test API from container
docker exec -it shesha-core-dev curl -I http://localhost:21021/AbpUserConfiguration/GetAll
```

## Development

### Building Individual Components

```bash
# Build only the frontend
docker build -t shesha-frontend ./shesha-reactjs

# Build only the API
docker build -t shesha-api ./shesha-core

# Build only the database
docker build -t shesha-db ./shesha-starter/database

# Build everything
docker-compose build
```

### Updating the Application

```bash
# Pull latest code changes and rebuild
git pull
docker-compose build
docker-compose up -d
```

## 🔥 Development Recommendations

### **⚠️ Important: Local Development vs Docker**

**For active development with hot reloading, we strongly recommend running projects directly on your machine rather than in Docker containers.** Here's why:

#### 🏠 Run Locally for Development:
- **Hot Reloading**: File changes trigger immediate rebuilds
- **Faster Iteration**: No container rebuild delays
- **Better Debugging**: Direct access to development tools
- **IDE Integration**: Full IntelliSense and debugging support
- **Easier Dependencies**: Direct npm/dotnet tool access

#### 🐳 Use Docker for:
- **Database Only**: Run just the database container
- **Integration Testing**: Full environment testing
- **Production-like Setup**: Complete containerized environment
- **Team Onboarding**: Consistent setup across team members
- **CI/CD**: Automated testing and deployment

### Mixed Development Setup (Recommended)

**Option 1: Database in Docker, Apps Local (Best for Development)**
```bash
# Start only the database
docker-compose up shesha-database

# Then run API and Frontend locally on your machine:
# API: dotnet run (in shesha-core project)
# Frontend: npm run dev (in shesha-reactjs project)
```

**Option 2: Full Docker for Integration Testing**
```bash
# Full containerized environment
docker-compose up --build
```

## 📁 Copying Docker Files to Other Projects

You can easily adapt these Docker files for other Shesha projects:

### 1. Copy Required Files

Copy these files to your target project:
- `docker-compose.yml`
- `.env`
- `generate-dev-certs.sh`
- `Docker-README.md`
- `shesha-starter/database/` (entire folder with Dockerfile and import-db.sh)
- `shesha-core/src/Shesha.Web.Host/appsettings.Docker.json` (if using API container)

### 2. Minimal Changes Required

**Update `docker-compose.yml`:**
```yaml
# Change build contexts to match your project structure
shesha-api:
  build:
    context: ./your-project-backend  # Update path

shesha-frontend:
  build:
    context: ./your-project-frontend  # Update path

shesha-database:
  build:
    context: ./your-database-folder  # Update if different
```

**Update `.env` for your project:**
```bash
DATABASE_NAME=YourProject-Dev  # Change to your project name
DATABASE_SERVER=shesha-database,1433  # Or your external server
DATABASE_PASSWORD=@123Shesha  # Your database password
API_HOST=http://shesha-api:21021  # Your API host
API_PORT=21021  # API HTTP port
API_HTTPS_PORT=44362  # API HTTPS port
FRONTEND_PORT=3000  # Frontend port
```

**Update database BACPAC file:**
- Replace `ShaProjectName.bacpac` with your project's BACPAC file
- Update the filename in `import-db.sh` if needed

### 3. Project-Specific Considerations

**Backend (.NET Core):**
- Ensure your project has a `Dockerfile`
- Verify `appsettings.Docker.json` exists with Docker-specific configuration (included in `shesha-core/src/Shesha.Web.Host/`)
- Check that connection strings in `appsettings.Docker.json` match your Docker setup
- Ensure health check endpoints are available

**Frontend (React/Next.js):**
- Ensure your project has a `Dockerfile.dev` for development
- Verify environment variables match your API endpoints
- Update port mappings if your frontend uses different ports

## Developer Workflow

### Typical Development Session

```bash
# 1. Start your development environment
docker-compose up -d

# 2. Start coding - your changes are reflected in the container with hot reload
# Edit files in shesha-reactjs/src/... (frontend)
# Edit files in shesha-core/src/... (API)

# 3. View logs when needed
docker-compose logs -f

# 4. Test your application
curl http://localhost:3000  # Frontend
curl http://localhost:21021/AbpUserConfiguration/GetAll  # API HTTP
curl -k https://localhost:44362/AbpUserConfiguration/GetAll  # API HTTPS

# 5. Stop when done for the day
docker-compose down
```

### Debugging and Testing

- **Frontend Testing**: Open http://localhost:3000 in your browser
- **API Endpoint Testing**: Use tools like Postman or curl with:
  - HTTP: http://localhost:21021
  - HTTPS: https://localhost:44362
- **Database Access**: Connect directly to localhost:1433 (or 1433 for containerized setup)
- **Log Viewing**: Real-time logs with `docker-compose logs -f`
- **Container Shell Access**:
  - Frontend: `docker exec -it shesha-reactjs-dev sh`
  - API: `docker exec -it shesha-core-dev bash`

## Developer Support

### Getting Help

- **Framework Documentation**: Check the main README.md for Shesha framework details
- **Docker Issues**: Review logs with `docker-compose logs -f`
- **Database Issues**: Use SQL Server Management Studio to connect to localhost:1433/1433
- **API Issues**: Test endpoints with `curl -I http://localhost:21021`

### Prerequisites for Local Development

- **Docker Desktop**: Installed and running
- **Memory**: At least 4GB available for containers
- **Disk Space**: ~2GB for images and data
- **Ports**: 3000, 21021, 44362, and 1433/1433 available

### Common Developer Tasks

```bash
# Rebuild after major changes
docker-compose build --no-cache

# Reset database (containerized setup only)
docker-compose down -v
docker-compose up -d

# View specific service logs
docker-compose logs shesha-frontend
docker-compose logs shesha-api
docker-compose logs shesha-database
```

## Configuration Examples

### Example 1: Full Stack Development (Default)
All services running with external SQL Server:
```bash
# No changes needed to docker-compose.yml
docker-compose up -d
```

### Example 2: Full Isolated Development
All services including database containerized:
```yaml
# In docker-compose.yml, uncomment:
# - Database connection string for shesha-api
# - depends_on for shesha-api
# - Internal API host for shesha-frontend
```

### Example 3: Frontend Only
```yaml
# Comment out in docker-compose.yml:
# shesha-api: ...
# shesha-database: ...
```

---
*This setup is optimized for local development. For production deployment, additional configuration for security, performance, and scalability would be required.*