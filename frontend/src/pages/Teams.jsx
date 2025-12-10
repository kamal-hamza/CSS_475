import React, { useEffect, useState } from "react";
import { getTeamStats } from "../services/api";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  FormControl,
  Select,
  Paper,
  Chip,
  Divider,
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
import {
  EmojiEvents,
  TrendingUp,
  Sports,
  QueryStats,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("total_fantasy_points");

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTeamStats();
        setTeams(data || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setError(error.message || "Failed to load team statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const sortedTeams = [...teams].sort((a, b) => b[sortBy] - a[sortBy]);

  const statOptions = [
    {
      value: "total_fantasy_points",
      label: "Fantasy Points",
    },
    { value: "pass_yards", label: "Passing Yards" },
    { value: "rush_yards", label: "Rushing Yards" },
    { value: "pass_tds", label: "Passing TDs" },
    { value: "rush_tds", label: "Rushing TDs" },
  ];

  const getBarColor = (index) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#C0C0C0";
    if (index === 2) return "#CD7F32";
    if (index < 5) return "#013369";
    return "#64748b";
  };

  const getMedalIcon = (index) => {
    if (index === 0) return "1";
    if (index === 1) return "2";
    if (index === 2) return "3";
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Team Statistics"
        subtitle={`Comprehensive performance metrics across all ${teams.length} NFL teams for the 2024 season.`}
        icon={<QueryStats />}
        actions={
          <FormControl sx={{ minWidth: 220 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                bgcolor: "rgba(255,255,255,0.05)",
                color: "white",
                fontWeight: "bold",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
              }}
            >
              {statOptions.map((stat) => (
                <option key={stat.value} value={stat.value}>
                  {stat.label}
                </option>
              ))}
            </Select>
          </FormControl>
        }
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Loading team statistics...
            </Typography>
          </Box>
        </Box>
      ) : error ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            bgcolor: "rgba(239, 68, 68, 0.05)",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Teams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
        </Paper>
      ) : teams.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            No Team Data Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No team statistics found for the 2024 season.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Top 3 Podium */}
          {sortedTeams.length >= 3 && (
            <Box sx={{ mb: 6, mt: 2 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <EmojiEvents color="primary" />
                Top 3 Teams
              </Typography>
              <Grid container spacing={3} alignItems="flex-end">
                {/* 2nd Place */}
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "center",
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "#C0C0C0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      }}
                    >
                      2
                    </Box>
                    <CardContent sx={{ pt: 4 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {sortedTeams[1].team}
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {sortedTeams[1][sortBy].toFixed(0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {statOptions.find((s) => s.value === sortBy)?.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 1st Place */}
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)",
                      border: "1px solid rgba(255, 215, 0, 0.3)",
                      textAlign: "center",
                      transform: { md: "scale(1.1)" },
                      position: "relative",
                      zIndex: 1,
                      overflow: "visible",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -25,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        bgcolor: "#FFD700",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        boxShadow: "0 4px 15px rgba(255, 215, 0, 0.4)",
                      }}
                    >
                      1
                    </Box>
                    <CardContent sx={{ pt: 5, pb: 4 }}>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {sortedTeams[0].team}
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="#FFD700"
                      >
                        {sortedTeams[0][sortBy].toFixed(0)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {statOptions.find((s) => s.value === sortBy)?.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 3rd Place */}
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "center",
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "#CD7F32",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      }}
                    >
                      3
                    </Box>
                    <CardContent sx={{ pt: 4 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {sortedTeams[2].team}
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {sortedTeams[2][sortBy].toFixed(0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {statOptions.find((s) => s.value === sortBy)?.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Chart */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 6,
              borderRadius: 4,
              bgcolor: "#131B2F",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <TrendingUp color="primary" />
              Top 10 Teams
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Ranked by {statOptions.find((s) => s.value === sortBy)?.label}
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedTeams.slice(0, 10)}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="team"
                    stroke="#94A3B8"
                    tick={{ fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    cursor={{
                      fill: "rgba(255,255,255,0.05)",
                    }}
                  />
                  <Bar dataKey={sortBy} radius={[8, 8, 0, 0]}>
                    {sortedTeams.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Team Cards Grid */}
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Sports color="primary" />
              All Teams Breakdown
            </Typography>
            <Grid container spacing={3}>
              {sortedTeams.map((team, index) => {
                const passPercentage =
                  (team.pass_yards / (team.pass_yards + team.rush_yards)) * 100;
                const rushPercentage = 100 - passPercentage;

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={team.team}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        bgcolor: "#131B2F",
                        border: "1px solid rgba(255,255,255,0.05)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 10px 20px -5px rgba(0,0,0,0.2)",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {team.team}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Rank #{index + 1}
                            </Typography>
                          </Box>
                          {index < 3 && (
                            <Typography variant="h5">
                              {getMedalIcon(index)}
                            </Typography>
                          )}
                        </Box>

                        <Divider
                          sx={{
                            my: 2,
                            borderColor: "rgba(255,255,255,0.05)",
                          }}
                        />

                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            gutterBottom
                            sx={{
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Fantasy Points
                          </Typography>
                          <Typography
                            variant="h4"
                            fontWeight="800"
                            color="primary.light"
                          >
                            {team.total_fantasy_points.toFixed(0)}
                          </Typography>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 3 }}>
                          <Grid item xs={6}>
                            <Chip
                              label={`${team.pass_yards.toFixed(0)} Pass Yds`}
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{
                                width: "100%",
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Chip
                              label={`${team.rush_yards.toFixed(0)} Rush Yds`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{
                                width: "100%",
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            gutterBottom
                          >
                            Offense Balance
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              height: 6,
                              borderRadius: 3,
                              overflow: "hidden",
                              mt: 1,
                              bgcolor: "rgba(255,255,255,0.05)",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${passPercentage}%`,
                                bgcolor: "#3B82F6",
                              }}
                            />
                            <Box
                              sx={{
                                width: `${rushPercentage}%`,
                                bgcolor: "#10B981",
                              }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Teams;
