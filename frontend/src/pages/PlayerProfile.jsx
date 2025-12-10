import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlayerStats, getPlayerDetails } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import {
  Person,
  TrendingUp,
  CalendarMonth,
  SportsScore,
  Speed,
  Shield,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";

const PlayerProfile = () => {
  const { id } = useParams();
  const [stats, setStats] = useState([]);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [playerStats, playerDetails] = await Promise.all([
          getPlayerStats(id),
          getPlayerDetails(id),
        ]);
        setStats(playerStats);
        setPlayer(playerDetails);
      } catch (error) {
        console.error("Error fetching player data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          No player selected
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Please search for a player or select one from the Players page.
        </Typography>
      </Container>
    );
  }

  if (!player && stats.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Player not found (ID: {id})
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          The player you're looking for doesn't exist or has no stats available.
        </Typography>
      </Container>
    );
  }

  // Determine player position
  const position = player?.position || "";
  const isQB = position === "QB";
  const isRB = position === "RB";
  const isWR = position === "WR" || position === "TE";
  const isK = position === "K";
  const isDEF = position === "DEF";

  // Calculate totals
  const totalPoints = stats.reduce((sum, s) => sum + s.fantasy_points_ppr, 0);
  const avgPoints = stats.length > 0 ? totalPoints / stats.length : 0;
  const totalPassingYards = stats.reduce((sum, s) => sum + s.passing_yards, 0);
  const totalRushingYards = stats.reduce((sum, s) => sum + s.rushing_yards, 0);
  const totalReceivingYards = stats.reduce(
    (sum, s) => sum + s.receiving_yards,
    0,
  );
  const totalPassingTDs = stats.reduce((sum, s) => sum + s.passing_tds, 0);
  const totalRushingTDs = stats.reduce((sum, s) => sum + s.rushing_tds, 0);
  const totalReceivingTDs = stats.reduce((sum, s) => sum + s.receiving_tds, 0);
  const totalReceptions = stats.reduce((sum, s) => sum + s.receptions, 0);
  const totalInterceptions = stats.reduce((sum, s) => sum + s.interceptions, 0);

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
      <PageHeader
        title={player?.player_name || `Player ${id}`}
        subtitle={`${player?.team || "Unknown Team"} • ${player?.position || "Unknown Position"} | Performance analysis`}
        icon={<Person />}
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h4" fontWeight="bold" color="primary.light">
                {totalPoints.toFixed(1)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Total Pts
              </Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {avgPoints.toFixed(1)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Avg Pts
              </Typography>
            </Box>
          </Box>
        }
      />

      {/* Quick Stats Grid - Position Specific */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* QB Stats */}
        {isQB && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Passing Yards
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="white">
                    {totalPassingYards}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Passing TDs
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {totalPassingTDs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Rushing Yards
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {totalRushingYards}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Interceptions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {totalInterceptions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* RB Stats */}
        {isRB && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Rushing Yards
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="white">
                    {totalRushingYards}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Rushing TDs
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {totalRushingTDs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Receptions
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {totalReceptions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Receiving Yards
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {totalReceivingYards}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* WR/TE Stats */}
        {isWR && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Receptions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="white">
                    {totalReceptions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Receiving Yards
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {totalReceivingYards}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Receiving TDs
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {totalReceivingTDs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#131B2F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Yards/Reception
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {totalReceptions > 0
                      ? (totalReceivingYards / totalReceptions).toFixed(1)
                      : "0.0"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* K/DEF - Show generic stats or message */}
        {(isK || isDEF || (!isQB && !isRB && !isWR)) && stats.length === 0 && (
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                bgcolor: "#131B2F",
                border: "1px solid rgba(255,255,255,0.05)",
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No stats available for this player
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This player may not have recorded any stats in the 2024 season
                yet.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Charts Section - Only show if player has stats */}
      {stats.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {/* Fantasy Points Chart - Show for all positions */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "#131B2F",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 4,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 3,
              }}
            >
              <TrendingUp color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Weekly Fantasy Performance
              </Typography>
            </Box>
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats}>
                  <defs>
                    <linearGradient
                      id="colorPoints"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    stroke="#94A3B8"
                    tickFormatter={(w) => `W${w}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis stroke="#94A3B8" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="fantasy_points_ppr"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorPoints)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Position-Specific Charts */}
          {isQB && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#131B2F",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <Speed color="success" />
                <Typography variant="h6" fontWeight="bold">
                  QB Performance Breakdown
                </Typography>
              </Box>
              <Box sx={{ height: 400, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
                      stroke="#94A3B8"
                      tickFormatter={(w) => `W${w}`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis stroke="#94A3B8" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="passing_yards"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                      name="Passing Yds"
                    />
                    <Line
                      type="monotone"
                      dataKey="passing_tds"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Pass TDs"
                    />
                    <Line
                      type="monotone"
                      dataKey="rushing_yards"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                      name="Rush Yds"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {isRB && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#131B2F",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <Speed color="success" />
                <Typography variant="h6" fontWeight="bold">
                  RB Performance Breakdown
                </Typography>
              </Box>
              <Box sx={{ height: 400, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
                      stroke="#94A3B8"
                      tickFormatter={(w) => `W${w}`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis stroke="#94A3B8" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rushing_yards"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Rush Yds"
                    />
                    <Line
                      type="monotone"
                      dataKey="rushing_tds"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                      name="Rush TDs"
                    />
                    <Line
                      type="monotone"
                      dataKey="receiving_yards"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                      name="Rec Yds"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {isWR && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#131B2F",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <Speed color="success" />
                <Typography variant="h6" fontWeight="bold">
                  {position === "TE" ? "TE" : "WR"} Performance Breakdown
                </Typography>
              </Box>
              <Box sx={{ height: 400, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
                      stroke="#94A3B8"
                      tickFormatter={(w) => `W${w}`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis stroke="#94A3B8" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="receptions"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                      name="Receptions"
                    />
                    <Line
                      type="monotone"
                      dataKey="receiving_yards"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                      name="Rec Yds"
                    />
                    <Line
                      type="monotone"
                      dataKey="receiving_tds"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Rec TDs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Game Log Table - Only show if player has stats */}
      {stats.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "#131B2F",
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CalendarMonth color="warning" />
              Game Log
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell>Opponent</TableCell>
                  {isQB && (
                    <>
                      <TableCell align="right">Pass Yds</TableCell>
                      <TableCell align="right">Pass TD</TableCell>
                      <TableCell align="right">INT</TableCell>
                      <TableCell align="right">Rush Yds</TableCell>
                    </>
                  )}
                  {isRB && (
                    <>
                      <TableCell align="right">Rush Yds</TableCell>
                      <TableCell align="right">Rush TD</TableCell>
                      <TableCell align="right">Rec</TableCell>
                      <TableCell align="right">Rec Yds</TableCell>
                    </>
                  )}
                  {isWR && (
                    <>
                      <TableCell align="right">Rec</TableCell>
                      <TableCell align="right">Rec Yds</TableCell>
                      <TableCell align="right">Rec TD</TableCell>
                      <TableCell align="right">Targets</TableCell>
                    </>
                  )}
                  {!isQB && !isRB && !isWR && (
                    <>
                      <TableCell align="right">Pass Yds</TableCell>
                      <TableCell align="right">Rush Yds</TableCell>
                      <TableCell align="right">Rec Yds</TableCell>
                    </>
                  )}
                  <TableCell align="right">Fantasy Pts</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((game, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.02) !important",
                      },
                    }}
                  >
                    <TableCell sx={{ color: "text.secondary" }}>
                      Week {game.week}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={game.opponent}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
                    </TableCell>
                    {isQB && (
                      <>
                        <TableCell align="right">
                          {game.passing_yards}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              game.passing_tds > 0 ? "success.main" : "inherit",
                          }}
                        >
                          {game.passing_tds}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              game.interceptions > 0 ? "error.main" : "inherit",
                          }}
                        >
                          {game.interceptions}
                        </TableCell>
                        <TableCell align="right">
                          {game.rushing_yards}
                        </TableCell>
                      </>
                    )}
                    {isRB && (
                      <>
                        <TableCell align="right">
                          {game.rushing_yards}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              game.rushing_tds > 0 ? "success.main" : "inherit",
                          }}
                        >
                          {game.rushing_tds}
                        </TableCell>
                        <TableCell align="right">{game.receptions}</TableCell>
                        <TableCell align="right">
                          {game.receiving_yards}
                        </TableCell>
                      </>
                    )}
                    {isWR && (
                      <>
                        <TableCell align="right">{game.receptions}</TableCell>
                        <TableCell align="right">
                          {game.receiving_yards}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              game.receiving_tds > 0
                                ? "success.main"
                                : "inherit",
                          }}
                        >
                          {game.receiving_tds}
                        </TableCell>
                        <TableCell align="right">{game.targets || 0}</TableCell>
                      </>
                    )}
                    {!isQB && !isRB && !isWR && (
                      <>
                        <TableCell align="right">
                          {game.passing_yards}
                        </TableCell>
                        <TableCell align="right">
                          {game.rushing_yards}
                        </TableCell>
                        <TableCell align="right">
                          {game.receiving_yards}
                        </TableCell>
                      </>
                    )}
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: "bold",
                        color: "primary.light",
                      }}
                    >
                      {game.fantasy_points_ppr.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default PlayerProfile;
