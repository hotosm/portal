"""
hotosm-auth: HOTOSM SSO Authentication Library

This library provides authentication for HOTOSM applications using:
- Hanko v2.1.0 for base SSO (Google, GitHub, Email/Password)
- OpenStreetMap OAuth 2.0 for OSM authorization

Key Features:
- JWT validation with JWKS
- httpOnly cookie-based session management
- Optional/required OSM integration
- FastAPI and Django support
- Legacy user mapping for gradual migration
"""

__version__ = "0.1.0"

from hotosm_auth.models import HankoUser, OSMConnection, OSMScope
from hotosm_auth.config import AuthConfig

__all__ = [
    "HankoUser",
    "OSMConnection",
    "OSMScope",
    "AuthConfig",
    "__version__",
]
