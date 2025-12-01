import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Game, GameLog, Player, Team

with app.app_context():
    teams_count = db.session.query(Team).count()
    players_count = db.session.query(Player).count()
    games_count = db.session.query(Game).count()
    # Updated to GameLog
    stats_count = db.session.query(GameLog).count()

    print(f"Teams: {teams_count}")
    print(f"Players: {players_count}")
    print(f"Games: {games_count}")
    print(f"GameLogs: {stats_count}")

    if teams_count > 0:
        print("\nSample teams:")
        teams = db.session.query(Team).limit(5).all()
        for team in teams:
            print(f"  - {team.team_abbr}: {team.team_name}")

    if players_count > 0:
        print("\nSample players:")
        players = db.session.query(Player).limit(5).all()
        for player in players:
            print(f"  - {player.player_name} ({player.position}) - {player.team}")

    if stats_count > 0:
        print(f"\nSample Game Logs:")
        logs = db.session.query(GameLog).limit(3).all()
        for log in logs:
            print(f"  - {log.player_id} Week {log.week}: {log.fantasy_points} pts")
