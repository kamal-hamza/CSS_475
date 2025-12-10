import React, { useState } from "react";
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Alert,
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    TrendingUp as TrendingUpIcon,
    Speed as SpeedIcon,
    EmojiEvents as TrophyIcon,
    BarChart as BarChartIcon,
    People as PeopleIcon,
} from "@mui/icons-material";
import api from "../services/api";

const ComplexQueries = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [params, setParams] = useState({
        season: 2024,
        week: 1,
        position: "QB",
        team: "BUF",
        minYards: 250,
        minGames: 3,
        minRushYards: 50,
    });

    const executeQuery = async (queryType, endpoint, queryParams = {}) => {
        setLoading(true);
        try {
            const response = await api.get(endpoint, { params: queryParams });
            setResults({ ...results, [queryType]: response.data });
        } catch (error) {
            console.error(`Error executing ${queryType}:`, error);
            setResults({ ...results, [queryType]: { error: error.message } });
        } finally {
            setLoading(false);
        }
    };

    const renderQueryCard = (title, description, icon, queryType, endpoint, queryParams, sqlQuery) => (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    {icon}
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="h6">{title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ width: "100%" }}>
                    {/* SQL Query Display */}
                    <Alert severity="info" sx={{ mb: 2, fontFamily: "monospace", fontSize: "0.85rem" }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                            SQL Query:
                        </Typography>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                            {sqlQuery}
                        </pre>
                    </Alert>

                    {/* Parameters */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {Object.keys(queryParams).map((key) => (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                                <TextField
                                    fullWidth
                                    label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                    value={params[key] || ""}
                                    onChange={(e) =>
                                        setParams({ ...params, [key]: e.target.value })
                                    }
                                    size="small"
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                        onClick={() => executeQuery(queryType, endpoint, queryParams)}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        Execute Query
                    </Button>

                    {/* Results */}
                    {results[queryType] && renderResults(queryType, results[queryType])}
                </Box>
            </AccordionDetails>
        </Accordion>
    );

    const renderResults = (queryType, data) => {
        if (data.error) {
            return (
                <Alert severity="error">
                    Error: {data.error}
                </Alert>
            );
        }

        if (!data || (Array.isArray(data) && data.length === 0)) {
            return (
                <Alert severity="warning">
                    No results found
                </Alert>
            );
        }

        // Handle different result types
        switch (queryType) {
            case "bestQB":
                return renderBestQBResults(data);
            case "multiThreat":
                return renderMultiThreatResults(data);
            case "teamPerformance":
                return renderTeamPerformanceResults(data);
            case "weeklyLeaders":
                return renderWeeklyLeadersResults(data);
            case "consistent":
                return renderConsistentResults(data);
            default:
                return <pre>{JSON.stringify(data, null, 2)}</pre>;
        }
    };

    const renderBestQBResults = (data) => (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Player</TableCell>
                        <TableCell>Team</TableCell>
                        <TableCell>Week</TableCell>
                        <TableCell>Opponent</TableCell>
                        <TableCell align="right">Yards</TableCell>
                        <TableCell align="right">TDs</TableCell>
                        <TableCell align="right">INTs</TableCell>
                        <TableCell align="right">Comp %</TableCell>
                        <TableCell align="right">Fantasy Pts</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{row.player_name}</TableCell>
                            <TableCell>{row.team}</TableCell>
                            <TableCell>{row.week}</TableCell>
                            <TableCell>{row.opponent}</TableCell>
                            <TableCell align="right">{row.passing_yards}</TableCell>
                            <TableCell align="right">{row.passing_tds}</TableCell>
                            <TableCell align="right">{row.interceptions}</TableCell>
                            <TableCell align="right">{row.completion_pct}%</TableCell>
                            <TableCell align="right">
                                <Chip label={row.fantasy_points.toFixed(1)} color="primary" size="small" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderMultiThreatResults = (data) => (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Player</TableCell>
                        <TableCell>Team</TableCell>
                        <TableCell align="right">Pass Yds</TableCell>
                        <TableCell align="right">Pass TDs</TableCell>
                        <TableCell align="right">Rush Yds</TableCell>
                        <TableCell align="right">Rush TDs</TableCell>
                        <TableCell align="right">Games</TableCell>
                        <TableCell align="right">Fantasy Pts</TableCell>
                        <TableCell align="right">Avg Pts/Game</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{row.player_name}</TableCell>
                            <TableCell>{row.team}</TableCell>
                            <TableCell align="right">{row.total_pass_yards}</TableCell>
                            <TableCell align="right">{row.total_pass_tds}</TableCell>
                            <TableCell align="right">{row.total_rush_yards}</TableCell>
                            <TableCell align="right">{row.total_rush_tds}</TableCell>
                            <TableCell align="right">{row.games_played}</TableCell>
                            <TableCell align="right">{row.total_fantasy_points.toFixed(1)}</TableCell>
                            <TableCell align="right">
                                <Chip label={row.avg_fantasy_points.toFixed(1)} color="success" size="small" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderTeamPerformanceResults = (data) => (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Home Performance
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Games</Typography>
                                <Typography variant="h6">{data.home_performance?.games || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Avg Score</Typography>
                                <Typography variant="h6">{data.home_performance?.avg_score || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Pass Yards</Typography>
                                <Typography variant="h6">{data.home_performance?.total_pass_yards || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Rush Yards</Typography>
                                <Typography variant="h6">{data.home_performance?.total_rush_yards || 0}</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Away Performance
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Games</Typography>
                                <Typography variant="h6">{data.away_performance?.games || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Avg Score</Typography>
                                <Typography variant="h6">{data.away_performance?.avg_score || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Pass Yards</Typography>
                                <Typography variant="h6">{data.away_performance?.total_pass_yards || 0}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Rush Yards</Typography>
                                <Typography variant="h6">{data.away_performance?.total_rush_yards || 0}</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderWeeklyLeadersResults = (data) => (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: "primary.dark" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                            <TrophyIcon sx={{ mr: 1 }} /> Passing Leader
                        </Typography>
                        {data.passing_leader ? (
                            <>
                                <Typography variant="h5">{data.passing_leader.player_name}</Typography>
                                <Typography color="text.secondary">{data.passing_leader.team}</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h4">{data.passing_leader.yards} yds</Typography>
                                    <Typography>{data.passing_leader.tds} TDs</Typography>
                                    <Typography variant="caption">vs {data.passing_leader.opponent}</Typography>
                                </Box>
                            </>
                        ) : (
                            <Typography>No data</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: "success.dark" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                            <TrophyIcon sx={{ mr: 1 }} /> Rushing Leader
                        </Typography>
                        {data.rushing_leader ? (
                            <>
                                <Typography variant="h5">{data.rushing_leader.player_name}</Typography>
                                <Typography color="text.secondary">{data.rushing_leader.team}</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h4">{data.rushing_leader.yards} yds</Typography>
                                    <Typography>{data.rushing_leader.tds} TDs</Typography>
                                    <Typography variant="caption">vs {data.rushing_leader.opponent}</Typography>
                                </Box>
                            </>
                        ) : (
                            <Typography>No data</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: "warning.dark" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                            <TrophyIcon sx={{ mr: 1 }} /> Receiving Leader
                        </Typography>
                        {data.receiving_leader ? (
                            <>
                                <Typography variant="h5">{data.receiving_leader.player_name}</Typography>
                                <Typography color="text.secondary">{data.receiving_leader.team}</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h4">{data.receiving_leader.yards} yds</Typography>
                                    <Typography>{data.receiving_leader.receptions} rec, {data.receiving_leader.tds} TDs</Typography>
                                    <Typography variant="caption">vs {data.receiving_leader.opponent}</Typography>
                                </Box>
                            </>
                        ) : (
                            <Typography>No data</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderConsistentResults = (data) => (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Player</TableCell>
                        <TableCell>Team</TableCell>
                        <TableCell align="right">Games</TableCell>
                        <TableCell align="right">Avg Pts</TableCell>
                        <TableCell align="right">Min Pts</TableCell>
                        <TableCell align="right">Max Pts</TableCell>
                        <TableCell align="right">Point Range</TableCell>
                        <TableCell align="right">Total Pts</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{row.player_name}</TableCell>
                            <TableCell>{row.team}</TableCell>
                            <TableCell align="right">{row.games_played}</TableCell>
                            <TableCell align="right">
                                <Chip label={row.avg_points} color="primary" size="small" />
                            </TableCell>
                            <TableCell align="right">{row.min_points}</TableCell>
                            <TableCell align="right">{row.max_points}</TableCell>
                            <TableCell align="right">{row.point_range}</TableCell>
                            <TableCell align="right">{row.total_points}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Complex Queries
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Demonstrating advanced SQL queries with multiple JOINs, subqueries, and aggregations
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Query 1: Best QB Performances */}
                {renderQueryCard(
                    "Best QB Performances",
                    "JOIN 4 tables: Player, GameLog, PassingStats, Game. Find top QB performances with game context.",
                    <TrendingUpIcon color="primary" />,
                    "bestQB",
                    "/complex/best-qb-performances",
                    { season: params.season, min_yards: params.minYards, limit: 20 },
                    `SELECT
    p.player_name, p.position, p.team,
    gl.week, gl.opponent,
    ps.passing_yards, ps.passing_tds, ps.interceptions,
    ps.completions, ps.attempts,
    g.gameday, g.stadium,
    gl.fantasy_points_ppr
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
JOIN games g ON gl.game_id = g.game_id
WHERE gl.season = ? AND p.position = 'QB' AND ps.passing_yards >= ?
ORDER BY ps.passing_yards DESC
LIMIT 20`
                )}

                {/* Query 2: Multi-Threat Players */}
                {renderQueryCard(
                    "Dual-Threat Players",
                    "JOIN 4 tables with NESTED SUBQUERY. Find players with both passing and rushing stats.",
                    <SpeedIcon color="success" />,
                    "multiThreat",
                    "/complex/multi-threat-players",
                    { season: params.season, min_rush_yards: params.minRushYards },
                    `-- Subquery to find players with significant rushing yards
WITH rushing_players AS (
    SELECT rs.player_id
    FROM rushing_stats rs
    JOIN game_logs gl ON rs.player_id = gl.player_id AND rs.game_id = gl.game_id
    WHERE gl.season = ?
    GROUP BY rs.player_id
    HAVING SUM(rs.rushing_yards) >= ?
)
-- Main query joining passing and rushing stats
SELECT
    p.player_id, p.player_name, p.position, p.team,
    SUM(ps.passing_yards) as total_pass_yards,
    SUM(ps.passing_tds) as total_pass_tds,
    SUM(rs.rushing_yards) as total_rush_yards,
    SUM(rs.rushing_tds) as total_rush_tds,
    COUNT(gl.week) as games_played,
    SUM(gl.fantasy_points_ppr) as total_fantasy_points
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
WHERE gl.season = ? AND p.player_id IN (SELECT player_id FROM rushing_players)
GROUP BY p.player_id, p.player_name, p.position, p.team
ORDER BY total_fantasy_points DESC`
                )}

                {/* Query 3: Team Performance Breakdown */}
                {renderQueryCard(
                    "Team Home vs Away Performance",
                    "JOIN 5 tables with GROUP BY and AGGREGATE functions. Analyze home vs away offensive performance.",
                    <BarChartIcon color="warning" />,
                    "teamPerformance",
                    "/complex/team-performance-breakdown",
                    { season: params.season, team: params.team },
                    `-- Home games
SELECT
    COUNT(g.game_id) as games,
    AVG(g.home_score) as avg_score,
    SUM(ps.passing_yards) as total_pass_yards,
    SUM(rs.rushing_yards) as total_rush_yards
FROM games g
JOIN game_logs gl ON g.game_id = gl.game_id
LEFT JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
LEFT JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
WHERE g.season = ? AND g.home_team = ? AND gl.team = ?

-- Away games (similar structure)
SELECT
    COUNT(g.game_id) as games,
    AVG(g.away_score) as avg_score,
    SUM(ps.passing_yards) as total_pass_yards,
    SUM(rs.rushing_yards) as total_rush_yards
FROM games g
JOIN game_logs gl ON g.game_id = gl.game_id
LEFT JOIN passing_stats ps ON gl.player_id = ps.player_id AND gl.game_id = ps.game_id
LEFT JOIN rushing_stats rs ON gl.player_id = rs.player_id AND gl.game_id = rs.game_id
WHERE g.season = ? AND g.away_team = ? AND gl.team = ?`
                )}

                {/* Query 4: Weekly Leaders */}
                {renderQueryCard(
                    "Weekly Statistical Leaders",
                    "Multiple JOINs with separate aggregations for different stat categories.",
                    <TrophyIcon color="error" />,
                    "weeklyLeaders",
                    "/complex/weekly-leaders",
                    { season: params.season, week: params.week },
                    `-- Passing Leader
SELECT p.player_name, p.team, ps.passing_yards, ps.passing_tds, gl.opponent
FROM players p
JOIN passing_stats ps ON p.player_id = ps.player_id
JOIN game_logs gl ON p.player_id = gl.player_id AND ps.game_id = gl.game_id
WHERE gl.season = ? AND gl.week = ?
ORDER BY ps.passing_yards DESC
LIMIT 1

-- Similar queries for Rushing and Receiving leaders`
                )}

                {/* Query 5: Consistent Performers */}
                {renderQueryCard(
                    "Most Consistent Players",
                    "GROUP BY with HAVING clause and statistical aggregate functions (AVG, MIN, MAX).",
                    <PeopleIcon color="info" />,
                    "consistent",
                    "/complex/consistent-performers",
                    { season: params.season, position: params.position, min_games: params.minGames },
                    `SELECT
    p.player_id, p.player_name, p.position, p.team,
    COUNT(gl.week) as games_played,
    AVG(gl.fantasy_points_ppr) as avg_points,
    MIN(gl.fantasy_points_ppr) as min_points,
    MAX(gl.fantasy_points_ppr) as max_points,
    SUM(gl.fantasy_points_ppr) as total_points
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
WHERE gl.season = ? AND p.position = ?
GROUP BY p.player_id, p.player_name, p.position, p.team
HAVING COUNT(gl.week) >= ?
ORDER BY avg_points DESC`
                )}
            </Box>
        </Container>
    );
};

export default ComplexQueries;
