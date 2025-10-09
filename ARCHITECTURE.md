# Architecture Documentation

## Overview

Portal is a modern full-stack web application following a three-tier architecture pattern with a React frontend, FastAPI backend, and PostgreSQL/PostGIS database. The application is designed with cloud-native principles, making it suitable for containerized deployment on both traditional infrastructure and Kubernetes.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                    (Web Browser)                            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   React 19 + TypeScript + Vite                       │  │
│  │   - Component-based UI                               │  │
│  │   - Type-safe data flow                              │  │
│  │   - Fast HMR development                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                    Backend Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   FastAPI + Python 3.12                              │  │
│  │   - Async request handling                           │  │
│  │   - Pydantic validation                              │  │
│  │   - OpenAPI documentation                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL (asyncpg)
┌────────────────────────▼────────────────────────────────────┐
│                    Database Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   PostgreSQL 16 + PostGIS                            │  │
│  │   - Relational data storage                          │  │
│  │   - Geospatial capabilities                          │  │
│  │   - ACID compliance                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Decisions

### Frontend Stack

#### React 19
**Why:** Latest version with improved performance, better type inference, and enhanced concurrent features. Industry-standard for building modern web UIs.

#### TypeScript
**Why:** Provides static typing, improved IDE support, and catches errors at compile-time rather than runtime. Essential for large-scale applications.

#### Vite
**Why:** Extremely fast development server with hot module replacement. Modern build tool that leverages ES modules. Much faster than Create React App or Webpack.

**Alternatives considered:**
- Create React App (deprecated, slow)
- Next.js (unnecessary complexity for SPA)

#### Biome
**Why:** Single tool for linting and formatting. Faster than ESLint + Prettier (written in Rust). Zero configuration needed.

**Replaces:**
- ESLint
- Prettier

#### Vitest
**Why:** Fast testing framework optimized for Vite. Better integration than Jest. Supports ES modules natively.

#### pnpm
**Why:** Fastest package manager with efficient disk space usage through content-addressable storage. Better than npm and yarn in terms of speed and reliability.

### Backend Stack

#### FastAPI
**Why:** Modern Python web framework with automatic API documentation, async support, and excellent performance. Built on Starlette and Pydantic.

**Key features:**
- Automatic OpenAPI/Swagger documentation
- Type hints for request/response validation
- Native async/await support
- High performance (comparable to Node.js and Go)

#### Python 3.12+
**Why:** Latest stable Python with improved performance (faster than 3.11), better type hints, and modern async features.

#### uv
**Why:** Extremely fast Python package manager written in Rust. 10-100x faster than pip. Replaces multiple tools (pip, virtualenv, poetry).

**Replaces:**
- pip
- virtualenv
- poetry
- pipenv

#### Ruff
**Why:** Blazing-fast Python linter and formatter (10-100x faster than alternatives). Written in Rust. Single tool replaces multiple linters.

**Replaces:**
- flake8
- black
- isort
- pylint
- pyupgrade

#### SQLAlchemy 2.0
**Why:** Mature ORM with full async support in 2.0. Type-safe query builder. Industry standard for Python.

**Key features:**
- Async/await support
- Declarative models
- Query optimization
- Database migration support (via Alembic)

#### asyncpg
**Why:** Fastest PostgreSQL driver for Python. Designed specifically for async operations. Better performance than psycopg.

#### Pydantic v2
**Why:** Fast data validation using type hints. Native integration with FastAPI. V2 has significant performance improvements over v1.

**Uses:**
- Request/response validation
- Settings management
- Data serialization

#### pytest
**Why:** Most popular Python testing framework. Excellent fixture system, clear assertions, extensive plugin ecosystem.

### Database

#### PostgreSQL 16
**Why:** Most advanced open-source relational database. ACID compliant, excellent performance, rich feature set.

**Key features:**
- JSONB support
- Full-text search
- Window functions
- Materialized views
- Row-level security

#### PostGIS
**Why:** Industry-standard spatial database extension. Required for geographic data handling.

**Capabilities:**
- Geometry/geography types
- Spatial indexes
- Geographic queries
- Distance calculations

## Project Structure

