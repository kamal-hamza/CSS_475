from database import db
from flask import jsonify, request
from models import (
    Coach,
    DefenseStats,
    Game,
    GameLog,
    KickingStats,
    PassingStats,
    Player,
    PuntingStats,
    ReceivingStats,
    Referee,
    RushingStats,
    Stadium,
    Team,
)
from sqlalchemy import desc, func, and_, or_, text, case
from datetime import datetime


def register_routes(app):
    @app.route("/api/teams", methods=["GET"])
    def get_teams():
        """Get all teams"""
        teams = Team.query.all()
        return jsonify(
            [{"team_abbr": t.team_abbr, "team_name": t.team_name} for t in teams]
        )

    @app.route("/api/coaches", methods=["GET"])
    def get_coaches():
        """Get all coaches"""
        coaches = Coach.query.all()
        return jsonify(
            [
                {
                    "coach_id": c.coach_id,
                    "coach_name": c.coach_name,
                }
                for c in coaches
            ]
        )

    @app.route("/api/referees", methods=["GET"])
    def get_referees():
        """Get all referees"""
        referees = Referee.query.all()
        return jsonify(
            [
                {
                    "referee_id": r.referee_id,
                    "referee_name": r.referee_name,
                }
                for r in referees
            ]
        )

    @app.route("/api/stadiums", methods=["GET"])
    def get_stadiums():
        """Get all stadiums"""
        stadiums = Stadium.query.all()
        return jsonify(
            [
                {
                    "stadium_id": s.stadium_id,
                    "stadium_name": s.stadium_name,
                    "location": s.location,
                    "roof": s.roof,
                    "surface": s.surface,
                }
                for s in stadiums
            ]
        )

    @app.route("/api/positions", methods=["GET"])
    def get_positions():
        """Get all unique positions"""
        positions = db.session.query(Player.position).distinct().filter(Player.position.isnot(None)).order_by(Player.position).all()
        return jsonify([p[0] for p in positions])

    @app.route("/api/players", methods=["GET"])
    def get_players():
        """Get players with optional filters"""
        team = request.args.get("team")
        position = request.args.get("position")
        limit = request.args.get("limit", 50, type=int)

        query = Player.query

        if team:
            query = query.filter(Player.team == team)
        if position:
            query = query.filter(Player.position == position)

        players = query.limit(limit).all()

        return jsonify(
            [
                {
                    "player_id": p.player_id,
                    "player_name": p.player_name,
                    "position": p.position,
                    "team": p.team,
                }
                for p in players
            ]
        )

    @app.route("/api/games", methods=["GET"])
    def get_games():
        """Get games with optional filters - includes comprehensive game data"""
        week = request.args.get("week", type=int)
        team = request.args.get("team")
        season = request.args.get("season", 2024, type=int)

        query = Game.query.filter(Game.season == season)

        if week:
            query = query.filter(Game.week == week)
        if team:
            query = query.filter((Game.home_team == team) | (Game.away_team == team))

        games = query.order_by(Game.week, Game.gameday).all()

        return jsonify(
            [
                {
                    # Basic Game Info
                    "game_id": g.game_id,
                    "season": g.season,
                    "week": g.week,
                    "game_type": g.game_type,
                    "gameday": str(g.gameday) if g.gameday else None,
                    "gametime": g.gametime,
                    "overtime": g.overtime,

                    # Teams and Scores
                    "home_team": g.home_team,
                    "away_team": g.away_team,
                    "home_score": g.home_score,
                    "away_score": g.away_score,

                    # Starting QBs
                    "away_qb_id": g.away_qb_id,
                    "away_qb_name": g.away_qb.player_name if g.away_qb else None,
                    "home_qb_id": g.home_qb_id,
                    "home_qb_name": g.home_qb.player_name if g.home_qb else None,

                    # Coaches
                    "away_coach_id": g.away_coach_id,
                    "away_coach_name": g.away_coach.coach_name if g.away_coach else None,
                    "home_coach_id": g.home_coach_id,
                    "home_coach_name": g.home_coach.coach_name if g.home_coach else None,

                    # Referee
                    "referee_id": g.referee_id,
                    "referee_name": g.referee.referee_name if g.referee else None,

                    # Stadium Info
                    "stadium_id": g.stadium_id,
                    "stadium_name": g.stadium.stadium_name if g.stadium else None,
                    "stadium_location": g.stadium.location if g.stadium else None,
                    "stadium_roof": g.stadium.roof if g.stadium else None,
                    "stadium_surface": g.stadium.surface if g.stadium else None,

                    # Weather
                    "temp": g.temp,
                    "wind": g.wind,

                    # Game Context
                    "away_rest": g.away_rest,
                    "home_rest": g.home_rest,
                    "div_game": g.div_game,

                    # Betting Data
                    "spread_line": float(g.spread_line) if g.spread_line else None,
                    "total_line": float(g.total_line) if g.total_line else None,
                    "away_moneyline": g.away_moneyline,
                    "home_moneyline": g.home_moneyline,
                    "away_spread_odds": g.away_spread_odds,
                    "home_spread_odds": g.home_spread_odds,
                    "over_odds": g.over_odds,
                    "under_odds": g.under_odds,

                    # External IDs
                    "espn": g.espn,
                    "pfr": g.pfr,
                    "pff": g.pff,
                }
                for g in games
            ]
        )

    @app.route("/api/stats/player/<player_id>", methods=["GET"])
    def get_player_stats(player_id):
        """Get stats for a specific player (Joined manually)"""
        season = request.args.get("season", 2024, type=int)

        # Fetch Logs with JOIN to get season/week/team/opponent
        logs = (
            db.session.query(
                GameLog,
                Game.season,
                Game.week,
                Game.home_team,
                Game.away_team,
            )
            .join(Game, GameLog.game_id == Game.game_id)
            .filter(GameLog.player_id == player_id, Game.season == season)
            .order_by(Game.week)
            .all()
        )

        # Fetch detailed stats separately
        pass_stats = PassingStats.query.filter(
            PassingStats.player_id == player_id
        ).all()
        rush_stats = RushingStats.query.filter(
            RushingStats.player_id == player_id
        ).all()
        rec_stats = ReceivingStats.query.filter(
            ReceivingStats.player_id == player_id
        ).all()

        # Index by game_id for fast lookup
        p_map = {s.game_id: s for s in pass_stats}
        r_map = {s.game_id: s for s in rush_stats}
        rec_map = {s.game_id: s for s in rec_stats}

        result = []
        for log, season, week, home_team, away_team in logs:
            gid = log.game_id
            p = p_map.get(gid)
            r = r_map.get(gid)
            rec = rec_map.get(gid)

            # Determine player's team and opponent from Player table
            player = Player.query.get(log.player_id)
            team = player.team if player else None
            opponent = away_team if team == home_team else home_team

            # Calculate PPR (fantasy_points + receptions)
            receptions = rec.receptions if rec else 0
            targets = rec.targets if rec else 0
            interceptions = p.interceptions if p else 0
            fantasy_points_ppr = (log.fantasy_points or 0) + receptions

            result.append(
                {
                    "week": week,
                    "opponent": opponent,
                    "passing_yards": p.passing_yards if p else 0,
                    "passing_tds": p.passing_tds if p else 0,
                    "interceptions": interceptions,
                    "rushing_yards": r.rushing_yards if r else 0,
                    "rushing_tds": r.rushing_tds if r else 0,
                    "receptions": receptions,
                    "receiving_yards": rec.receiving_yards if rec else 0,
                    "receiving_tds": rec.receiving_tds if rec else 0,
                    "targets": targets,
                    "fantasy_points": log.fantasy_points,
                    "fantasy_points_ppr": fantasy_points_ppr,
                }
            )

        return jsonify(result)

    @app.route("/api/stats/top-players", methods=["GET"])
    def get_top_players():
        """Get top fantasy performers"""
        position = request.args.get("position")
        season = request.args.get("season", 2024, type=int)
        limit = request.args.get("limit", 20, type=int)
        scoring = request.args.get("scoring", "ppr")

        # For PPR, we need to add receptions to fantasy_points
        if scoring == "ppr":
            # Sum fantasy_points + receptions (from receiving_stats)
            query = (
                db.session.query(
                    GameLog.player_id,
                    Player.player_name,
                    Player.position,
                    Player.team,
                    (func.sum(GameLog.fantasy_points) + func.coalesce(func.sum(ReceivingStats.receptions), 0)).label("total_points"),
                    func.count(GameLog.id).label("games_played"),
                )
                .join(Player, GameLog.player_id == Player.player_id)
                .join(Game, GameLog.game_id == Game.game_id)
                .outerjoin(ReceivingStats, and_(
                    GameLog.player_id == ReceivingStats.player_id,
                    GameLog.game_id == ReceivingStats.game_id
                ))
                .filter(Game.season == season)
                .group_by(
                    GameLog.player_id, Player.player_name, Player.position, Player.team
                )
            )
        else:
            query = (
                db.session.query(
                    GameLog.player_id,
                    Player.player_name,
                    Player.position,
                    Player.team,
                    func.sum(GameLog.fantasy_points).label("total_points"),
                    func.count(GameLog.id).label("games_played"),
                )
                .join(Player, GameLog.player_id == Player.player_id)
                .join(Game, GameLog.game_id == Game.game_id)
                .filter(Game.season == season)
                .group_by(
                    GameLog.player_id, Player.player_name, Player.position, Player.team
                )
            )

        if position:
            query = query.filter(Player.position == position)

        top_players = query.order_by(desc("total_points")).limit(limit).all()

        return jsonify(
            [
                {
                    "player_id": p.player_id,
                    "player_name": p.player_name,
                    "position": p.position,
                    "team": p.team,
                    "total_points": float(p.total_points) if p.total_points else 0,
                    "games_played": p.games_played,
                    "avg_points": round(float(p.total_points) / p.games_played, 2)
                    if p.games_played > 0 and p.total_points
                    else 0,
                }
                for p in top_players
            ]
        )

    @app.route("/api/stats/week/<int:week>", methods=["GET"])
    def get_week_stats(week):
        """Get top performers for a specific week"""
        season = request.args.get("season", 2024, type=int)
        position = request.args.get("position")
        limit = request.args.get("limit", 20, type=int)

        # 1. Get Top Logs with JOIN to get season/week
        query = (
            db.session.query(
                GameLog,
                Player,
                Game.season,
                Game.week,
                Game.home_team,
                Game.away_team,
                ReceivingStats.receptions
            )
            .join(Player, GameLog.player_id == Player.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .outerjoin(ReceivingStats, and_(
                GameLog.player_id == ReceivingStats.player_id,
                GameLog.game_id == ReceivingStats.game_id
            ))
            .filter(Game.season == season, Game.week == week)
        )

        if position:
            query = query.filter(Player.position == position)

        # Order by fantasy_points + receptions (PPR)
        results = query.order_by(desc(GameLog.fantasy_points + func.coalesce(ReceivingStats.receptions, 0))).limit(limit).all()

        output = []
        for log, player, g_season, g_week, home_team, away_team, receptions in results:
            p_stat = PassingStats.query.filter_by(
                player_id=log.player_id, game_id=log.game_id
            ).first()
            r_stat = RushingStats.query.filter_by(
                player_id=log.player_id, game_id=log.game_id
            ).first()
            rec_stat = ReceivingStats.query.filter_by(
                player_id=log.player_id, game_id=log.game_id
            ).first()

            # Determine team from player
            team = player.team
            opponent = away_team if team == home_team else home_team
            fantasy_points_ppr = (log.fantasy_points or 0) + (receptions or 0)

            output.append(
                {
                    "player_id": log.player_id,
                    "player_name": player.player_name,
                    "position": player.position,
                    "team": team,
                    "passing_yards": p_stat.passing_yards if p_stat else 0,
                    "passing_tds": p_stat.passing_tds if p_stat else 0,
                    "rushing_yards": r_stat.rushing_yards if r_stat else 0,
                    "rushing_tds": r_stat.rushing_tds if r_stat else 0,
                    "receiving_yards": rec_stat.receiving_yards if rec_stat else 0,
                    "receiving_tds": rec_stat.receiving_tds if rec_stat else 0,
                    "receptions": rec_stat.receptions if rec_stat else 0,
                    "fantasy_points": log.fantasy_points,
                    "fantasy_points_ppr": fantasy_points_ppr,
                }
            )

        return jsonify(output)

    @app.route("/api/search", methods=["GET"])
    def search_players():
        """Search players by name or position"""
        query = request.args.get("q", "")
        position = request.args.get("position", "")

        if not query or len(query) < 2:
            return jsonify([])

        # Build query with filters
        search_query = Player.query.filter(
            Player.player_name.ilike(f"%{query}%")
        )

        # Add position filter if provided
        if position:
            search_query = search_query.filter(Player.position == position)

        # Order by name similarity (exact matches first, then starts with, then contains)
        # SQLite/MySQL compatible ordering
        players = (
            search_query
            .order_by(
                db.case(
                    (Player.player_name.ilike(query), 1),
                    (Player.player_name.ilike(f"{query}%"), 2),
                    else_=3
                ),
                Player.player_name
            )
            .limit(20)
            .all()
        )

        return jsonify(
            [
                {
                    "player_id": p.player_id,
                    "player_name": p.player_name,
                    "position": p.position,
                    "team": p.team,
                }
                for p in players
            ]
        )

    @app.route("/api/players/search", methods=["GET"])
    def search_players_paginated():
        """Paginated player search with advanced filtering and sorting"""
        # Get query parameters
        query = request.args.get("q", "").strip()
        position = request.args.get("position", "")
        team = request.args.get("team", "")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        sort_by = request.args.get("sort_by", "name")  # name, position, team
        sort_order = request.args.get("sort_order", "asc")  # asc, desc

        # Validate per_page limits
        per_page = min(max(per_page, 1), 100)  # Between 1 and 100
        page = max(page, 1)  # At least page 1

        # Build base query
        search_query = Player.query

        # Apply name filter
        if query and len(query) >= 2:
            search_query = search_query.filter(
                Player.player_name.ilike(f"%{query}%")
            )

        # Apply position filter
        if position:
            search_query = search_query.filter(Player.position == position)

        # Apply team filter
        if team:
            search_query = search_query.filter(Player.team == team)

        # Apply sorting
        if sort_by == "name":
            sort_column = Player.player_name
        elif sort_by == "position":
            sort_column = Player.position
        elif sort_by == "team":
            sort_column = Player.team
        else:
            sort_column = Player.player_name

        if sort_order == "desc":
            sort_column = sort_column.desc()

        search_query = search_query.order_by(sort_column)

        # Execute paginated query
        pagination = search_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        # Build response
        return jsonify({
            "players": [
                {
                    "player_id": p.player_id,
                    "player_name": p.player_name,
                    "position": p.position,
                    "team": p.team,
                }
                for p in pagination.items
            ],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
                "next_page": pagination.next_num if pagination.has_next else None,
                "prev_page": pagination.prev_num if pagination.has_prev else None,
            },
            "filters": {
                "query": query,
                "position": position,
                "team": team,
                "sort_by": sort_by,
                "sort_order": sort_order,
            }
        })

    @app.route("/api/stats/compare", methods=["GET"])
    def compare_players():
        """Compare stats for multiple players"""
        player_ids = request.args.getlist("player_ids")
        season = request.args.get("season", 2024, type=int)

        if not player_ids:
            return jsonify([])

        results = []
        for pid in player_ids:
            # Fetch all stats for this player/season with JOIN
            logs = (
                db.session.query(GameLog, ReceivingStats.receptions)
                .join(Game, GameLog.game_id == Game.game_id)
                .outerjoin(ReceivingStats, and_(
                    GameLog.player_id == ReceivingStats.player_id,
                    GameLog.game_id == ReceivingStats.game_id
                ))
                .filter(GameLog.player_id == pid, Game.season == season)
                .all()
            )
            pass_stats = PassingStats.query.filter(PassingStats.player_id == pid).all()
            rush_stats = RushingStats.query.filter(RushingStats.player_id == pid).all()
            rec_stats = ReceivingStats.query.filter(
                ReceivingStats.player_id == pid
            ).all()

            player = Player.query.get(pid)

            if player and logs:
                totals = {
                    "passing_yards": sum(
                        s.passing_yards for s in pass_stats if s.passing_yards
                    )
                    or 0,
                    "passing_tds": sum(
                        s.passing_tds for s in pass_stats if s.passing_tds
                    )
                    or 0,
                    "interceptions": sum(
                        s.interceptions for s in pass_stats if s.interceptions
                    )
                    or 0,
                    "rushing_yards": sum(
                        s.rushing_yards for s in rush_stats if s.rushing_yards
                    )
                    or 0,
                    "rushing_tds": sum(
                        s.rushing_tds for s in rush_stats if s.rushing_tds
                    )
                    or 0,
                    "receiving_yards": sum(
                        s.receiving_yards for s in rec_stats if s.receiving_yards
                    )
                    or 0,
                    "receiving_tds": sum(
                        s.receiving_tds for s in rec_stats if s.receiving_tds
                    )
                    or 0,
                    "receptions": sum(s.receptions for s in rec_stats if s.receptions)
                    or 0,
                    "total_points": sum(
                        ((log.fantasy_points or 0) + (rec or 0)) for log, rec in logs
                    )
                    or 0,
                    "games_played": len(logs),
                }

                results.append(
                    {
                        "player_id": player.player_id,
                        "player_name": player.player_name,
                        "position": player.position,
                        "team": player.team,
                        "stats": {
                            **totals,
                            "avg_points": round(
                                totals["total_points"] / totals["games_played"], 2
                            )
                            if totals["games_played"] > 0
                            else 0,
                        },
                    }
                )

        return jsonify(results)

    @app.route("/api/teams/stats", methods=["GET"])
    def get_team_stats():
        """Get aggregated team stats"""
        season = request.args.get("season", 2024, type=int)

        # Use raw SQL for clearer queries
        from sqlalchemy import text

        # Get all teams first
        teams_query = text("""
            SELECT DISTINCT team
            FROM players
            WHERE team IS NOT NULL
        """)
        teams = db.session.execute(teams_query).fetchall()

        team_data = {}

        # Initialize team data
        for (team,) in teams:
            team_data[team] = {
                "team": team,
                "total_fantasy_points": 0,
                "pass_yards": 0,
                "pass_tds": 0,
                "rush_yards": 0,
                "rush_tds": 0,
            }

        # Aggregate Fantasy Points
        fp_query = text("""
            SELECT
                p.team,
                SUM(gl.fantasy_points + COALESCE(rs.receptions, 0)) as total_fp
            FROM game_logs_3nf gl
            JOIN players p ON gl.player_id = p.player_id
            JOIN games_3nf g ON gl.game_id = g.game_id
            LEFT JOIN receiving_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
            WHERE g.season = :season AND p.team IS NOT NULL
            GROUP BY p.team
        """)
        fp_results = db.session.execute(fp_query, {"season": season}).fetchall()

        for team, fp in fp_results:
            if team in team_data:
                team_data[team]["total_fantasy_points"] = float(fp) if fp else 0

        # Aggregate Passing Stats
        pass_query = text("""
            SELECT
                p.team,
                SUM(ps.passing_yards) as pass_yards,
                SUM(ps.passing_tds) as pass_tds
            FROM passing_stats ps
            JOIN players p ON ps.player_id = p.player_id
            JOIN games_3nf g ON ps.game_id = g.game_id
            WHERE g.season = :season AND p.team IS NOT NULL
            GROUP BY p.team
        """)
        pass_results = db.session.execute(pass_query, {"season": season}).fetchall()

        for team, yds, tds in pass_results:
            if team in team_data:
                team_data[team]["pass_yards"] = float(yds) if yds else 0
                team_data[team]["pass_tds"] = float(tds) if tds else 0

        # Aggregate Rushing Stats
        rush_query = text("""
            SELECT
                p.team,
                SUM(rs.rushing_yards) as rush_yards,
                SUM(rs.rushing_tds) as rush_tds
            FROM rushing_stats rs
            JOIN players p ON rs.player_id = p.player_id
            JOIN games_3nf g ON rs.game_id = g.game_id
            WHERE g.season = :season AND p.team IS NOT NULL
            GROUP BY p.team
        """)
        rush_results = db.session.execute(rush_query, {"season": season}).fetchall()

        for team, yds, tds in rush_results:
            if team in team_data:
                team_data[team]["rush_yards"] = float(yds) if yds else 0
                team_data[team]["rush_tds"] = float(tds) if tds else 0

        return jsonify(list(team_data.values()))

    # ==================== CRUD OPERATIONS ====================

    @app.route("/api/players", methods=["POST"])
    def create_player():
        """Create a new player"""
        data = request.json
        try:
            player = Player(
                player_id=data["player_id"],
                player_name=data["player_name"],
                position=data.get("position"),
                team=data.get("team"),
            )
            db.session.add(player)
            db.session.commit()
            return (
                jsonify(
                    {
                        "message": "Player created successfully",
                        "player_id": player.player_id,
                    }
                ),
                201,
            )
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/players/<player_id>", methods=["PUT"])
    def update_player(player_id):
        """Update an existing player"""
        player = Player.query.get_or_404(player_id)
        data = request.json
        try:
            if "player_name" in data:
                player.player_name = data["player_name"]
            if "position" in data:
                player.position = data["position"]
            if "team" in data:
                player.team = data["team"]

            db.session.commit()
            return jsonify({"message": "Player updated successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/players/<player_id>", methods=["DELETE"])
    def delete_player(player_id):
        """Delete a player"""
        player = Player.query.get_or_404(player_id)
        try:
            db.session.delete(player)
            db.session.commit()
            return jsonify({"message": "Player deleted successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/teams", methods=["POST"])
    def create_team():
        """Create a new team"""
        data = request.json
        try:
            team = Team(
                team_abbr=data["team_abbr"],
                team_name=data["team_name"],
                team_conf=data.get("team_conf"),
                team_division=data.get("team_division"),
                team_color=data.get("team_color"),
                team_logo_espn=data.get("team_logo_espn"),
            )
            db.session.add(team)
            db.session.commit()
            return (
                jsonify(
                    {
                        "message": "Team created successfully",
                        "team_abbr": team.team_abbr,
                    }
                ),
                201,
            )
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/teams/<team_abbr>", methods=["PUT"])
    def update_team(team_abbr):
        """Update an existing team"""
        team = Team.query.get_or_404(team_abbr)
        data = request.json
        try:
            if "team_name" in data:
                team.team_name = data["team_name"]
            if "team_conf" in data:
                team.team_conf = data["team_conf"]
            if "team_division" in data:
                team.team_division = data["team_division"]
            if "team_color" in data:
                team.team_color = data["team_color"]
            if "team_logo_espn" in data:
                team.team_logo_espn = data["team_logo_espn"]

            db.session.commit()
            return jsonify({"message": "Team updated successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/teams/<team_abbr>", methods=["DELETE"])
    def delete_team(team_abbr):
        """Delete a team"""
        team = Team.query.get_or_404(team_abbr)
        try:
            db.session.delete(team)
            db.session.commit()
            return jsonify({"message": "Team deleted successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/games", methods=["POST"])
    def create_game():
        """Create a new game"""
        data = request.json
        try:
            # Handle stadium - either get existing or create new
            stadium_id = data.get("stadium_id")
            if not stadium_id and data.get("stadium"):
                # Try to find existing stadium or create new one
                stadium = Stadium.query.filter_by(stadium_name=data["stadium"]).first()
                if not stadium:
                    stadium = Stadium(
                        stadium_name=data["stadium"],
                        location=data.get("location"),
                        roof=data.get("roof"),
                        surface=data.get("surface")
                    )
                    db.session.add(stadium)
                    db.session.flush()  # Get the stadium_id
                stadium_id = stadium.stadium_id

            game = Game(
                game_id=data["game_id"],
                season=data.get("season"),
                week=data.get("week"),
                game_type=data.get("game_type"),
                away_team=data.get("away_team"),
                home_team=data.get("home_team"),
                away_score=data.get("away_score"),
                home_score=data.get("home_score"),
                gameday=datetime.strptime(data["gameday"], "%Y-%m-%d").date()
                if "gameday" in data
                else None,
                gametime=data.get("gametime"),
                stadium_id=stadium_id,
                overtime=data.get("overtime", 0),
                temp=data.get("temp"),
                wind=data.get("wind"),
            )
            db.session.add(game)
            db.session.commit()
            return (
                jsonify(
                    {"message": "Game created successfully", "game_id": game.game_id}
                ),
                201,
            )
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/games/<game_id>", methods=["PUT"])
    def update_game(game_id):
        """Update an existing game"""
        game = Game.query.get_or_404(game_id)
        data = request.json
        try:
            if "away_score" in data:
                game.away_score = data["away_score"]
            if "home_score" in data:
                game.home_score = data["home_score"]
            if "stadium_id" in data:
                game.stadium_id = data["stadium_id"]
            if "temp" in data:
                game.temp = data["temp"]
            if "wind" in data:
                game.wind = data["wind"]

            db.session.commit()
            return jsonify({"message": "Game updated successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @app.route("/api/games/<game_id>", methods=["DELETE"])
    def delete_game(game_id):
        """Delete a game"""
        game = Game.query.get_or_404(game_id)
        try:
            db.session.delete(game)
            db.session.commit()
            return jsonify({"message": "Game deleted successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    # ==================== COMPLEX QUERIES ====================

    @app.route("/api/complex/best-qb-performances", methods=["GET"])
    def get_best_qb_performances():
        """
        COMPLEX QUERY 1: Join 4 tables (Player, GameLog, PassingStats, Game)
        Find top QB performances with complete game context
        Uses JOIN, GROUP BY, aggregate functions
        """
        season = request.args.get("season", 2024, type=int)
        min_yards = request.args.get("min_yards", 250, type=int)
        limit = request.args.get("limit", 20, type=int)

        results = (
            db.session.query(
                Player.player_name,
                Player.position,
                Player.team,
                Game.week,
                Game.home_team,
                Game.away_team,
                PassingStats.passing_yards,
                PassingStats.passing_tds,
                PassingStats.interceptions,
                PassingStats.completions,
                PassingStats.attempts,
                Game.gameday,
                Stadium.stadium_name,
                GameLog.fantasy_points,
                ReceivingStats.receptions,
            )
            .join(GameLog, Player.player_id == GameLog.player_id)
            .join(PassingStats, and_(
                GameLog.player_id == PassingStats.player_id,
                GameLog.game_id == PassingStats.game_id
            ))
            .join(Game, GameLog.game_id == Game.game_id)
            .outerjoin(Stadium, Game.stadium_id == Stadium.stadium_id)
            .outerjoin(ReceivingStats, and_(
                GameLog.player_id == ReceivingStats.player_id,
                GameLog.game_id == ReceivingStats.game_id
            ))
            .filter(
                Game.season == season,
                Player.position == "QB",
                PassingStats.passing_yards >= min_yards,
            )
            .order_by(desc(PassingStats.passing_yards))
            .limit(limit)
            .all()
        )

        return jsonify(
            [
                {
                    "player_name": r.player_name,
                    "position": r.position,
                    "team": r.team,
                    "week": r.week,
                    "opponent": r.away_team if r.team == r.home_team else r.home_team,
                    "passing_yards": float(r.passing_yards) if r.passing_yards else 0,
                    "passing_tds": r.passing_tds,
                    "interceptions": r.interceptions,
                    "completions": r.completions,
                    "attempts": r.attempts,
                    "completion_pct": round(
                        (r.completions / r.attempts * 100), 1
                    )
                    if r.attempts and r.attempts > 0
                    else 0,
                    "gameday": str(r.gameday) if r.gameday else None,
                    "stadium": r.stadium_name,
                    "fantasy_points": float(r.fantasy_points or 0) + (r.receptions or 0),
                }
                for r in results
            ]
        )

    @app.route("/api/complex/multi-threat-players", methods=["GET"])
    def get_multi_threat_players():
        """
        COMPLEX QUERY 2: Join 4 tables (Player, PassingStats, RushingStats, GameLog)
        Find players with both passing and rushing stats (dual-threat QBs)
        Uses nested subquery and aggregate functions
        """
        season = request.args.get("season", 2024, type=int)
        min_rush_yards = request.args.get("min_rush_yards", 50, type=int)

        # Subquery for players with rushing yards above threshold
        rushing_subquery = (
            db.session.query(RushingStats.player_id)
            .join(GameLog, and_(
                RushingStats.player_id == GameLog.player_id,
                RushingStats.game_id == GameLog.game_id
            ))
            .join(Game, GameLog.game_id == Game.game_id)
            .filter(Game.season == season)
            .group_by(RushingStats.player_id)
            .having(func.sum(RushingStats.rushing_yards) >= min_rush_yards)
            .subquery()
        )

        results = (
            db.session.query(
                Player.player_id,
                Player.player_name,
                Player.position,
                Player.team,
                func.sum(PassingStats.passing_yards).label("total_pass_yards"),
                func.sum(PassingStats.passing_tds).label("total_pass_tds"),
                func.sum(RushingStats.rushing_yards).label("total_rush_yards"),
                func.sum(RushingStats.rushing_tds).label("total_rush_tds"),
                func.count(GameLog.id).label("games_played"),
                (func.sum(GameLog.fantasy_points) + func.coalesce(func.sum(ReceivingStats.receptions), 0)).label("total_fantasy_points"),
            )
            .join(GameLog, Player.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .join(PassingStats, and_(
                GameLog.player_id == PassingStats.player_id,
                GameLog.game_id == PassingStats.game_id
            ))
            .join(RushingStats, and_(
                GameLog.player_id == RushingStats.player_id,
                GameLog.game_id == RushingStats.game_id
            ))
            .outerjoin(ReceivingStats, and_(
                GameLog.player_id == ReceivingStats.player_id,
                GameLog.game_id == ReceivingStats.game_id
            ))
            .filter(
                Game.season == season,
                Player.player_id.in_(rushing_subquery)
            )
            .group_by(Player.player_id, Player.player_name, Player.position, Player.team)
            .order_by(desc("total_fantasy_points"))
            .all()
        )

        return jsonify(
            [
                {
                    "player_id": r.player_id,
                    "player_name": r.player_name,
                    "position": r.position,
                    "team": r.team,
                    "total_pass_yards": float(r.total_pass_yards)
                    if r.total_pass_yards
                    else 0,
                    "total_pass_tds": r.total_pass_tds or 0,
                    "total_rush_yards": float(r.total_rush_yards)
                    if r.total_rush_yards
                    else 0,
                    "total_rush_tds": r.total_rush_tds or 0,
                    "games_played": r.games_played,
                    "total_fantasy_points": float(r.total_fantasy_points)
                    if r.total_fantasy_points
                    else 0,
                    "avg_fantasy_points": round(
                        float(r.total_fantasy_points) / r.games_played, 2
                    )
                    if r.games_played > 0 and r.total_fantasy_points
                    else 0,
                }
                for r in results
            ]
        )

    @app.route("/api/complex/team-performance-breakdown", methods=["GET"])
    def get_team_performance_breakdown():
        """
        COMPLEX QUERY 3: Join 5 tables (Team, Game, GameLog, PassingStats, RushingStats)
        Analyze team offensive performance in home vs away games
        Uses CASE statements, multiple JOINs, GROUP BY
        """
        season = request.args.get("season", 2024, type=int)
        team_abbr = request.args.get("team")

        if not team_abbr:
            return jsonify({"error": "team parameter is required"}), 400

        # Home games stats
        home_stats = (
            db.session.query(
                func.count(Game.game_id).label("games"),
                func.avg(Game.home_score).label("avg_score"),
                func.sum(PassingStats.passing_yards).label("total_pass_yards"),
                func.sum(RushingStats.rushing_yards).label("total_rush_yards"),
            )
            .join(GameLog, Game.game_id == GameLog.game_id)
            .join(Player, GameLog.player_id == Player.player_id)
            .outerjoin(PassingStats, and_(
                GameLog.player_id == PassingStats.player_id,
                GameLog.game_id == PassingStats.game_id
            ))
            .outerjoin(RushingStats, and_(
                GameLog.player_id == RushingStats.player_id,
                GameLog.game_id == RushingStats.game_id
            ))
            .filter(
                Game.season == season,
                Game.home_team == team_abbr,
                Player.team == team_abbr
            )
            .first()
        )

        # Away games stats
        away_stats = (
            db.session.query(
                func.count(Game.game_id).label("games"),
                func.avg(Game.away_score).label("avg_score"),
                func.sum(PassingStats.passing_yards).label("total_pass_yards"),
                func.sum(RushingStats.rushing_yards).label("total_rush_yards"),
            )
            .join(GameLog, Game.game_id == GameLog.game_id)
            .join(Player, GameLog.player_id == Player.player_id)
            .outerjoin(PassingStats, and_(
                GameLog.player_id == PassingStats.player_id,
                GameLog.game_id == PassingStats.game_id
            ))
            .outerjoin(RushingStats, and_(
                GameLog.player_id == RushingStats.player_id,
                GameLog.game_id == RushingStats.game_id
            ))
            .filter(
                Game.season == season,
                Game.away_team == team_abbr,
                Player.team == team_abbr
            )
            .first()
        )

        return jsonify(
            {
                "team": team_abbr,
                "season": season,
                "home_performance": {
                    "games": home_stats.games or 0,
                    "avg_score": round(float(home_stats.avg_score), 1)
                    if home_stats.avg_score
                    else 0,
                    "total_pass_yards": float(home_stats.total_pass_yards)
                    if home_stats.total_pass_yards
                    else 0,
                    "total_rush_yards": float(home_stats.total_rush_yards)
                    if home_stats.total_rush_yards
                    else 0,
                },
                "away_performance": {
                    "games": away_stats.games or 0,
                    "avg_score": round(float(away_stats.avg_score), 1)
                    if away_stats.avg_score
                    else 0,
                    "total_pass_yards": float(away_stats.total_pass_yards)
                    if away_stats.total_pass_yards
                    else 0,
                    "total_rush_yards": float(away_stats.total_rush_yards)
                    if away_stats.total_rush_yards
                    else 0,
                },
            }
        )

    @app.route("/api/complex/weekly-leaders", methods=["GET"])
    def get_weekly_leaders():
        """
        COMPLEX QUERY 4: Multiple JOINs with GROUP BY and HAVING
        Find weekly leaders across different stat categories
        """
        season = request.args.get("season", 2024, type=int)
        week = request.args.get("week", type=int)

        if not week:
            return jsonify({"error": "week parameter is required"}), 400

        # Passing leader
        pass_leader = (
            db.session.query(
                Player.player_name,
                Player.team,
                PassingStats.passing_yards,
                PassingStats.passing_tds,
                Game.home_team,
                Game.away_team,
            )
            .join(PassingStats, Player.player_id == PassingStats.player_id)
            .join(GameLog, and_(
                Player.player_id == GameLog.player_id,
                PassingStats.game_id == GameLog.game_id
            ))
            .join(Game, GameLog.game_id == Game.game_id)
            .filter(Game.season == season, Game.week == week)
            .order_by(desc(PassingStats.passing_yards))
            .first()
        )

        # Rushing leader
        rush_leader = (
            db.session.query(
                Player.player_name,
                Player.team,
                RushingStats.rushing_yards,
                RushingStats.rushing_tds,
                Game.home_team,
                Game.away_team,
            )
            .join(RushingStats, Player.player_id == RushingStats.player_id)
            .join(GameLog, and_(
                Player.player_id == GameLog.player_id,
                RushingStats.game_id == GameLog.game_id
            ))
            .join(Game, GameLog.game_id == Game.game_id)
            .filter(Game.season == season, Game.week == week)
            .order_by(desc(RushingStats.rushing_yards))
            .first()
        )

        # Receiving leader
        rec_leader = (
            db.session.query(
                Player.player_name,
                Player.team,
                ReceivingStats.receiving_yards,
                ReceivingStats.receiving_tds,
                ReceivingStats.receptions,
                Game.home_team,
                Game.away_team,
            )
            .join(ReceivingStats, Player.player_id == ReceivingStats.player_id)
            .join(GameLog, and_(
                Player.player_id == GameLog.player_id,
                ReceivingStats.game_id == GameLog.game_id
            ))
            .join(Game, GameLog.game_id == Game.game_id)
            .filter(Game.season == season, Game.week == week)
            .order_by(desc(ReceivingStats.receiving_yards))
            .first()
        )

        return jsonify(
            {
                "week": week,
                "season": season,
                "passing_leader": {
                    "player_name": pass_leader.player_name if pass_leader else None,
                    "team": pass_leader.team if pass_leader else None,
                    "yards": float(pass_leader.passing_yards)
                    if pass_leader and pass_leader.passing_yards
                    else 0,
                    "tds": pass_leader.passing_tds if pass_leader else 0,
                    "opponent": (pass_leader.away_team if pass_leader.team == pass_leader.home_team else pass_leader.home_team) if pass_leader else None,
                }
                if pass_leader
                else None,
                "rushing_leader": {
                    "player_name": rush_leader.player_name if rush_leader else None,
                    "team": rush_leader.team if rush_leader else None,
                    "yards": float(rush_leader.rushing_yards)
                    if rush_leader and rush_leader.rushing_yards
                    else 0,
                    "tds": rush_leader.rushing_tds if rush_leader else 0,
                    "opponent": (rush_leader.away_team if rush_leader.team == rush_leader.home_team else rush_leader.home_team) if rush_leader else None,
                }
                if rush_leader
                else None,
                "receiving_leader": {
                    "player_name": rec_leader.player_name if rec_leader else None,
                    "team": rec_leader.team if rec_leader else None,
                    "yards": float(rec_leader.receiving_yards)
                    if rec_leader and rec_leader.receiving_yards
                    else 0,
                    "receptions": rec_leader.receptions if rec_leader else 0,
                    "tds": rec_leader.receiving_tds if rec_leader else 0,
                    "opponent": (rec_leader.away_team if rec_leader.team == rec_leader.home_team else rec_leader.home_team) if rec_leader else None,
                }
                if rec_leader
                else None,
            }
        )

    @app.route("/api/complex/consistent-performers", methods=["GET"])
    def get_consistent_performers():
        """
        COMPLEX QUERY 5: Nested subquery with statistical analysis
        Find players with consistent fantasy performances (low variance)
        Uses subqueries, HAVING clause, and statistical functions
        """
        season = request.args.get("season", 2024, type=int)
        position = request.args.get("position", "QB")
        min_games = request.args.get("min_games", 3, type=int)

        # Calculate average and standard deviation of fantasy points (PPR = fantasy_points + receptions)
        results = (
            db.session.query(
                Player.player_id,
                Player.player_name,
                Player.position,
                Player.team,
                func.count(GameLog.id).label("games_played"),
                func.avg(GameLog.fantasy_points + func.coalesce(ReceivingStats.receptions, 0)).label("avg_points"),
                func.min(GameLog.fantasy_points + func.coalesce(ReceivingStats.receptions, 0)).label("min_points"),
                func.max(GameLog.fantasy_points + func.coalesce(ReceivingStats.receptions, 0)).label("max_points"),
                func.sum(GameLog.fantasy_points + func.coalesce(ReceivingStats.receptions, 0)).label("total_points"),
            )
            .join(GameLog, Player.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .outerjoin(ReceivingStats, and_(
                GameLog.player_id == ReceivingStats.player_id,
                GameLog.game_id == ReceivingStats.game_id
            ))
            .filter(Game.season == season, Player.position == position)
            .group_by(Player.player_id, Player.player_name, Player.position, Player.team)
            .having(func.count(GameLog.id) >= min_games)
            .order_by(desc("avg_points"))
            .all()
        )

        return jsonify(
            [
                {
                    "player_id": r.player_id,
                    "player_name": r.player_name,
                    "position": r.position,
                    "team": r.team,
                    "games_played": r.games_played,
                    "avg_points": round(float(r.avg_points), 2) if r.avg_points else 0,
                    "min_points": round(float(r.min_points), 2) if r.min_points else 0,
                    "max_points": round(float(r.max_points), 2) if r.max_points else 0,
                    "total_points": round(float(r.total_points), 2)
                    if r.total_points
                    else 0,
                    "point_range": round(
                        float(r.max_points) - float(r.min_points), 2
                    )
                    if r.max_points and r.min_points
                    else 0,
                }
                for r in results
            ]
        )

    @app.route("/api/stats/player-details/<player_id>", methods=["GET"])
    def get_player_details(player_id):
        """Get complete player details including basic info"""
        player = Player.query.get_or_404(player_id)
        return jsonify(
            {
                "player_id": player.player_id,
                "player_name": player.player_name,
                "position": player.position,
                "team": player.team,
            }
        )

    # ========================================
    # Simple Query Demonstration Endpoints
    # ========================================

    @app.route("/api/queries/all-teams", methods=["GET"])
    def query_all_teams():
        """Very simple query: List all NFL teams"""
        results = db.session.query(
            Team.team_abbr,
            Team.team_name,
            Team.team_conf,
            Team.team_division
        ).order_by(Team.team_name).all()

        return jsonify([
            {
                "abbr": r.team_abbr,
                "name": r.team_name,
                "conference": r.team_conf,
                "division": r.team_division
            }
            for r in results
        ])

    @app.route("/api/queries/players-by-team", methods=["GET"])
    def query_players_by_team():
        """Simple query: List players from a specific team"""
        team = request.args.get("team", "KC")

        results = db.session.query(
            Player.player_name,
            Player.position,
            Player.team
        ).filter(
            Player.team == team
        ).order_by(Player.position, Player.player_name).all()

        return jsonify([
            {
                "player_name": r.player_name,
                "position": r.position,
                "team": r.team
            }
            for r in results
        ])

    @app.route("/api/queries/games-by-week", methods=["GET"])
    def query_games_by_week():
        """Simple query: Show all games for a specific week"""
        week = request.args.get("week", 1, type=int)
        season = request.args.get("season", 2024, type=int)

        results = db.session.query(
            Game.game_id,
            Game.home_team,
            Game.away_team,
            Game.home_score,
            Game.away_score,
            Game.week,
            Game.gameday
        ).filter(
            Game.week == week,
            Game.season == season
        ).order_by(Game.gameday).all()

        return jsonify([
            {
                "game_id": r.game_id,
                "home_team": r.home_team,
                "away_team": r.away_team,
                "home_score": r.home_score or 0,
                "away_score": r.away_score or 0,
                "week": r.week,
                "gameday": r.gameday.isoformat() if r.gameday else None
            }
            for r in results
        ])

    @app.route("/api/queries/top-scorers", methods=["GET"])
    def query_top_scorers():
        """Simple query: Top fantasy point scorers for a given week"""
        season = request.args.get("season", 2024, type=int)
        week = request.args.get("week", 1, type=int)
        limit = request.args.get("limit", 10, type=int)

        results = (
            db.session.query(
                Player.player_name,
                Player.position,
                Player.team,
                Game.week,
                case(
                    (Game.home_team == Player.team, Game.away_team),
                    else_=Game.home_team
                ).label("opponent"),
                (GameLog.fantasy_points +
                 func.coalesce(
                     db.session.query(ReceivingStats.receptions)
                     .filter(ReceivingStats.player_id == GameLog.player_id,
                             ReceivingStats.game_id == GameLog.game_id)
                     .scalar_subquery(), 0
                 )).label("fantasy_points_ppr"),
            )
            .join(GameLog, Player.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .filter(Game.season == season, Game.week == week)
            .order_by(desc("fantasy_points_ppr"))
            .limit(limit)
            .all()
        )

        return jsonify(
            [
                {
                    "player_name": r.player_name,
                    "position": r.position,
                    "team": r.team,
                    "week": r.week,
                    "opponent": r.opponent,
                    "fantasy_points": round(float(r.fantasy_points_ppr), 2)
                    if r.fantasy_points_ppr
                    else 0,
                }
                for r in results
            ]
        )

    @app.route("/api/queries/qb-passing-leaders", methods=["GET"])
    def query_qb_passing_leaders():
        """Simple query: QB passing yard leaders with game details"""
        season = request.args.get("season", 2024, type=int)
        min_yards = request.args.get("min_yards", 250, type=int)
        limit = request.args.get("limit", 15, type=int)

        results = (
            db.session.query(
                Player.player_name,
                Player.team,
                Game.week,
                case(
                    (Game.home_team == Player.team, Game.away_team),
                    else_=Game.home_team
                ).label("opponent"),
                PassingStats.passing_yards,
                PassingStats.passing_tds,
                PassingStats.interceptions,
                PassingStats.completions,
                PassingStats.attempts,
            )
            .join(GameLog, Player.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .join(
                PassingStats,
                and_(
                    PassingStats.player_id == Player.player_id,
                    PassingStats.game_id == GameLog.game_id,
                ),
            )
            .filter(
                Game.season == season,
                Player.position == "QB",
                PassingStats.passing_yards >= min_yards,
            )
            .order_by(desc(PassingStats.passing_yards))
            .limit(limit)
            .all()
        )

        return jsonify(
            [
                {
                    "player_name": r.player_name,
                    "team": r.team,
                    "week": r.week,
                    "opponent": r.opponent,
                    "passing_yards": r.passing_yards or 0,
                    "passing_tds": r.passing_tds or 0,
                    "interceptions": r.interceptions or 0,
                    "completions": r.completions or 0,
                    "attempts": r.attempts or 0,
                    "completion_pct": round(
                        (r.completions / r.attempts * 100), 1
                    )
                    if r.attempts and r.completions
                    else 0,
                }
                for r in results
            ]
        )

    @app.route("/api/queries/rushing-leaders", methods=["GET"])
    def query_rushing_leaders():
        """Simple query: Season rushing leaders"""
        season = request.args.get("season", 2024, type=int)
        limit = request.args.get("limit", 20, type=int)

        results = (
            db.session.query(
                Player.player_name,
                Player.position,
                Player.team,
                func.sum(RushingStats.rushing_yards).label("total_yards"),
                func.sum(RushingStats.rushing_tds).label("total_tds"),
                func.sum(RushingStats.carries).label("total_carries"),
                func.count(func.distinct(GameLog.game_id)).label("games_played"),
            )
            .join(GameLog, Player.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .join(
                RushingStats,
                and_(
                    RushingStats.player_id == Player.player_id,
                    RushingStats.game_id == GameLog.game_id,
                ),
            )
            .filter(Game.season == season)
            .group_by(Player.player_id, Player.player_name, Player.position, Player.team)
            .order_by(desc("total_yards"))
            .limit(limit)
            .all()
        )

        return jsonify(
            [
                {
                    "player_name": r.player_name,
                    "position": r.position,
                    "team": r.team,
                    "total_yards": r.total_yards or 0,
                    "total_tds": r.total_tds or 0,
                    "total_carries": r.total_carries or 0,
                    "games_played": r.games_played or 0,
                    "yards_per_game": round(float(r.total_yards) / float(r.games_played), 1)
                    if r.games_played and r.total_yards
                    else 0,
                    "yards_per_carry": round(float(r.total_yards) / float(r.total_carries), 1)
                    if r.total_carries and r.total_yards
                    else 0,
                }
                for r in results
            ]
        )

    @app.route("/api/queries/receiving-leaders", methods=["GET"])
    def query_receiving_leaders():
        """Simple query: Season receiving leaders"""
        season = request.args.get("season", 2024, type=int)
        limit = request.args.get("limit", 20, type=int)

        results = (
            db.session.query(
                Player.player_name,
                Player.position,
                Player.team,
                func.sum(ReceivingStats.receiving_yards).label("total_yards"),
                func.sum(ReceivingStats.receptions).label("total_receptions"),
                func.sum(ReceivingStats.receiving_tds).label("total_tds"),
                func.sum(ReceivingStats.targets).label("total_targets"),
                func.count(func.distinct(GameLog.game_id)).label("games_played"),
            )
            .join(GameLog, Player.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .join(
                ReceivingStats,
                and_(
                    ReceivingStats.player_id == Player.player_id,
                    ReceivingStats.game_id == GameLog.game_id,
                ),
            )
            .filter(Game.season == season)
            .group_by(Player.player_id, Player.player_name, Player.position, Player.team)
            .order_by(desc("total_yards"))
            .limit(limit)
            .all()
        )

        return jsonify(
            [
                {
                    "player_name": r.player_name,
                    "position": r.position,
                    "team": r.team,
                    "total_yards": r.total_yards or 0,
                    "total_receptions": r.total_receptions or 0,
                    "total_tds": r.total_tds or 0,
                    "total_targets": r.total_targets or 0,
                    "games_played": r.games_played or 0,
                    "yards_per_game": round(float(r.total_yards) / float(r.games_played), 1)
                    if r.games_played and r.total_yards
                    else 0,
                    "yards_per_catch": round(float(r.total_yards) / float(r.total_receptions), 1)
                    if r.total_receptions and r.total_yards
                    else 0,
                    "catch_rate": round(float(r.total_receptions) / float(r.total_targets) * 100, 1)
                    if r.total_targets and r.total_receptions
                    else 0,
                }
                for r in results
            ]
        )

    @app.route("/api/queries/team-stats", methods=["GET"])
    def query_team_stats():
        """Aggregate query: Team offensive stats for a season"""
        season = request.args.get("season", 2024, type=int)
        team = request.args.get("team", "KC")

        # Get team passing stats
        pass_stats = (
            db.session.query(
                func.sum(PassingStats.passing_yards).label("total_pass_yards"),
                func.sum(PassingStats.passing_tds).label("total_pass_tds"),
                func.sum(PassingStats.interceptions).label("total_ints"),
            )
            .join(GameLog, PassingStats.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .join(Player, GameLog.player_id == Player.player_id)
            .filter(Game.season == season, Player.team == team)
            .first()
        )

        # Get team rushing stats
        rush_stats = (
            db.session.query(
                func.sum(RushingStats.rushing_yards).label("total_rush_yards"),
                func.sum(RushingStats.rushing_tds).label("total_rush_tds"),
            )
            .join(GameLog, RushingStats.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .join(Player, GameLog.player_id == Player.player_id)
            .filter(Game.season == season, Player.team == team)
            .first()
        )

        # Get team receiving stats
        rec_stats = (
            db.session.query(
                func.sum(ReceivingStats.receiving_yards).label("total_rec_yards"),
                func.sum(ReceivingStats.receiving_tds).label("total_rec_tds"),
                func.sum(ReceivingStats.receptions).label("total_receptions"),
            )
            .join(GameLog, ReceivingStats.player_id == GameLog.player_id)
            .join(Game, GameLog.game_id == Game.game_id)
            .join(Player, GameLog.player_id == Player.player_id)
            .filter(Game.season == season, Player.team == team)
            .first()
        )

        # Get games played
        games = (
            db.session.query(func.count(func.distinct(GameLog.game_id)))
            .join(Game, GameLog.game_id == Game.game_id)
            .join(Player, GameLog.player_id == Player.player_id)
            .filter(Game.season == season, Player.team == team)
            .scalar()
        )

        return jsonify(
            {
                "team": team,
                "season": season,
                "games_played": games or 0,
                "passing": {
                    "total_yards": pass_stats.total_pass_yards or 0,
                    "total_tds": pass_stats.total_pass_tds or 0,
                    "total_ints": pass_stats.total_ints or 0,
                    "yards_per_game": round(float(pass_stats.total_pass_yards) / float(games), 1)
                    if games and pass_stats.total_pass_yards
                    else 0,
                },
                "rushing": {
                    "total_yards": rush_stats.total_rush_yards or 0,
                    "total_tds": rush_stats.total_rush_tds or 0,
                    "yards_per_game": round(float(rush_stats.total_rush_yards) / float(games), 1)
                    if games and rush_stats.total_rush_yards
                    else 0,
                },
                "receiving": {
                    "total_yards": rec_stats.total_rec_yards or 0,
                    "total_tds": rec_stats.total_rec_tds or 0,
                    "total_receptions": rec_stats.total_receptions or 0,
                    "yards_per_game": round(float(rec_stats.total_rec_yards) / float(games), 1)
                    if games and rec_stats.total_rec_yards
                    else 0,
                },
            }
        )

    @app.route("/api/queries/player-game-log", methods=["GET"])
    def query_player_game_log():
        """Simple query: Player's complete game log for a season"""
        player_id = request.args.get("player_id")
        season = request.args.get("season", 2024, type=int)

        if not player_id:
            return jsonify({"error": "player_id is required"}), 400

        player = Player.query.get(player_id)
        if not player:
            return jsonify({"error": "Player not found"}), 404

        results = (
            db.session.query(
                GameLog,
                Game,
                case(
                    (Game.home_team == player.team, Game.away_team),
                    else_=Game.home_team
                ).label("opponent"),
                func.coalesce(
                    db.session.query(ReceivingStats.receptions)
                    .filter(ReceivingStats.player_id == GameLog.player_id,
                            ReceivingStats.game_id == GameLog.game_id)
                    .scalar_subquery(), 0
                ).label("receptions")
            )
            .join(Game, GameLog.game_id == Game.game_id)
            .filter(GameLog.player_id == player_id, Game.season == season)
            .order_by(Game.week)
            .all()
        )

        return jsonify(
            {
                "player": {
                    "player_id": player.player_id,
                    "player_name": player.player_name,
                    "position": player.position,
                    "team": player.team,
                },
                "season": season,
                "games": [
                    {
                        "week": g.week,
                        "opponent": opponent,
                        "fantasy_points": round(float(gl.fantasy_points + receptions), 2)
                        if gl.fantasy_points
                        else 0,
                        "gameday": g.gameday.isoformat() if g.gameday else None,
                        "stadium": g.stadium,
                    }
                    for gl, g, opponent, receptions in results
                ],
            }
        )
