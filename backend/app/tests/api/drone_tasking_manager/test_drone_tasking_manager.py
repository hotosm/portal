# portal/backend/app/tests/api/drone_tasking_manager/test_drone_tasking_manager.py

"""Tests for Drone TM API endpoints."""

import pytest
import httpx
from unittest.mock import AsyncMock, Mock, patch
from fastapi import HTTPException, Request


class TestGetProjects:
    """Test suite for get_projects function"""
    
    def create_mock_request(self, has_cookie: bool = True):
        """Helper to create a mock request with or without Hanko cookie"""
        mock_request = Mock(spec=Request)
        if has_cookie:
            mock_request.cookies = {"hanko": "mock-hanko-token-12345"}
        else:
            mock_request.cookies = {}
        return mock_request
    
    @pytest.mark.asyncio
    async def test_get_projects_success_default_params(self):
        """Test with default parameters and successful response"""
        mock_response_data = {
            "results": [{"id": "1", "name": "Project 1"}],
            "pagination": {"page": 1, "total": 1}
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_response.status_code = 200
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            endpoint = router.routes[0].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            result = await endpoint(mock_request)
            
            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            
            # Verify URL
            assert "projects/" in call_args[0][0]
            
            # Verify headers contain Cookie with Hanko token
            assert "Cookie" in call_args[1]["headers"]
            assert "hanko=mock-hanko-token-12345" in call_args[1]["headers"]["Cookie"]
            
            # Verify params
            assert call_args[1]["params"]["filter_by_owner"] == "false"
            assert call_args[1]["params"]["page"] == 1
            assert call_args[1]["params"]["results_per_page"] == 20
    
    @pytest.mark.asyncio
    async def test_get_projects_no_hanko_cookie(self):
        """Test when Hanko cookie is missing"""
        from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
        endpoint = router.routes[0].endpoint
        
        mock_request = self.create_mock_request(has_cookie=False)
        
        with pytest.raises(HTTPException) as exc_info:
            await endpoint(mock_request)
        
        assert exc_info.value.status_code == 401
        assert "Hanko authentication cookie not found" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_projects_with_all_params(self):
        """Test with all optional parameters"""
        mock_response_data = {"results": [], "pagination": {"total": 0}}
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_response.status_code = 200
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            endpoint = router.routes[0].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            result = await endpoint(
                mock_request,
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
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            endpoint = router.routes[0].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(mock_request)
            
            assert exc_info.value.status_code == 404
            assert "Error from DroneTM API" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_projects_fetch_all(self):
        """Test fetch_all parameter pagination"""
        page1_data = {
            "results": [{"id": "1", "name": "Project 1"}],
            "pagination": {"page": 1, "total_pages": 2}
        }
        page2_data = {
            "results": [{"id": "2", "name": "Project 2"}],
            "pagination": {"page": 2, "total_pages": 2}
        }
        
        mock_response1 = Mock()
        mock_response1.json.return_value = page1_data
        mock_response1.raise_for_status = Mock()
        mock_response1.status_code = 200
        
        mock_response2 = Mock()
        mock_response2.json.return_value = page2_data
        mock_response2.raise_for_status = Mock()
        mock_response2.status_code = 200
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=[mock_response1, mock_response2]
            )
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            endpoint = router.routes[0].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            result = await endpoint(mock_request, fetch_all=True)
            
            # Should have combined results from both pages
            assert len(result["results"]) == 2
            assert result["results"][0]["id"] == "1"
            assert result["results"][1]["id"] == "2"
            assert result["pagination"]["total"] == 2


class TestGetUserProjects:
    """Test suite for get_user_projects function"""
    
    def create_mock_request(self, has_cookie: bool = True):
        """Helper to create a mock request with or without Hanko cookie"""
        mock_request = Mock(spec=Request)
        if has_cookie:
            mock_request.cookies = {"hanko": "mock-hanko-token-12345"}
        else:
            mock_request.cookies = {}
        return mock_request
    
    @pytest.mark.asyncio
    async def test_get_user_projects_success_default_params(self):
        """Test with default parameters and successful response"""
        mock_response_data = {
            "results": [
                {"id": "1", "name": "User Project 1"},
                {"id": "2", "name": "User Project 2"}
            ],
            "pagination": {"page": 1, "total": 2}
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_response.status_code = 200
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            # Now /projects/user is the second route (index 1)
            endpoint = router.routes[1].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            result = await endpoint(mock_request)
            
            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            
            # Verify URL
            assert "projects/" in call_args[0][0]
            
            # Verify headers contain Cookie with Hanko token
            assert "Cookie" in call_args[1]["headers"]
            assert "hanko=mock-hanko-token-12345" in call_args[1]["headers"]["Cookie"]
            
            # Verify params - filter_by_owner should always be true
            assert call_args[1]["params"]["filter_by_owner"] == "true"
            assert call_args[1]["params"]["page"] == 1
            assert call_args[1]["params"]["results_per_page"] == 12  # Default is 12
    
    @pytest.mark.asyncio
    async def test_get_user_projects_no_hanko_cookie(self):
        """Test when Hanko cookie is missing"""
        from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
        endpoint = router.routes[1].endpoint
        
        mock_request = self.create_mock_request(has_cookie=False)
        
        with pytest.raises(HTTPException) as exc_info:
            await endpoint(mock_request)
        
        assert exc_info.value.status_code == 401
        assert "Hanko authentication cookie not found" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_user_projects_with_search(self):
        """Test with search parameter"""
        mock_response_data = {
            "results": [{"id": "1", "name": "Searched Project"}],
            "pagination": {"page": 1, "total": 1}
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()
        mock_response.status_code = 200
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            endpoint = router.routes[1].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            result = await endpoint(mock_request, search="test search")
            
            assert result == mock_response_data
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]
            
            assert params["filter_by_owner"] == "true"
            assert params["search"] == "test search"


class TestGetProjectById:
    """Test suite for get_project_by_id function"""
    
    def create_mock_request(self, has_cookie: bool = True):
        """Helper to create a mock request with or without Hanko cookie"""
        mock_request = Mock(spec=Request)
        if has_cookie:
            mock_request.cookies = {"hanko": "mock-hanko-token-12345"}
        else:
            mock_request.cookies = {}
        return mock_request
    
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
        mock_response.status_code = 200
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            # Now /projects/{project_id} is the third route (index 2)
            endpoint = router.routes[2].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            result = await endpoint(mock_request, project_id)
            
            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            
            assert project_id in call_args[0][0]
            assert "Cookie" in call_args[1]["headers"]
            assert "hanko=mock-hanko-token-12345" in call_args[1]["headers"]["Cookie"]
    
    @pytest.mark.asyncio
    async def test_get_project_by_id_no_hanko_cookie(self):
        """Test when Hanko cookie is missing"""
        from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
        endpoint = router.routes[2].endpoint
        
        mock_request = self.create_mock_request(has_cookie=False)
        
        with pytest.raises(HTTPException) as exc_info:
            await endpoint(mock_request, "some-project-id")
        
        assert exc_info.value.status_code == 401
        assert "Hanko authentication cookie not found" in exc_info.value.detail
    
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
            
            from app.api.routes.drone_tasking_manager.drone_tasking_manager import router
            endpoint = router.routes[2].endpoint
            
            mock_request = self.create_mock_request(has_cookie=True)
            
            with pytest.raises(HTTPException) as exc_info:
                await endpoint(mock_request, project_id)
            
            assert exc_info.value.status_code == 404
            assert "Error from DroneTM API" in exc_info.value.detail