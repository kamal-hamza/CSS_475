"""
CRUD (Create, Read, Update, Delete) Tests for NFL Stats Backend

This module tests all CRUD operations for:
- Players
- Teams
- Games

Each test is independent and uses fixtures for setup/teardown.
"""

import pytest
import json
import random
from datetime import datetime


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def extract_players(response_data):
    """Extract players list from API response (handles both old and new formats)."""
    if isinstance(response_data, dict) and 'players' in response_data:
        return response_data['players']
    return response_data


# ============================================================================
# PLAYER CRUD TESTS
# ============================================================================

class TestPlayerCRUD:
    """Test suite for Player CRUD operations."""

    @pytest.mark.crud
    def test_get_all_players(self, client):
        """Test retrieving all players."""
        response = client.get('/api/players')
        assert response.status_code == 200
        data = response.get_json()
        players = extract_players(data)
        assert isinstance(players, list)
        # Should have players in the database
        assert len(players) > 0

    @pytest.mark.crud
    def test_get_players_with_filters(self, client):
        """Test retrieving players with position and team filters."""
        # Test position filter
        response = client.get('/api/players?position=QB')
        assert response.status_code == 200
        data = response.get_json()
        players = extract_players(data)
        assert isinstance(players, list)
        if len(players) > 0:
            # All returned players should be QBs
            for player in players:
                assert player['position'] == 'QB'

        # Test team filter
        response = client.get('/api/players?team=KC')
        assert response.status_code == 200
        data = response.get_json()
        players = extract_players(data)
        assert isinstance(players, list)
        if len(players) > 0:
            for player in players:
                assert player['team'] == 'KC'

    @pytest.mark.crud
    def test_create_player_with_auto_generated_id(self, client):
        """Test creating a player without providing an ID (auto-generation)."""
        new_player = {
            'player_name': 'Auto Test Player',
            'position': 'WR',
            'team': 'KC',
            'height': '6-2',
            'weight': 210,
            'age': 24
        }

        response = client.post('/api/players', json=new_player)
        assert response.status_code in [200, 201]
        data = response.get_json()

        # Should have auto-generated player_id
        assert 'player_id' in data
        player_id = data['player_id']
        assert player_id is not None
        assert len(player_id) > 0

        # Verify the player was created
        get_response = client.get(f'/api/players')
        players = extract_players(get_response.get_json())
        created_player = next((p for p in players if p.get('player_id') == player_id), None)
        assert created_player is not None
        assert created_player['player_name'] == 'Auto Test Player'

        # Cleanup
        client.delete(f'/api/players/{player_id}')

    @pytest.mark.crud
    def test_create_player_with_provided_id(self, client):
        """Test creating a player with a specific ID."""
        # Use random ID to avoid conflicts
        player_id = f'99-{random.randint(8000000, 8999999)}'

        # Clean up first if exists
        client.delete(f'/api/players/{player_id}')

        new_player = {
            'player_id': player_id,
            'player_name': 'Custom ID Player',
            'position': 'RB',
            'team': 'KC',
            'height': '6-0',
            'weight': 215,
            'age': 26
        }

        response = client.post('/api/players', json=new_player)
        assert response.status_code in [200, 201]
        data = response.get_json()

        # Should use the provided player_id
        assert data['player_id'] == player_id
        assert 'message' in data

        # Cleanup
        client.delete(f'/api/players/{player_id}')

    @pytest.mark.crud
    def test_create_player_duplicate_id(self, client):
        """Test that creating a player with duplicate ID fails gracefully."""
        # First, get an existing player ID
        response = client.get('/api/players?limit=1')
        players = extract_players(response.get_json())

        if len(players) > 0:
            existing_id = players[0]['player_id']

            # Try to create a player with the same ID
            duplicate_player = {
                'player_id': existing_id,
                'player_name': 'Duplicate Test',
                'position': 'QB',
                'team': 'KC'
            }

            response = client.post('/api/players', json=duplicate_player)
            # Should fail with 400 or 409 (Conflict)
            assert response.status_code in [400, 409, 500]

    @pytest.mark.crud
    def test_update_player(self, client):
        """Test updating an existing player's information."""
        # Use random ID to avoid conflicts
        player_id = f'99-{random.randint(7000000, 7999999)}'

        # Clean up first if exists
        client.delete(f'/api/players/{player_id}')

        # Create a test player
        new_player = {
            'player_id': player_id,
            'player_name': 'Update Test Player',
            'position': 'TE',
            'team': 'KC',
            'height': '6-5',
            'weight': 250,
            'age': 27
        }

        create_response = client.post('/api/players', json=new_player)
        assert create_response.status_code in [200, 201]

        # Update the player
        updated_data = {
            'player_name': 'Updated Name',
            'position': 'TE',
            'team': 'SF',
            'height': '6-5',
            'weight': 255,
            'age': 28
        }

        update_response = client.put(f'/api/players/{player_id}', json=updated_data)
        assert update_response.status_code == 200
        data = update_response.get_json()
        assert 'message' in data

        # Verify the update by fetching the player
        get_response = client.get('/api/players?position=TE')
        players = extract_players(get_response.get_json())
        updated_player = next((p for p in players if p.get('player_id') == player_id), None)
        assert updated_player is not None
        assert updated_player['player_name'] == 'Updated Name'
        assert updated_player['team'] == 'SF'

        # Cleanup
        client.delete(f'/api/players/{player_id}')

    @pytest.mark.crud
    def test_update_nonexistent_player(self, client):
        """Test that updating a non-existent player fails appropriately."""
        update_data = {
            'player_name': 'Ghost Player',
            'position': 'QB',
            'team': 'KC'
        }

        response = client.put('/api/players/00-0000000', json=update_data)
        assert response.status_code in [404, 500]

    @pytest.mark.crud
    def test_delete_player(self, client):
        """Test deleting a player."""
        # Use random ID to avoid conflicts
        player_id = f'99-{random.randint(6000000, 6999999)}'

        # Clean up first if exists
        client.delete(f'/api/players/{player_id}')

        # Create a test player
        new_player = {
            'player_id': player_id,
            'player_name': 'Delete Test Player',
            'position': 'K',
            'team': 'KC'
        }

        create_response = client.post('/api/players', json=new_player)
        assert create_response.status_code in [200, 201]

        # Delete the player
        delete_response = client.delete(f'/api/players/{player_id}')
        assert delete_response.status_code in [200, 204]

        # Verify the player was deleted
        get_response = client.get('/api/players')
        players = extract_players(get_response.get_json())
        deleted_player = next((p for p in players if p.get('player_id') == player_id), None)
        assert deleted_player is None

    @pytest.mark.crud
    def test_delete_nonexistent_player(self, client):
        """Test that deleting a non-existent player fails appropriately."""
        response = client.delete('/api/players/00-0000000')
        assert response.status_code in [404, 500]


