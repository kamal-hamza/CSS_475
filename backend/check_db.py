import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Team, Player, Game, PlayerStats

with app.app_context():
    teams_count = db.session.query(Team).count()
    players_count = db.session.query(Player).count()
    games_count = db.session.query(Game).count()
    stats_count = db.session.query(PlayerStats).count()
    
    print(f"Teams: {teams_count}")
    print(f"Players: {players_count}")
    print(f"Games: {games_count}")
    print(f"PlayerStats: {stats_count}")
    
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
        print(f"\nSample stats:")
        stats = db.session.query(PlayerStats).limit(3).all()
        for stat in stats:
            print(f"  - {stat.player_name} Week {stat.week}: {stat.fantasy_points} pts")
