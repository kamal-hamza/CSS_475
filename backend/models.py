from database import db


class Team(db.Model):
    __tablename__ = "teams"
    team_abbr = db.Column(db.String(10), primary_key=True)
    team_name = db.Column(db.String(100))
    team_conf = db.Column(db.String(10))
    team_division = db.Column(db.String(10))
    team_color = db.Column(db.String(10))
    team_logo_espn = db.Column(db.Text)


class Player(db.Model):
    __tablename__ = "players"
    player_id = db.Column(db.String(50), primary_key=True)
    player_name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(10))
    team = db.Column(db.String(10), db.ForeignKey("teams.team_abbr"))


class Stadium(db.Model):
    """Normalized stadium table (3NF)"""
    __tablename__ = "stadiums"
    stadium_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    stadium_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    roof = db.Column(db.String(20))
    surface = db.Column(db.String(20))


class Coach(db.Model):
    """Normalized coach table (3NF)"""
    __tablename__ = "coaches"
    coach_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    coach_name = db.Column(db.String(100), nullable=False, unique=True)


class Referee(db.Model):
    """Normalized referee table (3NF)"""
    __tablename__ = "referees"
    referee_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    referee_name = db.Column(db.String(100), nullable=False, unique=True)


class Game(db.Model):
    """Normalized games table (3NF) - removed derived fields and stadium denormalization"""
    __tablename__ = "games_3nf"
    game_id = db.Column(db.String(50), primary_key=True)
    season = db.Column(db.Integer, nullable=False)
    week = db.Column(db.Integer, nullable=False)
    game_type = db.Column(db.String(10))
    away_team = db.Column(db.String(10), db.ForeignKey("teams.team_abbr"))
    home_team = db.Column(db.String(10), db.ForeignKey("teams.team_abbr"))
    away_score = db.Column(db.Integer)
    home_score = db.Column(db.Integer)
    gameday = db.Column(db.Date)
    gametime = db.Column(db.String(20))
    overtime = db.Column(db.Integer)
    stadium_id = db.Column(db.Integer, db.ForeignKey("stadiums.stadium_id"))
    temp = db.Column(db.Integer)
    wind = db.Column(db.Integer)

    # QB Information (Foreign Keys to Players)
    away_qb_id = db.Column(db.String(50), db.ForeignKey("players.player_id"))
    home_qb_id = db.Column(db.String(50), db.ForeignKey("players.player_id"))

    # Coach Information (Foreign Keys to Coaches)
    away_coach_id = db.Column(db.Integer, db.ForeignKey("coaches.coach_id"))
    home_coach_id = db.Column(db.Integer, db.ForeignKey("coaches.coach_id"))

    # Referee Information (Foreign Key to Referees)
    referee_id = db.Column(db.Integer, db.ForeignKey("referees.referee_id"))

    # Game Context
    away_rest = db.Column(db.Integer)  # Days of rest for away team
    home_rest = db.Column(db.Integer)  # Days of rest for home team
    div_game = db.Column(db.Integer)   # Division game flag (0 or 1)

    # Betting Data
    spread_line = db.Column(db.Float)
    total_line = db.Column(db.Float)
    away_moneyline = db.Column(db.Integer)
    home_moneyline = db.Column(db.Integer)
    away_spread_odds = db.Column(db.Integer)
    home_spread_odds = db.Column(db.Integer)
    over_odds = db.Column(db.Integer)
    under_odds = db.Column(db.Integer)

    # External IDs for linking to other platforms
    espn = db.Column(db.String(50))
    pfr = db.Column(db.String(50))
    pff = db.Column(db.String(50))

    # Relationships
    stadium = db.relationship("Stadium", backref="games")
    away_qb = db.relationship("Player", foreign_keys=[away_qb_id], backref="away_games")
    home_qb = db.relationship("Player", foreign_keys=[home_qb_id], backref="home_games")
    away_coach = db.relationship("Coach", foreign_keys=[away_coach_id], backref="away_games")
    home_coach = db.relationship("Coach", foreign_keys=[home_coach_id], backref="home_games")
    referee = db.relationship("Referee", backref="games")


# --- STAT TABLES (Decoupled Siblings) ---
# Each table links directly to Player and Game.


