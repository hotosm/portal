.PHONY: help install dev dev-standalone dev-docker certs stop test test-backend test-frontend lint lint-fix clean build deploy-test

UV_LOCAL_ENV ?= .venv-local
UV_LOCAL = UV_PROJECT_ENVIRONMENT=$(UV_LOCAL_ENV) uv

LOGIN_DIR := ../login
CERTS_DIR := certs
DEV_DOMAINS := portal.hotosm.test login.hotosm.test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Installation
install: ## Install all dependencies
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install
	@echo "Installing backend dependencies..."
	cd backend && $(UV_LOCAL) sync --all-extras
	@echo "✓ Dependencies installed"

# Development (Local)
dev-backend: ## Run backend locally (without Docker)
	@echo "Starting backend..."
	cd backend && $(UV_LOCAL) run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Run frontend locally (without Docker)
	@echo "Starting frontend..."
	cd frontend && pnpm dev

# Development (Docker)
certs: ## Generate local HTTPS certs for *.hotosm.test via mkcert (used by Caddy, no Traefik)
	@command -v mkcert >/dev/null 2>&1 || { echo "Error: mkcert is required. Install it from https://github.com/FiloSottile/mkcert and re-run 'make certs'." >&2; exit 1; }
	@mkdir -p $(CERTS_DIR)
	@if [ ! -f "$(CERTS_DIR)/dev.crt" ] || [ ! -f "$(CERTS_DIR)/dev.key" ]; then \
		mkcert -install; \
		mkcert -cert-file $(CERTS_DIR)/dev.crt -key-file $(CERTS_DIR)/dev.key $(DEV_DOMAINS); \
	fi

dev: certs ## Run Portal + Login standalone with HTTPS via Caddy (no hot-dev-env, no Traefik) at https://portal.hotosm.test. Requires ../login to be present.
	@if [ ! -d "$(LOGIN_DIR)/frontend" ] || [ ! -d "$(LOGIN_DIR)/backend" ]; then \
		echo "Error: The login repository must be in the same folder to run the project and access it through the login." >&2; \
		exit 1; \
	fi
	@echo "Starting Portal + Login standalone with HTTPS (Caddy, no hot-dev-env, no Traefik)."
	@echo "Portal: https://portal.hotosm.test"
	@echo "Login:  https://login.hotosm.test"
	@echo "Make sure both hosts resolve to 127.0.0.1 in your hosts file."
	docker compose --profile dev up --build

dev-standalone: ## Run Portal only, without Traefik (http://localhost:5173)
	@echo "Starting standalone development environment..."
	docker compose --profile dev up --build

dev-down: ## Stop development environment
	docker compose --profile dev down

# Production (Docker)
prod: ## Run all services with Docker (production profile)
	@echo "Starting production environment..."
	docker compose --profile prod up -d --build

prod-down: ## Stop production environment
	docker compose --profile prod down

stop: ## Stop all Docker services
	docker compose --profile dev --profile prod down

# Testing
test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd backend && $(UV_LOCAL) run --extra dev pytest

test-backend-cov: ## Run backend tests with coverage report
	@echo "Running backend tests with coverage..."
	cd backend && $(UV_LOCAL) run --extra dev pytest --cov-report=html

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd frontend && pnpm test

# Linting and formatting
lint: ## Run linters for both frontend and backend
	@echo "Linting backend..."
	cd backend && $(UV_LOCAL) run --extra dev ruff check .
	@echo "Linting frontend..."
	cd frontend && pnpm lint

lint-fix: ## Fix linting issues
	@echo "Fixing backend linting issues..."
	cd backend && $(UV_LOCAL) run --extra dev ruff check --fix .
	cd backend && $(UV_LOCAL) run --extra dev ruff format .
	@echo "Fixing frontend linting issues..."
	cd frontend && pnpm lint:fix

# Database
db-shell: ## Open PostgreSQL shell
	docker compose exec db psql -U portal -d portal

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "Resetting database..."
	docker compose down -v
	docker compose --profile dev up -d db

# Database Migrations
migrate: ## Run database migrations
	@echo "Running migrations..."
	@if docker compose ps backend-dev 2>/dev/null | grep -Eiq "running|up"; then \
		echo "Using Docker dev container..."; \
		docker compose exec backend-dev uv run alembic upgrade head; \
	elif docker compose ps backend 2>/dev/null | grep -Eiq "running|up"; then \
		echo "Using Docker prod container..."; \
		docker compose exec backend uv run alembic upgrade head; \
	else \
		echo "Using local uv..."; \
		cd backend && env -u DATABASE_URL UV_PROJECT_ENVIRONMENT=$(UV_LOCAL_ENV) uv run alembic upgrade head; \
	fi

migrate-create: ## Create a new migration (usage: make migrate-create MSG="description")
	@echo "Creating migration: $(MSG)"
	@if docker compose ps backend-dev 2>/dev/null | grep -Eiq "running|up"; then \
		echo "Using Docker dev container..."; \
		docker compose exec backend-dev uv run alembic revision --autogenerate -m "$(MSG)"; \
	elif docker compose ps backend 2>/dev/null | grep -Eiq "running|up"; then \
		echo "Using Docker prod container..."; \
		docker compose exec backend uv run alembic revision --autogenerate -m "$(MSG)"; \
	else \
		echo "Using local uv..."; \
		cd backend && env -u DATABASE_URL UV_PROJECT_ENVIRONMENT=$(UV_LOCAL_ENV) uv run alembic revision --autogenerate -m "$(MSG)"; \
	fi

migrate-rollback: ## Rollback last migration
	@echo "Rolling back last migration..."
	@if docker compose ps backend-dev 2>/dev/null | grep -Eiq "running|up"; then \
		echo "Using Docker dev container..."; \
		docker compose exec backend-dev uv run alembic downgrade -1; \
	elif docker compose ps backend 2>/dev/null | grep -Eiq "running|up"; then \
		echo "Using Docker prod container..."; \
		docker compose exec backend uv run alembic downgrade -1; \
	else \
		echo "Using local uv..."; \
		cd backend && env -u DATABASE_URL UV_PROJECT_ENVIRONMENT=$(UV_LOCAL_ENV) uv run alembic downgrade -1; \
	fi

migrate-history: ## Show migration history
	@if docker compose ps backend-dev 2>/dev/null | grep -Eiq "running|up"; then \
		docker compose exec backend-dev uv run alembic history; \
	elif docker compose ps backend 2>/dev/null | grep -Eiq "running|up"; then \
		docker compose exec backend uv run alembic history; \
	else \
		cd backend && env -u DATABASE_URL UV_PROJECT_ENVIRONMENT=$(UV_LOCAL_ENV) uv run alembic history; \
	fi

# Cleanup
clean: ## Clean build artifacts and caches
	@echo "Cleaning..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "✓ Cleaned"

# Build
build: ## Build Docker images
	docker compose build

# Logs
logs: ## Show logs from all services
	docker compose logs -f

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

logs-db: ## Show database logs
	docker compose logs -f db

# Health checks
health: ## Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health && echo "✓ Backend healthy" || echo "✗ Backend unhealthy"
	@curl -f http://localhost:5173 && echo "✓ Frontend healthy" || echo "✗ Frontend unhealthy"
