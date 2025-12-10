# NFL Fantasy Stats Database System

## Project Overview

This is a comprehensive database application for managing and analyzing NFL player statistics and fantasy football data. The system provides a full-stack solution with a MySQL database backend (normalized to 3NF), Flask REST API, and React frontend with Material-UI components.

**🎉 NEW: Database has been normalized to Third Normal Form (3NF)** - See [DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md) for details.

## Features

### Core Functionality

- **Player Management**: Track NFL players with positions, teams, and comprehensive statistics
- **Team Information**: Manage team data including conference, division, and team colors
- **Game Tracking**: Record game results, scores, and venue information
- **Stadium Management**: Normalized stadium data with characteristics (roof type, surface, location)
- **Statistical Analysis**: Detailed stats including passing, rushing, receiving, defense, kicking, and punting
- **Database Normalization**: Strict 3NF compliance with backward-compatible views

### Advanced Features

- **Complex Queries**: 5+ advanced SQL queries demonstrating:
    - Multi-table JOINs (3-4 tables)
    - Nested subqueries
    - GROUP BY with aggregate functions
    - Statistical analysis with MIN, MAX, AVG
- **CRUD Operations**: Full Create, Read, Update, Delete functionality via Admin Dashboard
- **Interactive UI**: Modern, responsive interface with charts and data visualization
- **Real-time Search**: Player search with autocomplete
- **Fantasy Points Tracking**: Both standard and PPR scoring systems

## Technology Stack

### Backend

- **Python 3.8+**
- **Flask** - REST API framework
- **SQLAlchemy** - ORM for database operations
- **MySQL 8.0+** - Relational database
- **PyMySQL** - MySQL database connector
- **Flask-CORS** - Cross-origin resource sharing

### Frontend

- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Database Schema (Normalized 3NF)

### Normalized Tables

The database follows **Third Normal Form (3NF)** principles:

**Core Tables:**

- `teams` - NFL teams (3NF ✓)
- `players` - Player roster (3NF ✓)
- `stadiums` - **NEW** Stadium information (3NF ✓)
- `games_3nf` - Game records with normalized stadium references (3NF ✓)
- `game_logs_3nf` - Player game logs without redundancy (3NF ✓)

**Statistics Tables (3NF ✓):**

- `passing_stats` - QB passing statistics
- `rushing_stats` - Rushing statistics
- `receiving_stats` - Receiving statistics
- `defense_stats` - Defensive statistics
- `kicking_stats` - Field goal and PAT statistics
- `punting_stats` - Punting statistics

### Compatibility Views

For backward compatibility, the following views maintain the old table interface:

- `games_view` - Exposes old `games` structure with derived fields
- `game_logs_view` - Exposes old `game_logs` structure with calculated PPR
- `player_season_stats` - Aggregate season statistics per player

### Key Normalization Changes

1. **Stadium Normalization**: Created `stadiums` table to eliminate redundant stadium data
    - Before: Stadium info repeated in every game record (285 records)
    - After: 34 unique stadium records referenced by FK

2. **Removed Derived Fields from `games`**:
    - `weekday` - Now calculated from `gameday` in view
    - `result` - Now calculated from scores in view
    - `total` - Now calculated from scores in view

3. **Removed Redundant Fields from `game_logs`**:
    - `season`, `week` - Available via JOIN with `games_3nf`
    - `team` - Available via JOIN with `players`
    - `opponent` - Calculated from game home/away teams
    - `fantasy_points_ppr` - Calculated as `fantasy_points + receptions`

### Tables (Legacy Structure)

1. **teams** - NFL team information
2. **players** - Player profiles
3. **games** - Game records and details
4. **game_logs** - Per-game player summary stats
5. **passing_stats** - Quarterback statistics
6. **rushing_stats** - Running back statistics
7. **receiving_stats** - Receiver statistics
8. **defense_stats** - Defensive player statistics
9. **kicking_stats** - Kicker statistics
10. **punting_stats** - Punter statistics

### Normalization

The database design follows **3rd Normal Form (3NF)**:

- All tables have primary keys
- No repeating groups (1NF)
- All non-key attributes depend on the entire primary key (2NF)
- No transitive dependencies (3NF)
- Foreign key constraints maintain referential integrity

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**

    ```bash
    cd CSS_475/backend
    ```

2. **Create virtual environment**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install dependencies**

    ```bash
    pip install -r requirements.txt
    ```

