from database import db
from flask import jsonify, request
from models import (
    Game,
    GameLog,
    PassingStats,
    Player,
    ReceivingStats,
    RushingStats,
    Team,
)
from sqlalchemy import desc, func


def register_routes(app):
    @app.route("/api/teams", methods=["GET"])
    def get_teams():
        """Get all teams"""
        teams = Team.query.all()
        return jsonify(
            [{"team_abbr": t.team_abbr, "team_name": t.team_name} for t in teams]
        )

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
        """Get games with optional filters"""
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
                    "game_id": g.game_id,
                    "week": g.week,
                    "home_team": g.home_team,
                    "away_team": g.away_team,
                    "home_score": g.home_score,
                    "away_score": g.away_score,
                    "gameday": str(g.gameday) if g.gameday else None,
                }
                for g in games
            ]
        )

    @app.route("/api/stats/player/<player_id>", methods=["GET"])
    def get_player_stats(player_id):
        """Get stats for a specific player (Joined manually)"""
        season = request.args.get("season", 2024, type=int)

        # Fetch Logs (Summary info)
        logs = (
            GameLog.query.filter_by(player_id=player_id, season=season)
            .order_by(GameLog.week)
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
        for log in logs:
            gid = log.game_id
            p = p_map.get(gid)
            r = r_map.get(gid)
            rec = rec_map.get(gid)

            result.append(
                {
                    "week": log.week,
                    "opponent": log.opponent,
                    "passing_yards": p.passing_yards if p else 0,
                    "passing_tds": p.passing_tds if p else 0,
                    "rushing_yards": r.rushing_yards if r else 0,
                    "rushing_tds": r.rushing_tds if r else 0,
                    "receiving_yards": rec.receiving_yards if rec else 0,
                    "receiving_tds": rec.receiving_tds if rec else 0,
                    "fantasy_points": log.fantasy_points,
                    "fantasy_points_ppr": log.fantasy_points_ppr,
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

        score_field = (
            GameLog.fantasy_points_ppr if scoring == "ppr" else GameLog.fantasy_points
        )

        query = (
            db.session.query(
                GameLog.player_id,
                Player.player_name,
                Player.position,
                Player.team,
                func.sum(score_field).label("total_points"),
                func.count(GameLog.week).label("games_played"),
            )
            .join(Player, GameLog.player_id == Player.player_id)
            .filter(GameLog.season == season)
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

        # 1. Get Top Logs
        query = (
            db.session.query(GameLog, Player)
            .join(Player)
            .filter(GameLog.season == season, GameLog.week == week)
        )

        if position:
            query = query.filter(Player.position == position)

        results = query.order_by(desc(GameLog.fantasy_points_ppr)).limit(limit).all()

        output = []
        for log, player in results:
            p_stat = PassingStats.query.filter_by(
                player_id=log.player_id, game_id=log.game_id
            ).first()
            r_stat = RushingStats.query.filter_by(
                player_id=log.player_id, game_id=log.game_id
            ).first()
            rec_stat = ReceivingStats.query.filter_by(
                player_id=log.player_id, game_id=log.game_id
            ).first()

            output.append(
                {
                    "player_id": log.player_id,
                    "player_name": player.player_name,
                    "position": player.position,
                    "team": log.team,
                    "passing_yards": p_stat.passing_yards if p_stat else 0,
                    "passing_tds": p_stat.passing_tds if p_stat else 0,
                    "rushing_yards": r_stat.rushing_yards if r_stat else 0,
                    "rushing_tds": r_stat.rushing_tds if r_stat else 0,
                    "receiving_yards": rec_stat.receiving_yards if rec_stat else 0,
                    "receiving_tds": rec_stat.receiving_tds if rec_stat else 0,
                    "receptions": rec_stat.receptions if rec_stat else 0,
                    "fantasy_points": log.fantasy_points,
                    "fantasy_points_ppr": log.fantasy_points_ppr,
                }
            )

        return jsonify(output)

    @app.route("/api/search", methods=["GET"])
    def search_players():
        """Search players by name"""
        query = request.args.get("q", "")
        if not query or len(query) < 2:
            return jsonify([])

        players = (
            Player.query.filter(Player.player_name.ilike(f"%{query}%")).limit(10).all()
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

    @app.route("/api/stats/compare", methods=["GET"])
    def compare_players():
        """Compare stats for multiple players"""
        player_ids = request.args.getlist("player_ids")
        season = request.args.get("season", 2024, type=int)

        if not player_ids:
            return jsonify([])

        results = []
        for pid in player_ids:
            # Fetch all stats for this player/season
            logs = GameLog.query.filter_by(player_id=pid, season=season).all()
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
                        l.fantasy_points_ppr for l in logs if l.fantasy_points_ppr
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

        # Aggregate Fantasy Points (on GameLog)
        fp_query = (
            db.session.query(
                GameLog.team,
                func.sum(GameLog.fantasy_points_ppr).label("total_fantasy_points"),
            )
            .filter(GameLog.season == season)
            .group_by(GameLog.team)
            .all()
        )

        # Aggregate Passing
        pass_query = (
            db.session.query(
                GameLog.team,
                func.sum(PassingStats.passing_yards).label("pass_yards"),
                func.sum(PassingStats.passing_tds).label("pass_tds"),
            )
            .join(
                PassingStats,
                (GameLog.player_id == PassingStats.player_id)
                & (GameLog.game_id == PassingStats.game_id),
            )
            .filter(GameLog.season == season)
            .group_by(GameLog.team)
            .all()
        )

        # Aggregate Rushing
        rush_query = (
            db.session.query(
                GameLog.team,
                func.sum(RushingStats.rushing_yards).label("rush_yards"),
                func.sum(RushingStats.rushing_tds).label("rush_tds"),
            )
            .join(
                RushingStats,
                (GameLog.player_id == RushingStats.player_id)
                & (GameLog.game_id == RushingStats.game_id),
            )
            .filter(GameLog.season == season)
            .group_by(GameLog.team)
            .all()
        )

        # Merge results
        team_data = {}

        for t, fp in fp_query:
            if not t:
                continue
            team_data[t] = {
                "team": t,
                "total_fantasy_points": fp or 0,
                "pass_yards": 0,
                "pass_tds": 0,
                "rush_yards": 0,
                "rush_tds": 0,
            }

        for t, yds, tds in pass_query:
            if t in team_data:
                team_data[t]["pass_yards"] = yds or 0
                team_data[t]["pass_tds"] = tds or 0

        for t, yds, tds in rush_query:
            if t in team_data:
                team_data[t]["rush_yards"] = yds or 0
                team_data[t]["rush_tds"] = tds or 0

        return jsonify(list(team_data.values()))
