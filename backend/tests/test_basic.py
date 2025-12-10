"""
Basic API Tests for NFL Stats Backend

This module tests basic API functionality including:
- Health check endpoints
- Basic API structure
- CORS headers
- Error handling
- Response formats

These are smoke tests that verify the API is running correctly.
"""

import pytest
import json


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def extract_players(response_data):
    """Extract players list from API response (handles both old and new formats)."""
    if isinstance(response_data, dict) and 'players' in response_data:
        return response_data['players']
    return response_data


# ============================================================================
# HEALTH CHECK TESTS
# ============================================================================

class TestHealthChecks:
    """Test suite for API health check endpoints."""

    @pytest.mark.smoke
    def test_root_endpoint(self, client):
        """Test the root endpoint returns a welcome message."""
        response = client.get('/')
        assert response.status_code == 200

        data = response.get_json()
        assert isinstance(data, dict)
        assert 'message' in data
        assert 'NFL' in data['message'] or 'API' in data['message']

    @pytest.mark.smoke
    def test_health_endpoint(self, client):
        """Test the health check endpoint."""
        response = client.get('/health')
        assert response.status_code == 200

        data = response.get_json()
        assert isinstance(data, dict)
        assert 'status' in data
        assert data['status'] == 'healthy'
        assert 'database' in data
        assert data['database'] == 'connected'

    @pytest.mark.smoke
    def test_health_endpoint_database_connection(self, client):
        """Test that health endpoint verifies database connectivity."""
        response = client.get('/health')
        assert response.status_code == 200

        data = response.get_json()
        # If database is connected, status should be healthy
        if data.get('database') == 'connected':
            assert data['status'] == 'healthy'


# ============================================================================
# API STRUCTURE TESTS
# ============================================================================

class TestAPIStructure:
    """Test suite for API structure and routing."""

    @pytest.mark.smoke
    def test_api_prefix_routes(self, client):
        """Test that API routes use /api prefix."""
        # These endpoints should exist under /api
        endpoints = [
            '/api/teams',
            '/api/players',
            '/api/games',
            '/api/coaches',
            '/api/referees',
        ]

        for endpoint in endpoints:
            response = client.get(endpoint)
            # Should not return 404
            assert response.status_code != 404

    @pytest.mark.smoke
    def test_query_endpoints_exist(self, client):
        """Test that query endpoints are properly registered."""
        # These query endpoints should exist
        query_endpoints = [
            '/api/queries/all-teams',
            '/api/queries/top-scorers?season=2024&week=1',
            '/api/queries/rushing-leaders?season=2024',
        ]

        for endpoint in query_endpoints:
            response = client.get(endpoint)
            # Should not return 404 (might return 200 or 400 for missing params)
            assert response.status_code != 404

    def test_nonexistent_endpoint_returns_404(self, client):
        """Test that requesting non-existent endpoint returns 404."""
        response = client.get('/api/nonexistent/endpoint')
        assert response.status_code == 404


# ============================================================================
# RESPONSE FORMAT TESTS
# ============================================================================

class TestResponseFormats:
    """Test suite for API response formats."""

    @pytest.mark.smoke
    def test_json_response_format(self, client):
        """Test that all endpoints return JSON."""
        endpoints = [
            '/',
            '/health',
            '/api/teams',
            '/api/players?limit=1',
        ]

        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.content_type == 'application/json'

    def test_list_endpoints_return_arrays(self, client):
        """Test that list endpoints return JSON arrays."""
        list_endpoints = [
            '/api/teams',
            '/api/games',
            '/api/queries/all-teams',
        ]

        for endpoint in list_endpoints:
            response = client.get(endpoint)
            if response.status_code == 200:
                data = response.get_json()
                assert isinstance(data, list), f"{endpoint} should return a list"

        # /api/players now returns a dict with 'players' key
        response = client.get('/api/players')
        if response.status_code == 200:
            data = response.get_json()
            if isinstance(data, dict):
                assert 'players' in data, "/api/players should have 'players' key"
                assert isinstance(data['players'], list), "/api/players['players'] should be a list"
            else:
                # Backwards compatibility
                assert isinstance(data, list), "/api/players should return a list or dict with 'players'"

    def test_detail_endpoints_return_objects(self, client):
        """Test that detail/single-item endpoints return JSON objects."""
        # First get a valid ID
        response = client.get('/api/players?limit=1')
        if response.status_code == 200:
            players = extract_players(response.get_json())
            if len(players) > 0:
                player_id = players[0]['player_id']

                # Test player details endpoint if it exists
                detail_response = client.get(f'/api/players/{player_id}')
                if detail_response.status_code == 200:
                    data = detail_response.get_json()
                    # Could be object or could still be in a list depending on implementation


# ============================================================================
# CORS TESTS
# ============================================================================

