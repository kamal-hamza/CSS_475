import React, { useEffect, useState } from 'react';
import { getGames } from '../services/api';
import { Calendar, MapPin } from 'lucide-react';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(1);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const data = await getGames({ week });
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [week]);

  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Schedule</h1>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-md">
          {weeks.map(w => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${week === w
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
            >
              Week {w}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-500">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500">No games found for this week.</div>
        ) : (
          games.map(game => (
            <div key={game.game_id} className="card hover:border-blue-500/30 transition-colors group">
              <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {game.gameday}
                </div>
                <div className="px-2 py-0.5 rounded bg-slate-700 text-xs">Final</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                      {game.away_team}
                    </div>
                    <span className="font-semibold text-white">{game.away_team}</span>
                  </div>
                  <span className={`text-xl font-bold ${game.away_score > game.home_score ? 'text-white' : 'text-gray-500'}`}>
                    {game.away_score}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                      {game.home_team}
                    </div>
                    <span className="font-semibold text-white">{game.home_team}</span>
                  </div>
                  <span className={`text-xl font-bold ${game.home_score > game.away_score ? 'text-white' : 'text-gray-500'}`}>
                    {game.home_score}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Game Stats →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Games;
