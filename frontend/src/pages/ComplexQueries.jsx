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
    Alert,
    Chip,
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    TrendingUp as TrendingUpIcon,
    Speed as SpeedIcon,
    EmojiEvents as TrophyIcon,
    BarChart as BarChartIcon,
    People as PeopleIcon,
    SportsFootball as FootballIcon,
} from "@mui/icons-material";
import api from "../services/api";

const ComplexQueries = () => {
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});
    const [params, setParams] = useState({
        season: 2024,
        week: 1,
        team: "KC",
        min_yards: 250,
        limit: 15,
        player_id: "00-0033873", // Patrick Mahomes as default
    });

    const executeQuery = async (queryType, endpoint, queryParams = {}) => {
        setLoading({ ...loading, [queryType]: true });
        try {
            const response = await api.get(endpoint, { params: queryParams });
            setResults({ ...results, [queryType]: response.data });
        } catch (error) {
            console.error(`Error executing ${queryType}:`, error);
            setResults({ ...results, [queryType]: { error: error.message } });
        } finally {
            setLoading({ ...loading, [queryType]: false });
        }
    };

    const renderQueryCard = (
        title,
        description,
        icon,
        queryType,
        endpoint,
        queryParams,
        sqlQuery,
        paramInputs,
        renderFunction,
    ) => (
        <Accordion key={queryType}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
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
                    <Alert
                        severity="info"
                        sx={{
                            mb: 2,
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: "bold" }}
                        >
                            SQL Query:
                        </Typography>
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                            }}
                        >
                            {sqlQuery}
                        </pre>
                    </Alert>

                    {/* Parameters */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {paramInputs.map(({ key, label }) => (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    value={params[key] || ""}
                                    onChange={(e) =>
                                        setParams({
                                            ...params,
                                            [key]: e.target.value,
                                        })
                                    }
                                    size="small"
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Button
                        variant="contained"
                        startIcon={
                            loading[queryType] ? (
                                <CircularProgress size={20} />
                            ) : (
                                <SearchIcon />
                            )
                        }
                        onClick={() =>
                            executeQuery(queryType, endpoint, queryParams)
                        }
                        disabled={loading[queryType]}
                        sx={{ mb: 2 }}
                    >
                        Execute Query
                    </Button>

                    {/* Results */}
                    {results[queryType] && renderFunction(results[queryType])}
                </Box>
            </AccordionDetails>
        </Accordion>
    );

    const renderTopScorers = (data) => {
        if (data.error) {
            return <Alert severity="error">{data.error}</Alert>;
        }
        if (!data || data.length === 0) {
            return <Alert severity="info">No results found</Alert>;
        }

        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <strong>Player</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Position</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Team</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Week</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Opponent</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Fantasy Points</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.player_name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.position}
                                        size="small"
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell>{row.team}</TableCell>
                                <TableCell>{row.week}</TableCell>
                                <TableCell>{row.opponent}</TableCell>
                                <TableCell align="right">
                                    <strong>{row.fantasy_points}</strong>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderQBLeaders = (data) => {
        if (data.error) {
            return <Alert severity="error">{data.error}</Alert>;
        }
        if (!data || data.length === 0) {
            return <Alert severity="info">No results found</Alert>;
        }

        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <strong>QB</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Team</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Week</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Opponent</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Yards</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>TDs</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>INTs</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Comp %</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.player_name}</TableCell>
                                <TableCell>{row.team}</TableCell>
                                <TableCell>{row.week}</TableCell>
                                <TableCell>{row.opponent}</TableCell>
                                <TableCell align="right">
                                    <strong>{row.passing_yards}</strong>
                                </TableCell>
                                <TableCell align="right">
                                    {row.passing_tds}
                                </TableCell>
                                <TableCell align="right">
                                    {row.interceptions}
                                </TableCell>
                                <TableCell align="right">
                                    {row.completion_pct}% ({row.completions}/
                                    {row.attempts})
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderRushingLeaders = (data) => {
        if (data.error) {
            return <Alert severity="error">{data.error}</Alert>;
        }
        if (!data || data.length === 0) {
            return <Alert severity="info">No results found</Alert>;
        }

        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <strong>Player</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Pos</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Team</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Games</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Carries</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Yards</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>TDs</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>YPG</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>YPC</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.player_name}</TableCell>
                                <TableCell>
                                    <Chip label={row.position} size="small" />
                                </TableCell>
                                <TableCell>{row.team}</TableCell>
                                <TableCell align="right">
                                    {row.games_played}
                                </TableCell>
                                <TableCell align="right">
                                    {row.total_carries}
                                </TableCell>
                                <TableCell align="right">
                                    <strong>{row.total_yards}</strong>
                                </TableCell>
                                <TableCell align="right">
                                    {row.total_tds}
                                </TableCell>
                                <TableCell align="right">
                                    {row.yards_per_game}
                                </TableCell>
                                <TableCell align="right">
                                    {row.yards_per_carry}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderReceivingLeaders = (data) => {
        if (data.error) {
            return <Alert severity="error">{data.error}</Alert>;
        }
        if (!data || data.length === 0) {
            return <Alert severity="info">No results found</Alert>;
        }

        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <strong>Player</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Pos</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Team</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Games</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Rec</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Targets</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Yards</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>TDs</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>YPG</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>YPC</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>Catch %</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.player_name}</TableCell>
                                <TableCell>
                                    <Chip label={row.position} size="small" />
                                </TableCell>
                                <TableCell>{row.team}</TableCell>
                                <TableCell align="right">
                                    {row.games_played}
                                </TableCell>
                                <TableCell align="right">
                                    {row.total_receptions}
                                </TableCell>
                                <TableCell align="right">
                                    {row.total_targets}
                                </TableCell>
                                <TableCell align="right">
                                    <strong>{row.total_yards}</strong>
                                </TableCell>
                                <TableCell align="right">
                                    {row.total_tds}
                                </TableCell>
                                <TableCell align="right">
                                    {row.yards_per_game}
                                </TableCell>
                                <TableCell align="right">
                                    {row.yards_per_catch}
                                </TableCell>
                                <TableCell align="right">
                                    {row.catch_rate}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderTeamStats = (data) => {
        if (data.error) {
            return <Alert severity="error">{data.error}</Alert>;
        }
        if (!data) {
            return <Alert severity="info">No results found</Alert>;
        }

        return (
            <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {data.team} - {data.season} Season ({data.games_played}{" "}
                    games)
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Passing
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {data.passing.total_yards} yards
                                </Typography>
                                <Typography
                                    sx={{ mb: 1.5 }}
                                    color="text.secondary"
                                >
                                    {data.passing.yards_per_game} YPG
                                </Typography>
                                <Typography variant="body2">
                                    {data.passing.total_tds} TDs,{" "}
                                    {data.passing.total_ints} INTs
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Rushing
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {data.rushing.total_yards} yards
                                </Typography>
                                <Typography
                                    sx={{ mb: 1.5 }}
                                    color="text.secondary"
                                >
                                    {data.rushing.yards_per_game} YPG
                                </Typography>
                                <Typography variant="body2">
                                    {data.rushing.total_tds} TDs
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Receiving
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {data.receiving.total_yards} yards
                                </Typography>
                                <Typography
                                    sx={{ mb: 1.5 }}
                                    color="text.secondary"
                                >
                                    {data.receiving.yards_per_game} YPG
                                </Typography>
                                <Typography variant="body2">
                                    {data.receiving.total_receptions} catches,{" "}
                                    {data.receiving.total_tds} TDs
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderPlayerGameLog = (data) => {
        if (data.error) {
            return <Alert severity="error">{data.error}</Alert>;
        }
        if (!data || !data.games || data.games.length === 0) {
            return (
                <Alert severity="info">No game log found for this player</Alert>
            );
        }

        return (
            <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {data.player.player_name} ({data.player.position}) -{" "}
                    {data.player.team}
                </Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Week</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Opponent</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Date</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Stadium</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>Fantasy Points</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.games.map((game, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{game.week}</TableCell>
                                    <TableCell>{game.opponent}</TableCell>
                                    <TableCell>
                                        {game.gameday
                                            ? new Date(
                                                  game.gameday,
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {game.stadium || "N/A"}
                                    </TableCell>
                                    <TableCell align="right">
                                        <strong>{game.fantasy_points}</strong>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{ fontWeight: "bold", mb: 1 }}
                >
                    Database Queries
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Simple SQL queries demonstrating our NFL data
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Query 1: Top Fantasy Scorers */}
                {renderQueryCard(
                    "Top Fantasy Scorers by Week",
                    "Simple SELECT with JOIN and ORDER BY to find the highest fantasy point scorers for a specific week",
                    <TrophyIcon color="primary" />,
                    "topScorers",
                    "/api/queries/top-scorers",
                    {
                        season: params.season,
                        week: params.week,
                        limit: params.limit,
                    },
                    `SELECT
    p.player_name,
    p.position,
    p.team,
    gl.week,
    gl.opponent,
    gl.fantasy_points_ppr
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
WHERE gl.season = ? AND gl.week = ?
ORDER BY gl.fantasy_points_ppr DESC
LIMIT ?`,
                    [
                        { key: "season", label: "Season" },
                        { key: "week", label: "Week" },
                        { key: "limit", label: "Limit" },
                    ],
                    renderTopScorers,
                )}

                {/* Query 2: QB Passing Leaders */}
                {renderQueryCard(
                    "QB Passing Yard Leaders",
                    "Multi-table JOIN to find QB performances with passing stats and game details",
                    <TrendingUpIcon color="success" />,
                    "qbLeaders",
                    "/api/queries/qb-passing-leaders",
                    {
                        season: params.season,
                        min_yards: params.min_yards,
                        limit: params.limit,
                    },
                    `SELECT
    p.player_name,
    p.team,
    gl.week,
    gl.opponent,
    ps.passing_yards,
    ps.passing_tds,
    ps.interceptions,
    ps.completions,
    ps.attempts
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
JOIN passing_stats ps ON ps.player_id = p.player_id
    AND ps.game_id = gl.game_id
WHERE gl.season = ?
    AND p.position = 'QB'
    AND ps.passing_yards >= ?
ORDER BY ps.passing_yards DESC
LIMIT ?`,
                    [
                        { key: "season", label: "Season" },
                        { key: "min_yards", label: "Min Passing Yards" },
                        { key: "limit", label: "Limit" },
                    ],
                    renderQBLeaders,
                )}

                {/* Query 3: Rushing Leaders */}
                {renderQueryCard(
                    "Season Rushing Leaders",
                    "GROUP BY query with aggregate functions (SUM, COUNT) to calculate season totals",
                    <SpeedIcon color="warning" />,
                    "rushingLeaders",
                    "/api/queries/rushing-leaders",
                    { season: params.season, limit: params.limit },
                    `SELECT
    p.player_name,
    p.position,
    p.team,
    SUM(rs.rushing_yards) as total_yards,
    SUM(rs.rushing_tds) as total_tds,
    SUM(rs.carries) as total_carries,
    COUNT(gl.week) as games_played
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
JOIN rushing_stats rs ON rs.player_id = p.player_id
    AND rs.game_id = gl.game_id
WHERE gl.season = ?
GROUP BY p.player_id, p.player_name, p.position, p.team
ORDER BY total_yards DESC
LIMIT ?`,
                    [
                        { key: "season", label: "Season" },
                        { key: "limit", label: "Limit" },
                    ],
                    renderRushingLeaders,
                )}

                {/* Query 4: Receiving Leaders */}
                {renderQueryCard(
                    "Season Receiving Leaders",
                    "GROUP BY with multiple aggregate calculations for receiving stats",
                    <PeopleIcon color="error" />,
                    "receivingLeaders",
                    "/api/queries/receiving-leaders",
                    { season: params.season, limit: params.limit },
                    `SELECT
    p.player_name,
    p.position,
    p.team,
    SUM(rec.receiving_yards) as total_yards,
    SUM(rec.receptions) as total_receptions,
    SUM(rec.receiving_tds) as total_tds,
    SUM(rec.targets) as total_targets,
    COUNT(gl.week) as games_played
FROM players p
JOIN game_logs gl ON p.player_id = gl.player_id
JOIN receiving_stats rec ON rec.player_id = p.player_id
    AND rec.game_id = gl.game_id
WHERE gl.season = ?
GROUP BY p.player_id, p.player_name, p.position, p.team
ORDER BY total_yards DESC
LIMIT ?`,
                    [
                        { key: "season", label: "Season" },
                        { key: "limit", label: "Limit" },
                    ],
                    renderReceivingLeaders,
                )}

                {/* Query 5: Team Aggregate Stats */}
                {renderQueryCard(
                    "Team Offensive Statistics",
                    "Multiple aggregate queries combined to show complete team offensive stats",
                    <BarChartIcon color="info" />,
                    "teamStats",
                    "/api/queries/team-stats",
                    { season: params.season, team: params.team },
                    `-- Passing stats
SELECT
    SUM(ps.passing_yards) as total_pass_yards,
    SUM(ps.passing_tds) as total_pass_tds,
    SUM(ps.interceptions) as total_ints
FROM passing_stats ps
JOIN game_logs gl ON ps.player_id = gl.player_id
WHERE gl.season = ? AND gl.team = ?

-- Rushing stats
SELECT
    SUM(rs.rushing_yards) as total_rush_yards,
    SUM(rs.rushing_tds) as total_rush_tds
FROM rushing_stats rs
JOIN game_logs gl ON rs.player_id = gl.player_id
WHERE gl.season = ? AND gl.team = ?

-- Receiving stats
SELECT
    SUM(rec.receiving_yards) as total_rec_yards,
    SUM(rec.receiving_tds) as total_rec_tds,
    SUM(rec.receptions) as total_receptions
FROM receiving_stats rec
JOIN game_logs gl ON rec.player_id = gl.player_id
WHERE gl.season = ? AND gl.team = ?`,
                    [
                        { key: "season", label: "Season" },
                        { key: "team", label: "Team (e.g., KC, BUF, SF)" },
                    ],
                    renderTeamStats,
                )}

                {/* Query 6: Player Game Log */}
                {renderQueryCard(
                    "Player Game Log",
                    "Simple JOIN to retrieve a player's complete game-by-game performance log",
                    <FootballIcon color="secondary" />,
                    "playerGameLog",
                    "/api/queries/player-game-log",
                    { player_id: params.player_id, season: params.season },
                    `SELECT
    gl.week,
    gl.opponent,
    gl.fantasy_points_ppr,
    g.gameday,
    g.stadium
FROM game_logs gl
JOIN games g ON gl.game_id = g.game_id
WHERE gl.player_id = ? AND gl.season = ?
ORDER BY gl.week`,
                    [
                        {
                            key: "player_id",
                            label: "Player ID (e.g., 00-0033873 for Mahomes)",
                        },
                        { key: "season", label: "Season" },
                    ],
                    renderPlayerGameLog,
                )}
            </Box>
        </Container>
    );
};

export default ComplexQueries;
