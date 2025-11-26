import pytest
import httpx
from unittest.mock import AsyncMock, Mock, patch
from fastapi import HTTPException


class TestGetProjects:
    
    def create_mock_user(self):
        mock_user = Mock()
        mock_user.access_token = "test-jwt-token-123"
        mock_user.id = 12345
        return mock_user
    
    @pytest.mark.asyncio
    async def test_get_projects_success_default_params(self):
        mock_response_data = {
            "results": [{"id": "1", "name": "Project 1"}],
            "pagination": {
                "page": 1,
                "results_per_page": 20,
                "total": 1,
                "total_pages": 1
            }
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            mock_user = self.create_mock_user()
            result = await endpoint(user=mock_user)
            
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "projects/" in call_args[0][0]
            assert call_args[1]["headers"]["access-token"] == "test-jwt-token-123"
            assert call_args[1]["params"]["filter_by_owner"] == "false"
            assert call_args[1]["params"]["page"] == 1
            assert call_args[1]["params"]["results_per_page"] == 20
    
    @pytest.mark.asyncio
    async def test_get_projects_with_all_params(self):
        mock_response_data = {
            "results": [],
            "pagination": {"page": 2, "results_per_page": 50, "total": 0, "total_pages": 0}
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            mock_user = self.create_mock_user()
            result = await endpoint(
                user=mock_user,
                filter_by_owner=True,
                status="active",
                search="drone",
                page=2,
                results_per_page=50
            )
            
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]
            
            assert params["filter_by_owner"] == "true"
            assert params["status"] == "active"
            assert params["search"] == "drone"
            assert params["page"] == 2
            assert params["results_per_page"] == 50
            
            headers = call_args[1]["headers"]
            assert headers["access-token"] == "test-jwt-token-123"
    
    @pytest.mark.asyncio
    async def test_get_projects_with_partial_params(self):
        mock_response = Mock()
        mock_response.json.return_value = {
            "results": [],
            "pagination": {}
        }
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            mock_user = self.create_mock_user()
            await endpoint(user=mock_user, status="completed")
            
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]
            
            assert params["status"] == "completed"
            assert "search" not in params
            
            headers = call_args[1]["headers"]
            assert headers["access-token"] == "test-jwt-token-123"
    
    @pytest.mark.asyncio
    async def test_get_projects_http_status_error(self):
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = "Not found"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error",
                    request=Mock(),
                    response=mock_response
                )
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            mock_user = self.create_mock_user()
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user)
            
            assert exc_info.value.status_code == 404
            assert "Error from DroneTM API" in exc_info.value.detail
            assert "Not found" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_projects_generic_exception(self):
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection error")
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            mock_user = self.create_mock_user()
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user)
            
            assert exc_info.value.status_code == 500
            assert "Connection error" in exc_info.value.detail


class TestGetProjectById:
    
    def create_mock_user(self):
        mock_user = Mock()
        mock_user.access_token = "test-jwt-token-123"
        mock_user.id = 12345
        return mock_user
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_success_uuid(self):
        project_id = "5c92d0c5-1702-4ebd-b885-67867b488e8e"
        mock_response_data = {
            "id": project_id,
            "name": "Test Project",
            "status": "active"
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            mock_user = self.create_mock_user()
            result = await endpoint(user=mock_user, project_id=project_id)
            
            assert result == mock_response_data
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            
            assert project_id in call_args[0][0]
            assert call_args[1]["headers"]["access-token"] == "test-jwt-token-123"
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_success_numeric(self):
        project_id = "123"
        mock_response_data = {"id": project_id, "name": "Numeric Project"}
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            mock_user = self.create_mock_user()
            result = await endpoint(user=mock_user, project_id=project_id)
            
            assert result == mock_response_data
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert project_id in call_args[0][0]
            assert call_args[1]["headers"]["access-token"] == "test-jwt-token-123"
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_not_found(self):
        project_id = "non-existent-id"
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = "Project not found"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Not found",
                    request=Mock(),
                    response=mock_response
                )
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            mock_user = self.create_mock_user()
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user, project_id=project_id)
            
            assert exc_info.value.status_code == 404
            assert "Error from DroneTM API" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_unauthorized(self):
        project_id = "some-id"
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Unauthorized",
                    request=Mock(),
                    response=mock_response
                )
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            mock_user = self.create_mock_user()
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user, project_id=project_id)
            
            assert exc_info.value.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_server_error(self):
        project_id = "some-id"
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.text = "Internal server error"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Server error",
                    request=Mock(),
                    response=mock_response
                )
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            mock_user = self.create_mock_user()
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user, project_id=project_id)
            
            assert exc_info.value.status_code == 500
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_generic_exception(self):
        project_id = "some-id"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Network timeout")
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            mock_user = self.create_mock_user()
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user, project_id=project_id)
            
            assert exc_info.value.status_code == 500
            assert "Network timeout" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_json_decode_error(self):
        project_id = "some-id"
        mock_response = Mock()
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            mock_user = self.create_mock_user()
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user, project_id=project_id)
            
            assert exc_info.value.status_code == 500