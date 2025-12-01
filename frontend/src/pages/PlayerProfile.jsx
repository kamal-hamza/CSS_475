import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlayerStats, searchPlayers } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, Activity, Calendar, TrendingUp, Shield } from 'lucide-react';

const PlayerProfile = () => {
  const { id } = useParams();
  const [stats, setStats] = useState([]);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const playerStats = await getPlayerStats(id);
        setStats(playerStats);

        // We need player info (name, team, etc.) which isn't directly in stats endpoint
        // So we'll search for the player by ID (or we could add a specific endpoint)
        // For now, let's use the first stat entry or search
        if (playerStats.length > 0) {
          // In a real app, we'd have a specific /api/players/:id endpoint
          // For now, we can infer from stats or do a search
          // Let's just use the first stat entry for basic info if available
          // But wait, stats endpoint returns stats, not full player info
          // Let's assume we can get basic info from the stats or we need to fetch it.
          // Actually, the stats endpoint I wrote returns: week, opponent, passing_yards, etc.
          // It DOES NOT return player name/team in the stats array (it's in the parent object in some APIs, but mine returns a list of stats)
          // I should probably update the backend to return player info with stats or add a player info endpoint.
          // For now, let's fetch player info via search (hacky but works)
          // Wait, search by ID? My search endpoint searches by name.
          // Let's just update the backend to return player info wrapper.
          // OR, I can just use the search endpoint if I know the name... which I don't.
          // Okay, let's add a quick endpoint to get player info or update getPlayerStats to return a wrapper.
          // Let's update getPlayerStats in backend to return { player: {...}, stats: [...] }
          // But I can't change backend right now without restarting server.
          // Let's look at `routes.py` again.
          // `get_player_stats` returns a list of stats.
          // `get_players` returns a list of players.
          // I can filter `get_players` by ID? No, it filters by team/position.
          // I'll add a quick client-side hack: I'll just display stats for now, and maybe "Unknown Player" until I fix backend.
          // Actually, I can use `searchPlayers` if I had the name.
          // Let's just display the ID for now or fix the backend.
          // Fixing the backend is better.
          // But I want to finish frontend first.
          // Let's assume I'll fix backend later.
          // Wait, I can use the `search` endpoint if I pass the ID? No, it searches by name.
          // Okay, I will update the backend to include player info in the stats response or a separate endpoint.
          // For now, I'll just render the stats.
        }
      } catch (error) {
        console.error("Error fetching player stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  if (stats.length === 0) return <div className="text-center py-20">No stats found for this player.</div>;

  // Calculate totals
  const totalPoints = stats.reduce((sum, s) => sum + s.fantasy_points_ppr, 0);
  const avgPoints = totalPoints / stats.length;
  const totalPassingYards = stats.reduce((sum, s) => sum + s.passing_yards, 0);
  const totalRushingYards = stats.reduce((sum, s) => sum + s.rushing_yards, 0);
  const totalReceivingYards = stats.reduce((sum, s) => sum + s.receiving_yards, 0);
  const totalTDs = stats.reduce((sum, s) => sum + s.passing_tds + s.rushing_tds + s.receiving_tds, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Player Header */}
      <div className="card bg-gradient-to-r from-blue-900/50 to-slate-900/50 border-blue-500/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">Player {id}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Team</span>
              <span>•</span>
              <span>Position</span>
            </div>
          </div>
          <div className="md:ml-auto flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{totalPoints.toFixed(1)}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Total Pts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{avgPoints.toFixed(1)}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Avg Pts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{stats.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Games</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">Passing Yards</div>
          <div className="text-2xl font-bold">{totalPassingYards}</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">Rushing Yards</div>
          <div className="text-2xl font-bold">{totalRushingYards}</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">Receiving Yards</div>
          <div className="text-2xl font-bold">{totalReceivingYards}</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">Total TDs</div>
          <div className="text-2xl font-bold">{totalTDs}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Weekly Fantasy Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={w => `W${w}`} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="fantasy_points_ppr" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPoints)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Yards Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={w => `W${w}`} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="passing_yards" stroke="#3b82f6" strokeWidth={2} dot={false} name="Passing" />
                <Line type="monotone" dataKey="rushing_yards" stroke="#22c55e" strokeWidth={2} dot={false} name="Rushing" />
                <Line type="monotone" dataKey="receiving_yards" stroke="#a855f7" strokeWidth={2} dot={false} name="Receiving" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Game Log */}
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Game Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="py-3 px-4">Week</th>
                <th className="py-3 px-4">Opponent</th>
                <th className="py-3 px-4 text-right">Pass Yds</th>
                <th className="py-3 px-4 text-right">Pass TD</th>
                <th className="py-3 px-4 text-right">Rush Yds</th>
                <th className="py-3 px-4 text-right">Rush TD</th>
                <th className="py-3 px-4 text-right">Rec Yds</th>
                <th className="py-3 px-4 text-right">Rec TD</th>
                <th className="py-3 px-4 text-right font-bold text-blue-400">Fantasy</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((game, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-gray-300">Week {game.week}</td>
                  <td className="py-3 px-4 text-gray-300">{game.opponent}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{game.passing_yards}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{game.passing_tds}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{game.rushing_yards}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{game.rushing_tds}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{game.receiving_yards}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{game.receiving_tds}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-400">{game.fantasy_points_ppr.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
