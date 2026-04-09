"""Tests for homepage map DB sync behavior (incremental, async, multi-source)."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
import respx
from httpx import AsyncClient, Response
from sqlalchemy import select

from app.core.config import settings
from app.db.models.map_project import MapProject
from app.db.models.map_project_sync_state import MapProjectSyncState


TM_URL = f"{settings.tasking_manager_api_url}/projects/"
DRONE_URL = f"{settings.drone_tm_api_url}/projects/centroids"
FAIR_URL = f"{settings.fair_api_url}/models/centroid/"
UMAP_SHOWCASE_URL = f"{settings.umap_base_url}/en/showcase/"


def _tm_payload(project_ids: list[int]) -> dict:
    return {
        "mapResults": {
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [10 + idx, -10 - idx]},
                    "properties": {
                        "projectId": project_id,
                        "name": f"TM {project_id}",
                        "created": "2025-01-01T00:00:00Z",
                    },
                }
                for idx, project_id in enumerate(project_ids)
            ]
        }
    }


def _drone_payload(project_ids: list[str]) -> dict:
    return {
        "results": [
            {
                "id": project_id,
                "name": f"Drone {project_id}",
                "created_at": "2025-02-01T12:00:00Z",
                "centroid": {"type": "Point", "coordinates": [20 + idx, 5 + idx]},
            }
            for idx, project_id in enumerate(project_ids)
        ]
    }


def _drone_payload_with_pagination(project_ids: list[str], page: int, per_page: int, total: int) -> dict:
    payload = _drone_payload(project_ids)
    payload["pagination"] = {
        "page": page,
        "per_page": per_page,
        "total": total,
    }
    return payload


def _fair_payload(model_ids: list[int]) -> dict:
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [-70 - idx, 40 + idx]},
                "properties": {
                    "mid": model_id,
                    "name": f"fAIr {model_id}",
                    "created_at": "2025-03-03T08:15:00Z",
                },
            }
            for idx, model_id in enumerate(model_ids)
        ],
    }


def _umap_showcase_payload(map_ids: list[str]) -> dict:
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [100 + idx, 0.5 + idx]},
                "properties": {
                    "name": f"uMap {map_id}",
                    "created": "2025-04-10T09:00:00Z",
                    "description": f"[[/en/map/test_{map_id}|Open map {map_id}]]",
                },
            }
            for idx, map_id in enumerate(map_ids)
        ],
    }


def _oam_rows(image_ids: list[str]) -> list[dict]:
    return [
        {
            "id": f"imagery:{image_id}",
            "product": "imagery",
            "project_id": image_id,
            "name": f"OAM {image_id}",
            "longitude": -75.0,
            "latitude": 11.0,
            "metadata_json": {
                "source_uuid": image_id,
                "created_at": "2025-05-20T00:00:00Z",
                "source_id": image_id,
            },
            "synced_at": datetime.now(timezone.utc),
        }
        for image_id in image_ids
    ]


@pytest.mark.asyncio
@respx.mock
async def test_refresh_sync_inserts_all_products_and_metadata(client: AsyncClient, test_db_session):
    """Refresh sync inserts rows from all products and stores source metadata."""
    respx.get(TM_URL).mock(return_value=Response(200, json=_tm_payload([101])))
    respx.get(DRONE_URL).mock(return_value=Response(200, json=_drone_payload(["dr-1"])))
    respx.get(FAIR_URL).mock(return_value=Response(200, json=_fair_payload([7])))
    respx.get(UMAP_SHOWCASE_URL).mock(
        return_value=Response(200, json=_umap_showcase_payload(["2001"]))
    )

    with patch(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        new=AsyncMock(return_value=_oam_rows(["img-1"])),
    ):
        response = await client.get("/api/homepage-map/projects/snapshot?refresh=true")

    assert response.status_code == 200
    payload = response.json()
    assert payload["type"] == "FeatureCollection"
    assert len(payload["features"]) == 5

    rows = (await test_db_session.execute(select(MapProject))).scalars().all()
    assert len(rows) == 5
    assert {row.product for row in rows} == {
        "tasking-manager",
        "drone-tasking-manager",
        "fair",
        "umap",
        "imagery",
    }

    drone_row = next(row for row in rows if row.product == "drone-tasking-manager")
    assert drone_row.project_id == "dr-1"
    assert drone_row.metadata_json["source_uuid"] == "dr-1"
    assert drone_row.metadata_json["created_at"] == "2025-02-01T12:00:00Z"


@pytest.mark.asyncio
@respx.mock
async def test_refresh_sync_does_not_duplicate_existing_rows(client: AsyncClient, test_db_session):
    """Running refresh twice with same source IDs must not create duplicates."""
    tm_route = respx.get(TM_URL).mock(return_value=Response(200, json=_tm_payload([1001])))
    drone_route = respx.get(DRONE_URL).mock(
        return_value=Response(200, json=_drone_payload(["dr-1001"]))
    )
    fair_route = respx.get(FAIR_URL).mock(return_value=Response(200, json=_fair_payload([501])))
    umap_route = respx.get(UMAP_SHOWCASE_URL).mock(
        return_value=Response(200, json=_umap_showcase_payload(["3001"]))
    )

    with patch(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        new=AsyncMock(return_value=_oam_rows(["img-1001"])),
    ):
        response_1 = await client.get("/api/homepage-map/projects/snapshot?refresh=true")
        response_2 = await client.get("/api/homepage-map/projects/snapshot?refresh=true")

    assert response_1.status_code == 200
    assert response_2.status_code == 200

    rows = (await test_db_session.execute(select(MapProject))).scalars().all()
    assert len(rows) == 5

    assert tm_route.call_count == 2
    assert drone_route.call_count == 2
    assert fair_route.call_count == 2
    assert umap_route.call_count == 2


@pytest.mark.asyncio
@respx.mock
async def test_refresh_sync_does_not_delete_rows_when_source_shrinks(client: AsyncClient, test_db_session):
    """Existing rows remain when a later sync returns fewer IDs."""
    respx.get(TM_URL).mock(
        side_effect=[
            Response(200, json=_tm_payload([1, 2])),
            Response(200, json=_tm_payload([1])),
        ]
    )
    respx.get(DRONE_URL).mock(
        side_effect=[
            Response(200, json=_drone_payload(["dr-a"])),
            Response(200, json=_drone_payload([])),
        ]
    )
    respx.get(FAIR_URL).mock(return_value=Response(200, json=_fair_payload([11])))
    respx.get(UMAP_SHOWCASE_URL).mock(
        return_value=Response(200, json=_umap_showcase_payload(["990"]))
    )

    with patch(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        new=AsyncMock(side_effect=[_oam_rows(["img-a"]), _oam_rows([])]),
    ):
        first = await client.get("/api/homepage-map/projects/snapshot?refresh=true")
        second = await client.get("/api/homepage-map/projects/snapshot?refresh=true")

    assert first.status_code == 200
    assert second.status_code == 200

    ids = (
        await test_db_session.execute(
            select(MapProject.id).where(MapProject.product == "tasking-manager")
        )
    ).scalars().all()
    assert set(ids) == {"tasking-manager:1", "tasking-manager:2"}

    all_ids = (await test_db_session.execute(select(MapProject.id))).scalars().all()
    assert "drone-tasking-manager:dr-a" in all_ids
    assert "imagery:img-a" in all_ids


@pytest.mark.asyncio
@respx.mock
async def test_refresh_sync_continues_when_one_product_endpoint_fails(client: AsyncClient, test_db_session):
    """A failing product endpoint should not break the whole refresh sync."""
    respx.get(TM_URL).mock(return_value=Response(200, json=_tm_payload([77])))
    respx.get(DRONE_URL).mock(return_value=Response(500, json={"detail": "boom"}))
    respx.get(FAIR_URL).mock(return_value=Response(200, json=_fair_payload([88])))
    respx.get(UMAP_SHOWCASE_URL).mock(
        return_value=Response(200, json=_umap_showcase_payload(["1010"]))
    )

    with patch(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        new=AsyncMock(return_value=_oam_rows(["img-x"])),
    ):
        response = await client.get("/api/homepage-map/projects/snapshot?refresh=true")

    assert response.status_code == 200

    rows = (await test_db_session.execute(select(MapProject))).scalars().all()
    products = {row.product for row in rows}

    assert "tasking-manager" in products
    assert "fair" in products
    assert "umap" in products
    assert "imagery" in products
    assert "drone-tasking-manager" not in products


@pytest.mark.asyncio
@respx.mock
async def test_refresh_sync_tracks_cursor_and_inserts_only_newer_rows(client: AsyncClient, test_db_session):
    """Cursor state stores latest created/id and subsequent sync inserts only newer rows."""
    respx.get(TM_URL).mock(
        side_effect=[
            Response(200, json=_tm_payload([10])),
            Response(200, json=_tm_payload([10, 11])),
        ]
    )
    respx.get(DRONE_URL).mock(
        return_value=Response(200, json=_drone_payload(["dr-cursor"]))
    )
    respx.get(FAIR_URL).mock(return_value=Response(200, json=_fair_payload([91])))
    respx.get(UMAP_SHOWCASE_URL).mock(
        return_value=Response(200, json=_umap_showcase_payload(["4100"]))
    )

    with patch(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        new=AsyncMock(return_value=_oam_rows(["img-cursor"])),
    ):
        first = await client.get("/api/homepage-map/projects/snapshot?refresh=true")
        second = await client.get("/api/homepage-map/projects/snapshot?refresh=true")

    assert first.status_code == 200
    assert second.status_code == 200

    tm_rows = (
        await test_db_session.execute(
            select(MapProject).where(MapProject.product == "tasking-manager")
        )
    ).scalars().all()
    assert {row.project_id for row in tm_rows} == {"10", "11"}

    state_rows = (await test_db_session.execute(select(MapProjectSyncState))).scalars().all()
    state_by_product = {row.product: row for row in state_rows}
    assert set(state_by_product.keys()) == {
        "tasking-manager",
        "drone-tasking-manager",
        "fair",
        "umap",
        "imagery",
    }
    assert state_by_product["tasking-manager"].last_identity == "11"
    assert state_by_product["tasking-manager"].last_created_at is not None


@pytest.mark.asyncio
@respx.mock
async def test_refresh_sync_updates_existing_record_when_name_changes(client: AsyncClient, test_db_session):
    """Existing map project rows are updated when source data changes (e.g. name)."""
    respx.get(TM_URL).mock(
        side_effect=[
            Response(200, json=_tm_payload([42])),
            Response(
                200,
                json={
                    "mapResults": {
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": {"type": "Point", "coordinates": [10, -10]},
                                "properties": {
                                    "projectId": 42,
                                    "name": "TM 42 renamed",
                                    "created": "2025-01-01T00:00:00Z",
                                },
                            }
                        ]
                    }
                },
            ),
        ]
    )
    respx.get(DRONE_URL).mock(return_value=Response(200, json=_drone_payload(["dr-update"])))
    respx.get(FAIR_URL).mock(return_value=Response(200, json=_fair_payload([321])))
    respx.get(UMAP_SHOWCASE_URL).mock(
        return_value=Response(200, json=_umap_showcase_payload(["5200"]))
    )

    with patch(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        new=AsyncMock(return_value=_oam_rows(["img-update"])),
    ):
        first = await client.get("/api/homepage-map/projects/snapshot?refresh=true")
        second = await client.get("/api/homepage-map/projects/snapshot?refresh=true")

    assert first.status_code == 200
    assert second.status_code == 200

    tm_row = (
        await test_db_session.execute(
            select(MapProject).where(MapProject.id == "tasking-manager:42")
        )
    ).scalar_one()
    assert tm_row.name == "TM 42 renamed"


@pytest.mark.asyncio
@respx.mock
async def test_refresh_sync_fetches_all_dronetm_pages(client: AsyncClient, test_db_session):
    """DroneTM sync should paginate beyond first page and persist all projects."""
    respx.get(TM_URL).mock(return_value=Response(200, json=_tm_payload([9001])))
    respx.get(FAIR_URL).mock(return_value=Response(200, json=_fair_payload([901])))
    respx.get(UMAP_SHOWCASE_URL).mock(
        return_value=Response(200, json=_umap_showcase_payload(["9020"]))
    )

    drone_route = respx.get(DRONE_URL).mock(
        side_effect=[
            Response(
                200,
                json=_drone_payload_with_pagination(
                    ["dr-page-1"], page=1, per_page=1, total=2
                ),
            ),
            Response(
                200,
                json=_drone_payload_with_pagination(
                    ["dr-page-2"], page=2, per_page=1, total=2
                ),
            ),
        ]
    )

    with patch(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        new=AsyncMock(return_value=_oam_rows(["img-pages"])),
    ):
        response = await client.get("/api/homepage-map/projects/snapshot?refresh=true")

    assert response.status_code == 200
    assert drone_route.call_count == 2

    drone_ids = (
        await test_db_session.execute(
            select(MapProject.project_id).where(MapProject.product == "drone-tasking-manager")
        )
    ).scalars().all()
    assert set(drone_ids) == {"dr-page-1", "dr-page-2"}


@pytest.mark.asyncio
async def test_refresh_sync_uses_source_specific_ssl_verification(client: AsyncClient, monkeypatch):
    """fAIr SSL setting should not affect TLS verification for TM/DroneTM/uMap sync calls."""

    created_verify_values: list[bool] = []

    class _FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            self.verify = kwargs.get("verify", True)
            created_verify_values.append(self.verify)

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

    tm_fetch = AsyncMock(return_value=[])
    drone_fetch = AsyncMock(return_value=[])
    fair_fetch = AsyncMock(return_value=[])
    umap_fetch = AsyncMock(return_value=[])

    monkeypatch.setattr("app.services.map_projects_service.httpx.AsyncClient", _FakeAsyncClient)
    monkeypatch.setattr("app.services.map_projects_service._fetch_tasking_manager_rows", tm_fetch)
    monkeypatch.setattr("app.services.map_projects_service._fetch_dronetm_rows", drone_fetch)
    monkeypatch.setattr("app.services.map_projects_service._fetch_fair_rows", fair_fetch)
    monkeypatch.setattr("app.services.map_projects_service._fetch_umap_rows", umap_fetch)
    monkeypatch.setattr(
        "app.services.map_projects_service._fetch_oam_rows_from_db",
        AsyncMock(return_value=[]),
    )
    monkeypatch.setattr("app.services.map_projects_service.settings.fair_verify_ssl", False)

    response = await client.get("/api/homepage-map/projects/snapshot?refresh=true")
    assert response.status_code == 200

    assert created_verify_values == [True, False]
    assert tm_fetch.await_args.args[0].verify is True
    assert drone_fetch.await_args.args[0].verify is True
    assert umap_fetch.await_args.args[0].verify is True
    assert fair_fetch.await_args.args[0].verify is False
