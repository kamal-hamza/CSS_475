-- ============================================================================
-- NFL FANTASY STATS DATABASE - COMPREHENSIVE SQL QUERIES
-- ============================================================================
-- Project: CSS 475 Database Systems Final Project
-- Database: MySQL 8.0+
-- Purpose: Complete SQL documentation including DDL, DML, and complex queries
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE SETUP
-- ============================================================================

-- Create database (if needed)
CREATE DATABASE IF NOT EXISTS nfl_stats
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE nfl_stats;

-- ============================================================================
-- SECTION 2: DATA DEFINITION LANGUAGE (DDL) - TABLE CREATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 DROP TABLES (in correct order to respect foreign keys)
-- ----------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS punting_stats;
DROP TABLE IF EXISTS kicking_stats;
DROP TABLE IF EXISTS defense_stats;
DROP TABLE IF EXISTS receiving_stats;
DROP TABLE IF EXISTS rushing_stats;
DROP TABLE IF EXISTS passing_stats;
DROP TABLE IF EXISTS game_logs;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 2.2 CREATE BASE TABLES
-- ----------------------------------------------------------------------------

-- TEAMS TABLE
-- Stores NFL team information
-- Primary Key: team_abbr (3-letter team abbreviation)
-- Normalization: 3NF compliant
CREATE TABLE teams (
    team_abbr VARCHAR(10) NOT NULL,
    team_name VARCHAR(100),
    team_conf VARCHAR(10),          -- Conference: AFC or NFC
    team_division VARCHAR(10),      -- Division: North, South, East, West
    team_color VARCHAR(10),         -- Primary team color (hex code)
    team_logo_espn TEXT,            -- URL to ESPN logo
    PRIMARY KEY (team_abbr),
    INDEX idx_conference (team_conf),
    INDEX idx_division (team_division)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PLAYERS TABLE
-- Stores player master data
-- Primary Key: player_id (NFL GSIS ID)
-- Foreign Key: team references teams(team_abbr)
-- Normalization: 3NF compliant
CREATE TABLE players (
    player_id VARCHAR(50) NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    position VARCHAR(10),           -- QB, RB, WR, TE, K, DEF, etc.
    team VARCHAR(10),               -- Current team
    PRIMARY KEY (player_id),
    FOREIGN KEY (team) REFERENCES teams(team_abbr) ON DELETE SET NULL,
    INDEX idx_position (position),
    INDEX idx_team (team),
    INDEX idx_name (player_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GAMES TABLE
-- Stores game schedule and results
-- Primary Key: game_id (unique identifier for each game)
-- Foreign Keys: home_team, away_team reference teams(team_abbr)
-- Normalization: 2NF (contains some denormalized fields for performance)
CREATE TABLE games (
    game_id VARCHAR(50) NOT NULL,
    season INTEGER,                 -- Year (e.g., 2024)
    week INTEGER,                   -- Week number (1-18 regular season)
    game_type VARCHAR(10),          -- REG, POST, PRE
    away_team VARCHAR(10),
    home_team VARCHAR(10),
    away_score INTEGER,
    home_score INTEGER,
    gameday DATE,
    weekday VARCHAR(10),            -- Day of week (derived from gameday)
    gametime VARCHAR(20),           -- Kickoff time
    result INTEGER,                 -- Point differential (calculated)
    total INTEGER,                  -- Total points (calculated)
    overtime INTEGER,               -- 0 or 1
    stadium VARCHAR(100),
    location VARCHAR(100),          -- City, State
    roof VARCHAR(20),               -- dome, outdoors, closed, open
    surface VARCHAR(20),            -- grass, fieldturf, etc.
    temp INTEGER,                   -- Temperature in Fahrenheit
    wind INTEGER,                   -- Wind speed in MPH
    PRIMARY KEY (game_id),
    FOREIGN KEY (away_team) REFERENCES teams(team_abbr),
    FOREIGN KEY (home_team) REFERENCES teams(team_abbr),
    INDEX idx_season_week (season, week),
    INDEX idx_gameday (gameday),
    INDEX idx_home_team (home_team),
    INDEX idx_away_team (away_team)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2.3 CREATE STATISTICS TABLES
-- ----------------------------------------------------------------------------

-- GAME_LOGS TABLE
-- Summary statistics for each player per game
-- Composite Natural Key: (player_id, game_id)
-- Surrogate Key: id (for performance)
-- Foreign Keys: player_id, game_id
-- Normalization: 2NF (contains denormalized season/week for query performance)
CREATE TABLE game_logs (
    id INTEGER NOT NULL AUTO_INCREMENT,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    season INTEGER,                 -- Denormalized from games for performance
    week INTEGER,                   -- Denormalized from games for performance
    team VARCHAR(10),               -- Player's team for this game
    opponent VARCHAR(10),           -- Opponent team abbreviation
    fantasy_points FLOAT,           -- Standard scoring
    fantasy_points_ppr FLOAT,       -- Points Per Reception scoring
    PRIMARY KEY (id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE KEY _gl_uc (player_id, game_id),
    INDEX idx_season_week (season, week),
    INDEX idx_player (player_id),
    INDEX idx_team (team)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PASSING_STATS TABLE
-- Quarterback passing statistics per game
-- Composite Natural Key: (player_id, game_id)
-- Normalization: 3NF compliant
CREATE TABLE passing_stats (
    id INTEGER NOT NULL AUTO_INCREMENT,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    completions INTEGER,            -- Passes completed
    attempts INTEGER,               -- Pass attempts
    passing_yards FLOAT,            -- Total passing yards
    passing_tds INTEGER,            -- Passing touchdowns
    interceptions INTEGER,          -- Interceptions thrown
    sacks INTEGER,                  -- Times sacked
    sack_yards FLOAT,               -- Yards lost to sacks
    sack_fumbles INTEGER,           -- Fumbles on sacks
    sack_fumbles_lost INTEGER,      -- Fumbles lost on sacks
    passing_air_yards FLOAT,        -- Air yards (depth of target)
    passing_yards_after_catch FLOAT, -- YAC on completions
    passing_first_downs INTEGER,    -- First downs by passing
    passing_epa FLOAT,              -- Expected Points Added
    passing_2pt_conversions INTEGER, -- 2-point conversions
    PRIMARY KEY (id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE KEY _pass_uc (player_id, game_id),
    INDEX idx_player_game (player_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RUSHING_STATS TABLE
-- Running back rushing statistics per game
-- Normalization: 3NF compliant
CREATE TABLE rushing_stats (
    id INTEGER NOT NULL AUTO_INCREMENT,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    carries INTEGER,                -- Rushing attempts
    rushing_yards FLOAT,            -- Total rushing yards
    rushing_tds INTEGER,            -- Rushing touchdowns
    rushing_fumbles INTEGER,        -- Fumbles on rushes
    rushing_fumbles_lost INTEGER,   -- Fumbles lost
    rushing_first_downs INTEGER,    -- First downs by rushing
    rushing_epa FLOAT,              -- Expected Points Added
    rushing_2pt_conversions INTEGER, -- 2-point conversions
    PRIMARY KEY (id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE KEY _rush_uc (player_id, game_id),
    INDEX idx_player_game (player_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RECEIVING_STATS TABLE
-- Wide receiver/tight end receiving statistics per game
-- Normalization: 3NF compliant
CREATE TABLE receiving_stats (
    id INTEGER NOT NULL AUTO_INCREMENT,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    receptions INTEGER,             -- Catches made
    targets INTEGER,                -- Times targeted
    receiving_yards FLOAT,          -- Total receiving yards
    receiving_tds INTEGER,          -- Receiving touchdowns
    receiving_fumbles INTEGER,      -- Fumbles on receptions
    receiving_fumbles_lost INTEGER, -- Fumbles lost
    receiving_air_yards FLOAT,      -- Air yards on targets
    receiving_yards_after_catch FLOAT, -- Yards after catch
    receiving_first_downs INTEGER,  -- First downs receiving
    receiving_epa FLOAT,            -- Expected Points Added
    receiving_2pt_conversions INTEGER, -- 2-point conversions
    PRIMARY KEY (id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE KEY _rec_uc (player_id, game_id),
    INDEX idx_player_game (player_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DEFENSE_STATS TABLE
-- Defensive player statistics per game
-- Normalization: 3NF compliant
CREATE TABLE defense_stats (
    id INTEGER NOT NULL AUTO_INCREMENT,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    tackles_solo FLOAT,             -- Solo tackles
    tackles_assists FLOAT,          -- Assisted tackles
    tackles_for_loss FLOAT,         -- Tackles for loss
    qb_hits INTEGER,                -- Quarterback hits
    sacks FLOAT,                    -- Sacks (can be 0.5 for shared)
    fumbles_forced INTEGER,         -- Forced fumbles
    fumbles_recovered INTEGER,      -- Fumbles recovered
    fumbles_lost INTEGER,           -- Fumbles lost
    interceptions INTEGER,          -- Interceptions
    pass_defended INTEGER,          -- Passes defended
    tds INTEGER,                    -- Defensive touchdowns
    PRIMARY KEY (id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE KEY _def_uc (player_id, game_id),
    INDEX idx_player_game (player_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- KICKING_STATS TABLE
-- Kicker statistics per game
-- Normalization: 3NF compliant
CREATE TABLE kicking_stats (
    id INTEGER NOT NULL AUTO_INCREMENT,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    fg_made INTEGER,                -- Field goals made
    fg_missed INTEGER,              -- Field goals missed
    fg_blocked INTEGER,             -- Field goals blocked
    fg_long INTEGER,                -- Longest field goal
    pat_made INTEGER,               -- Extra points made
    pat_missed INTEGER,             -- Extra points missed
    pat_blocked INTEGER,            -- Extra points blocked
    pat_total INTEGER,              -- Total extra point attempts
    PRIMARY KEY (id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE KEY _kick_uc (player_id, game_id),
    INDEX idx_player_game (player_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PUNTING_STATS TABLE
-- Punter statistics per game
-- Normalization: 3NF compliant
CREATE TABLE punting_stats (
    id INTEGER NOT NULL AUTO_INCREMENT,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    punts INTEGER,                  -- Number of punts
    punt_yards INTEGER,             -- Total punt yards
    punt_net_yards INTEGER,         -- Net punt yards
    punt_long INTEGER,              -- Longest punt
    punt_inside_20 INTEGER,         -- Punts inside 20-yard line
    punt_touchbacks INTEGER,        -- Touchbacks
    punt_blocked INTEGER,           -- Blocked punts
    PRIMARY KEY (id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE KEY _punt_uc (player_id, game_id),
    INDEX idx_player_game (player_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 3: BASIC QUERIES (SELECT, INSERT, UPDATE, DELETE)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 SELECT QUERIES
-- ----------------------------------------------------------------------------

-- Get all teams
SELECT team_abbr, team_name, team_conf, team_division
FROM teams
ORDER BY team_conf, team_division, team_name;

-- Get all players for a specific team
SELECT player_id, player_name, position
FROM players
WHERE team = 'BUF'
ORDER BY position, player_name;

-- Get games for a specific week
SELECT game_id, away_team, home_team, away_score, home_score, gameday
FROM games
WHERE season = 2024 AND week = 1
ORDER BY gameday;

-- Get top fantasy scorers
SELECT p.player_name, p.position, p.team, SUM(gl.fantasy_points_ppr) AS total_points
FROM game_logs gl
JOIN players p ON gl.player_id = p.player_id
WHERE gl.season = 2024
GROUP BY gl.player_id, p.player_name, p.position, p.team
ORDER BY total_points DESC
LIMIT 20;

-- ----------------------------------------------------------------------------
-- 3.2 INSERT QUERIES
-- ----------------------------------------------------------------------------

-- Insert a new team
INSERT INTO teams (team_abbr, team_name, team_conf, team_division, team_color)
VALUES ('SEA', 'Seattle Seahawks', 'NFC', 'West', '#002244');

-- Insert a new player
INSERT INTO players (player_id, player_name, position, team)
VALUES ('00-0012345', 'John Doe', 'QB', 'SEA');

-- Insert a new game
INSERT INTO games (game_id, season, week, game_type, home_team, away_team,
                   home_score, away_score, gameday)
VALUES ('2024_01_SEA_SF', 2024, 1, 'REG', 'SEA', 'SF', 24, 21, '2024-09-10');

-- Insert game log
INSERT INTO game_logs (player_id, game_id, season, week, team, opponent,
                       fantasy_points, fantasy_points_ppr)
VALUES ('00-0012345', '2024_01_SEA_SF', 2024, 1, 'SEA', 'SF', 25.5, 25.5);

-- ----------------------------------------------------------------------------
-- 3.3 UPDATE QUERIES
-- ----------------------------------------------------------------------------

-- Update player team
UPDATE players
SET team = 'SF'
WHERE player_id = '00-0012345';

-- Update game score
UPDATE games
SET home_score = 28, away_score = 24
WHERE game_id = '2024_01_SEA_SF';

-- Update player name
UPDATE players
SET player_name = 'John Smith'
WHERE player_id = '00-0012345';

-- ----------------------------------------------------------------------------
-- 3.4 DELETE QUERIES
-- ----------------------------------------------------------------------------

-- Delete a player (cascades to stats due to ON DELETE CASCADE)
DELETE FROM players
WHERE player_id = '00-0012345';

-- Delete a game (cascades to all related stats)
DELETE FROM games
WHERE game_id = '2024_01_SEA_SF';

-- Delete old game logs (cleanup)
DELETE FROM game_logs
WHERE season < 2020;

-- ============================================================================
-- SECTION 4: COMPLEX QUERIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- COMPLEX QUERY 1: Best QB Performances
-- Purpose: Find top QB performances with complete game context
-- Joins: 4 tables (Player, GameLog, PassingStats, Game)
-- Features: Multiple JOINs, filtering, aggregate functions, ordering
-- ----------------------------------------------------------------------------
SELECT
    p.player_name,
    p.position,
    p.team,
    gl.week,
    gl.opponent,
    ps.passing_yards,
    ps.passing_tds,
    ps.interceptions,
    ps.completions,
    ps.attempts,
    ROUND((ps.completions / ps.attempts * 100), 1) AS completion_pct,
    g.gameday,
    g.stadium,
    gl.fantasy_points_ppr
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
JOIN games g ON gl.game_id = g.game_id
WHERE gl.season = 2024
  AND p.position = 'QB'
  AND ps.passing_yards >= 250
ORDER BY ps.passing_yards DESC
LIMIT 20;

-- ----------------------------------------------------------------------------
-- COMPLEX QUERY 2: Dual-Threat Players (QBs with Passing and Rushing)
-- Purpose: Find players excelling in both passing and rushing
-- Joins: 4 tables (Player, PassingStats, RushingStats, GameLog)
-- Features: Nested subquery, GROUP BY, HAVING, aggregate functions
-- ----------------------------------------------------------------------------

-- First, identify players with significant rushing yards (subquery)
WITH rushing_players AS (
    SELECT rs.player_id
    FROM rushing_stats rs
    JOIN game_logs gl ON rs.player_id = gl.player_id AND rs.game_id = gl.game_id
    WHERE gl.season = 2024
    GROUP BY rs.player_id
    HAVING SUM(rs.rushing_yards) >= 50
)
-- Main query: Get combined passing and rushing stats
SELECT
    p.player_id,
    p.player_name,
    p.position,
    p.team,
    SUM(ps.passing_yards) AS total_pass_yards,
    SUM(ps.passing_tds) AS total_pass_tds,
    SUM(rs.rushing_yards) AS total_rush_yards,
    SUM(rs.rushing_tds) AS total_rush_tds,
    COUNT(gl.week) AS games_played,
    SUM(gl.fantasy_points_ppr) AS total_fantasy_points,
    ROUND(SUM(gl.fantasy_points_ppr) / COUNT(gl.week), 2) AS avg_fantasy_points
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
WHERE gl.season = 2024
  AND p.player_id IN (SELECT player_id FROM rushing_players)
GROUP BY p.player_id, p.player_name, p.position, p.team
ORDER BY total_fantasy_points DESC;

-- ----------------------------------------------------------------------------
-- COMPLEX QUERY 3: Team Home vs Away Performance Analysis
-- Purpose: Compare team offensive performance in home vs away games
-- Joins: 5 tables (Team, Game, GameLog, PassingStats, RushingStats)
-- Features: Multiple queries with aggregations, LEFT JOINs, CASE statements
-- ----------------------------------------------------------------------------

-- Home games performance
SELECT
    'Home' AS game_location,
    g.home_team AS team,
    COUNT(g.game_id) AS games,
    AVG(g.home_score) AS avg_score,
    SUM(ps.passing_yards) AS total_pass_yards,
    SUM(rs.rushing_yards) AS total_rush_yards,
    AVG(ps.passing_yards) AS avg_pass_yards,
    AVG(rs.rushing_yards) AS avg_rush_yards
FROM games g
JOIN game_logs gl ON g.game_id = gl.game_id
LEFT JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
LEFT JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
WHERE g.season = 2024
  AND g.home_team = 'BUF'
  AND gl.team = 'BUF'

UNION ALL

-- Away games performance
SELECT
    'Away' AS game_location,
    g.away_team AS team,
    COUNT(g.game_id) AS games,
    AVG(g.away_score) AS avg_score,
    SUM(ps.passing_yards) AS total_pass_yards,
    SUM(rs.rushing_yards) AS total_rush_yards,
    AVG(ps.passing_yards) AS avg_pass_yards,
    AVG(rs.rushing_yards) AS avg_rush_yards
FROM games g
JOIN game_logs gl ON g.game_id = gl.game_id
LEFT JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
LEFT JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
WHERE g.season = 2024
  AND g.away_team = 'BUF'
  AND gl.team = 'BUF'
ORDER BY game_location;

-- ----------------------------------------------------------------------------
-- COMPLEX QUERY 4: Weekly Statistical Leaders
-- Purpose: Find top performers in each category for a specific week
-- Joins: Multiple JOINs across different stat tables
-- Features: Separate queries for different stat categories, subqueries
-- ----------------------------------------------------------------------------

-- Passing leader for the week
SELECT 'Passing Leader' AS category,
    p.player_name,
    p.team,
    ps.passing_yards AS yards,
    ps.passing_tds AS tds,
    gl.opponent
FROM players p
JOIN passing_stats ps ON p.player_id = ps.player_id
JOIN game_logs gl ON p.player_id = gl.player_id AND ps.game_id = gl.game_id
WHERE gl.season = 2024 AND gl.week = 1
ORDER BY ps.passing_yards DESC
LIMIT 1

UNION ALL

-- Rushing leader for the week
SELECT 'Rushing Leader' AS category,
    p.player_name,
    p.team,
    rs.rushing_yards AS yards,
    rs.rushing_tds AS tds,
    gl.opponent
FROM players p
JOIN rushing_stats rs ON p.player_id = rs.player_id
JOIN game_logs gl ON p.player_id = gl.player_id AND rs.game_id = gl.game_id
WHERE gl.season = 2024 AND gl.week = 1
ORDER BY rs.rushing_yards DESC
LIMIT 1

UNION ALL

-- Receiving leader for the week
SELECT 'Receiving Leader' AS category,
    p.player_name,
    p.team,
    rec.receiving_yards AS yards,
    rec.receiving_tds AS tds,
    gl.opponent
FROM players p
JOIN receiving_stats rec ON p.player_id = rec.player_id
JOIN game_logs gl ON p.player_id = gl.player_id AND rec.game_id = gl.game_id
WHERE gl.season = 2024 AND gl.week = 1
ORDER BY rec.receiving_yards DESC
LIMIT 1;

-- ----------------------------------------------------------------------------
-- COMPLEX QUERY 5: Consistent Performers (Statistical Analysis)
-- Purpose: Find players with consistent fantasy performance
-- Joins: Player, GameLog
-- Features: GROUP BY, HAVING, statistical aggregate functions (AVG, MIN, MAX)
-- ----------------------------------------------------------------------------
SELECT
    p.player_id,
    p.player_name,
    p.position,
    p.team,
    COUNT(gl.week) AS games_played,
    ROUND(AVG(gl.fantasy_points_ppr), 2) AS avg_points,
    ROUND(MIN(gl.fantasy_points_ppr), 2) AS min_points,
    ROUND(MAX(gl.fantasy_points_ppr), 2) AS max_points,
    ROUND(SUM(gl.fantasy_points_ppr), 2) AS total_points,
    ROUND(MAX(gl.fantasy_points_ppr) - MIN(gl.fantasy_points_ppr), 2) AS point_range,
    ROUND(STDDEV(gl.fantasy_points_ppr), 2) AS std_deviation
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
WHERE gl.season = 2024
  AND p.position = 'QB'
GROUP BY p.player_id, p.player_name, p.position, p.team
HAVING COUNT(gl.week) >= 3
ORDER BY avg_points DESC, std_deviation ASC
LIMIT 20;

-- ============================================================================
-- SECTION 5: ADVANCED ANALYTICAL QUERIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Player Comparison Query
-- Compare multiple players across all stat categories
-- ----------------------------------------------------------------------------
SELECT
    p.player_name,
    p.position,
    p.team,
    COUNT(DISTINCT gl.game_id) AS games_played,
    SUM(ps.passing_yards) AS pass_yards,
    SUM(ps.passing_tds) AS pass_tds,
    SUM(rs.rushing_yards) AS rush_yards,
    SUM(rs.rushing_tds) AS rush_tds,
    SUM(rec.receiving_yards) AS rec_yards,
    SUM(rec.receiving_tds) AS rec_tds,
    SUM(rec.receptions) AS receptions,
    SUM(gl.fantasy_points_ppr) AS total_points,
    ROUND(AVG(gl.fantasy_points_ppr), 2) AS avg_points_per_game
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
LEFT JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
LEFT JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
LEFT JOIN receiving_stats rec ON gl.player_id = rec.player_id AND gl.game_id = rec.game_id
WHERE gl.season = 2024
  AND p.player_id IN ('00-0034857', '00-0033873', '00-0036212')  -- Player IDs to compare
GROUP BY p.player_id, p.player_name, p.position, p.team
ORDER BY total_points DESC;

-- ----------------------------------------------------------------------------
-- 5.2 Team Offensive Rankings
-- Rank teams by total offensive production
-- ----------------------------------------------------------------------------
SELECT
    t.team_abbr,
    t.team_name,
    t.team_conf,
    COUNT(DISTINCT gl.game_id) AS games_played,
    SUM(ps.passing_yards) AS total_pass_yards,
    SUM(ps.passing_tds) AS total_pass_tds,
    SUM(rs.rushing_yards) AS total_rush_yards,
    SUM(rs.rushing_tds) AS total_rush_tds,
    SUM(gl.fantasy_points_ppr) AS total_fantasy_points,
    ROUND(SUM(ps.passing_yards) / COUNT(DISTINCT gl.game_id), 1) AS pass_yards_per_game,
    ROUND(SUM(rs.rushing_yards) / COUNT(DISTINCT gl.game_id), 1) AS rush_yards_per_game
FROM teams t
JOIN game_logs gl ON t.team_abbr = gl.team
LEFT JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
LEFT JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
WHERE gl.season = 2024
GROUP BY t.team_abbr, t.team_name, t.team_conf
ORDER BY total_fantasy_points DESC;

-- ----------------------------------------------------------------------------
-- 5.3 Position-Based Rankings with Window Functions
-- Rank players within their position group
-- ----------------------------------------------------------------------------
SELECT
    player_name,
    position,
    team,
    total_points,
    games_played,
    avg_points,
    RANK() OVER (PARTITION BY position ORDER BY total_points DESC) AS position_rank,
    PERCENT_RANK() OVER (PARTITION BY position ORDER BY total_points DESC) AS percentile_rank
FROM (
    SELECT
        p.player_name,
        p.position,
        p.team,
        SUM(gl.fantasy_points_ppr) AS total_points,
        COUNT(gl.week) AS games_played,
        ROUND(AVG(gl.fantasy_points_ppr), 2) AS avg_points
    FROM players p
    JOIN game_logs gl ON p.player_id = gl.player_id
    WHERE gl.season = 2024
      AND p.position IN ('QB', 'RB', 'WR', 'TE')
    GROUP BY p.player_id, p.player_name, p.position, p.team
    HAVING COUNT(gl.week) >= 3
) ranked_players
ORDER BY position, position_rank;

-- ----------------------------------------------------------------------------
-- 5.4 Weekly Trending Analysis
-- Identify players with improving performance over time
-- ----------------------------------------------------------------------------
SELECT
    p.player_name,
    p.position,
    p.team,
    gl.week,
    gl.fantasy_points_ppr,
    AVG(gl.fantasy_points_ppr) OVER (
        PARTITION BY gl.player_id
        ORDER BY gl.week
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS three_week_avg,
    gl.fantasy_points_ppr - LAG(gl.fantasy_points_ppr) OVER (
        PARTITION BY gl.player_id
        ORDER BY gl.week
    ) AS week_over_week_change
FROM game_logs gl
JOIN players p ON gl.player_id = p.player_id
WHERE gl.season = 2024
  AND p.position = 'QB'
ORDER BY p.player_name, gl.week;

-- ============================================================================
-- SECTION 6: DATA INTEGRITY VERIFICATION QUERIES
-- ============================================================================

-- Check for orphaned players (team doesn't exist)
SELECT p.player_id, p.player_name, p.team
FROM players p
LEFT JOIN teams t ON p.team = t.team_abbr
WHERE p.team IS NOT NULL AND t.team_abbr IS NULL;

-- Check for orphaned game logs (invalid player)
SELECT COUNT(*) AS orphaned_logs
FROM game_logs gl
LEFT JOIN players p ON gl.player_id = p.player_id
WHERE p.player_id IS NULL;

-- Check for orphaned game logs (invalid game)
SELECT COUNT(*) AS orphaned_logs
FROM game_logs gl
LEFT JOIN games g ON gl.game_id = g.game_id
WHERE g.game_id IS NULL;

-- Verify unique constraints on stat tables
SELECT player_id, game_id, COUNT(*) AS duplicate_count
FROM passing_stats
GROUP BY player_id, game_id
HAVING COUNT(*) > 1;

-- ============================================================================
-- SECTION 7: DATABASE MAINTENANCE QUERIES
-- ============================================================================

-- Get table sizes and row counts
SELECT
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'nfl_stats'
ORDER BY (data_length + index_length) DESC;

-- Check index usage
SELECT
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'nfl_stats'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Analyze table for optimization
ANALYZE TABLE teams, players, games, game_logs, passing_stats,
              rushing_stats, receiving_stats, defense_stats,
              kicking_stats, punting_stats;

-- ============================================================================
-- SECTION 8: SAMPLE PARAMETERIZED QUERIES (FOR API ENDPOINTS)
-- ============================================================================

-- These queries use ? placeholders for parameters (Python/Flask style)
-- Actual implementation varies by programming language

-- Get top players by position (parameterized)
-- Parameters: position, season, limit
/*
SELECT
    p.player_id,
    p.player_name,
    p.position,
    p.team,
    SUM(gl.fantasy_points_ppr) AS total_points,
    COUNT(gl.week) AS games_played,
    ROUND(AVG(gl.fantasy_points_ppr), 2) AS avg_points
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
WHERE p.position = ?
  AND gl.season = ?
GROUP BY p.player_id, p.player_name, p.position, p.team
ORDER BY total_points DESC
LIMIT ?;
*/

-- Get games for specific team and week (parameterized)
-- Parameters: team, season, week
/*
SELECT
    g.game_id,
    g.week,
    g.home_team,
    g.away_team,
    g.home_score,
    g.away_score,
    g.gameday,
    g.stadium
FROM games g
WHERE (g.home_team = ? OR g.away_team = ?)
  AND g.season = ?
  AND g.week = ?
ORDER BY g.gameday;
*/

-- ============================================================================
-- END OF SQL DOCUMENTATION
-- ============================================================================

-- Summary:
-- - 10 normalized tables (teams, players, games, and 7 stat tables)
-- - All tables in at least 2NF, most in 3NF
-- - Foreign key constraints maintain referential integrity
-- - Indexes on commonly queried columns for performance
-- - 5+ complex queries demonstrating:
--   * Multi-table JOINs (3-4 tables)
--   * Nested subqueries
--   * GROUP BY with aggregate functions
--   * Window functions for advanced analytics
--   * Statistical analysis (AVG, MIN, MAX, STDDEV)
-- - CRUD operations for all entities
-- - Data integrity verification queries
-- - Database maintenance utilities
-- ============================================================================
