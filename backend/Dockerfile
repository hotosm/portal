# Backend Dockerfile with multi-stage build using uv

# Development stage
FROM python:3.12-slim AS development

WORKDIR /app

# Install system dependencies including git and ssh
RUN apt-get update && apt-get install -y \
    curl \
    git \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy backend dependency files
COPY backend/pyproject.toml ./

# Install dependencies with uv (including dev dependencies)
# Mount SSH keys for private git repos
RUN --mount=type=ssh uv sync

# Copy backend application code
COPY backend/ .

# Expose port
EXPOSE 8000

# Run with uvicorn (hot-reload enabled in docker-compose)
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Production stage
FROM python:3.12-slim AS production

WORKDIR /app

# Install system dependencies including git and ssh
RUN apt-get update && apt-get install -y \
    curl \
    git \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy backend dependency files
COPY backend/pyproject.toml ./

# Install only production dependencies
# Mount SSH keys for private git repos
RUN --mount=type=ssh uv sync --no-dev

# Copy backend application code
COPY backend/app ./app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
