# HOT Portal

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

A centralized web workspace that simplifies access to the HOT (Humanitarian OpenStreetMap Team) Tech Suite ecosystem. Portal provides a unified interface for accessing multiple geospatial tools, managing projects, and streamlining workflows for humanitarian mapping and social change.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## About

The HOT Tech Suite encompasses a full spectrum of geospatial tools for humanitarian work:

- **Drone Tasking Manager** - Organized aerial image capturing
- **OpenAerialMap** - Publishing aerial imagery
- **fAIr** - AI-assisted mapping
- **Tasking Manager** - Remote mapping coordination
- **Field Tasking Manager** - Field mapping project organization
- **ChatMap** - Accessible field mapping via messaging apps
- **Export Tool** - OSM data export
- **uMap** - Map data visualization

While powerful individually, these tools present challenges: different logins, scattered documentation, varied interfaces, and complex workflows. Portal addresses these issues by providing a single, multilingual entry point that reduces cognitive load and improves accessibility for all users—from technical experts to community mappers.

## Features

- **Unified Access**: Single sign-on across the HOT Tech Suite
- **Multilingual Support**: Accessible to global communities
- **Role-Based Interface**: Tailored experiences for mappers, project managers, drone pilots, funders, and organizations
- **Cross-Product Workflows**: Streamlined processes combining multiple tools
- **Centralized Management**: Projects, documentation, and support in one place
- **Modern Architecture**: Built with React 19, FastAPI, and PostgreSQL/PostGIS
- **Cloud-Native**: Docker support for containerized deployment
- **Open Source**: Licensed under GNU AGPL v3.0

## Tech Stack

