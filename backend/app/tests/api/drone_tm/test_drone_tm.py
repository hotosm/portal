import pytest
import httpx
from unittest.mock import AsyncMock, Mock, patch
from fastapi import HTTPException


class TestGetProjects:
    """Test suite for get_projects function"""
    
    @pytest.mark.asyncio
    async def test_get_projects_success_default_params(self):
        """Test with default parameters and successful response"""
        mock_response_data = {
            "results": [{"id": "1", "name": "Project 1"}],
            "total": 1
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
            
            result = await endpoint()
            
            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            
            assert "projects/" in call_args[0][0]
            assert call_args[1]["params"]["filter_by_owner"] == "false"
            assert call_args[1]["params"]["page"] == 1
            assert call_args[1]["params"]["results_per_page"] == 20
    
    @pytest.mark.asyncio
    async def test_get_projects_with_all_params(self):
        """Test with all optional parameters"""
        mock_response_data = {"results": [], "total": 0}
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            result = await endpoint(
                filter_by_owner=True,
                status="active",
                search="drone",
                page=2,
                results_per_page=50
            )
            
            assert result == mock_response_data
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]
            
            assert params["filter_by_owner"] == "true"
            assert params["status"] == "active"
            assert params["search"] == "drone"
            assert params["page"] == 2
            assert params["results_per_page"] == 50
    
    @pytest.mark.asyncio
    async def test_get_projects_with_partial_params(self):
        """Test with only some optional parameters"""
        mock_response = Mock()
        mock_response.json.return_value = {}
        mock_response.raise_for_status = Mock()
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            await endpoint(status="completed")
            
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]
            
            assert params["status"] == "completed"
            assert "search" not in params
    
    @pytest.mark.asyncio
    async def test_get_projects_http_status_error(self):
        """Test HTTP error handling"""
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
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint()
            
            assert exc_info.value.status_code == 404
            assert "Error from DroneTM API" in exc_info.value.detail
            assert "Not found" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_projects_generic_exception(self):
        """Test generic exception handling"""
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection error")
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[0].endpoint
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint()
            
            assert exc_info.value.status_code == 500
            assert "Connection error" in exc_info.value.detail


class TestGetProjectById:
    """Test suite for get_project_by_id function"""
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_success_uuid(self):
        """Test successful request with UUID"""
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
            
            result = await endpoint(project_id)
            
            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            
            assert project_id in call_args[0][0]
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_success_numeric(self):
        """Test successful request with numeric ID"""
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
            
            result = await endpoint(project_id)
            
            assert result == mock_response_data
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert project_id in call_args[0][0]
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_not_found(self):
        """Test when project doesn't exist (404)"""
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
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(project_id)
            
            assert exc_info.value.status_code == 404
            assert "Error desde DroneTM API" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_unauthorized(self):
        """Test authentication error (401)"""
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
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(project_id)
            
            assert exc_info.value.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_server_error(self):
        """Test server error (500)"""
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
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(project_id)
            
            assert exc_info.value.status_code == 500
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_generic_exception(self):
        """Test generic exception handling"""
        project_id = "some-id"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Network timeout")
            )
            
            from app.api.routes.drone_tm.drone_tm import router
            endpoint = router.routes[1].endpoint
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(project_id)
            
            assert exc_info.value.status_code == 500
            assert "Network timeout" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_json_decode_error(self):
        """Test when response is not valid JSON"""
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
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(project_id)
            
            assert exc_info.value.status_code == 500