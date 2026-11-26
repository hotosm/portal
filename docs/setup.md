### Authentication Setup (Optional)

Portal uses [Hanko](https://hanko.io/) for SSO authentication.

**Configuration:**
```bash
# In .env file
VITE_HANKO_URL=https://dev.login.hotosm.org       # Frontend
HANKO_API_URL=https://dev.login.hotosm.org        # Backend
COOKIE_SECRET=your-secret-key-min-32-bytes        # Backend (change in production!)
```

**For local development**, Portal includes a local Hanko SSO server that runs in Docker (dev profile only):
- Automatically starts with `make dev`
- Runs on port 8002 (proxied through Vite on port 5173)
- Uses local PostgreSQL database (port 5436)
- Configuration in `hanko-config.yaml`
- **Important**: Access the app at `http://127.0.0.1:5173` (NOT `localhost`) for proper cookie handling

**For production**, Portal uses the hosted Hanko instance at `https://dev.login.hotosm.org`.

See [`auth-libs/README.md`](auth-libs/README.md) for detailed authentication documentation.

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

**Note**: `make migrate` auto-detects dev/prod containers. On the deployed
environments you do not run this by hand: both compose files declare a one-shot
`migrate` service that runs `alembic upgrade head` before the backend starts.

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

### Utilities

```bash
make clean             # Clean build artifacts and caches
make health            # Check service health
make help              # Show all available commands
```

### Environment Variables

```bash
# Production
VITE_HANKO_URL=https://dev.login.hotosm.org
HANKO_API_URL=https://dev.login.hotosm.org
JWT_ISSUER=auto
COOKIE_SECRET=<your-secret-from-github-secrets>

# Development (local with Hanko SSO)
VITE_HANKO_URL=http://127.0.0.1:5173
JWT_ISSUER=http://127.0.0.1:5173
```

## API Documentation

https://portal.hotosm.org/api/redoc