### Monorepo Organization

```
portal/
├── frontend/           # React application
├── backend/           # FastAPI application
├── scripts/           # Deployment and utility scripts
└── .github/           # CI/CD workflows
```

**Why monorepo?**
- Simplified dependency management
- Atomic commits across frontend/backend
- Easier code sharing
- Single CI/CD pipeline

### Backend Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/       # API endpoint modules
│   ├── core/             # Configuration and utilities
│   │   ├── config.py     # Pydantic settings
│   │   └── database.py   # Database session management
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic layer
│   └── tests/            # Test suite
│       ├── conftest.py   # Pytest fixtures
│       └── api/          # API tests
└── pyproject.toml        # uv configuration
```

**Design patterns:**
- **Repository pattern**: Services layer abstracts database operations
- **Dependency injection**: FastAPI's Depends for loose coupling
- **Schema separation**: Pydantic models separate from SQLAlchemy models

### Frontend Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── types/           # TypeScript type definitions
│   ├── pages/           # Page components
│   ├── App.tsx          # Root component
│   └── main.tsx         # Application entry point
└── package.json
```

**Design patterns:**
- **Component composition**: Small, reusable components
- **Custom hooks**: Encapsulate stateful logic
- **Service layer**: Centralized API calls
- **Type-first**: TypeScript types define contracts

## Data Flow

### Request Flow

1. **Client Request**
   - User interacts with React UI
   - Service layer function called

2. **API Call**
   - Fetch request to backend
   - TypeScript types ensure correct payload

3. **Backend Processing**
   - FastAPI receives request
   - Pydantic validates request data
   - Route handler called

4. **Business Logic**
   - Service layer processes request
   - Database queries via SQLAlchemy
   - Async operations for performance

5. **Database Operation**
   - SQLAlchemy generates SQL
   - asyncpg executes query
   - Results returned

6. **Response**
   - Pydantic serializes response
   - FastAPI returns JSON
   - Frontend updates UI

### Example Flow: Health Check

```
Frontend                 Backend                  Database
   │                        │                        │
   │─GET /api/health-check─>│                        │
   │                        │                        │
   │                        │─SELECT 1──────────────>│
   │                        │                        │
   │                        │<─────────OK────────────│
   │                        │                        │
   │<────JSON response──────│                        │
   │                        │                        │
   │  Update UI             │                        │
   │                        │                        │
```

## Deployment Strategy

### Current (Phase 1): EC2 Testing Environment

**Infrastructure:**
- Single EC2 instance
- Docker Compose orchestration
- GitHub Actions for CI/CD

**Deployment process:**
1. Push to `develop` branch
2. GitHub Actions runs tests
3. Build Docker images
4. Push images to GitHub Container Registry
5. SSH to EC2 and deploy
6. Health check verification

**Why EC2 first?**
- Simpler initial setup
- Easier debugging
- Lower initial cost
- Faster iteration

### Future (Phase 2): Kubernetes Production

**Infrastructure:**
- HOTOSM Kubernetes cluster
- Helm chart for deployment
- Domain: `portal.hotosm.org`
- JumpCloud SSO integration

**Migration path:**
1. Create Helm chart from Docker Compose
2. Configure K8s resources:
   - Deployments for frontend/backend
   - StatefulSet for database (or managed DB)
   - Services for internal communication
   - Ingress for external access
   - ConfigMaps for configuration
   - Secrets for sensitive data
3. Set up CI/CD for K8s deployment
4. Configure monitoring and logging
5. Implement JumpCloud authentication

**Why Kubernetes?**
- Horizontal scaling
- Self-healing
- Rolling updates
- Resource optimization
- Production-grade reliability

### Kubernetes Readiness

The application is designed with K8s deployment in mind:

#### Health Checks
```python
@app.get("/health")        # Liveness probe
@app.get("/ready")         # Readiness probe
```

#### 12-Factor App Principles
- **Config via environment variables**: Pydantic settings
- **Logs to stdout**: All logging to console
- **Stateless processes**: No local state
- **Port binding**: Configurable ports
- **Graceful shutdown**: Signal handling

