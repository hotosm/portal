"""
Logging configuration for hotosm-auth library.

Provides a simple, configurable logger that respects LOG_LEVEL environment variable.
"""

import logging
import os
import sys

# Logger name for the library
LOGGER_NAME = "hotosm_auth"

# Default log level (can be overridden via LOG_LEVEL env var)
DEFAULT_LOG_LEVEL = logging.WARNING


def get_logger(name: str = LOGGER_NAME) -> logging.Logger:
    """
    Get a configured logger for hotosm-auth.

    The log level can be controlled via the LOG_LEVEL environment variable:
        LOG_LEVEL=DEBUG   - Show all debug messages
        LOG_LEVEL=INFO    - Show info and above
        LOG_LEVEL=WARNING - Show warnings and errors only (default)
        LOG_LEVEL=ERROR   - Show errors only

    Usage:
        from hotosm_auth.logger import get_logger

        logger = get_logger(__name__)
        logger.debug("Detailed debug information")
        logger.info("General information")
        logger.warning("Warning message")
        logger.error("Error message")

    Args:
        name: Logger name (defaults to "hotosm_auth")

    Returns:
        logging.Logger: Configured logger instance
    """
    logger = logging.getLogger(name)

    # Only configure if not already configured (avoid duplicate handlers)
    if not logger.handlers:
        # Get log level from environment or use default
        log_level_str = os.getenv("LOG_LEVEL", "WARNING").upper()
        log_level = getattr(logging, log_level_str, DEFAULT_LOG_LEVEL)

        # Create console handler with formatting
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)

        # Create formatter
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)

        # Add handler to logger
        logger.addHandler(handler)
        logger.setLevel(log_level)

        # Don't propagate to root logger (avoid duplicate logs)
        logger.propagate = False

    return logger


# Default logger instance for convenience
logger = get_logger()
