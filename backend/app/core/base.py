"""SQLAlchemy Base class for models."""

from sqlalchemy.orm import declarative_base

# Base class for models - separated to avoid circular imports and heavy config loading
Base = declarative_base()