#### Docker Configuration
- Multi-stage builds for optimization
- Health checks in Dockerfiles
- Non-root user in production
- Minimal attack surface

#### Resource Limits
```yaml
# Example K8s resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Development Workflow

### Local Development

1. **Docker Compose (Recommended)**
   ```bash
   make dev
   ```
   - Hot-reload for both frontend and backend
   - Isolated database
   - Consistent environment

2. **Native (Alternative)**
   ```bash
   make dev-backend    # Terminal 1
   make dev-frontend   # Terminal 2
   ```
   - Faster startup
   - Direct debugging
   - IDE integration

### Testing Strategy

#### Backend Testing
- **Unit tests**: Individual functions
- **Integration tests**: API endpoints with test DB
- **Fixtures**: Reusable test data and mocks
- **Coverage target**: 80%+

```python
# Example test structure
def test_endpoint(client, test_db):
    response = await client.get("/api/endpoint")
    assert response.status_code == 200
```

#### Frontend Testing
- **Component tests**: React component behavior
- **Integration tests**: User interactions
- **Type checking**: TypeScript compilation

### Code Quality

#### Automated Checks
- **Linting**: Ruff (backend), Biome (frontend)
- **Formatting**: Automatic on save
- **Type checking**: TypeScript, Python type hints
- **Tests**: Run in CI/CD

#### Git Workflow
```
main (production)
  ├── develop (testing/staging)
      ├── feature/xxx (feature branches)
```

## Security Considerations

### Current Implementation
- **CORS**: Configured in FastAPI
- **Environment variables**: Secrets in .env
- **SQL injection**: Prevented by SQLAlchemy parameterization
- **Input validation**: Pydantic schemas
- **Docker**: Non-root user in production

### Future Enhancements
- **Authentication**: JWT or OAuth2
- **Rate limiting**: Per-endpoint limits
- **HTTPS**: TLS termination at ingress
- **Database encryption**: At rest and in transit
- **Secret management**: Vault or K8s secrets

## Performance Optimization

### Backend
- **Async operations**: Non-blocking I/O
- **Connection pooling**: SQLAlchemy async pool
- **Query optimization**: Indexes, eager loading
- **Caching**: Redis (future)

### Frontend
- **Code splitting**: Vite automatic
- **Lazy loading**: React.lazy for routes
- **Asset optimization**: Vite build optimization
- **CDN**: Static asset serving (future)

### Database
- **Indexes**: On frequently queried columns
- **Query analysis**: EXPLAIN plans
- **PostGIS indexes**: Spatial indexes for geo queries
- **Materialized views**: For complex queries

## Monitoring and Observability

### Planned Implementation
- **Application logs**: Structured JSON logs
- **Metrics**: Prometheus-compatible endpoints
- **Tracing**: OpenTelemetry (future)
- **Alerts**: Based on health checks and metrics

### Health Endpoints
```
GET /health         # Liveness: Is app running?
GET /ready          # Readiness: Can accept traffic?
GET /api/health-check  # Detailed: DB status, response times
```

## Scalability

### Horizontal Scaling
- **Stateless design**: Any instance can handle any request
- **Database connection pooling**: Shared connections
- **Load balancing**: Kubernetes service

### Vertical Scaling
- **Async operations**: Efficient resource usage
- **Connection limits**: Configurable pool sizes
- **Resource requests**: K8s resource management

## Future Enhancements

### Short-term
- [ ] Database migrations with Alembic
- [ ] Authentication and authorization
- [ ] User management endpoints
- [ ] Logging configuration
- [ ] API rate limiting

### Medium-term
- [ ] Helm chart creation
- [ ] Kubernetes deployment
- [ ] JumpCloud SSO integration
- [ ] Redis caching layer
- [ ] WebSocket support (if needed)

### Long-term
- [ ] Multi-region deployment
- [ ] CDC (Change Data Capture)
- [ ] Real-time features
- [ ] Advanced geo-spatial features
- [ ] GraphQL API (if needed)

## References

- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [React Best Practices](https://react.dev/learn)
- [12-Factor App](https://12factor.net/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Kubernetes Patterns](https://kubernetes.io/docs/concepts/)
