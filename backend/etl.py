import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import nflreadpy as nfl
import numpy as np
import pandas as pd
from app import app
from database import db
from models import (
    DefenseStats,
    Game,
    GameLog,
    KickingStats,
    PassingStats,
    Player,
    PuntingStats,
    ReceivingStats,
    RushingStats,
    Team,
)
from sqlalchemy import text


def safe_map(df):
    """Replaces NaN with None for database compatibility"""
    # Replace Infinity with None too just in case
    return df.replace([np.inf, -np.inf, np.nan], None)


def ensure_pandas(df):
    try:
        return df.to_pandas()
    except AttributeError:
        return df


def bulk_insert_from_df(model, df):
    """Helper to bulk insert a dataframe into a SQLAlchemy model"""
    if df.empty:
        # print(f"  [WARN] DataFrame for {model.__tablename__} is empty. Skipping insert.")
        return 0

    # print(f"  [INFO] Inserting {len(df)} records into {model.__tablename__}...")
    data = df.to_dict("records")
    chunk_size = 5000
    total_inserted = 0

    for i in range(0, len(data), chunk_size):
        chunk = data[i : i + chunk_size]
        try:
            db.session.bulk_insert_mappings(model, chunk)
            db.session.commit()
            total_inserted += len(chunk)
            # print(f"    - Chunk {i//chunk_size + 1}: Committed {len(chunk)} rows.")
        except Exception as e:
            db.session.rollback()
            print(f"    [ERROR] Error inserting chunk into {model.__tablename__}: {e}")

    return total_inserted


def prepare_teams(df):
    cols = {
        "team_abbr": "team_abbr",
        "team_name": "team_name",
        "team_conf": "team_conf",
        "team_division": "team_division",
        "team_color": "team_color",
        "team_logo_espn": "team_logo_espn",
    }
    return df[cols.keys()].rename(columns=cols).drop_duplicates(subset=["team_abbr"])


def prepare_games(df):
    cols = {
        "game_id": "game_id",
        "season": "season",
        "week": "week",
        "game_type": "game_type",
        "home_team": "home_team",
        "away_team": "away_team",
        "away_score": "away_score",
        "home_score": "home_score",
        "gameday": "gameday",
        "weekday": "weekday",
        "gametime": "gametime",
        "result": "result",
        "total": "total",
        "overtime": "overtime",
        "stadium": "stadium",
        "location": "location",
        "roof": "roof",
        "surface": "surface",
        "temp": "temp",
        "wind": "wind",
    }
    available_cols = [c for c in cols.keys() if c in df.columns]
    return df[available_cols].rename(columns=cols).drop_duplicates(subset=["game_id"])


