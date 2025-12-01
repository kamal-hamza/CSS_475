from flask import jsonify, request
from models import Team, Player, Game, PlayerStats
from database import db
from sqlalchemy import func, desc

def register_routes(app):
    
    @app.route('/api/teams', methods=['GET'])
    def get_teams():
        """Get all teams"""
        teams = Team.query.all()
        return jsonify([{
            'team_abbr': t.team_abbr,
            'team_name': t.team_name
        } for t in teams])
    
    @app.route('/api/players', methods=['GET'])
    def get_players():
        """Get players with optional filters"""
        team = request.args.get('team')
        position = request.args.get('position')
        limit = request.args.get('limit', 50, type=int)
        
        query = Player.query
        
        if team:
            query = query.filter(Player.team == team)
        if position:
            query = query.filter(Player.position == position)
        
        players = query.limit(limit).all()
        
        return jsonify([{
            'player_id': p.player_id,
            'player_name': p.player_name,
            'position': p.position,
            'team': p.team
        } for p in players])
    
    @app.route('/api/games', methods=['GET'])
    def get_games():
        """Get games with optional filters"""
        week = request.args.get('week', type=int)
        team = request.args.get('team')
        season = request.args.get('season', 2024, type=int)
        
        query = Game.query.filter(Game.season == season)
        
        if week:
            query = query.filter(Game.week == week)
        if team:
            query = query.filter((Game.home_team == team) | (Game.away_team == team))
        
        games = query.order_by(Game.week, Game.gameday).all()
        
        return jsonify([{
            'game_id': g.game_id,
            'week': g.week,
            'home_team': g.home_team,
            'away_team': g.away_team,
            'home_score': g.home_score,
            'away_score': g.away_score,
            'gameday': str(g.gameday) if g.gameday else None
        } for g in games])
    
    @app.route('/api/stats/player/<player_id>', methods=['GET'])
    def get_player_stats(player_id):
        """Get stats for a specific player"""
        season = request.args.get('season', 2024, type=int)
        
        stats = PlayerStats.query.filter_by(
            player_id=player_id,
            season=season
        ).order_by(PlayerStats.week).all()
        
        return jsonify([{
            'week': s.week,
            'opponent': s.recent_team,
            'passing_yards': s.passing_yards,
            'passing_tds': s.passing_tds,
            'rushing_yards': s.rushing_yards,
            'rushing_tds': s.rushing_tds,
            'receiving_yards': s.receiving_yards,
            'receiving_tds': s.receiving_tds,
            'fantasy_points': s.fantasy_points,
            'fantasy_points_ppr': s.fantasy_points_ppr
        } for s in stats])
    
    @app.route('/api/stats/top-players', methods=['GET'])
    def get_top_players():
        """Get top fantasy performers"""
        position = request.args.get('position')
        season = request.args.get('season', 2024, type=int)
        limit = request.args.get('limit', 20, type=int)
        scoring = request.args.get('scoring', 'ppr')  # ppr or standard
        
        # Aggregate stats by player
        score_field = PlayerStats.fantasy_points_ppr if scoring == 'ppr' else PlayerStats.fantasy_points
        
        query = db.session.query(
            PlayerStats.player_id,
            PlayerStats.player_name,
            PlayerStats.position,
            PlayerStats.recent_team,
            func.sum(score_field).label('total_points'),
            func.count(PlayerStats.week).label('games_played')
        ).filter(
            PlayerStats.season == season
        ).group_by(
            PlayerStats.player_id,
            PlayerStats.player_name,
            PlayerStats.position,
            PlayerStats.recent_team
        )
        
        if position:
            query = query.filter(PlayerStats.position == position)
        
        top_players = query.order_by(desc('total_points')).limit(limit).all()
        
        return jsonify([{
            'player_id': p.player_id,
            'player_name': p.player_name,
            'position': p.position,
            'team': p.recent_team,
            'total_points': float(p.total_points) if p.total_points else 0,
            'games_played': p.games_played,
            'avg_points': round(float(p.total_points) / p.games_played, 2) if p.games_played > 0 and p.total_points else 0
        } for p in top_players])
    
    @app.route('/api/stats/week/<int:week>', methods=['GET'])
    def get_week_stats(week):
        """Get top performers for a specific week"""
        season = request.args.get('season', 2024, type=int)
        position = request.args.get('position')
        limit = request.args.get('limit', 20, type=int)
        
        query = PlayerStats.query.filter_by(
            season=season,
            week=week
        )
        
        if position:
            query = query.filter(PlayerStats.position == position)
        
        stats = query.order_by(desc(PlayerStats.fantasy_points_ppr)).limit(limit).all()
        
        return jsonify([{
            'player_id': s.player_id,
            'player_name': s.player_name,
            'position': s.position,
            'team': s.recent_team,
            'passing_yards': s.passing_yards,
            'passing_tds': s.passing_tds,
            'rushing_yards': s.rushing_yards,
            'rushing_tds': s.rushing_tds,
            'receiving_yards': s.receiving_yards,
            'receiving_tds': s.receiving_tds,
            'receptions': s.receptions,
            'targets': s.targets,
            'fantasy_points': s.fantasy_points,
            'fantasy_points_ppr': s.fantasy_points_ppr
        } for s in stats])

    @app.route('/api/search', methods=['GET'])
    def search_players():
        """Search players by name"""
        query = request.args.get('q', '')
        if not query or len(query) < 2:
            return jsonify([])
        
        players = Player.query.filter(Player.player_name.ilike(f'%{query}%')).limit(10).all()
        
        return jsonify([{
            'player_id': p.player_id,
            'player_name': p.player_name,
            'position': p.position,
            'team': p.team
        } for p in players])

    @app.route('/api/stats/compare', methods=['GET'])
    def compare_players():
        """Compare stats for multiple players"""
        player_ids = request.args.getlist('player_ids')
        season = request.args.get('season', 2024, type=int)
        
        if not player_ids:
            return jsonify([])
            
        # Aggregate stats for each player
        results = []
        for pid in player_ids:
            stats = db.session.query(
                func.sum(PlayerStats.passing_yards).label('passing_yards'),
                func.sum(PlayerStats.passing_tds).label('passing_tds'),
                func.sum(PlayerStats.interceptions).label('interceptions'),
                func.sum(PlayerStats.rushing_yards).label('rushing_yards'),
                func.sum(PlayerStats.rushing_tds).label('rushing_tds'),
                func.sum(PlayerStats.receiving_yards).label('receiving_yards'),
                func.sum(PlayerStats.receiving_tds).label('receiving_tds'),
                func.sum(PlayerStats.receptions).label('receptions'),
                func.sum(PlayerStats.fantasy_points_ppr).label('total_points'),
                func.count(PlayerStats.week).label('games_played')
            ).filter(
                PlayerStats.player_id == pid,
                PlayerStats.season == season
            ).first()
            
            player = Player.query.get(pid)
            
            if player and stats.games_played > 0:
                results.append({
                    'player_id': player.player_id,
                    'player_name': player.player_name,
                    'position': player.position,
                    'team': player.team,
                    'stats': {
                        'passing_yards': stats.passing_yards or 0,
                        'passing_tds': stats.passing_tds or 0,
                        'interceptions': stats.interceptions or 0,
                        'rushing_yards': stats.rushing_yards or 0,
                        'rushing_tds': stats.rushing_tds or 0,
                        'receiving_yards': stats.receiving_yards or 0,
                        'receiving_tds': stats.receiving_tds or 0,
                        'receptions': stats.receptions or 0,
                        'total_points': stats.total_points or 0,
                        'games_played': stats.games_played,
                        'avg_points': round(stats.total_points / stats.games_played, 2)
                    }
                })
                
        return jsonify(results)

    @app.route('/api/teams/stats', methods=['GET'])
    def get_team_stats():
        """Get aggregated team stats"""
        season = request.args.get('season', 2024, type=int)
        
        # Aggregate player stats by team
        team_stats = db.session.query(
            PlayerStats.recent_team,
            func.sum(PlayerStats.passing_yards).label('pass_yards'),
            func.sum(PlayerStats.passing_tds).label('pass_tds'),
            func.sum(PlayerStats.rushing_yards).label('rush_yards'),
            func.sum(PlayerStats.rushing_tds).label('rush_tds'),
            func.sum(PlayerStats.fantasy_points_ppr).label('total_fantasy_points')
        ).filter(
            PlayerStats.season == season,
            PlayerStats.recent_team != None
        ).group_by(PlayerStats.recent_team).all()
        
        return jsonify([{
            'team': t.recent_team,
            'pass_yards': t.pass_yards or 0,
            'pass_tds': t.pass_tds or 0,
            'rush_yards': t.rush_yards or 0,
            'rush_tds': t.rush_tds or 0,
            'total_fantasy_points': t.total_fantasy_points or 0,
            'total_yards': (t.pass_yards or 0) + (t.rush_yards or 0)
        } for t in team_stats])