4. **Configure database (Aiven Cloud MySQL)**
   The project is configured to use Aiven cloud database:

    ```
    DB_HOST=your-database-host.aivencloud.com
    DB_PORT=15569
    DB_USER=your-database-user
    DB_PASSWORD=your-database-password
    DB_NAME=defaultdb
    ```

    The `.env` file will be automatically created when you run the setup script.

5. **Setup and populate database**
   Run the automated setup script to create tables and load NFL data:

    ```bash
    python setup_aiven_db.py
    ```

    This will:
    - Test connection to Aiven
    - Create all 10 tables
    - Load real NFL data from nflreadpy library
    - Populate teams, players, games, and statistics
    - Takes approximately 2-3 minutes

    **When prompted, type `yes` to continue.**

6. **Run the backend server**
    ```bash
    python app.py
    ```
    The API will be available at `http://localhost:5002`

### Frontend Setup

1. **Navigate to frontend directory**

    ```bash
    cd CSS_475/frontend
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start development server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`

## Usage Guide

### Accessing the Application

1. **Home Page** (`/`)
    - Dashboard with top players by position
    - Fantasy points visualization
    - Quick stats overview

2. **Players Page** (`/players`)
    - Browse top players by position
    - Filter by QB, RB, WR, TE, K, DEF
    - View detailed statistics
    - Click on player to see full profile

3. **Teams Page** (`/teams`)
    - Team statistics and rankings
    - Passing vs rushing yard breakdown
    - Sort by different metrics

4. **Games Page** (`/games`)
    - Browse games by week
    - View scores and matchups
    - Filter by season and week

5. **Player Profile** (`/player/:id`)
    - Detailed player statistics
    - Weekly performance charts
    - Complete game log
    - Yards breakdown visualization

6. **Queries** (`/queries`)
    - Interactive query execution
    - 9 SQL queries (beginner → advanced) with visualization
    - Customizable parameters
    - SQL query display

7. **Admin Dashboard** (`/admin`)
    - CRUD operations for Players, Teams, and Games
    - Add, edit, and delete records
    - Bulk data management

### API Endpoints

#### Players

- `GET /api/players` - Get all players
- `GET /api/players?team=BUF` - Filter by team
- `GET /api/players?position=QB` - Filter by position
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

#### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/stats` - Get team statistics
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

#### Games

- `GET /api/games` - Get all games
- `GET /api/games?week=1` - Filter by week
- `POST /api/games` - Create game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

#### Statistics

- `GET /api/stats/player/:id` - Get player stats
- `GET /api/stats/top-players?position=QB` - Top performers
- `GET /api/stats/week/:week` - Weekly leaders
- `GET /api/search?q=mahomes` - Search players

#### Complex Queries

- `GET /api/complex/best-qb-performances` - Top QB games (4-table JOIN)
- `GET /api/complex/multi-threat-players` - Dual-threat QBs (nested subquery)
- `GET /api/complex/team-performance-breakdown` - Home vs Away analysis
- `GET /api/complex/weekly-leaders` - Weekly stat leaders
- `GET /api/complex/consistent-performers` - Consistent players (GROUP BY + HAVING)

## Complex Queries Explanation

### Query 1: Best QB Performances

**Joins**: Player, GameLog, PassingStats, Game (4 tables)
**Features**: Multiple JOINs, filtering, ordering
**Purpose**: Find top quarterback performances with complete game context

### Query 2: Dual-Threat Players

**Joins**: Player, PassingStats, RushingStats, GameLog (4 tables)
**Features**: Nested subquery, GROUP BY, HAVING, aggregate functions
**Purpose**: Identify players excelling in both passing and rushing

### Query 3: Team Performance Breakdown

**Joins**: Team, Game, GameLog, PassingStats, RushingStats (5 tables)
**Features**: Multiple queries with aggregations, LEFT JOINs
**Purpose**: Compare team offensive performance in home vs away games

### Query 4: Weekly Leaders

**Joins**: Player, PassingStats, RushingStats, ReceivingStats, GameLog
**Features**: Multiple independent queries, ordering
**Purpose**: Find top performers in each statistical category per week

### Query 5: Consistent Performers

**Joins**: Player, GameLog
**Features**: GROUP BY, HAVING clause, statistical functions (AVG, MIN, MAX)
**Purpose**: Identify players with consistent fantasy performances

## Testing

### Backend Testing

Run SQL queries directly:

```bash
mysql -u your_username -p nfl_stats
```

Test API endpoints:

```bash
curl http://localhost:5002/api/teams
curl http://localhost:5002/api/players?position=QB
```

### Frontend Testing

