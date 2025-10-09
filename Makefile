.PHONY: help install dev dev-docker stop test test-backend test-frontend lint lint-fix clean build deploy-test

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
	cd backend && uv sync --all-extras
	@echo "✓ Dependencies installed"

# Development (Local)
dev-backend: ## Run backend locally (without Docker)
	@echo "Starting backend..."
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Run frontend locally (without Docker)
	@echo "Starting frontend..."
	cd frontend && pnpm dev

# Development (Docker)
dev: ## Run all services with Docker (development profile)
	@echo "Starting development environment..."
	@echo ""
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
	cd backend && uv run pytest

test-backend-cov: ## Run backend tests with coverage report
	@echo "Running backend tests with coverage..."
	cd backend && uv run pytest --cov-report=html

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd frontend && pnpm test

# Linting and formatting
lint: ## Run linters for both frontend and backend
	@echo "Linting backend..."
	cd backend && uv run ruff check .
	@echo "Linting frontend..."
	cd frontend && pnpm lint

lint-fix: ## Fix linting issues
	@echo "Fixing backend linting issues..."
	cd backend && uv run ruff check --fix .
	cd backend && uv run ruff format .
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
	@if docker compose ps backend-dev 2>/dev/null | grep -q "running"; then \
		echo "Using Docker dev container..."; \
		docker compose exec backend-dev uv run alembic upgrade head; \
	elif docker compose ps backend 2>/dev/null | grep -q "running"; then \
		echo "Using Docker prod container..."; \
		docker compose exec backend uv run alembic upgrade head; \
	else \
		echo "Using local uv..."; \
		cd backend && uv run alembic upgrade head; \
	fi

migrate-create: ## Create a new migration (usage: make migrate-create MSG="description")
	@echo "Creating migration: $(MSG)"
	@if docker compose ps backend-dev 2>/dev/null | grep -q "running"; then \
		echo "Using Docker dev container..."; \
		docker compose exec backend-dev uv run alembic revision --autogenerate -m "$(MSG)"; \
	elif docker compose ps backend 2>/dev/null | grep -q "running"; then \
		echo "Using Docker prod container..."; \
		docker compose exec backend uv run alembic revision --autogenerate -m "$(MSG)"; \
	else \
		echo "Using local uv..."; \
		cd backend && uv run alembic revision --autogenerate -m "$(MSG)"; \
	fi

migrate-rollback: ## Rollback last migration
	@echo "Rolling back last migration..."
	@if docker compose ps backend-dev 2>/dev/null | grep -q "running"; then \
		echo "Using Docker dev container..."; \
		docker compose exec backend-dev uv run alembic downgrade -1; \
	elif docker compose ps backend 2>/dev/null | grep -q "running"; then \
		echo "Using Docker prod container..."; \
		docker compose exec backend uv run alembic downgrade -1; \
	else \
		echo "Using local uv..."; \
		cd backend && uv run alembic downgrade -1; \
	fi

migrate-history: ## Show migration history
	@if docker compose ps backend-dev 2>/dev/null | grep -q "running"; then \
		docker compose exec backend-dev uv run alembic history; \
	elif docker compose ps backend 2>/dev/null | grep -q "running"; then \
		docker compose exec backend uv run alembic history; \
	else \
		cd backend && uv run alembic history; \
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
