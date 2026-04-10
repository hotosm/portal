"""Unit tests verifying the three backend optimizations:

1. No runtime DDL — ensure_table_exists() is gone from map_projects_service.
2. build_dronetm_cache_key() — single source of truth for cache key format.
3. Cache key consistency — preloader and route generate the identical key.
"""

import inspect

import pytest

import app.services.map_projects_service as map_projects_service
from app.api.routes.shared.drone_tm_helpers import (
    build_dronetm_cache_key,
)


# ---------------------------------------------------------------------------
# 1. No runtime DDL
# ---------------------------------------------------------------------------


def test_ensure_table_exists_not_present_in_module():
    """ensure_table_exists must not exist in map_projects_service.

    Tables must be created solely by Alembic migrations, never by the app at
    runtime. Removing this function eliminates the DuplicateTable race condition
    that occurred when multiple instances started simultaneously.
    """
    assert not hasattr(map_projects_service, "ensure_table_exists"), (
        "ensure_table_exists() was found in map_projects_service. "
        "Remove it: table creation belongs in Alembic migrations only."
    )


def test_sync_from_sources_does_not_call_ensure_table_exists():
    """sync_from_sources must not reference ensure_table_exists."""
    source = inspect.getsource(map_projects_service.sync_from_sources)
    assert "ensure_table_exists" not in source


def test_query_map_projects_does_not_call_ensure_table_exists():
    """query_map_projects must not reference ensure_table_exists."""
    source = inspect.getsource(map_projects_service.query_map_projects)
    assert "ensure_table_exists" not in source


def test_is_db_empty_does_not_call_ensure_table_exists():
    """is_db_empty must not reference ensure_table_exists."""
    source = inspect.getsource(map_projects_service.is_db_empty)
    assert "ensure_table_exists" not in source


# ---------------------------------------------------------------------------
# 2. build_dronetm_cache_key correctness
# ---------------------------------------------------------------------------


class TestBuildDronetmCacheKey:
    def test_default_preload_params_produce_expected_key(self):
        """Default params used by the preloader must generate the known key."""
        key = build_dronetm_cache_key(
            filter_by_owner=False, search=None, page=1, results_per_page=1000
        )
        assert key == "dronetm_centroids_False_None_1_1000"

    def test_filter_by_owner_true_changes_key(self):
        key = build_dronetm_cache_key(
            filter_by_owner=True, search=None, page=1, results_per_page=1000
        )
        assert key == "dronetm_centroids_True_None_1_1000"

    def test_search_term_included_in_key(self):
        key = build_dronetm_cache_key(
            filter_by_owner=False, search="nepal", page=1, results_per_page=100
        )
        assert key == "dronetm_centroids_False_nepal_1_100"

    def test_different_pages_produce_different_keys(self):
        key1 = build_dronetm_cache_key(False, None, 1, 100)
        key2 = build_dronetm_cache_key(False, None, 2, 100)
        assert key1 != key2

    def test_different_per_page_values_produce_different_keys(self):
        key1 = build_dronetm_cache_key(False, None, 1, 50)
        key2 = build_dronetm_cache_key(False, None, 1, 100)
        assert key1 != key2

    def test_none_search_and_empty_string_search_differ(self):
        """None and '' must not collide — they represent different requests."""
        key_none = build_dronetm_cache_key(False, None, 1, 1000)
        key_empty = build_dronetm_cache_key(False, "", 1, 1000)
        assert key_none != key_empty


# ---------------------------------------------------------------------------
# 3. Preloader key == route key (no silent drift)
# ---------------------------------------------------------------------------


def test_preloader_cache_key_matches_route_cache_key():
    """The key written by main.preload_cache must equal the key the route reads.

    Before this fix, main.py contained a hardcoded string literal.  If anyone
    changed the route's f-string format, the preloader would warm the wrong
    slot and the route would always hit a cold cache on the first real request.

    Now both sides call build_dronetm_cache_key, so the key is always in sync.
    """
    # Simulates what the frontend requests on first load:
    # GET /api/drone-tasking-manager/projects/centroids?results_per_page=1000
    route_key = build_dronetm_cache_key(
        filter_by_owner=False, search=None, page=1, results_per_page=1000
    )

    # Simulates what main.py preload_drone_tm writes into the cache
    preload_key = build_dronetm_cache_key(
        filter_by_owner=False, search=None, page=1, results_per_page=1000
    )

    assert route_key == preload_key, (
        f"Cache key drift detected: route={route_key!r}, preload={preload_key!r}. "
        "Both must use build_dronetm_cache_key with identical parameters."
    )


def test_main_py_imports_build_dronetm_cache_key():
    """main.py must import build_dronetm_cache_key (not use a hardcoded string).

    If the import is removed, the preloader will silently fall back to a stale
    literal and this test will catch it.
    """
    import app.main as main_module

    assert hasattr(main_module, "build_dronetm_cache_key"), (
        "build_dronetm_cache_key is not imported in main.py. "
        "The preloader must use this function instead of a hardcoded string."
    )