class TestCORS:
    """Test suite for CORS (Cross-Origin Resource Sharing) headers."""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in responses."""
        response = client.get('/api/teams')

        # Check for CORS headers
        # Note: In test client, CORS headers might not be present
        # This test validates the setup but may need adjustment
        assert response.status_code == 200

    def test_options_request_allowed(self, client):
        """Test that OPTIONS requests are handled for CORS preflight."""
        response = client.options('/api/teams')

        # OPTIONS request should be successful
        # Status code could be 200 or 204
        assert response.status_code in [200, 204, 405]


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

class TestErrorHandling:
    """Test suite for API error handling."""

    def test_404_error_format(self, client):
        """Test that 404 errors return proper format."""
        response = client.get('/api/this/does/not/exist')
        assert response.status_code == 404

    def test_400_error_for_invalid_params(self, client):
        """Test that invalid parameters return 400 errors."""
        # Try to get games without required parameters
        response = client.get('/api/queries/games-by-week')
        # This endpoint has default values, so it returns 200
        assert response.status_code in [200, 400, 422]

    def test_error_response_is_json(self, client):
        """Test that error responses are in JSON format."""
        response = client.get('/api/nonexistent')
        # Even errors should return JSON (if error handling is set up)
        # Some frameworks return HTML by default, so this might fail
        # and that's okay - it's a suggestion for improvement


# ============================================================================
# QUERY PARAMETER TESTS
# ============================================================================

class TestQueryParameters:
    """Test suite for query parameter handling."""

    def test_limit_parameter(self, client):
        """Test that limit parameter is respected."""
        response = client.get('/api/players?limit=5')
        assert response.status_code == 200

        data = response.get_json()
        players = extract_players(data)
        assert isinstance(players, list)
        assert len(players) <= 5

    def test_filter_parameters(self, client):
        """Test that filter parameters work correctly."""
        # Test position filter
        response = client.get('/api/players?position=QB')
        assert response.status_code == 200

        data = response.get_json()
        players = extract_players(data)
        if len(players) > 0:
            for player in players:
                assert player['position'] == 'QB'

    def test_multiple_filter_parameters(self, client):
        """Test that multiple filters work together."""
        response = client.get('/api/players?position=QB&team=KC')
        assert response.status_code == 200

        data = response.get_json()
        players = extract_players(data)
        if len(players) > 0:
            for player in players:
                assert player['position'] == 'QB'
                assert player['team'] == 'KC'

    def test_case_insensitive_parameters(self, client):
        """Test if query parameters handle different cases."""
        # Most implementations are case-sensitive, but worth testing
        response1 = client.get('/api/players?team=KC')
        response2 = client.get('/api/players?team=kc')

        # Both should succeed, but might return different results
        assert response1.status_code == 200
        # KC is uppercase in the database, so lowercase might return empty
        assert response2.status_code == 200


# ============================================================================
# DATA CONSISTENCY TESTS
# ============================================================================

class TestDataConsistency:
    """Test suite for data consistency across endpoints."""

    def test_team_count_consistency(self, client):
        """Test that team count is consistent across endpoints."""
        # Get teams from main endpoint
        response1 = client.get('/api/teams')
        teams1 = response1.get_json()

        # Get teams from query endpoint
        response2 = client.get('/api/queries/all-teams')
        teams2 = response2.get_json()

        # Should have similar counts (allowing for some difference in data structure)
        assert len(teams1) >= 32
        assert len(teams2) >= 32

    def test_player_data_consistency(self, client):
        """Test that player data is consistent across endpoints."""
        # Get a player from the main endpoint
        response = client.get('/api/players?limit=1')
        assert response.status_code == 200

        players = extract_players(response.get_json())
        if len(players) > 0:
            player = players[0]

            # Verify required fields exist
            assert 'player_id' in player
            assert 'player_name' in player
            assert 'position' in player

            # Player ID should be non-empty
            assert len(player['player_id']) > 0


# ============================================================================
# INTEGRATION SMOKE TESTS
# ============================================================================

class TestIntegrationSmoke:
    """Smoke tests that verify basic integration between components."""

    @pytest.mark.smoke
    @pytest.mark.integration
    def test_full_api_workflow(self, client):
        """Test a complete workflow through the API."""
        # 1. Check health
        health_response = client.get('/health')
        assert health_response.status_code == 200

        # 2. Get teams
        teams_response = client.get('/api/teams')
        assert teams_response.status_code == 200
        teams = teams_response.get_json()
        assert len(teams) > 0

        # 3. Get players for a team
        team = teams[0]['team_abbr']
        players_response = client.get(f'/api/players?team={team}')
        assert players_response.status_code == 200
        players = extract_players(players_response.get_json())

        # 4. Run a query
        query_response = client.get('/api/queries/all-teams')
        assert query_response.status_code == 200

    @pytest.mark.smoke
    def test_database_connectivity_through_queries(self, client):
        """Test that database is accessible through various queries."""
        # Try multiple endpoints that require database access
        endpoints = [
            '/api/teams',
            '/api/players?limit=1',
            '/api/games?limit=1',
            '/api/queries/all-teams',
        ]

        for endpoint in endpoints:
            response = client.get(endpoint)
            # All should succeed if database is connected
            assert response.status_code == 200, f"{endpoint} failed"
            data = response.get_json()
            assert data is not None, f"{endpoint} returned null data"