class GameLog(db.Model):
    """Normalized game logs table (3NF) - removed redundant fields (season, week, team, opponent, fantasy_points_ppr)"""

    __tablename__ = "game_logs_3nf"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=True
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games_3nf.game_id"), nullable=True)
    fantasy_points = db.Column(db.Float)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_gl_3nf_uc"),)


class PassingStats(db.Model):
    __tablename__ = "passing_stats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games_3nf.game_id"), nullable=False)

    completions = db.Column(db.Integer)
    attempts = db.Column(db.Integer)
    passing_yards = db.Column(db.Float)
    passing_tds = db.Column(db.Integer)
    interceptions = db.Column(db.Integer)
    sacks = db.Column(db.Integer)
    sack_yards = db.Column(db.Float)
    sack_fumbles = db.Column(db.Integer)
    sack_fumbles_lost = db.Column(db.Integer)
    passing_air_yards = db.Column(db.Float)
    passing_yards_after_catch = db.Column(db.Float)
    passing_first_downs = db.Column(db.Integer)
    passing_epa = db.Column(db.Float)
    passing_2pt_conversions = db.Column(db.Integer)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_pass_uc"),)


class RushingStats(db.Model):
    __tablename__ = "rushing_stats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games_3nf.game_id"), nullable=False)

    carries = db.Column(db.Integer)
    rushing_yards = db.Column(db.Float)
    rushing_tds = db.Column(db.Integer)
    rushing_fumbles = db.Column(db.Integer)
    rushing_fumbles_lost = db.Column(db.Integer)
    rushing_first_downs = db.Column(db.Integer)
    rushing_epa = db.Column(db.Float)
    rushing_2pt_conversions = db.Column(db.Integer)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_rush_uc"),)


class ReceivingStats(db.Model):
    __tablename__ = "receiving_stats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games_3nf.game_id"), nullable=False)

    receptions = db.Column(db.Integer)
    targets = db.Column(db.Integer)
    receiving_yards = db.Column(db.Float)
    receiving_tds = db.Column(db.Integer)
    receiving_fumbles = db.Column(db.Integer)
    receiving_fumbles_lost = db.Column(db.Integer)
    receiving_air_yards = db.Column(db.Float)
    receiving_yards_after_catch = db.Column(db.Float)
    receiving_first_downs = db.Column(db.Integer)
    receiving_epa = db.Column(db.Float)
    receiving_2pt_conversions = db.Column(db.Integer)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_rec_uc"),)


class DefenseStats(db.Model):
    __tablename__ = "defense_stats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games_3nf.game_id"), nullable=False)

    tackles_solo = db.Column(db.Float)
    tackles_assists = db.Column(db.Float)
    tackles_for_loss = db.Column(db.Float)
    qb_hits = db.Column(db.Integer)
    sacks = db.Column(db.Float)
    fumbles_forced = db.Column(db.Integer)
    fumbles_recovered = db.Column(db.Integer)
    fumbles_lost = db.Column(db.Integer)
    interceptions = db.Column(db.Integer)
    pass_defended = db.Column(db.Integer)
    tds = db.Column(db.Integer)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_def_uc"),)


class KickingStats(db.Model):
    __tablename__ = "kicking_stats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games_3nf.game_id"), nullable=False)

    fg_made = db.Column(db.Integer)
    fg_missed = db.Column(db.Integer)
    fg_blocked = db.Column(db.Integer)
    fg_long = db.Column(db.Integer)
    pat_made = db.Column(db.Integer)
    pat_missed = db.Column(db.Integer)
    pat_blocked = db.Column(db.Integer)
    pat_total = db.Column(db.Integer)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_kick_uc"),)


class PuntingStats(db.Model):
    __tablename__ = "punting_stats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games_3nf.game_id"), nullable=False)

    punts = db.Column(db.Integer)
    punt_yards = db.Column(db.Integer)
    punt_net_yards = db.Column(db.Integer)
    punt_long = db.Column(db.Integer)
    punt_inside_20 = db.Column(db.Integer)
    punt_touchbacks = db.Column(db.Integer)
    punt_blocked = db.Column(db.Integer)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_punt_uc"),)