# ============================================================================
# TEAM CRUD TESTS
# ============================================================================

class TestTeamCRUD:
    """Test suite for Team CRUD operations."""

    @pytest.mark.crud
    def test_get_all_teams(self, client):
        """Test retrieving all teams."""
        response = client.get('/api/teams')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        # Should have 32 NFL teams
        assert len(data) >= 32

    @pytest.mark.crud
    def test_create_team(self, client):
        """Test creating a new team."""
        # Use random suffix to avoid conflicts
        team_abbr = f'TS{random.randint(0, 9)}'

        # Clean up first if exists
        client.delete(f'/api/teams/{team_abbr}')

        new_team = {
            'team_abbr': team_abbr,
            'team_name': 'Test Team',
            'team_conf': 'NFC',
            'team_division': 'North'
        }

        response = client.post('/api/teams', json=new_team)
        assert response.status_code in [200, 201]
        data = response.get_json()
        assert data['team_abbr'] == team_abbr
        assert 'message' in data

        # Verify the team was created
        get_response = client.get('/api/teams')
        teams = get_response.get_json()
        created_team = next((t for t in teams if t['team_abbr'] == team_abbr), None)
        assert created_team is not None

        # Cleanup
        client.delete(f'/api/teams/{team_abbr}')

    @pytest.mark.crud
    def test_create_team_duplicate(self, client):
        """Test that creating a team with duplicate abbreviation fails."""
        # Get an existing team
        response = client.get('/api/teams')
        teams = response.get_json()

        if len(teams) > 0:
            existing_abbr = teams[0]['team_abbr']

            duplicate_team = {
                'team_abbr': existing_abbr,
                'team_name': 'Duplicate Team',
                'team_id': 'duplicate-id',
                'conference': 'AFC',
                'division': 'East'
            }

            response = client.post('/api/teams', json=duplicate_team)
            assert response.status_code in [400, 409, 500]

    @pytest.mark.crud
    def test_update_team(self, client):
        """Test updating a team's information."""
        # Use random suffix to avoid conflicts
        team_abbr = f'UP{random.randint(0, 9)}'

        # Clean up first if exists
        client.delete(f'/api/teams/{team_abbr}')

        # Create a test team
        new_team = {
            'team_abbr': team_abbr,
            'team_name': 'Update Test Team',
            'team_conf': 'AFC',
            'team_division': 'West'
        }

        create_response = client.post('/api/teams', json=new_team)
        assert create_response.status_code in [200, 201]

        # Update the team
        updated_data = {
            'team_name': 'Updated Test Team',
            'conference': 'NFC',
            'division': 'East'
        }

        update_response = client.put(f'/api/teams/{team_abbr}', json=updated_data)
        assert update_response.status_code == 200
        data = update_response.get_json()
        assert 'message' in data

        # Verify the update by fetching the team
        get_response = client.get('/api/teams')
        teams = get_response.get_json()
        updated_team = next((t for t in teams if t['team_abbr'] == team_abbr), None)
        assert updated_team is not None
        assert updated_team['team_name'] == 'Updated Test Team'

        # Cleanup
        client.delete(f'/api/teams/{team_abbr}')

    @pytest.mark.crud
    def test_update_nonexistent_team(self, client):
        """Test that updating a non-existent team fails."""
        update_data = {
            'team_name': 'Ghost Team',
            'conference': 'AFC',
            'division': 'North'
        }

        response = client.put('/api/teams/XXX', json=update_data)
        assert response.status_code in [404, 500]

    @pytest.mark.crud
    def test_delete_team(self, client):
        """Test deleting a team."""
        # Use random suffix to avoid conflicts
        team_abbr = f'DE{random.randint(0, 9)}'

        # Clean up first if exists
        client.delete(f'/api/teams/{team_abbr}')

        # Create a test team
        new_team = {
            'team_abbr': team_abbr,
            'team_name': 'Delete Test Team',
            'team_conf': 'NFC',
            'team_division': 'South'
        }

        create_response = client.post('/api/teams', json=new_team)
        assert create_response.status_code in [200, 201]

        # Delete the team
        delete_response = client.delete(f'/api/teams/{team_abbr}')
        assert delete_response.status_code in [200, 204]

        # Verify the team was deleted
        get_response = client.get('/api/teams')
        teams = get_response.get_json()
        deleted_team = next((t for t in teams if t['team_abbr'] == team_abbr), None)
        assert deleted_team is None

    @pytest.mark.crud
    def test_delete_nonexistent_team(self, client):
        """Test that deleting a non-existent team fails."""
        response = client.delete('/api/teams/XXX')
        assert response.status_code in [404, 500]


