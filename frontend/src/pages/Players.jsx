import React, { useEffect, useState } from "react";
import { getTopPlayers } from "../services/api";
import { Link } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Avatar,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    ToggleButtonGroup,
    ToggleButton,
    LinearProgress,
    Tooltip,
} from "@mui/material";
import { EmojiEvents, TrendingUp, People, Sports } from "@mui/icons-material";
import PageHeader from "../components/PageHeader";

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [position, setPosition] = useState("QB");

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

    const positions = ["QB", "RB", "WR", "TE", "K", "DEF"];

    const handlePositionChange = (event, newPosition) => {
        if (newPosition !== null) {
            setPosition(newPosition);
        }
    };

    const getMedalColor = (index) => {
        if (index === 0) return "#FFD700";
        if (index === 1) return "#C0C0C0";
        if (index === 2) return "#CD7F32";
        return null;
    };

    const getPositionColor = (pos) => {
        const colors = {
            QB: "#9c27b0",
            RB: "#4caf50",
            WR: "#2196f3",
            TE: "#ff9800",
            K: "#ffc107",
            DEF: "#f44336",
        };
        return colors[pos] || "#757575";
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <PageHeader
                title="Top Players"
                subtitle={`Elite ${position} performers ranked by total fantasy points for the 2024 season.`}
                icon={<Sports />}
                actions={
                    <ToggleButtonGroup
                        value={position}
                        exclusive
                        onChange={handlePositionChange}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.05)",
                            borderRadius: 3,
                            "& .MuiToggleButton-root": {
                                color: "text.secondary",
                                border: "1px solid rgba(255,255,255,0.1)",
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: "primary.dark",
                                    },
                                },
                            },
                        }}
                    >
                        {positions.map((pos) => (
                            <ToggleButton key={pos} value={pos}>
                                {pos}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                }
            />

            {/* Stats Summary Cards */}
            {!loading && players.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card
                            elevation={3}
                            sx={{
                                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)",
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                position: 'relative',
                                overflow: 'visible'
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: 20,
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: '#FFD700',
                                    boxShadow: '0 4px 10px rgba(255, 215, 0, 0.4)',
                                    color: '#000'
                                }}
                            >
                                <EmojiEvents />
                            </Box>
                            <CardContent>
                                <Box>
                                    <Typography
                                        variant="overline"
                                        color="text.secondary"
                                    >
                                        League Leader
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        gutterBottom
                                    >
                                        {players[0]?.player_name}
                                    </Typography>
                                    <Typography variant="h6" color="warning.main">
                                        {players[0]?.total_points.toFixed(1)} pts
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="overline"
                                            color="text.secondary"
                                        >
                                            Average PPG
                                        </Typography>
                                        <Typography
                                            variant="h3"
                                            fontWeight="bold"
                                            color="info.main"
                                        >
                                            {(
                                                players.reduce(
                                                    (sum, p) =>
                                                        sum + p.avg_points,
                                                    0,
                                                ) / players.length
                                            ).toFixed(1)}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Across top 50 {position}s
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)' }}>
                                        <TrendingUp sx={{ fontSize: 30, color: '#3B82F6' }} />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="overline"
                                            color="text.secondary"
                                        >
                                            Total Games
                                        </Typography>
                                        <Typography
                                            variant="h3"
                                            fontWeight="bold"
                                            color="success.main"
                                        >
                                            {players.reduce(
                                                (sum, p) =>
                                                    sum + p.games_played,
                                                0,
                                            )}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Combined appearances
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                                        <People sx={{ fontSize: 30, color: '#10B981' }} />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Players Table */}
            <Paper
                elevation={0}
                sx={{
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: '#131B2F'
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Player</TableCell>
                                <TableCell>Team</TableCell>
                                <TableCell align="right">Games</TableCell>
                                <TableCell align="right">Avg Pts</TableCell>
                                <TableCell align="right">Total Pts</TableCell>
                                <TableCell align="right">Performance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{ py: 8 }}
                                    >
                                        <CircularProgress size={60} />
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ mt: 2 }}
                                        >
                                            Loading elite players...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                players.map((player, index) => (
                                    <TableRow
                                        key={player.player_id}
                                        hover
                                        sx={{
                                            "&:hover": {
                                                bgcolor: "rgba(255,255,255,0.02) !important",
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            {index < 3 ? (
                                                <Tooltip
                                                    title={
                                                        index === 0
                                                            ? "1st Place"
                                                            : index === 1
                                                                ? "2nd Place"
                                                                : "3rd Place"
                                                    }
                                                >
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: getMedalColor(index),
                                                            color: "#000",
                                                            fontWeight: "bold",
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </Avatar>
                                                </Tooltip>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ pl: 1.5, fontWeight: 600 }}
                                                >
                                                    {index + 1}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                component={Link}
                                                to={`/player/${player.player_id}`}
                                                sx={{
                                                    textDecoration: "none",
                                                    color: "inherit",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    "&:hover": {
                                                        color: "primary.light",
                                                    },
                                                }}
                                            >
                                                {index < 3 && (
                                                    <EmojiEvents
                                                        sx={{
                                                            fontSize: 18,
                                                            color: getMedalColor(index),
                                                        }}
                                                    />
                                                )}
                                                <Typography
                                                    variant="body1"
                                                    fontWeight="bold"
                                                >
                                                    {player.player_name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={player.team}
                                                size="small"
                                                sx={{
                                                    fontWeight: "bold",
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.secondary">
                                                {player.games_played}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={player.avg_points.toFixed(1)}
                                                size="small"
                                                color={player.avg_points > 20 ? "success" : "default"}
                                                variant="filled"
                                                sx={{ fontWeight: "bold", minWidth: 50 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                variant="body1"
                                                fontWeight="bold"
                                                color="primary.light"
                                            >
                                                {player.total_points.toFixed(1)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ width: 150 }}
                                        >
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min(
                                                    (player.total_points /
                                                        (players[0]?.total_points || 1)) * 100,
                                                    100,
                                                )}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: "rgba(255,255,255,0.05)",
                                                    "& .MuiLinearProgress-bar":
                                                    {
                                                        borderRadius: 3,
                                                        bgcolor: getPositionColor(position),
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {!loading && players.length > 0 && (
                <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing top {players.length} {position} players by total points
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default Players;
