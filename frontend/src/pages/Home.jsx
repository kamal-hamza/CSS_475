import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTopPlayers } from "../services/api";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Container,
    Paper,
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import PageHeader from "../components/PageHeader";

const Home = () => {
    const [topQBs, setTopQBs] = useState([]);
    const [topRBs, setTopRBs] = useState([]);
    const [topWRs, setTopWRs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [qbs, rbs, wrs] = await Promise.all([
                    getTopPlayers({ position: "QB", limit: 5 }),
                    getTopPlayers({ position: "RB", limit: 5 }),
                    getTopPlayers({ position: "WR", limit: 5 }),
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
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80vh",
                }}
            >
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    const renderLeaderboard = (title, players, color) => (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: `${color}20`,
                            mr: 2,
                            display: "flex"
                        }}
                    >
                        <EmojiEventsIcon sx={{ color: color }} />
                    </Box>
                    <Typography
                        variant="h6"
                        component="div"
                    >
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {players.map((player, index) => (
                        <Paper
                            key={player.player_id}
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: "background.paper",
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: "flex",
                                alignItems: "center",
                                borderRadius: 3,
                                transition: "all 0.2s",
                                "&:hover": {
                                    transform: "translateX(5px)",
                                    bgcolor: "rgba(255,255,255,0.03)",
                                    borderColor: color,
                                },
                                cursor: "pointer",
                            }}
                            component={Link}
                            to={`/player/${player.player_id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: index < 3 ? color : 'rgba(255,255,255,0.1)',
                                    color: index < 3 ? '#000' : 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {index + 1}
                            </Box>

                            <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                                >
                                    {player.player_name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {player.team}
                                </Typography>
                            </Box>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    color: color
                                }}
                            >
                                {player.total_points.toFixed(1)}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );

    const chartData = [
        { name: "QB", value: topQBs[0]?.total_points || 0 },
        { name: "RB", value: topRBs[0]?.total_points || 0 },
        { name: "WR", value: topWRs[0]?.total_points || 0 },
    ];

    const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <PageHeader
                title="NFL Stats Dashboard"
                subtitle="Track and analyze player performance across the 2024 season. View automated insights and top performers."
                icon={<SportsFootballIcon />}
            />

            {/* Top Leaders Chart */}
            <Card sx={{ mb: 4, p: 2 }}>
                <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', mr: 2 }}>
                            <TrendingUpIcon sx={{ color: "success.main" }} />
                        </Box>
                        <Typography
                            variant="h5"
                            component="div"
                        >
                            Top Fantasy Scorers by Position
                        </Typography>
                    </Box>
                    <Box sx={{ height: 350, width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94A3B8"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1E293B',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* Leaderboards */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    {renderLeaderboard("Top Quarterbacks", topQBs, "#3B82F6")}
                </Grid>
                <Grid item xs={12} md={4}>
                    {renderLeaderboard("Top Running Backs", topRBs, "#10B981")}
                </Grid>
                <Grid item xs={12} md={4}>
                    {renderLeaderboard("Top Wide Receivers", topWRs, "#F59E0B")}
                </Grid>
            </Grid>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <CardContent>
                            <Typography
                                variant="overline"
                                color="info.main"
                                sx={{ opacity: 0.8 }}
                            >
                                Total Players Tracked
                            </Typography>
                            <Typography
                                variant="h3"
                                sx={{ color: 'info.main' }}
                            >
                                {topQBs.length + topRBs.length + topWRs.length}+
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                        <CardContent>
                            <Typography
                                variant="overline"
                                color="text.secondary"
                            >
                                Current Season
                            </Typography>
                            <Typography
                                variant="h3"
                                color="text.primary"
                            >
                                2024
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <CardContent>
                            <Typography
                                variant="overline"
                                color="warning.main"
                                sx={{ opacity: 0.8 }}
                            >
                                NFL Top Scorer
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography
                                    variant="h4"
                                    sx={{ color: 'warning.main' }}
                                >
                                    {topQBs[0]?.player_name || "N/A"}
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'warning.light', opacity: 0.8 }}>
                                    {topQBs[0]?.total_points.toFixed(0) || "0"} pts
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
