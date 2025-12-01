from database import db
from sqlalchemy import Integer, String, Float, Text, Date

class Team(db.Model):
    __tablename__ = 'teams'
    team_abbr = db.Column(String(10), primary_key=True)
    team_name = db.Column(String(100))
    team_conf = db.Column(String(10))
    team_division = db.Column(String(10))
    team_color = db.Column(String(10))
    team_logo_espn = db.Column(Text)

class Player(db.Model):
    __tablename__ = 'players'
    player_id = db.Column(String(50), primary_key=True)
    player_name = db.Column(String(100))
    position = db.Column(String(10))
    team = db.Column(String(10), db.ForeignKey('teams.team_abbr'))
    
class Game(db.Model):
    __tablename__ = 'games'
    game_id = db.Column(String(50), primary_key=True)
    season = db.Column(Integer)
    week = db.Column(Integer)
    game_type = db.Column(String(10))
    away_team = db.Column(String(10), db.ForeignKey('teams.team_abbr'))
    home_team = db.Column(String(10), db.ForeignKey('teams.team_abbr'))
    away_score = db.Column(Integer)
    home_score = db.Column(Integer)
    gameday = db.Column(Date)
    weekday = db.Column(String(10))
    gametime = db.Column(String(20))
    result = db.Column(Integer)
    total = db.Column(Integer)
    overtime = db.Column(Integer)
    stadium = db.Column(String(100))
    location = db.Column(String(100))
    roof = db.Column(String(20))
    surface = db.Column(String(20))
    temp = db.Column(Integer)
    wind = db.Column(Integer)

class PlayerStats(db.Model):
    __tablename__ = 'player_stats'
    id = db.Column(Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(String(50), db.ForeignKey('players.player_id'))
    player_name = db.Column(String(100))
    position = db.Column(String(10))
    recent_team = db.Column(String(10))
    season = db.Column(Integer)
    week = db.Column(Integer)
    season_type = db.Column(String(10))
    
    # Passing
    completions = db.Column(Integer)
    attempts = db.Column(Integer)
    passing_yards = db.Column(Float)
    passing_tds = db.Column(Integer)
    interceptions = db.Column(Integer)
    sacks = db.Column(Integer)
    sack_yards = db.Column(Float)
    sack_fumbles = db.Column(Integer)
    sack_fumbles_lost = db.Column(Integer)
    passing_air_yards = db.Column(Float)
    passing_yards_after_catch = db.Column(Float)
    passing_first_downs = db.Column(Integer)
    passing_epa = db.Column(Float)
    passing_2pt_conversions = db.Column(Integer)
    
    # Rushing
    carries = db.Column(Integer)
    rushing_yards = db.Column(Float)
    rushing_tds = db.Column(Integer)
    rushing_fumbles = db.Column(Integer)
    rushing_fumbles_lost = db.Column(Integer)
    rushing_first_downs = db.Column(Integer)
    rushing_epa = db.Column(Float)
    rushing_2pt_conversions = db.Column(Integer)
    
    # Receiving
    receptions = db.Column(Integer)
    targets = db.Column(Integer)
    receiving_yards = db.Column(Float)
    receiving_tds = db.Column(Integer)
    receiving_fumbles = db.Column(Integer)
    receiving_fumbles_lost = db.Column(Integer)
    receiving_air_yards = db.Column(Float)
    receiving_yards_after_catch = db.Column(Float)
    receiving_first_downs = db.Column(Integer)
    receiving_epa = db.Column(Float)
    receiving_2pt_conversions = db.Column(Integer)
    
    # Fantasy
    fantasy_points = db.Column(Float)
    fantasy_points_ppr = db.Column(Float)
    
    __table_args__ = (
        db.UniqueConstraint('player_id', 'season', 'week', 'season_type', name='_player_week_uc'),
    )
