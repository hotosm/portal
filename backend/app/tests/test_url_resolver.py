"""Unit tests for app/services/url_resolver.py — parse_project_url."""

import pytest

from app.services.url_resolver import parse_project_url


@pytest.mark.parametrize(
    "url, expected_app, expected_id",
    [
        # --- tasking-manager ---
        ("https://tasks.hotosm.org/projects/555", "tasking-manager", "555"),
        ("https://tasks.hotosm.org/projects/1", "tasking-manager", "1"),
        ("https://tasks.hotosm.org/projects/12345/", "tasking-manager", "12345"),
        ("https://tasks.hotosm.org/projects/42?lang=en", "tasking-manager", "42"),
        # --- drone-tasking-manager ---
        ("https://drone.hotosm.org/projects/7", "drone-tasking-manager", "7"),
        ("https://drone.hotosm.org/projects/200/tasks", "drone-tasking-manager", "200"),
        ("https://drone.hotosm.org/projects/bo-phase-3", "drone-tasking-manager", "bo-phase-3"),
        ("https://drone.hotosm.org/projects/my-project-2024", "drone-tasking-manager", "my-project-2024"),
        # --- field-tm ---
        ("https://field.hotosm.org/projects/99", "field-tm", "99"),
        ("https://field.hotosm.org/projects/99/", "field-tm", "99"),
        # --- fair ---
        ("https://fair.hotosm.org/ai-models/7", "fair", "7"),
        ("https://fair.hotosm.org/ai-models/123/", "fair", "123"),
        # --- export-tool ---
        (
            "https://export.hotosm.org/v3/exports/4b7d8c9a-1234-5678-abcd-ef0123456789",
            "export-tool",
            "4b7d8c9a-1234-5678-abcd-ef0123456789",
        ),
        (
            "https://export.hotosm.org/v3/exports/abcdef12-0000-0000-0000-000000000000/",
            "export-tool",
            "abcdef12-0000-0000-0000-000000000000",
        ),
        # --- open-aerial-map ---
        (
            "https://map.openaerialmap.org/#/-18.720703125,18.562947442888312,3/latest/69f7b2056e5c3ae8d432f323",
            "open-aerial-map",
            "69f7b2056e5c3ae8d432f323",
        ),
        (
            "https://map.openaerialmap.org/#/0,0,3/latest/abcdef1234567890abcdef12?_k=xyz",
            "open-aerial-map",
            "abcdef1234567890abcdef12",
        ),
        (
            "https://map.openaerialmap.org/#/-18.720703125,18.562947442888312,3/user/6a04609fcc972f0164bdd7e5/6a04633ecc972f0164bdda20?_k=t0jvz6",
            "open-aerial-map",
            "6a04609fcc972f0164bdd7e5:6a04633ecc972f0164bdda20",
        ),
        (
            "https://map.openaerialmap.org/#/0,0,3/user/aabbccddeeff00112233aabb/112233aabbccddeeff001122",
            "open-aerial-map",
            "aabbccddeeff00112233aabb:112233aabbccddeeff001122",
        ),
        # --- umap ---
        (
            "https://umap.hotosm.org/es/map/test-portal_2675#16/-34.572928/-58.430572",
            "umap",
            "2675",
        ),
        ("https://umap.hotosm.org/en/map/my-map_42", "umap", "42"),
        # slug with multiple underscores — should capture the LAST _{digits}
        ("https://umap.hotosm.org/es/map/some_map_name_999#10/0/0", "umap", "999"),
        # --- chatmap ---
        (
            "https://chatmap.hotosm.org/#map/d4ca5204-2352-406b-8a95-f21be9d86a27",
            "chatmap",
            "d4ca5204-2352-406b-8a95-f21be9d86a27",
        ),
        (
            "https://chatmap.hotosm.org/#map/aaaabbbb-cccc-dddd-eeee-ffffffffffff",
            "chatmap",
            "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
        ),
    ],
)
def test_valid_urls(url: str, expected_app: str, expected_id: str) -> None:
    result = parse_project_url(url)
    assert result is not None, f"Expected match for {url!r}"
    app, project_id = result
    assert app == expected_app
    assert project_id == expected_id


@pytest.mark.parametrize(
    "url",
    [
        # wrong domain
        "https://tasks.hotosm.org/",
        "https://tasks.hotosm.org/projects/",
        "https://tasks.hotosm.org/projects/abc",
        "https://evil.com/projects/123",
        "https://tasks.evil.org/projects/123",
        # missing ID
        "https://drone.hotosm.org/projects/",
        "https://fair.hotosm.org/ai-models/",
        # OAM missing /latest/ or /user/ segment
        "https://map.openaerialmap.org/#/0,0,3/abc123",
        # OAM /user/ path but non-hex user id
        "https://map.openaerialmap.org/#/0,0,3/user/not-a-hex-id/6a04633ecc972f0164bdda20",
        # umap missing _{id}
        "https://umap.hotosm.org/es/map/no-number-here",
        # chatmap missing uuid
        "https://chatmap.hotosm.org/#map/",
        # chatmap wrong path
        "https://chatmap.hotosm.org/map/d4ca5204-2352-406b-8a95-f21be9d86a27",
        # completely unrelated
        "https://example.com",
        "",
        "not a url",
    ],
)
def test_invalid_urls(url: str) -> None:
    assert parse_project_url(url) is None, f"Expected no match for {url!r}"
