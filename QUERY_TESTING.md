# Query Endpoint Testing Guide

This guide explains how to test the SQL query demonstration endpoints in the NFL Stats Database.

## Quick Start

### Option 1: Using the Frontend (Easiest)

1. **Start the backend server:**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```
   Backend should be running on `http://localhost:5001`

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend should be running on `http://localhost:5173`

3. **Navigate to the Queries page:**
   - Open your browser to `http://localhost:5173`
   - Click on "Complex Queries" in the navigation menu
   - The first query (All Teams) will auto-run when the page loads
   - Click "Run Query" on any other query to see results

### Option 2: Using the Test Script

1. **Make sure the backend is running** (see Option 1, step 1)

2. **Run the automated test script:**
   ```bash
   cd backend
   python test_queries.py
   ```

   This will test all 9 query endpoints and show you:
   - ✓ Success/failure status
   - Number of records returned
   - Sample results from each query

### Option 3: Using curl (Advanced)

Test individual endpoints with curl:

```bash
# Beginner queries
curl "http://localhost:5001/api/queries/all-teams"
curl "http://localhost:5001/api/queries/players-by-team?team=KC"
curl "http://localhost:5001/api/queries/games-by-week?week=1&season=2024"

# Intermediate queries
curl "http://localhost:5001/api/queries/top-scorers?season=2024&week=1&limit=10"
curl "http://localhost:5001/api/queries/qb-passing-leaders?season=2024&min_yards=250&limit=10"

# Advanced queries
curl "http://localhost:5001/api/queries/rushing-leaders?season=2024&limit=10"
curl "http://localhost:5001/api/queries/receiving-leaders?season=2024&limit=10"
curl "http://localhost:5001/api/queries/team-stats?season=2024&team=KC"
curl "http://localhost:5001/api/queries/player-game-log?player_id=00-0033873&season=2024"
```

## Query Endpoints Reference

### 🟢 Beginner Queries

#### 1. All Teams
**Endpoint:** `GET /api/queries/all-teams`  
**Parameters:** None  
**Description:** Lists all NFL teams with their conference and division  
**SQL Concept:** Basic SELECT

#### 2. Players by Team
**Endpoint:** `GET /api/queries/players-by-team`  
**Parameters:**
- `team` (optional, default: "KC") - Team abbreviation

**Description:** Shows all players on a specific team  
**SQL Concept:** SELECT with WHERE clause

#### 3. Games by Week
**Endpoint:** `GET /api/queries/games-by-week`  
**Parameters:**
- `week` (optional, default: 1) - Week number
- `season` (optional, default: 2024) - Season year

**Description:** Shows all games for a specific week  
**SQL Concept:** Multiple WHERE conditions

---

### 🟡 Intermediate Queries

#### 4. Top Fantasy Scorers
**Endpoint:** `GET /api/queries/top-scorers`  
**Parameters:**
- `season` (optional, default: 2024)
- `week` (optional, default: 1)
- `limit` (optional, default: 10)

**Description:** Top fantasy point scorers for a given week  
**SQL Concept:** JOIN with ORDER BY

#### 5. QB Passing Leaders
**Endpoint:** `GET /api/queries/qb-passing-leaders`  
**Parameters:**
- `season` (optional, default: 2024)
- `min_yards` (optional, default: 250)
- `limit` (optional, default: 15)

**Description:** QB performances with detailed passing stats  
**SQL Concept:** Multiple JOINs (3 tables)

---

### 🔴 Advanced Queries

#### 6. Season Rushing Leaders
**Endpoint:** `GET /api/queries/rushing-leaders`  
**Parameters:**
- `season` (optional, default: 2024)
- `limit` (optional, default: 20)

**Description:** Season-long rushing leaders with aggregated stats  
**SQL Concept:** GROUP BY with SUM() and COUNT()

#### 7. Season Receiving Leaders
**Endpoint:** `GET /api/queries/receiving-leaders`  
**Parameters:**
- `season` (optional, default: 2024)
- `limit` (optional, default: 20)

**Description:** Season-long receiving leaders with catch rate, etc.  
**SQL Concept:** Complex aggregation with multiple SUM()

#### 8. Team Offensive Stats
**Endpoint:** `GET /api/queries/team-stats`  
**Parameters:**
- `season` (optional, default: 2024)
- `team` (optional, default: "KC")

**Description:** Complete team offensive breakdown  
**SQL Concept:** Multiple separate aggregation queries combined

#### 9. Player Game Log
**Endpoint:** `GET /api/queries/player-game-log`  
**Parameters:**
- `player_id` (required) - Player ID (e.g., "00-0033873" for Mahomes)
- `season` (optional, default: 2024)

**Description:** Week-by-week performance log for a player  
**SQL Concept:** JOIN with games table for detailed info

---

## Troubleshooting

### 404 Errors
**Problem:** Getting 404 Not Found errors  
**Solution:**
1. Make sure the backend server is running (`python app.py`)
2. Check that it's running on port 5001
3. Verify the URL starts with `http://localhost:5001/api/queries/...`

### Empty Results
**Problem:** Query returns no data  
**Solution:**
1. Check that the ETL has been run and data is loaded
2. Try different parameters (different week, team, or season)
3. Verify data exists: `curl http://localhost:5001/api/teams`

### Connection Refused
**Problem:** Cannot connect to backend  
**Solution:**
1. Start the backend: `cd backend && python app.py`
2. Check if another process is using port 5001
3. Look for error messages in the backend console

### CORS Errors (Frontend)
**Problem:** CORS policy blocking requests  
**Solution:**
1. Make sure Flask-CORS is installed: `pip install flask-cors`
2. Backend should have CORS enabled in `app.py`
3. Both backend and frontend should be running

## Expected Results

### Sample Output: All Teams
```json
[
  {
    "abbr": "ARI",
    "name": "Arizona Cardinals",
    "conference": "NFC",
    "division": "NFC West"
  },
  ...
]
```

### Sample Output: Top Fantasy Scorers
```json
[
  {
    "player_name": "Alvin Kamara",
    "position": "RB",
    "team": "NO",
    "week": 1,
    "opponent": "CAR",
    "fantasy_points": 41.9
  },
  ...
]
```

### Sample Output: Team Stats
```json
{
  "team": "KC",
  "season": 2024,
  "games_played": 17,
  "passing": {
    "total_yards": 4183,
    "total_tds": 26,
    "total_ints": 11,
    "yards_per_game": 246.1
  },
  "rushing": {...},
  "receiving": {...}
}
```

## Features Demonstrated

Each query demonstrates different SQL concepts:

- **Basic SELECT**: Retrieving data from a single table
- **WHERE clauses**: Filtering data
- **JOINs**: Combining data from multiple tables
- **ORDER BY**: Sorting results
- **GROUP BY**: Aggregating data
- **Aggregate functions**: SUM(), COUNT(), AVG()
- **Calculated fields**: Computing values from raw data

## Need Help?

If queries aren't working:

1. Check backend logs in the terminal where `python app.py` is running
2. Verify database connection in backend console
3. Test basic endpoints first: `/api/teams`, `/api/players`
4. Run the test script for detailed diagnostics: `python test_queries.py`

---

**Last Updated:** Based on feat/newapis branch
**Backend Port:** 5001
**Frontend Port:** 5173
