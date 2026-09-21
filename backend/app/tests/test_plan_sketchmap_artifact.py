"""Tests for the SketchMap Tool downloadable-artifact flow.

Covers: custom_title survives a live re-hydration (the whole reason it's a
dedicated column and not stashed in `data`), and ensure_sketchmap_artifact's
first-fetch/already-stored/not-ready/upstream-unavailable branches.
"""

from unittest.mock import AsyncMock, patch

import pytest

CREATE_PROJECT_ID = "create:en:4b7d8c9a-1234-5678-abcd-ef0123456789:8.1,49.1,8.2,49.2"
DIGITIZE_PROJECT_ID = "digitize:en:4b7d8c9a-1234-5678-abcd-ef0123456789"


async def _create_plan_with_sketchmap_project(client, project_id: str, custom_title: str):
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [
                {
                    "app": "sketchmap-tool",
                    "project_id": project_id,
                    "custom_title": custom_title,
                }
            ],
        },
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    return body["id"], body["projects"][0]["id"]


@pytest.mark.asyncio
async def test_custom_title_survives_live_rehydration(auth_client):
    """A live refresh overwrites `data` with the fresh upstream snapshot, but
    must not touch custom_title — that's the whole reason it's a dedicated
    column."""
    client, _ = auth_client
    plan_id, _ = await _create_plan_with_sketchmap_project(
        client, CREATE_PROJECT_ID, "My printable map"
    )

    resp = await client.get(f"/api/plans/{plan_id}?refresh=true")
    assert resp.status_code == 200
    project = resp.json()["projects"][0]
    assert project["custom_title"] == "My printable map"
    # Sanity: upstream really was refreshed (proves this isn't a no-op refresh).
    assert project["upstream"]["flow"] == "create"


@pytest.mark.asyncio
async def test_ensure_artifact_create_flow_fetches_and_stores_once(auth_client):
    client, _ = auth_client
    plan_id, plan_project_id = await _create_plan_with_sketchmap_project(
        client, CREATE_PROJECT_ID, "My printable map"
    )

    fetch_mock = AsyncMock(return_value=b"%PDF-1.4 fake pdf bytes")
    upload_mock = AsyncMock()
    with (
        patch("app.services.sketchmap_tool_service.fetch_create_pdf_bytes", fetch_mock),
        patch("app.services.s3_service.is_s3_configured", return_value=False),
        patch(
            "app.services.s3_service.upload_plan_project_file_local",
            return_value="local/plans/x/projects/y/z.pdf",
        ) as upload_local_mock,
    ):
        resp = await client.post(f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file")
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["content_type"] == "application/pdf"
        assert body["size_bytes"] == len(b"%PDF-1.4 fake pdf bytes")
        assert body["download_url"].endswith(
            f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file/content"
        )
        fetch_mock.assert_awaited_once()
        upload_local_mock.assert_called_once()

        # Second call must not hit SketchMap Tool again — already stored.
        resp2 = await client.post(f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file")
        assert resp2.status_code == 200
        body2 = resp2.json()
        # fetched_at round-trips through SQLite without its "Z" suffix on the
        # second read — compare everything else exactly, and only the values.
        assert body2["content_type"] == body["content_type"]
        assert body2["size_bytes"] == body["size_bytes"]
        assert body2["download_url"] == body["download_url"]
        assert body2["fetched_at"].rstrip("Z") == body["fetched_at"].rstrip("Z")
        fetch_mock.assert_awaited_once()
        upload_local_mock.assert_called_once()


@pytest.mark.asyncio
async def test_ensure_artifact_digitize_flow_content_type(auth_client):
    client, _ = auth_client
    plan_id, plan_project_id = await _create_plan_with_sketchmap_project(
        client, DIGITIZE_PROJECT_ID, "My scanned map"
    )

    with (
        patch(
            "app.services.sketchmap_tool_service.fetch_digitize_geojson_bytes",
            AsyncMock(return_value=b'{"type": "FeatureCollection", "features": []}'),
        ),
        patch("app.services.s3_service.is_s3_configured", return_value=False),
        patch(
            "app.services.s3_service.upload_plan_project_file_local",
            return_value="local/plans/x/projects/y/z.geojson",
        ),
    ):
        resp = await client.post(f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file")
        assert resp.status_code == 200, resp.text
        assert resp.json()["content_type"] == "application/geo+json"


@pytest.mark.asyncio
async def test_ensure_artifact_not_ready_returns_409(auth_client):
    client, _ = auth_client
    plan_id, plan_project_id = await _create_plan_with_sketchmap_project(
        client, DIGITIZE_PROJECT_ID, "My scanned map"
    )

    with patch(
        "app.services.sketchmap_tool_service.fetch_digitize_geojson_bytes",
        AsyncMock(return_value=None),
    ):
        resp = await client.post(f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file")
    assert resp.status_code == 409
    assert resp.json()["detail"] == "not_ready"


@pytest.mark.asyncio
async def test_ensure_artifact_upstream_unavailable_returns_502(auth_client):
    from app.services.exceptions import UpstreamUnavailable

    client, _ = auth_client
    plan_id, plan_project_id = await _create_plan_with_sketchmap_project(
        client, CREATE_PROJECT_ID, "My printable map"
    )

    async def broken(_uuid, **_kwargs):
        raise UpstreamUnavailable("boom")

    with patch("app.services.sketchmap_tool_service.fetch_create_pdf_bytes", broken):
        resp = await client.post(f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file")
    assert resp.status_code == 502


@pytest.mark.asyncio
async def test_ensure_artifact_rejects_non_sketchmap_project(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={"name": "P", "projects": [{"app": "tasking-manager", "project_id": "1"}]},
    )
    plan_id = resp.json()["id"]
    plan_project_id = resp.json()["projects"][0]["id"]

    resp = await client.post(f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file")
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_download_content_streams_stored_bytes(auth_client):
    client, _ = auth_client
    plan_id, plan_project_id = await _create_plan_with_sketchmap_project(
        client, CREATE_PROJECT_ID, "My printable map"
    )

    pdf_bytes = b"%PDF-1.4 fake pdf bytes"
    with (
        patch(
            "app.services.sketchmap_tool_service.fetch_create_pdf_bytes",
            AsyncMock(return_value=pdf_bytes),
        ),
        patch("app.services.s3_service.is_s3_configured", return_value=False),
        patch(
            "app.services.s3_service.upload_plan_project_file_local",
            return_value="local/plans/x/projects/y/z.pdf",
        ),
    ):
        resp = await client.post(f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file")
    assert resp.status_code == 200

    with patch("app.services.s3_service.get_plan_project_file_local", return_value=pdf_bytes):
        resp = await client.get(
            f"/api/plans/{plan_id}/projects/{plan_project_id}/sketchmap-file/content"
        )
    assert resp.status_code == 200
    assert resp.content == pdf_bytes
    assert resp.headers["content-type"] == "application/pdf"
    assert "attachment" in resp.headers["content-disposition"]
    assert "My-printable-map.pdf" in resp.headers["content-disposition"]
