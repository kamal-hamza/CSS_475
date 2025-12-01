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


class Game(db.Model):
    __tablename__ = "games"
    game_id = db.Column(db.String(50), primary_key=True)
    season = db.Column(db.Integer)
    week = db.Column(db.Integer)
    game_type = db.Column(db.String(10))
    away_team = db.Column(db.String(10), db.ForeignKey("teams.team_abbr"))
    home_team = db.Column(db.String(10), db.ForeignKey("teams.team_abbr"))
    away_score = db.Column(db.Integer)
    home_score = db.Column(db.Integer)
    gameday = db.Column(db.Date)
    weekday = db.Column(db.String(10))
    gametime = db.Column(db.String(20))
    result = db.Column(db.Integer)
    total = db.Column(db.Integer)
    overtime = db.Column(db.Integer)
    stadium = db.Column(db.String(100))
    location = db.Column(db.String(100))
    roof = db.Column(db.String(20))
    surface = db.Column(db.String(20))
    temp = db.Column(db.Integer)
    wind = db.Column(db.Integer)


# --- STAT TABLES (Decoupled Siblings) ---
# Each table links directly to Player and Game.


class GameLog(db.Model):
    """General summary stats (fantasy points, opponent, etc)"""

    __tablename__ = "game_logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games.game_id"), nullable=False)
    season = db.Column(db.Integer)
    week = db.Column(db.Integer)
    team = db.Column(db.String(10))
    opponent = db.Column(db.String(10))
    fantasy_points = db.Column(db.Float)
    fantasy_points_ppr = db.Column(db.Float)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_gl_uc"),)


class PassingStats(db.Model):
    __tablename__ = "passing_stats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player_id = db.Column(
        db.String(50), db.ForeignKey("players.player_id"), nullable=False
    )
    game_id = db.Column(db.String(50), db.ForeignKey("games.game_id"), nullable=False)

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
    game_id = db.Column(db.String(50), db.ForeignKey("games.game_id"), nullable=False)

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
    game_id = db.Column(db.String(50), db.ForeignKey("games.game_id"), nullable=False)

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
    game_id = db.Column(db.String(50), db.ForeignKey("games.game_id"), nullable=False)

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
    game_id = db.Column(db.String(50), db.ForeignKey("games.game_id"), nullable=False)

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
    game_id = db.Column(db.String(50), db.ForeignKey("games.game_id"), nullable=False)

    punts = db.Column(db.Integer)
    punt_yards = db.Column(db.Integer)
    punt_net_yards = db.Column(db.Integer)
    punt_long = db.Column(db.Integer)
    punt_inside_20 = db.Column(db.Integer)
    punt_touchbacks = db.Column(db.Integer)
    punt_blocked = db.Column(db.Integer)

    __table_args__ = (db.UniqueConstraint("player_id", "game_id", name="_punt_uc"),)