### Frontend
- [React 19](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vite.dev/) - Build tool and dev server
- [Biome](https://biomejs.dev/) - Fast linter and formatter
- [Vitest](https://vitest.dev/) - Unit testing framework
- [pnpm](https://pnpm.io/) - Package manager

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLAlchemy 2.0](https://www.sqlalchemy.org/) - Async ORM
- [Pydantic v2](https://docs.pydantic.dev/) - Data validation
- [Alembic](https://alembic.sqlalchemy.org/) - Database migrations
- [asyncpg](https://github.com/MagicStack/asyncpg) - PostgreSQL driver
- [pytest](https://pytest.org/) - Testing framework
- [Ruff](https://docs.astral.sh/ruff/) - Fast Python linter and formatter
- [uv](https://docs.astral.sh/uv/) - Fast Python package manager

### Database
- [PostgreSQL 16](https://www.postgresql.org/) - Relational database
- [PostGIS](https://postgis.net/) - Spatial database extension

## Prerequisites

### Docker Development (Recommended)
- [Docker](https://www.docker.com/) 24+
- [Docker Compose V2](https://docs.docker.com/compose/) 2.20+ (note: use `docker compose`, not `docker-compose`)

### Local Development (Without Docker)
- Python 3.12+
- Node.js 20+
- **PostgreSQL 16+ with PostGIS** (must be running locally)
- [uv](https://docs.astral.sh/uv/) - Python package manager
- [pnpm](https://pnpm.io/) - Node package manager

## Quick Start

Get up and running in 3 steps:

```bash
# 1. Clone and setup
git clone <repository-url>
cd portal
cp .env.example .env
# Optional: Edit .env if you have port conflicts (e.g., PostgreSQL on 5432)

# 2. Start all services
make dev

# 3. In a new terminal, run database migrations
make migrate
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

**Note**: For local development without Docker, see the [Development](#development) section below.

## Development

### Option 1: Docker (Recommended)

**Start/Stop services:**
```bash
make dev               # Start all services with hot-reload
make stop              # Stop all services
```

**Database migrations:**
```bash
make migrate           # Run migrations (auto-detects Docker or local)
make migrate-create MSG="description"  # Create new migration
make migrate-rollback  # Rollback last migration
make migrate-history   # View migration history
```

**View logs:**
```bash
make logs              # All services (real-time)
make logs-backend      # Backend only (real-time)
make logs-frontend     # Frontend only (real-time)
make logs-db           # Database only (real-time)
```

**Docker utilities:**
```bash
make build             # Rebuild Docker images
make prod              # Run in production mode
```

**Production deployment:**
```bash
# 1. Start production services
make prod

# 2. Run migrations (one-time setup or after updates)
make migrate

# 3. Check logs
make logs

# 4. Stop services
make prod-down
```

**Note**: `make migrate` auto-detects dev/prod containers. In production deployments, migrations should ideally run as part of your CI/CD pipeline or as a Kubernetes init container.

### Option 2: Local Setup (Without Docker)

**Prerequisites**:
- PostgreSQL 15+ with PostGIS extension
- Python 3.12+
- Node.js 20+

**Install PostgreSQL with PostGIS (Ubuntu/Debian):**
```bash
sudo apt install postgresql-15 postgresql-15-postgis-3
sudo systemctl start postgresql
```

**1. Install dependencies:**
```bash
make install           # Installs pnpm and uv dependencies
```

**2. Setup PostgreSQL database:**
```bash
# Find your PostgreSQL port (usually 5432, but could be 5433, 5434, etc.)
pg_lsclusters

# Set password for postgres user (replace PORT with your PostgreSQL port)
sudo -u postgres psql -p PORT -c "ALTER USER postgres PASSWORD 'postgres';"

# Create the database
sudo -u postgres psql -p PORT -c "CREATE DATABASE portal;"

# Enable PostGIS extension
sudo -u postgres psql -p PORT -d portal -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

**3. Configure environment:**
```bash
cp .env.example .env
# Edit .env and update DATABASE_URL with your PostgreSQL port
# Example: DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5434/portal
```

**4. Run database migrations:**
```bash
make migrate
```

**5. Start services** (use separate terminals):
```bash
# Terminal 1 - Backend
make dev-backend

# Terminal 2 - Frontend
make dev-frontend
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### Testing

**Important**: Tests run locally, not in Docker. Run `make install` first.

```bash
make test              # Run all tests
make test-backend      # Backend only
make test-frontend     # Frontend only
```

**Detailed backend testing:**
```bash
cd backend
uv run pytest                    # All tests
uv run pytest --cov              # With coverage
uv run pytest -v                 # Verbose
uv run pytest tests/api/         # Specific directory
```

**Detailed frontend testing:**
```bash
cd frontend
pnpm test                        # Run tests
pnpm test:ui                     # With UI
pnpm test:coverage               # With coverage
```

### Code Quality

**Quick commands:**
```bash
make lint              # Check code style
make lint-fix          # Auto-fix issues
```

**Backend (Ruff):**
```bash
cd backend
uv run ruff check .              # Lint
uv run ruff check --fix .        # Fix
uv run ruff format .             # Format
```

**Frontend (Biome):**
```bash
cd frontend
pnpm lint                        # Lint
pnpm lint:fix                    # Fix and format
```

### Database Operations

```bash
make db-shell          # Open PostgreSQL shell
make db-reset          # Reset database (⚠️ deletes all data)
```

**Migrations:**

The `make migrate` command automatically detects whether you're running Docker or local:
- If `backend-dev` container is running → runs migrations inside Docker
- Otherwise → runs migrations locally with `uv`

```bash
make migrate                              # Run all pending migrations
make migrate-create MSG="description"     # Create new migration
make migrate-rollback                     # Rollback last migration
make migrate-history                      # View migration history
```

**Note**: When using Docker, you must run `make migrate` after the first `make dev` to initialize the database schema.

### Troubleshooting

**Docker Compose version error:**
If you get `KeyError: 'ContainerConfig'` or similar errors, you need Docker Compose V2:
```bash
# Remove old version
sudo apt remove docker-compose docker-compose-plugin

# Install V2
sudo apt install docker-compose-v2

# Verify (should show v2.x.x)
docker compose version
```

**Docker services won't start:**
```bash
docker compose down -v           # Remove volumes
docker compose build --no-cache  # Rebuild
make dev                         # Start again
```

**Port conflicts:**
If you get "port already allocated" errors, edit `.env`:
```env
BACKEND_PORT=8001
FRONTEND_PORT=5174
POSTGRES_PORT=5433  # Default PostgreSQL uses 5432
```

**Database connection issues:**
```bash
docker compose ps                # Check status
docker compose logs db           # Check logs
make db-reset                    # Reset (⚠️ deletes data)
```

**Backend hot-reload not working:**
- Ensure you're using `make dev` (development profile)
- Check volume mounts in `docker-compose.yml`

**Frontend not connecting to backend:**
- Verify proxy config in `vite.config.ts`
- Check CORS settings in `backend/app/core/config.py`
- Ensure backend is running: `curl http://localhost:8000/health`

### Utilities

```bash
make clean             # Clean build artifacts and caches
make health            # Check service health
make help              # Show all available commands
```

## Project Structure

```
portal/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   └── pages/          # Page components
│   ├── Dockerfile          # Multi-stage Docker build
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── biome.json
│
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   └── routes/     # Route modules
│   │   ├── core/           # Configuration & database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── tests/          # Test suite
│   ├── Dockerfile          # Multi-stage Docker build
│   └── pyproject.toml      # uv configuration
│
├── scripts/                 # Utility scripts
│   └── init-db.sql         # Database initialization
│
├── .github/
│   └── workflows/
│       └── deploy-testing.yml  # CI/CD pipeline
│
├── docker-compose.yml       # Docker orchestration
├── Makefile                # Development commands
├── .env.example            # Environment variables template
└── README.md              # This file
```

## API Documentation

The API is self-documented using FastAPI's built-in OpenAPI support:

- **Swagger UI**: http://localhost:8000/api/docs (interactive testing)
- **ReDoc**: http://localhost:8000/api/redoc (clean documentation)
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json (specification)

**Key endpoints:**
- `GET /health` - Basic health check
- `GET /ready` - Readiness check with database status
- `GET /api/health-check` - Detailed health with response times

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests: `make test`
4. Run linters: `make lint-fix`
5. Commit with descriptive message
6. Push and create a Pull Request

## License

[GNU Affero General Public License v3.0](LICENSE)

## Links

- [Architecture Documentation](ARCHITECTURE.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