def run_etl():
    with app.app_context():
        print("!!! RESETTING DATABASE (Optimized) !!!")

        with db.engine.connect() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
            tables_to_drop = [
                "punting_stats",
                "kicking_stats",
                "defense_stats",
                "receiving_stats",
                "rushing_stats",
                "passing_stats",
                "game_logs",
                "player_game_log",
                "player_stats",
                "games",
                "players",
                "teams",
            ]
            for table in tables_to_drop:
                conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
            conn.commit()

        db.create_all()
        print("Tables created.")

        season_year = 2024

        # 1. LOAD TEAMS
        print("\n--- 1. LOAD TEAMS ---")
        df_teams = ensure_pandas(nfl.load_teams())
        df_teams_clean = prepare_teams(df_teams)
        bulk_insert_from_df(Team, safe_map(df_teams_clean))
        print(f"Inserted {len(df_teams_clean)} teams.")
        valid_teams = set(df_teams_clean["team_abbr"])

        # 2. LOAD GAMES
        print("\n--- 2. LOAD GAMES ---")
        df_games = ensure_pandas(nfl.load_schedules(seasons=[season_year]))
        df_games_clean = prepare_games(df_games)
        df_games_clean = df_games_clean[df_games_clean["home_team"].isin(valid_teams)]
        df_games_clean = df_games_clean[df_games_clean["away_team"].isin(valid_teams)]

        bulk_insert_from_df(Game, safe_map(df_games_clean))
        print(f"Inserted {len(df_games_clean)} games.")

        game_map = {}
        for _, row in df_games_clean.iterrows():
            game_map[(row["week"], row["home_team"])] = row["game_id"]
            game_map[(row["week"], row["away_team"])] = row["game_id"]

        # 3. LOAD PLAYERS (Master)
        print("\n--- 3. LOAD PLAYERS ---")
        df_players = ensure_pandas(nfl.load_players())

        # FIX: The column for team is 'latest_team', NOT 'team' or 'team_abbr'
        cols_to_keep = {
            "gsis_id": "player_id",
            "display_name": "player_name",
            "position": "position",
            "latest_team": "team",  # Correct mapping based on logs
        }

        available_cols = [c for c in cols_to_keep.keys() if c in df_players.columns]
        df_players = df_players[available_cols].rename(columns=cols_to_keep)

        # Ensure all target columns exist
        for target_col in ["player_id", "player_name", "position", "team"]:
            if target_col not in df_players.columns:
                df_players[target_col] = None

        # Filter valid teams (Set invalid teams to None instead of dropping the player)
        df_players.loc[~df_players["team"].isin(valid_teams), "team"] = None

        # Drop dupes and missing IDs
        df_players_clean = df_players.dropna(subset=["player_id"]).drop_duplicates(
            subset=["player_id"]
        )

        bulk_insert_from_df(Player, safe_map(df_players_clean))
        print(f"Inserted {len(df_players_clean)} players.")
        valid_player_ids = set(df_players_clean["player_id"])

        # 4. LOAD STATS
        print("\n--- 4. LOAD STATS ---")
        df_stats = ensure_pandas(nfl.load_player_stats(seasons=[season_year]))

        # 4a. Fix Game IDs in Stats
        def get_game_id(row):
            # Check 'team' then 'recent_team'
            t = row.get("team") or row.get("recent_team")
            return game_map.get((row["week"], t))

        df_stats["game_id"] = df_stats.apply(get_game_id, axis=1)

        # Filter valid stats
        df_stats = df_stats.dropna(subset=["game_id", "player_id"])
        df_stats = df_stats[df_stats["player_id"].isin(valid_player_ids)]
        print(f"Valid stats rows: {len(df_stats)}")

        # 4b. Insert Game Logs
        log_cols = {
            "player_id": "player_id",
            "game_id": "game_id",
            "season": "season",
            "week": "week",
            "team": "team",
            "opponent_team": "opponent",
            "fantasy_points": "fantasy_points",
            "fantasy_points_ppr": "fantasy_points_ppr",
        }
        log_keys = [c for c in log_cols.keys() if c in df_stats.columns]
        df_logs = df_stats[log_keys + ["game_id"]].rename(columns=log_cols)
        bulk_insert_from_df(GameLog, safe_map(df_logs))
        print("Inserted Game Logs.")

        # 4c. Insert Passing Stats
        pass_cols = {
            "player_id": "player_id",
            "game_id": "game_id",
            "completions": "completions",
            "attempts": "attempts",
            "passing_yards": "passing_yards",
            "passing_tds": "passing_tds",
            "passing_interceptions": "interceptions",
            "sacks_suffered": "sacks",
            "sack_yards_lost": "sack_yards",
            "passing_air_yards": "passing_air_yards",
            "passing_yards_after_catch": "passing_yards_after_catch",
            "passing_first_downs": "passing_first_downs",
            "passing_epa": "passing_epa",
            "passing_2pt_conversions": "passing_2pt_conversions",
            "sack_fumbles": "sack_fumbles",
            "sack_fumbles_lost": "sack_fumbles_lost",
        }
        pass_keys = [c for c in pass_cols.keys() if c in df_stats.columns]
        if "attempts" in df_stats.columns:
            df_pass = df_stats[df_stats["attempts"] > 0][
                pass_keys + ["game_id"]
            ].rename(columns=pass_cols)
            df_pass = df_pass.loc[:, ~df_pass.columns.duplicated()]
            inserted = bulk_insert_from_df(PassingStats, safe_map(df_pass))
            print(f"Inserted {inserted} Passing records.")

        # 4d. Insert Rushing Stats
        rush_cols = {
            "player_id": "player_id",
            "game_id": "game_id",
            "carries": "carries",
            "rushing_yards": "rushing_yards",
            "rushing_tds": "rushing_tds",
            "rushing_fumbles": "rushing_fumbles",
            "rushing_fumbles_lost": "rushing_fumbles_lost",
            "rushing_first_downs": "rushing_first_downs",
            "rushing_epa": "rushing_epa",
            "rushing_2pt_conversions": "rushing_2pt_conversions",
        }
        rush_keys = [c for c in rush_cols.keys() if c in df_stats.columns]
        if "carries" in df_stats.columns:
            df_rush = df_stats[df_stats["carries"] > 0][rush_keys + ["game_id"]].rename(
                columns=rush_cols
            )
            df_rush = df_rush.loc[:, ~df_rush.columns.duplicated()]
            inserted = bulk_insert_from_df(RushingStats, safe_map(df_rush))
            print(f"Inserted {inserted} Rushing records.")

        # 4e. Insert Receiving Stats
        rec_cols = {
            "player_id": "player_id",
            "game_id": "game_id",
            "receptions": "receptions",
            "targets": "targets",
            "receiving_yards": "receiving_yards",
            "receiving_tds": "receiving_tds",
            "receiving_fumbles": "receiving_fumbles",
            "receiving_fumbles_lost": "receiving_fumbles_lost",
            "receiving_air_yards": "receiving_air_yards",
            "receiving_yards_after_catch": "receiving_yards_after_catch",
            "receiving_first_downs": "receiving_first_downs",
            "receiving_epa": "receiving_epa",
            "receiving_2pt_conversions": "receiving_2pt_conversions",
        }
        rec_keys = [c for c in rec_cols.keys() if c in df_stats.columns]
        if "targets" in df_stats.columns:
            df_rec = df_stats[df_stats["targets"] > 0][rec_keys + ["game_id"]].rename(
                columns=rec_cols
            )
            df_rec = df_rec.loc[:, ~df_rec.columns.duplicated()]
            inserted = bulk_insert_from_df(ReceivingStats, safe_map(df_rec))
            print(f"Inserted {inserted} Receiving records.")

        # 4f. Insert Defense Stats
        def_cols = {
            "player_id": "player_id",
            "game_id": "game_id",
            "def_tackles_solo": "tackles_solo",
            "def_tackle_assists": "tackles_assists",
            "def_tackles_for_loss": "tackles_for_loss",
            "def_qb_hits": "qb_hits",
            "def_sacks": "sacks",
            "def_fumbles_forced": "fumbles_forced",
            "def_interceptions": "interceptions",
            "def_pass_defended": "pass_defended",
            "def_tds": "tds",
        }
        def_keys = [c for c in def_cols.keys() if c in df_stats.columns]

        # Check for defensive activity
        # If columns missing, we can't filter by them. Assume 0 if missing.
        for c in ["def_tackles_solo", "def_sacks", "def_interceptions"]:
            if c not in df_stats.columns:
                df_stats[c] = 0

        def_mask = (
            (df_stats["def_tackles_solo"] > 0)
            | (df_stats["def_sacks"] > 0)
            | (df_stats["def_interceptions"] > 0)
        )
        df_def = df_stats[def_mask][def_keys + ["game_id"]].rename(columns=def_cols)
        df_def = df_def.loc[:, ~df_def.columns.duplicated()]
        inserted = bulk_insert_from_df(DefenseStats, safe_map(df_def))
        print(f"Inserted {inserted} Defense records.")

        # 4g. Insert Kicking Stats
        kick_cols = {
            "player_id": "player_id",
            "game_id": "game_id",
            "fg_made": "fg_made",
            "fg_missed": "fg_missed",
            "fg_blocked": "fg_blocked",
            "fg_long": "fg_long",
            "pat_made": "pat_made",
            "pat_missed": "pat_missed",
            "pat_blocked": "pat_blocked",
            "pat_att": "pat_total",
        }
        kick_keys = [c for c in kick_cols.keys() if c in df_stats.columns]

        if "fg_att" in df_stats.columns and "pat_att" in df_stats.columns:
            kick_mask = (df_stats["fg_att"] > 0) | (df_stats["pat_att"] > 0)
            df_kick = df_stats[kick_mask][kick_keys + ["game_id"]].rename(
                columns=kick_cols
            )
            df_kick = df_kick.loc[:, ~df_kick.columns.duplicated()]
            inserted = bulk_insert_from_df(KickingStats, safe_map(df_kick))
            print(f"Inserted {inserted} Kicking records.")

        # 4h. Insert Punting Stats - Punting data is MISSING from weekly stats file
        # We can't insert what we don't have.
        print("Skipping Punting Stats (Not available in source dataframe).")

        # 5. UPDATE PLAYER TEAMS
        # Since we loaded players with 'latest_team' from Master list,
        # let's try to update using the most recent stats to be sure.
        print("Updating player teams from recent stats...")
        latest_teams = (
            df_stats.sort_values(["player_id", "week"])
            .groupby("player_id")["team"]
            .last()
            .reset_index()
        )

        # Filter valid teams
        latest_teams = latest_teams[latest_teams["team"].isin(valid_teams)]

        # Perform bulk update via SQL for speed
        # We create a temp table or just iterate? Iterating 2000 players is fine.
        # Faster: Use mappings with bulk_update_mappings if we had a primary key match in session
        # SQL execution is safest here.
        count = 0
        for _, row in latest_teams.iterrows():
            if row["team"]:
                db.session.execute(
                    text(
                        "UPDATE players SET team = :team WHERE player_id = :pid AND (team IS NULL OR team != :team)"
                    ),
                    {"team": row["team"], "pid": row["player_id"]},
                )
                count += 1
        db.session.commit()
        print(f"Updated teams for {count} players.")

        print("ETL Complete!")


if __name__ == "__main__":
    run_etl()
