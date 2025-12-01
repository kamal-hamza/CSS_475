import React, { useEffect, useState } from 'react';
import { getTeamStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('total_fantasy_points');

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const data = await getTeamStats();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const sortedTeams = [...teams].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Team Statistics</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="total_fantasy_points">Fantasy Points</option>
          <option value="pass_yards">Passing Yards</option>
          <option value="rush_yards">Rushing Yards</option>
          <option value="pass_tds">Passing TDs</option>
          <option value="rush_tds">Rushing TDs</option>
        </select>
      </div>

      {/* Chart */}
      <div className="card h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedTeams.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="team" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar dataKey={sortBy} fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {sortedTeams.slice(0, 10).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index < 3 ? '#3b82f6' : '#1e293b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedTeams.map((team, index) => (
          <div key={team.team} className="card hover:bg-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xl font-bold text-white">{team.team}</div>
              <div className="text-xs font-mono text-gray-500">#{index + 1}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fantasy Pts</span>
                <span className="text-white font-medium">{team.total_fantasy_points.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pass Yds</span>
                <span className="text-white font-medium">{team.pass_yards.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rush Yds</span>
                <span className="text-white font-medium">{team.rush_yards.toFixed(0)}</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(team.pass_yards / (team.pass_yards + team.rush_yards)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Pass</span>
                <span>Rush</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
