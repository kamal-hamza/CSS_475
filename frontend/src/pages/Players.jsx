import React, { useEffect, useState } from 'react';
import { getTopPlayers } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState('QB');

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const data = await getTopPlayers({ position, limit: 50 });
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [position]);

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Players</h1>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          {positions.map(pos => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${position === pos
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Player</th>
                <th className="py-4 px-6">Team</th>
                <th className="py-4 px-6 text-right">Games</th>
                <th className="py-4 px-6 text-right">Avg Pts</th>
                <th className="py-4 px-6 text-right">Total Pts</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">Loading players...</td>
                </tr>
              ) : (
                players.map((player, index) => (
                  <tr key={player.player_id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 text-gray-500 font-mono">#{index + 1}</td>
                    <td className="py-4 px-6">
                      <Link to={`/player/${player.player_id}`} className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {player.player_name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{player.team}</td>
                    <td className="py-4 px-6 text-right text-gray-300">{player.games_played}</td>
                    <td className="py-4 px-6 text-right text-green-400 font-medium">{player.avg_points.toFixed(1)}</td>
                    <td className="py-4 px-6 text-right text-blue-400 font-bold">{player.total_points.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Players;
