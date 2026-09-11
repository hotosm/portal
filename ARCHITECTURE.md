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
  - `/` - Root welcome message with docs link

- **Authentication (OSM OAuth)**:
  - `/api/auth/osm/login` - Start OSM OAuth flow (requires Hanko session)
  - `/api/auth/osm/callback` - Handle OSM OAuth callback, sets encrypted cookie
  - `/api/auth/osm/status` - Check OSM connection status
  - `POST /api/auth/osm/disconnect` - Revoke OSM tokens and disconnect account

- **Tasking Manager**:
  - `/api/tasking-manager/projects` - Return all project of Tasking Manager
  - `/api/tasking-manager/countries` - Return all countries of Tasking Manager
  - `/api/tasking-manager/projectid/{project_id}` - ProjectID data of Tasking Manager
  - `/api/tasking-manager/projects/user` - User data of Tasking Manager

- **Drone Tasking Manager**:
  - `/api/drone-tasking-manager/projects` - Return all project of Drone TM (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects?fetch_all=true` - Returns all Drone TM projects without pagination. (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects/{project_id}` - ProjectID data of Drone TM (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects/user` - Project user data of Drone TM (Drone Tasking Manager)
  - `/api/drone-tasking-manager/projects/centroids` - Get project centroids from the DroneTM API.

- **Open Aerial Map**:
  - `/api/open-aerial-map/projects` - Return all project of Open Aerial Map
  - `/api/open-aerial-map/projects/all` - Return all OAM imagery (compact snapshot)
  - `/api/open-aerial-map/projects/snapshot` - Return OAM imagery snapshot from DB
  - `/api/open-aerial-map/projects/{image_id}` - ImageID data of Open Aerial Map
  - `/api/open-aerial-map/user/{user_id}` - UserID data of Open Aerial Map
  - `/api/open-aerial-map/user/me` - User data of Open Aerial Map

- **fAIr**:
  - `/api/fair/projects` - Get AI models from fAIr, paginated/filterable
  - `/api/fair/models/centroid` - Get all AI model centroids from fAIr as GeoJSON
  - `DELETE /api/fair/models/centroid/cache` - Invalidate fAIr centroids cache
  - `/api/fair/model/{mid}` - Obtain details of a specific model of fAIr
  - `/api/fair/model/user/{user_id}` - Get AI models from fAIr filtered by user ID
  - `/api/fair/me/models` - Get AI models from fAIr for the authenticated user

- **Field Tasking Manager**:
  - `/api/field-tm/projects` - Return all project of Field Tasking Manager
  - `/api/field-tm/projectid/{project_id}` - ProjectID data of Field Tasking Manager

- **UMap**:
  - `/api/umap/{location}/{project_id}` - ProjectID data of UMap HOTOSM
  - `/api/umap/user/maps` - UMap HOTOSM user maps information
  - `/api/umap/showcase` - Umap HOTOSM showcase projects

- **ChatMap**:
  - `/api/chatmap/user/maps` - Authenticated user's ChatMap maps
  - `/api/chatmap/map/{map_id}` - Public ChatMap map by ID
  - `/api/chatmap/map` - Authenticated user's ChatMap (Hanko cookie)

- **Homepage Map**:
  - `/api/homepage-map/projects/snapshot` - Unified homepage map snapshot (GeoJSON)

- **Export Tool**:
  - `/api/export-tool/jobs` - Data jobs of Export Tool
  - `/api/export-tool/jobs/me` - Authenticated user's Export Tool jobs
  - `/api/export-tool/jobs/{job_uid}` - ID of data jobs of Export Tool

- **Plans** (user-owned collections of project references):
  - `/api/plans` - List plans visible to the user (own + group plans)
  - `POST /api/plans` - Create a new plan
  - `POST /api/plans/resolve-url` - Parse a project URL and confirm it exists upstream
  - `/api/plans/shared/{plan_id}` - Return a public plan (no auth required)
  - `/api/plans/{plan_id}` - Return a plan if the user may view it
  - `PATCH /api/plans/{plan_id}` - Update name/description/scope/visibility/projects
  - `DELETE /api/plans/{plan_id}` - Delete a plan (owner only)
  - `PATCH /api/plans/{plan_id}/projects/{plan_project_id}/toggle-exists` - Toggle project_exists on a plan_project
  - `PATCH /api/plans/{plan_id}/projects/{plan_project_id}/complete-task` - Resolve a placeholder task against an upstream project
  - `/api/plans/{plan_id}/collections` - List the collections of a plan
  - `POST /api/plans/{plan_id}/collections` - Add a collection to a plan
  - `PATCH /api/plans/{plan_id}/collections/{collection_id}` - Rename/move a collection
  - `DELETE /api/plans/{plan_id}/collections/{collection_id}` - Delete a collection
  - `POST /api/plans/{plan_id}/projects` - Append one project/task to a plan
  - `PATCH /api/plans/{plan_id}/projects/reorder` - Apply drag-and-drop placements (collection + position)
  - `PATCH /api/plans/{plan_id}/projects/{plan_project_id}/collection` - Move a project to a different collection
  - `PATCH /api/plans/{plan_id}/projects/{plan_project_id}/featured` - Mark/unmark a project as featured
  - `DELETE /api/plans/{plan_id}/projects/{plan_project_id}` - Delete one project/task from a plan
  - `PATCH /api/plans/{plan_id}/projects/{app}/{project_id}` - Update the status of one project inside a plan
  - `/api/plans/{plan_id}/images/{image_id}/content` - Raw image binary content of a plan image
  - `POST /api/plans/{plan_id}/images` - Upload an image to a plan
  - `DELETE /api/plans/{plan_id}/images/{image_id}` - Delete a plan image

- **Groups**:
  - `/api/groups` - List the groups the current user belongs to (proxied from login)

- **Auth testing** (admin-only diagnostic endpoints):
  - `/api/test/me` - Requires Hanko auth + admin access; returns JWT user info
  - `/api/test/osm` - Requires Hanko auth + admin + OSM connection; returns OSM connection info

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