# ============================================================================
# GAME CRUD TESTS
# ============================================================================

class TestGameCRUD:
    """Test suite for Game CRUD operations."""

    @pytest.mark.crud
    def test_get_all_games(self, client):
        """Test retrieving all games."""
        response = client.get('/api/games')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0

    @pytest.mark.crud
    def test_get_games_with_filters(self, client):
        """Test retrieving games with season and week filters."""
        # Test season filter
        response = client.get('/api/games?season=2024')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        if len(data) > 0:
            for game in data:
                assert game['season'] == 2024

        # Test week filter
        response = client.get('/api/games?season=2024&week=1')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        if len(data) > 0:
            for game in data:
                assert game['season'] == 2024
                assert game['week'] == 1

        # Test team filter
        response = client.get('/api/games?team=KC')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        if len(data) > 0:
            for game in data:
                assert 'KC' in [game['away_team'], game['home_team']]

    @pytest.mark.crud
    def test_create_game_with_auto_generated_id(self, client):
        """Test creating a game without providing an ID (auto-generation)."""
        new_game = {
            'season': 2024,
            'week': 99,  # Use a high week number to avoid conflicts
            'game_type': 'REG',
            'away_team': 'KC',
            'home_team': 'SF',
            'away_score': 24,
            'home_score': 21,
            'game_date': '2024-12-31',
            'stadium_name': 'Test Stadium',
            'stadium_location': 'Test City, TS'
        }

        response = client.post('/api/games', json=new_game)
        assert response.status_code in [200, 201]
        data = response.get_json()

        # Should have auto-generated game_id
        assert 'game_id' in data
        game_id = data['game_id']
        assert game_id is not None
        assert '2024_99' in game_id

        # Cleanup
        client.delete(f'/api/games/{game_id}')

    @pytest.mark.crud
    def test_create_game_with_provided_id(self, client):
        """Test creating a game with a specific ID."""
        new_game = {
            'game_id': '2024_98_TEST_GAME',
            'season': 2024,
            'week': 98,
            'game_type': 'REG',
            'away_team': 'KC',
            'home_team': 'BUF',
            'away_score': 27,
            'home_score': 24,
            'game_date': '2024-12-30',
            'stadium_name': 'Custom Stadium',
            'stadium_location': 'Buffalo, NY'
        }

        response = client.post('/api/games', json=new_game)
        assert response.status_code in [200, 201]
        data = response.get_json()

        # Should use the provided game_id
        assert data['game_id'] == '2024_98_TEST_GAME'

        # Cleanup
        client.delete('/api/games/2024_98_TEST_GAME')

    @pytest.mark.crud
    def test_update_game(self, client):
        """Test updating a game's information."""
        # Use random week to avoid conflicts
        week = random.randint(90, 96)
        game_id = f'2024_{week}_UPD_TEST'

        # Clean up first if exists
        client.delete(f'/api/games/{game_id}')

        # Create a test game
        new_game = {
            'game_id': game_id,
            'season': 2024,
            'week': week,
            'game_type': 'REG',
            'away_team': 'KC',
            'home_team': 'LV',
            'away_score': 20,
            'home_score': 17,
            'game_date': '2024-12-29'
        }

        create_response = client.post('/api/games', json=new_game)
        assert create_response.status_code in [200, 201]

        # Update the game scores
        updated_data = {
            'away_score': 31,
            'home_score': 28
        }

        update_response = client.put(f'/api/games/{game_id}', json=updated_data)
        assert update_response.status_code == 200
        data = update_response.get_json()
        assert 'message' in data

        # Verify the update by fetching the game
        get_response = client.get(f'/api/games?season=2024&week={week}')
        games = get_response.get_json()
        updated_game = next((g for g in games if g.get('game_id') == game_id), None)
        assert updated_game is not None
        assert updated_game['away_score'] == 31
        assert updated_game['home_score'] == 28

        # Cleanup
        client.delete(f'/api/games/{game_id}')

    @pytest.mark.crud
    def test_update_nonexistent_game(self, client):
        """Test that updating a non-existent game fails."""
        update_data = {
            'away_score': 10,
            'home_score': 20
        }

        response = client.put('/api/games/NONEXISTENT_GAME', json=update_data)
        assert response.status_code in [404, 500]

    @pytest.mark.crud
    def test_delete_game(self, client):
        """Test deleting a game."""
        # Create a test game
        new_game = {
            'game_id': '2024_96_DEL_TEST',
            'season': 2024,
            'week': 96,
            'game_type': 'REG',
            'away_team': 'KC',
            'home_team': 'DEN',
            'away_score': 30,
            'home_score': 14,
            'game_date': '2024-12-28'
        }

        create_response = client.post('/api/games', json=new_game)
        assert create_response.status_code in [200, 201]

        # Delete the game
        delete_response = client.delete('/api/games/2024_96_DEL_TEST')
        assert delete_response.status_code in [200, 204]

        # Verify the game was deleted
        get_response = client.get('/api/games?season=2024&week=96')
        games = get_response.get_json()
        deleted_game = next((g for g in games if g.get('game_id') == '2024_96_DEL_TEST'), None)
        assert deleted_game is None

    @pytest.mark.crud
    def test_delete_nonexistent_game(self, client):
        """Test that deleting a non-existent game fails."""
        response = client.delete('/api/games/NONEXISTENT_GAME')
        assert response.status_code in [404, 500]


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestCRUDIntegration:
    """Integration tests that test multiple CRUD operations together."""

    @pytest.mark.integration
    @pytest.mark.crud
    def test_full_player_lifecycle(self, client):
        """Test creating, reading, updating, and deleting a player in sequence."""
        # Use random ID to avoid conflicts
        player_id = f'99-{random.randint(5000000, 5999999)}'

        # Clean up first if exists
        client.delete(f'/api/players/{player_id}')

        # Create
        new_player = {
            'player_id': player_id,
            'player_name': 'Lifecycle Test Player',
            'position': 'QB',
            'team': 'KC',
            'height': '6-4',
            'weight': 230,
            'age': 25
        }

        create_response = client.post('/api/players', json=new_player)
        assert create_response.status_code in [200, 201]

        # Read
        get_response = client.get('/api/players?position=QB')
        players = extract_players(get_response.get_json())
        created_player = next((p for p in players if p.get('player_id') == player_id), None)
        assert created_player is not None
        assert created_player['player_name'] == 'Lifecycle Test Player'

        # Update
        update_data = {
            'player_name': 'Updated Lifecycle Player',
            'position': 'QB',
            'team': 'KC'
        }
        update_response = client.put(f'/api/players/{player_id}', json=update_data)
        assert update_response.status_code == 200

        # Verify update
        get_response = client.get('/api/players?position=QB')
        players = extract_players(get_response.get_json())
        updated_player = next((p for p in players if p.get('player_id') == player_id), None)
        assert updated_player['player_name'] == 'Updated Lifecycle Player'

        # Delete
        delete_response = client.delete(f'/api/players/{player_id}')
        assert delete_response.status_code in [200, 204]

        # Verify deletion
        get_response = client.get('/api/players?position=QB')
        players = extract_players(get_response.get_json())
        deleted_player = next((p for p in players if p.get('player_id') == player_id), None)
        assert deleted_player is None

    @pytest.mark.integration
    @pytest.mark.crud
    def test_create_multiple_entities(self, client):
        """Test creating multiple players, teams, and games."""
        created_ids = {'players': [], 'teams': [], 'games': []}

        try:
            # Create multiple players
            for i in range(3):
                player = {
                    'player_id': f'99-444444{i}',
                    'player_name': f'Batch Player {i}',
                    'position': 'WR',
                    'team': 'KC',
                    'height': '6-1',
                    'weight': 200,
                    'age': 23 + i
                }
                response = client.post('/api/players', json=player)
                assert response.status_code in [200, 201]
                created_ids['players'].append(f'99-444444{i}')

            # Verify all players were created
            get_response = client.get('/api/players?position=WR&team=KC')
            players = extract_players(get_response.get_json())
            batch_players = [p for p in players if p.get('player_id', '').startswith('99-444444')]
            assert len(batch_players) >= 3

        finally:
            # Cleanup all created entities
            for player_id in created_ids['players']:
                client.delete(f'/api/players/{player_id}')
