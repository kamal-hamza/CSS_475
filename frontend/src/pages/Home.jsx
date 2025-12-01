import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopPlayers } from '../services/api';
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
  Avatar, Chip, Container, Paper
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Home = () => {
  const [topQBs, setTopQBs] = useState([]);
  const [topRBs, setTopRBs] = useState([]);
  const [topWRs, setTopWRs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qbs, rbs, wrs] = await Promise.all([
          getTopPlayers('QB'),
          getTopPlayers('RB'),
          getTopPlayers('WR')
        ]);
        setTopQBs(qbs.slice(0, 5));
        setTopRBs(rbs.slice(0, 5));
        setTopWRs(wrs.slice(0, 5));
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderLeaderboard = (title, players, color) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEventsIcon sx={{ color: color, mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {players.map((player, index) => (
            <Paper
              key={player.player_id}
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(5px)', bgcolor: 'action.hover' },
                cursor: 'pointer'
              }}
              component={Link}
              to={`/player/${player.player_id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography variant="h6" sx={{ width: 30, color: 'text.secondary', fontWeight: 'bold' }}>
                {index + 1}
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {player.player_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {player.team}
                </Typography>
              </Box>
              <Chip
                label={`${player.fantasy_points_ppr.toFixed(1)} pts`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </div>
    </div>
        );
};

        export default Home;
