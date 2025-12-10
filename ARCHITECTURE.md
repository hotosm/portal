# Architecture Documentation

## Overview

Portal is a full-stack web application with React 19 frontend, FastAPI backend, and PostgreSQL/PostGIS database. Designed for containerized deployment on EC2 (testing) and Kubernetes (production).

## System Architecture

```
┌─────────────────────┐
│   React Frontend    │  (Vite, TypeScript, Biome)
│   Port: 5173        │
└──────────┬──────────┘
           │ REST API
┌──────────▼──────────┐
│   FastAPI Backend   │  (Python 3.12, async)
│   Port: 8000        │
└──────────┬──────────┘
           │ asyncpg
┌──────────▼──────────┐
│  PostgreSQL + PostGIS│  (Database)
│   Port: 5432        │
└─────────────────────┘
```

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Biome** - Linting/formatting (replaces ESLint + Prettier)
- **pnpm** - Package manager

### Backend
- **FastAPI** - Modern async Python framework
- **Python 3.12** - Latest stable version
- **uv** - Fast package manager (replaces pip/poetry)
- **Ruff** - Fast linter/formatter (replaces flake8/black)
- **SQLAlchemy 2.0** - Async ORM
- **Pydantic v2** - Data validation

### Database
- **PostgreSQL 16** - Relational database
- **PostGIS** - Spatial extension for geospatial data

## Project Structure

```
portal/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── services/   # API calls
│   │   └── types/      # TypeScript types
│   └── package.json
├── backend/            # FastAPI application
│   ├── app/
│   │   ├── api/routes/ # API endpoints
│   │   ├── core/       # Config & database
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── services/   # Business logic
│   │   └── tests/      # Test suite
│   └── pyproject.toml
└── .github/workflows/  # CI/CD
```

## Key Decisions

**Why FastAPI?**
- Automatic OpenAPI documentation
- Native async/await support
- Type hints for validation
- High performance

**Why PostgreSQL + PostGIS?**
- ACID compliance
- Geospatial capabilities required for mapping features
- Rich feature set (JSONB, full-text search, etc.)

**Why monorepo?**
- Atomic commits across frontend/backend
- Single CI/CD pipeline
- Easier code sharing

**Modern tooling:**
- **uv** - 10-100x faster than pip
- **Ruff** - 10-100x faster than flake8/black
- **Biome** - Faster than ESLint + Prettier

## Application Design

### Backend Architecture
- **Async-first**: All database operations use async/await
- **Dependency injection**: FastAPI's `Depends` pattern
- **Repository pattern**: Services layer for business logic
- **Schema separation**: Pydantic models (API) vs SQLAlchemy models (DB)

### API Conventions
- **Base path**: `/api`
- **Health checks**:
  - `/health` - Liveness probe
  - `/ready` - Readiness probe (includes DB check)
  - `/api/health-check` - Detailed diagnostics
  - `/api/tasking-manager/projects` - Return all project of Tasking Manager
  - `/api/tasking-manager/countries` - Return all countries of Tasking Manager
  - `/api/tasking-manager/projectid` - ProjectID data of Tasking Manager
  - `/api/drone-tasking-manager/projects` - Return all project of Drone TM (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects?fetch_all=true` - Returns all Drone TM projects without pagination. (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects/projectid` - ProjectID data of Drone TM (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects/user` - Project user data of Drone TM (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects/centroids` - Get project centroids from the DroneTM API.
  - `/api/open-aerial-map/projects` - Return all project of Open Aerial Map
  - `/api/open-aerial-map/imageid` - ImageID data of Open Aerial Map
  - `/api/open-aerial-map/user/userid` - UserID data of Open Aerial Map
  - `/api/fair/projects` - Return all project of fAIr
  - `/api/fair/dataset/user/{user_id}` - Get AI models from fAIr API filtered by user ID
  - `/api/fair/model/user/{user_id}` - Get datasets from fAIr API filtered by user ID
  - `/api/fair/me/models` - Get AI models from fAIr API for the authenticated user
  - `/api/fair/me/datasets` - Get datasets from fAIr API for the authenticated user
  - `/api/fair/model/user/{user_id}` - Returns the user models of fAIr
  - `/api/fair/dataset/user/{user_id}` - Returns the user dataset of fAIr
  - `/api/field-tm/projects` - Return all project of Field Tasking Manager
  - `/api/field-tm/projectid` - ProjectID data of Field Tasking Manager
  - `/api/umap/{locationid}/{projectid}` - ProjectID data of UMap HOTOSM
  - `/api/export-tool/jobs` - Data jobs of Export Tool
  - `/api/export-tool/jobs/{job_uid}` - ID of data jobs of Export Tool

### Frontend Architecture
- **Component composition**: Small, reusable components
- **Custom hooks**: Encapsulate stateful logic
- **Service layer**: Centralized API calls
- **Type-first**: TypeScript types define contracts

## Deployment

### Phase 1: EC2 Testing (Current)
- Single EC2 instance
- Docker Compose orchestration
- Auto-deploy on push to `develop` branch
- GitHub Actions CI/CD pipeline

### Phase 2: Kubernetes Production (Future)
- HOTOSM Kubernetes cluster
- Domain: `portal.hotosm.org`
- JumpCloud SSO integration
- Helm charts for deployment

## Kubernetes Readiness

Application implements 12-factor app principles:
- ✅ Config via environment variables
- ✅ Logs to stdout
- ✅ Stateless processes
- ✅ Health check endpoints
- ✅ Non-root Docker user
- ✅ Graceful shutdown

## Development

### Local Setup
```bash
# Docker (recommended)
make dev

# Or run natively (2 terminals)
make dev-backend
make dev-frontend
```

### Testing
```bash
make test              # All tests
make test-backend      # Backend only
make test-frontend     # Frontend only
```

### Code Quality
```bash
make lint              # Check code style
make lint-fix          # Auto-fix issues
```

## Security

- CORS configuration
- Pydantic input validation
- SQLAlchemy prevents SQL injection
- Non-root Docker user in production

## References

- [README.md](README.md) - Setup and development guide
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [12-Factor App](https://12factor.net/)
