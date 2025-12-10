# Backend Test Suite

Comprehensive test suite for the NFL Stats Backend API.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Writing New Tests](#writing-new-tests)
- [Coverage Reports](#coverage-reports)
- [Troubleshooting](#troubleshooting)

## Overview

This test suite provides comprehensive coverage for the NFL Stats Backend, including:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between components
- **CRUD Tests**: Test Create, Read, Update, Delete operations
- **Query Tests**: Test all query endpoints
- **Smoke Tests**: Quick tests to verify basic functionality

## Test Structure

```
tests/
├── conftest.py          # Pytest configuration and fixtures
├── test_basic.py        # Basic API tests (health, structure, errors)
├── test_crud.py         # CRUD operation tests (players, teams, games)
├── test_queries.py      # Query endpoint tests (beginner to advanced)
└── README.md           # This file
```

## Setup

### 1. Install Dependencies

```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### 2. Environment Configuration

Ensure your `.env` file is configured with database credentials:

```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=your_port
DB_NAME=your_database
```

### 3. Start Backend Server (Optional)

Some tests can run without the server, but integration tests work best with it running:

```bash
python app.py
```

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/test_crud.py
pytest tests/test_queries.py
pytest tests/test_basic.py
```

### Run Specific Test Class

```bash
pytest tests/test_crud.py::TestPlayerCRUD
pytest tests/test_queries.py::TestBeginnerQueries
```

### Run Specific Test Function

```bash
pytest tests/test_crud.py::TestPlayerCRUD::test_create_player_with_auto_generated_id
```

### Run Tests by Marker

```bash
# Run only smoke tests (quick basic checks)
pytest -m smoke

# Run only CRUD tests
pytest -m crud

# Run only query tests
pytest -m queries

# Run only integration tests
pytest -m integration

# Run all except slow tests
pytest -m "not slow"
```

### Run with Verbose Output

```bash
pytest -v
pytest -vv  # Extra verbose
```

### Run with Coverage Report

```bash
pytest --cov=. --cov-report=html
```

Then open `htmlcov/index.html` in your browser to view the coverage report.

### Run Tests in Parallel (faster)

```bash
pip install pytest-xdist
pytest -n auto  # Uses all CPU cores
pytest -n 4     # Uses 4 workers
```

## Test Categories

### Smoke Tests (`@pytest.mark.smoke`)

Quick tests that verify the API is running and basic functionality works.

```bash
pytest -m smoke
```

These tests:
- Check health endpoints
- Verify API structure
- Test basic connectivity
- Should complete in < 10 seconds

### CRUD Tests (`@pytest.mark.crud`)

Tests for Create, Read, Update, Delete operations on:
- Players
- Teams
- Games

```bash
pytest -m crud
```

Coverage includes:
- Creating entities with auto-generated IDs
- Creating entities with custom IDs
- Reading/filtering entities
- Updating entities
- Deleting entities
- Error handling (duplicates, missing entities, etc.)

### Query Tests (`@pytest.mark.queries`)

Tests for all query endpoints:

**Beginner Queries:**
- All teams
- Players by team
- Games by week

**Intermediate Queries:**
- Top fantasy scorers
- QB passing leaders

**Advanced Queries:**
- Rushing leaders
- Receiving leaders
- Team statistics
- Player game logs

```bash
pytest -m queries
```

### Integration Tests (`@pytest.mark.integration`)

Tests that verify multiple components working together.

```bash
pytest -m integration
```

### Slow Tests (`@pytest.mark.slow`)

Tests that may take longer to complete (> 5 seconds).

```bash
# Run all tests including slow ones
pytest

# Skip slow tests
pytest -m "not slow"
```

## Writing New Tests

### Basic Test Template

```python
import pytest

class TestMyFeature:
    """Test suite for my feature."""
    
    @pytest.mark.smoke  # Add appropriate markers
    def test_my_feature(self, client):
        """Test description."""
        # Arrange
        endpoint = '/api/my-endpoint'
        
        # Act
        response = client.get(endpoint)
        
        # Assert
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
```

### Using Fixtures

Fixtures are defined in `conftest.py` and can be used in any test:

```python
def test_create_player(self, client, sample_player_data):
    """Test using sample player data fixture."""
    response = client.post('/api/players', json=sample_player_data)
    assert response.status_code in [200, 201]
```

Available fixtures:
- `client`: Flask test client
- `app`: Flask application
- `app_context`: Application context
- `sample_player_data`: Sample player dictionary
- `sample_team_data`: Sample team dictionary
- `sample_game_data`: Sample game dictionary
- `create_test_player`: Factory function to create test players
- `create_test_team`: Factory function to create test teams
- `create_test_game`: Factory function to create test games

### Test Markers

Add markers to organize tests:

```python
@pytest.mark.smoke        # Quick smoke test
@pytest.mark.unit         # Unit test
@pytest.mark.integration  # Integration test
@pytest.mark.crud         # CRUD operation test
@pytest.mark.queries      # Query endpoint test
@pytest.mark.slow         # Slow test (> 5 seconds)
```

## Coverage Reports

### Generate Coverage Report

```bash
pytest --cov=. --cov-report=html --cov-report=term-missing
```

### View HTML Report

```bash
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Paths (CRUD, Auth)**: > 90%
- **Query Endpoints**: > 75%

## Troubleshooting

### Database Connection Errors

**Problem**: Tests fail with database connection errors.

**Solution**:
1. Verify `.env` file has correct credentials
2. Check database is accessible from your machine
3. Ensure SSL certificates are valid (if using cloud database)

```bash
# Test database connection manually
python -c "from database import db, get_db_uri; print(get_db_uri())"
```

### Import Errors

**Problem**: `ModuleNotFoundError` or import errors.

**Solution**:
1. Ensure you're in the backend directory
2. Activate virtual environment
3. Install dependencies

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Test Isolation Issues

**Problem**: Tests pass individually but fail when run together.

**Solution**: Tests may not be properly isolated. Check:
1. Are you cleaning up created test data?
2. Are fixtures using unique IDs?
3. Consider using transactions that rollback

```python
# Good: Use unique IDs for test data
player_data = {
    'player_id': f'99-{random.randint(1000000, 9999999)}',
    # ...
}
```

### Slow Tests

**Problem**: Tests take too long to run.

**Solution**:
1. Use the `-m "not slow"` flag to skip slow tests during development
2. Run slow tests only in CI/CD pipeline
3. Consider mocking external dependencies

```bash
# Fast development testing
pytest -m "smoke or crud" --maxfail=1

# Full test suite
pytest -m "not slow"

# Complete validation (before commit)
pytest
```

### Port Already in Use

**Problem**: Backend server fails to start on port 5001.

**Solution**:
```bash
# Find process using port 5001
lsof -i :5001  # macOS/Linux
netstat -ano | findstr :5001  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        pytest --cov=. --cov-report=xml
      env:
        DB_USER: ${{ secrets.DB_USER }}
        DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        DB_HOST: ${{ secrets.DB_HOST }}
        DB_PORT: ${{ secrets.DB_PORT }}
        DB_NAME: ${{ secrets.DB_NAME }}
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
   ```python
   def test_create_player_with_auto_generated_id(self, client):
       # Clear what this test does
   ```

2. **Test Organization**: Group related tests in classes
   ```python
   class TestPlayerCRUD:
       # All player CRUD tests together
   ```

3. **Test Isolation**: Each test should be independent
   - Don't rely on data from previous tests
   - Clean up test data after each test
   - Use fixtures for common setup

4. **Clear Assertions**: Make assertions clear and specific
   ```python
   # Good
   assert response.status_code == 200
   assert player['name'] == 'Test Player'
   
   # Avoid
   assert response.status_code  # What's the expected value?
   ```

5. **Error Testing**: Test both success and failure cases
   ```python
   def test_create_player_success(self, client):
       # Test success case
   
   def test_create_player_duplicate_id(self, client):
       # Test error case
   ```

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Flask Testing Documentation](https://flask.palletsprojects.com/en/2.3.x/testing/)
- [Coverage.py Documentation](https://coverage.readthedocs.io/)

## Support

For questions or issues:
1. Check this README
2. Review test code for examples
3. Check pytest documentation
4. Ask the team

---

**Last Updated**: 2024
**Maintained By**: Development Team