- Navigate through all pages
- Test CRUD operations in Admin panel
- Execute complex queries with different parameters
- Verify charts and visualizations render correctly

## Data Population

The database is populated with:

- Real NFL team data
- Sample player records
- Game results from 2024 season
- Comprehensive statistics across all stat categories

To add more data:

1. Use the Admin Dashboard UI
2. Import CSV files using the ETL script
3. Manually insert via SQL

## Project Structure

```
CSS_475/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── database.py         # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── routes.py           # API routes and endpoints
│   ├── requirements.txt    # Python dependencies
│   └── test.sql           # Database schema and sample data
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Main application component
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
└── README.md              # This file
```

## Development Notes

### Adding New Endpoints

1. Define route in `backend/routes.py`
2. Add corresponding function in `frontend/src/services/api.js`
3. Create or update UI component to use the endpoint

### Database Migrations

When modifying the schema:

1. Update models in `backend/models.py`
2. Update `test.sql` with new CREATE TABLE statements
3. Drop and recreate tables or use migration tools

### Testing the Normalized Database

After the database normalization to 3NF, test the application:

**1. Verify Database Migration:**

```bash
cd backend
python check_and_normalize_db.py
```

**2. Test Backend API:**

```bash
# Terminal 1 - Start Flask server
cd backend
python app.py

# Terminal 2 - Run automated tests
cd backend
pip install termcolor
python test_normalized_api.py
```

**3. Test Frontend:**

```bash
cd frontend
npm run dev
# Open http://localhost:5173 and verify all pages work
```

See [TESTING_NORMALIZED_APP.md](TESTING_NORMALIZED_APP.md) for detailed testing guide.

### Database Normalization Details

The database has been migrated to strict 3NF:

- **Stadiums Table**: Created to eliminate redundant stadium data (34 unique stadiums vs 285 games)
- **Removed Derived Fields**: `weekday`, `result`, `total` now calculated in views
- **Removed Redundant Fields**: `season`, `week`, `team`, `opponent` from game_logs (available via JOINs)
- **Backward Compatibility**: Views (`games_view`, `game_logs_view`) maintain old interface

For complete migration details, see [DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md).

### Styling

- Material-UI theme defined in `frontend/src/theme.js`
- Custom styles use MUI's `sx` prop
- Responsive design with Grid and Container components

## Future Enhancements

If given another week, we would focus on:

1. **Advanced Analytics**: Predictive models for fantasy points
2. **User Authentication**: Secure login and personalized dashboards
3. **Real-time Updates**: WebSocket integration for live game scores
4. **Mobile App**: React Native version for iOS/Android
5. **Export Features**: PDF reports and CSV data export
6. **Advanced Visualizations**: Heat maps, trend lines, comparative analysis
7. **API Rate Limiting**: Security and performance optimization
8. **Caching Layer**: Redis integration for frequently accessed data

## Troubleshooting

### Backend Issues

- **Port 5002 in use**: Change port in `app.py`
- **Database connection failed**: Check `.env` credentials
- **Module not found**: Ensure virtual environment is activated and dependencies installed

### Frontend Issues

- **Port 5173 in use**: Vite will automatically use next available port
- **API connection failed**: Verify backend is running on port 5002
- **npm install fails**: Clear cache with `npm cache clean --force`

### Database Issues

- **Connection timeout**: Check internet connection to Aiven cloud database
- **SSL connection error**: Database.py automatically handles SSL for Aiven
- **Table doesn't exist**: Run `python setup_aiven_db.py` to create schema
- **Foreign key constraint fails**: Ensure referenced records exist (e.g., create team before player)
- **Empty tables**: Re-run ETL process with `python setup_aiven_db.py`

## Database Hosting

This project uses **Aiven Cloud MySQL** for database hosting:

- **Provider**: Aiven (https://aiven.io)
- **Service**: MySQL 8.0+
- **Location**: Cloud-hosted
- **Connection**: SSL/TLS encrypted
- **Benefits**:
    - No local MySQL installation required
    - Accessible from anywhere
    - Automatic backups
    - Professional-grade hosting

## Data Source

All NFL data is loaded from the **nflreadpy** library:

- Real, up-to-date NFL statistics
- Player profiles and team information
- Game schedules and results
- Comprehensive weekly statistics
- Updated for 2024 season

## Contributors

- Developed as a CSS 475 Database Systems course project
- University of Washington Bothell

## License

This project is for educational purposes as part of the CSS 475 course.

---

For questions or issues, please contact the development team.
