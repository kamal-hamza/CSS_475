import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import nflreadpy as nfl
import pandas as pd
from app import app, db
from models import Team, Player, Game, PlayerStats
from datetime import datetime

SEASON_YEAR = 2024

def safe_int(val):
    """Safely convert to int, handling NaN and None"""
    try:
        if pd.isna(val):
            return None
        return int(val)
    except (ValueError, TypeError):
        return None

def safe_float(val):
    """Safely convert to float, handling NaN and None"""
    try:
        if pd.isna(val):
            return None
        return float(val)
    except (ValueError, TypeError):
        return None

def safe_str(val):
    """Safely convert to string, handling NaN and None"""
    if pd.isna(val):
        return None
    return str(val)

def run_etl():
    with app.app_context():
        db.create_all()
        print("Database tables created.")
        print(f"Starting ETL for Season {SEASON_YEAR}...")
        
        # 1. Load Teams
        print("Fetching Teams from rosters...")
        try:
            rosters_df = nfl.load_rosters(seasons=[SEASON_YEAR])
            if hasattr(rosters_df, 'to_pandas'):
                rosters_df = rosters_df.to_pandas()
            
            # Get existing teams to avoid duplicates
            existing_teams = set(t.team_abbr for t in db.session.query(Team.team_abbr).all())
            
            teams_data = rosters_df[['team']].drop_duplicates()
            new_teams = []
            
            for _, row in teams_data.iterrows():
                team_abbr = safe_str(row['team'])
                if team_abbr and team_abbr not in existing_teams:
                    new_teams.append(Team(team_abbr=team_abbr, team_name=team_abbr))
                    existing_teams.add(team_abbr)
            
            if new_teams:
                db.session.bulk_save_objects(new_teams)
                db.session.commit()
                print(f"Loaded {len(new_teams)} new teams.")
            else:
                print("No new teams to load.")
                
        except Exception as e:
            print(f"Error loading teams: {e}")
            db.session.rollback()

        # 2. Load Games
        print("Fetching Schedule...")
        try:
            schedule_df = nfl.load_schedules(seasons=[SEASON_YEAR])
            if hasattr(schedule_df, 'to_pandas'):
                schedule_df = schedule_df.to_pandas()
            
            # Get existing game IDs
            existing_games = set(g.game_id for g in db.session.query(Game.game_id).all())
            
            print(f"Found {len(schedule_df)} games in schedule.")
            new_games = []
            
            for _, row in schedule_df.iterrows():
                game_id = safe_str(row.get('game_id'))
                if not game_id or game_id in existing_games:
                    continue
                
                # Parse gameday
                gameday = None
                if 'gameday' in row and not pd.isna(row['gameday']):
                    try:
                        gameday = pd.to_datetime(row['gameday']).date()
                    except:
                        pass
                
                new_games.append(Game(
                    game_id=game_id,
                    season=safe_int(row.get('season')),
                    week=safe_int(row.get('week')),
                    game_type=safe_str(row.get('game_type')),
                    away_team=safe_str(row.get('away_team')),
                    home_team=safe_str(row.get('home_team')),
                    away_score=safe_int(row.get('away_score')),
                    home_score=safe_int(row.get('home_score')),
                    gameday=gameday,
                    weekday=safe_str(row.get('weekday')),
                    gametime=safe_str(row.get('gametime')),
                    result=safe_int(row.get('result')),
                    total=safe_int(row.get('total')),
                    overtime=safe_int(row.get('overtime')),
                    stadium=safe_str(row.get('stadium')),
                    location=safe_str(row.get('location')),
                    roof=safe_str(row.get('roof')),
                    surface=safe_str(row.get('surface')),
                    temp=safe_int(row.get('temp')),
                    wind=safe_int(row.get('wind'))
                ))
                existing_games.add(game_id)
            
            if new_games:
                db.session.bulk_save_objects(new_games)
                db.session.commit()
                print(f"Loaded {len(new_games)} new games.")
            else:
                print("No new games to load.")
                
        except Exception as e:
            print(f"Error loading games: {e}")
            db.session.rollback()

        # 3. Load Players from Rosters
        print("Fetching Players from rosters...")
        try:
            rosters_df = nfl.load_rosters(seasons=[SEASON_YEAR])
            if hasattr(rosters_df, 'to_pandas'):
                rosters_df = rosters_df.to_pandas()
            
            # Get existing player IDs (much faster than individual queries)
            existing_players = set(p.player_id for p in db.session.query(Player.player_id).all())
            
            unique_players_df = rosters_df[['gsis_id', 'full_name', 'position', 'team']].drop_duplicates(subset=['gsis_id'])
            
            print(f"Processing {len(unique_players_df)} players from rosters...")
            new_players = []
            
            for _, row in unique_players_df.iterrows():
                player_id = safe_str(row.get('gsis_id'))
                if not player_id or player_id in existing_players:
                    continue
                
                new_players.append(Player(
                    player_id=player_id,
                    player_name=safe_str(row.get('full_name')),
                    position=safe_str(row.get('position')),
                    team=safe_str(row.get('team'))
                ))
                existing_players.add(player_id)
            
            if new_players:
                db.session.bulk_save_objects(new_players)
                db.session.commit()
                print(f"Loaded {len(new_players)} new players from rosters.")
            else:
                print("No new players from rosters.")
                
        except Exception as e:
            print(f"Error loading players from rosters: {e}")
            db.session.rollback()

        # 4. Load Player Stats
        print("Fetching Player Stats...")
        try:
            stats_df = nfl.load_player_stats(seasons=[SEASON_YEAR])
            if hasattr(stats_df, 'to_pandas'):
                stats_df = stats_df.to_pandas()
            
            print(f"Processing {len(stats_df)} stat records...")
            
            # First, ensure all players from stats exist
            unique_players_from_stats = stats_df[['player_id', 'player_name', 'position', 'team']].drop_duplicates(subset=['player_id'])
            print(f"Ensuring {len(unique_players_from_stats)} players from stats exist...")
            
            # Refresh existing players set
            existing_players = set(p.player_id for p in db.session.query(Player.player_id).all())
            new_players_from_stats = []
            
            for _, row in unique_players_from_stats.iterrows():
                player_id = safe_str(row.get('player_id'))
                if not player_id or player_id in existing_players:
                    continue
                
                new_players_from_stats.append(Player(
                    player_id=player_id,
                    player_name=safe_str(row.get('player_name')),
                    position=safe_str(row.get('position')),
                    team=safe_str(row.get('team'))
                ))
                existing_players.add(player_id)
            
            if new_players_from_stats:
                db.session.bulk_save_objects(new_players_from_stats)
                db.session.commit()
                print(f"Added {len(new_players_from_stats)} new players from stats.")
            
            # Get existing stats to avoid duplicates
            existing_stats_query = db.session.query(
                PlayerStats.player_id, 
                PlayerStats.season, 
                PlayerStats.week, 
                PlayerStats.season_type
            ).all()
            existing_stats = set((s.player_id, s.season, s.week, s.season_type) for s in existing_stats_query)
            
            # Now load stats in batches
            batch_size = 1000
            total_new_stats = 0
            
            for i in range(0, len(stats_df), batch_size):
                batch = stats_df.iloc[i:i+batch_size]
                new_stats = []
                
                for _, row in batch.iterrows():
                    player_id = safe_str(row.get('player_id'))
                    season = safe_int(row.get('season'))
                    week = safe_int(row.get('week'))
                    season_type = safe_str(row.get('season_type', 'REG'))
                    
                    if not player_id or not season or week is None:
                        continue
                    
                    # Check if already exists
                    if (player_id, season, week, season_type) in existing_stats:
                        continue
                    
                    new_stats.append(PlayerStats(
                        player_id=player_id,
                        player_name=safe_str(row.get('player_name')),
                        position=safe_str(row.get('position')),
                        recent_team=safe_str(row.get('team')),
                        season=season,
                        week=week,
                        season_type=season_type,
                        # Passing
                        completions=safe_int(row.get('completions')),
                        attempts=safe_int(row.get('attempts')),
                        passing_yards=safe_float(row.get('passing_yards')),
                        passing_tds=safe_int(row.get('passing_tds')),
                        interceptions=safe_int(row.get('passing_interceptions')),
                        sacks=safe_int(row.get('sacks_suffered')),
                        sack_yards=safe_float(row.get('sack_yards_lost')),
                        sack_fumbles=safe_int(row.get('sack_fumbles')),
                        sack_fumbles_lost=safe_int(row.get('sack_fumbles_lost')),
                        passing_air_yards=safe_float(row.get('passing_air_yards')),
                       passing_yards_after_catch=safe_float(row.get('passing_yards_after_catch')),
                        passing_first_downs=safe_int(row.get('passing_first_downs')),
                        passing_epa=safe_float(row.get('passing_epa')),
                        passing_2pt_conversions=safe_int(row.get('passing_2pt_conversions')),
                        # Rushing
                        carries=safe_int(row.get('carries')),
                        rushing_yards=safe_float(row.get('rushing_yards')),
                        rushing_tds=safe_int(row.get('rushing_tds')),
                        rushing_fumbles=safe_int(row.get('rushing_fumbles')),
                        rushing_fumbles_lost=safe_int(row.get('rushing_fumbles_lost')),
                        rushing_first_downs=safe_int(row.get('rushing_first_downs')),
                        rushing_epa=safe_float(row.get('rushing_epa')),
                        rushing_2pt_conversions=safe_int(row.get('rushing_2pt_conversions')),
                        # Receiving
                        receptions=safe_int(row.get('receptions')),
                        targets=safe_int(row.get('targets')),
                        receiving_yards=safe_float(row.get('receiving_yards')),
                        receiving_tds=safe_int(row.get('receiving_tds')),
                        receiving_fumbles=safe_int(row.get('receiving_fumbles')),
                        receiving_fumbles_lost=safe_int(row.get('receiving_fumbles_lost')),
                        receiving_air_yards=safe_float(row.get('receiving_air_yards')),
                        receiving_yards_after_catch=safe_float(row.get('receiving_yards_after_catch')),
                        receiving_first_downs=safe_int(row.get('receiving_first_downs')),
                        receiving_epa=safe_float(row.get('receiving_epa')),
                        receiving_2pt_conversions=safe_int(row.get('receiving_2pt_conversions')),
                        # Fantasy
                        fantasy_points=safe_float(row.get('fantasy_points')),
                        fantasy_points_ppr=safe_float(row.get('fantasy_points_ppr'))
                    ))
                    existing_stats.add((player_id, season, week, season_type))
                
                if new_stats:
                    db.session.bulk_save_objects(new_stats)
                    db.session.commit()
                    total_new_stats += len(new_stats)
                    print(f"Processed {min(i+batch_size, len(stats_df))}/{len(stats_df)} stats... ({total_new_stats} new)")
            
            print(f"Loaded {total_new_stats} total new player stats.")
            
        except Exception as e:
            print(f"Error loading player stats: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()

        print("\n✅ ETL Complete!")
        print(f"Final counts:")
        print(f"  Teams: {db.session.query(Team).count()}")
        print(f"  Players: {db.session.query(Player).count()}")
        print(f"  Games: {db.session.query(Game).count()}")
        print(f"  Player Stats: {db.session.query(PlayerStats).count()}")

if __name__ == '__main__':
    run_etl()
