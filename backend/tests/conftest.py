"""
Pytest configuration and fixtures for backend tests.
This file contains shared fixtures used across all test files.
"""

import os
import pytest
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import app as flask_app
from database import db


@pytest.fixture(scope='session')
def app():
    """
    Create and configure a Flask application instance for testing.
    This fixture is session-scoped, so it's created once per test session.
    """
    # Configure for testing
    flask_app.config['TESTING'] = True

    # Create application context
    with flask_app.app_context():
        yield flask_app


@pytest.fixture(scope='function')
def client(app):
    """
    Create a test client for the Flask application.
    This fixture is function-scoped, so a new client is created for each test.
    """
    return app.test_client()


@pytest.fixture(scope='function')
def app_context(app):
    """
    Create an application context for tests that need to access the database.
    """
    with app.app_context():
        yield


@pytest.fixture(scope='function')
def db_session(app):
    """
    Create a database session for tests that need direct database access.
    Note: This uses the actual database, not a test database.
    Be careful with data modifications.
    """
    with app.app_context():
        yield db.session


@pytest.fixture
def sample_team_data():
    """Sample team data for testing."""
    return {
        'team_abbr': 'TST',
        'team_name': 'Test Team',
        'team_id': 'test-team-id',
        'conference': 'NFC',
        'division': 'North'
    }


@pytest.fixture
def sample_player_data():
    """Sample player data for testing."""
    return {
        'player_id': '99-9999999',
        'player_name': 'Test Player',
        'position': 'QB',
        'team': 'KC',
        'height': '6-3',
        'weight': 225,
        'age': 25,
        'birth_date': '1999-01-01',
        'years_exp': 3
    }


@pytest.fixture
def sample_game_data():
    """Sample game data for testing."""
    return {
        'game_id': '2024_1_TST_OPP',
        'season': 2024,
        'week': 1,
        'game_type': 'REG',
        'away_team': 'TST',
        'home_team': 'OPP',
        'away_score': 21,
        'home_score': 17,
        'game_date': '2024-09-08',
        'stadium_id': 'test-stadium'
    }


@pytest.fixture
def sample_stadium_data():
    """Sample stadium data for testing."""
    return {
        'stadium_id': 'test-stadium',
        'stadium_name': 'Test Stadium',
        'stadium_location': 'Test City, TS',
        'stadium_type': 'outdoor',
        'stadium_capacity': 70000
    }


@pytest.fixture
def create_test_player(client, sample_player_data):
    """
    Factory fixture to create a test player.
    Returns a function that creates a player and returns the response.
    """
    created_players = []

    def _create_player(player_data=None):
        if player_data is None:
            player_data = sample_player_data.copy()

        response = client.post('/api/players', json=player_data)
        if response.status_code in [200, 201]:
            created_players.append(player_data.get('player_id'))
        return response

    yield _create_player

    # Cleanup: delete created players
    for player_id in created_players:
        try:
            client.delete(f'/api/players/{player_id}')
        except:
            pass  # Ignore errors during cleanup


@pytest.fixture
def create_test_team(client, sample_team_data):
    """
    Factory fixture to create a test team.
    Returns a function that creates a team and returns the response.
    """
    created_teams = []

    def _create_team(team_data=None):
        if team_data is None:
            team_data = sample_team_data.copy()

        response = client.post('/api/teams', json=team_data)
        if response.status_code in [200, 201]:
            created_teams.append(team_data.get('team_abbr'))
        return response

    yield _create_team

    # Cleanup: delete created teams
    for team_abbr in created_teams:
        try:
            client.delete(f'/api/teams/{team_abbr}')
        except:
            pass  # Ignore errors during cleanup


@pytest.fixture
def create_test_game(client, sample_game_data):
    """
    Factory fixture to create a test game.
    Returns a function that creates a game and returns the response.
    """
    created_games = []

    def _create_game(game_data=None):
        if game_data is None:
            game_data = sample_game_data.copy()

        response = client.post('/api/games', json=game_data)
        if response.status_code in [200, 201]:
            created_games.append(game_data.get('game_id'))
        return response

    yield _create_game

    # Cleanup: delete created games
    for game_id in created_games:
        try:
            client.delete(f'/api/games/{game_id}')
        except:
            pass  # Ignore errors during cleanup


@pytest.fixture(autouse=True)
def reset_test_data():
    """
    Auto-used fixture that runs before and after each test.
    Can be used to ensure test isolation.
    """
    # Setup: runs before each test
    yield
    # Teardown: runs after each test
    pass


@pytest.fixture
def auth_headers():
    """
    Fixture for authentication headers if needed in the future.
    """
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
