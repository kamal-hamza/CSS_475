import React, { useEffect, useState } from "react";
import { getGames } from "../services/api";
import { Link } from "react-router-dom";
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Chip,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Paper,
    Divider,
    Tooltip,
    Stack,
} from "@mui/material";
import {
    CalendarMonth,
    TrendingUp,
    LocalFireDepartment,
    SportsFootball,
    Stadium as StadiumIcon,
    Person,
    Sports,
    WbSunny,
    Air,
    ShowChart,
    EmojiEvents,
    Bed,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";

const Games = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [week, setWeek] = useState(1);
    const [weeks, setWeeks] = useState([]);

    useEffect(() => {
        // Generate array of weeks 1-18
        setWeeks(Array.from({ length: 18 }, (_, i) => i + 1));
    }, []);

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

    const handleWeekChange = (event, newWeek) => {
        if (newWeek !== null) {
            setWeek(newWeek);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 30) return "#10B981"; // High scoring
        if (score >= 20) return "#3B82F6"; // Medium scoring
        return "#64748B"; // Low scoring
    };

    const isCloseGame = (homeScore, awayScore) => {
        return Math.abs(homeScore - awayScore) <= 7;
    };

    const isHighScoring = (homeScore, awayScore) => {
        return homeScore + awayScore >= 50;
    };

    const getWeatherIcon = (temp) => {
        if (!temp) return null;
        if (temp < 32) return "❄️";
        if (temp < 50) return "🌥️";
        if (temp < 70) return "⛅";
        return "☀️";
    };

    const getRoofIcon = (roof) => {
        if (roof === "outdoors") return "🏟️";
        if (roof === "dome" || roof === "closed") return "🏛️";
        if (roof === "retractable") return "🔄";
        return "🏟️";
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <PageHeader
                title="Schedules & Results"
                subtitle="Track game outcomes, scores, QB matchups, coaching duels, and betting lines throughout the 2024 NFL season."
                icon={<CalendarMonth />}
                actions={
                    <Box
                        sx={{
                            bgcolor: "rgba(255,255,255,0.05)",
                            p: 1,
                            borderRadius: 3,
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <ToggleButtonGroup
                            value={week}
                            exclusive
                            onChange={handleWeekChange}
                            aria-label="week selection"
                            sx={{
                                display: "flex",
                                overflowX: "auto",
                                maxWidth: { xs: "300px", md: "500px" },
                                "& .MuiToggleButton-root": {
                                    color: "text.secondary",
                                    border: "none",
                                    borderRadius: "8px !important",
                                    mx: 0.5,
                                    minWidth: 40,
                                    "&.Mui-selected": {
                                        bgcolor: "primary.main",
                                        color: "white",
                                        "&:hover": { bgcolor: "primary.dark" },
                                    },
                                },
                                "&::-webkit-scrollbar": { height: 4 },
                                "&::-webkit-scrollbar-thumb": {
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    borderRadius: 2,
                                },
                            }}
                        >
                            {weeks.map((w) => (
                                <ToggleButton key={w} value={w} size="small">
                                    W{w}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                }
            />

            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "40vh",
                    }}
                >
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : games.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: "center",
                        bgcolor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 4,
                    }}
                >
                    <StadiumIcon
                        sx={{
                            fontSize: 60,
                            color: "text.secondary",
                            mb: 2,
                            opacity: 0.5,
                        }}
                    />
                    <Typography
                        variant="h5"
                        color="text.secondary"
                        gutterBottom
                    >
                        No Games Scheduled
                    </Typography>
                    <Typography color="text.secondary">
                        There are no games scheduled for Week {week}.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {games.map((game) => {
                        const homeWinner = game.home_score > game.away_score;
                        const awayWinner = game.away_score > game.home_score;
                        const close = isCloseGame(
                            game.home_score,
                            game.away_score,
                        );
                        const highScoring = isHighScoring(
                            game.home_score,
                            game.away_score,
                        );

                        return (
                            <Grid item xs={12} lg={6} key={game.game_id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        bgcolor: "#131B2F",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        borderRadius: 3,
                                        position: "relative",
                                        overflow: "visible",
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow:
                                                "0 12px 24px -8px rgba(0,0,0,0.3)",
                                            borderColor: "primary.main",
                                        },
                                    }}
                                >
                                    {/* Game Status Indicators */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 4,
                                            background: homeWinner
                                                ? "linear-gradient(90deg, #3B82F6 50%, transparent 50%)"
                                                : "linear-gradient(90deg, transparent 50%, #3B82F6 50%)",
                                        }}
                                    />

                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        {/* Header with Date and Badges */}
                                        <Box
                                            sx={{
                                                mb: 2,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <CalendarMonth
                                                    sx={{ fontSize: 14 }}
                                                />
                                                WEEK {week} • {game.gameday} •{" "}
                                                {game.gametime}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 0.5,
                                                }}
                                            >
                                                {close && (
                                                    <Chip
                                                        icon={
                                                            <LocalFireDepartment
                                                                sx={{
                                                                    fontSize:
                                                                        "12px !important",
                                                                }}
                                                            />
                                                        }
                                                        label="Thriller"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: "0.65rem",
                                                        }}
                                                    />
                                                )}
                                                {highScoring && (
                                                    <Chip
                                                        icon={
                                                            <TrendingUp
                                                                sx={{
                                                                    fontSize:
                                                                        "12px !important",
                                                                }}
                                                            />
                                                        }
                                                        label="Shootout"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: "0.65rem",
                                                        }}
                                                    />
                                                )}
                                                {game.div_game === 1 && (
                                                    <Chip
                                                        icon={
                                                            <EmojiEvents
                                                                sx={{
                                                                    fontSize:
                                                                        "12px !important",
                                                                }}
                                                            />
                                                        }
                                                        label="Division"
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: "0.65rem",
                                                        }}
                                                    />
                                                )}
                                                {game.overtime === 1 && (
                                                    <Chip
                                                        label="OT"
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: "0.65rem",
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Score Display */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 3,
                                            }}
                                        >
                                            {/* Away Team */}
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="h4"
                                                    fontWeight="800"
                                                    sx={{
                                                        color: awayWinner
                                                            ? "white"
                                                            : "text.secondary",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {game.away_team}
                                                </Typography>
                                                <Typography
                                                    variant="h3"
                                                    fontWeight="bold"
                                                    sx={{
                                                        color: getScoreColor(
                                                            game.away_score,
                                                        ),
                                                    }}
                                                >
                                                    {game.away_score}
                                                </Typography>
                                                {awayWinner && (
                                                    <Chip
                                                        label="WIN"
                                                        size="small"
                                                        color="primary"
                                                        sx={{
                                                            mt: 1,
                                                            height: 20,
                                                            fontSize: "0.7rem",
                                                            fontWeight: "bold",
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            <Typography
                                                variant="h5"
                                                color="text.secondary"
                                                sx={{
                                                    opacity: 0.3,
                                                    px: 2,
                                                    fontWeight: 300,
                                                }}
                                            >
                                                VS
                                            </Typography>

                                            {/* Home Team */}
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="h4"
                                                    fontWeight="800"
                                                    sx={{
                                                        color: homeWinner
                                                            ? "white"
                                                            : "text.secondary",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {game.home_team}
                                                </Typography>
                                                <Typography
                                                    variant="h3"
                                                    fontWeight="bold"
                                                    sx={{
                                                        color: getScoreColor(
                                                            game.home_score,
                                                        ),
                                                    }}
                                                >
                                                    {game.home_score}
                                                </Typography>
                                                {homeWinner && (
                                                    <Chip
                                                        label="WIN"
                                                        size="small"
                                                        color="primary"
                                                        sx={{
                                                            mt: 1,
                                                            height: 20,
                                                            fontSize: "0.7rem",
                                                            fontWeight: "bold",
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        <Divider
                                            sx={{
                                                my: 2,
                                                borderColor:
                                                    "rgba(255,255,255,0.05)",
                                            }}
                                        />

                                        {/* QB Matchup */}
                                        {(game.away_qb_name ||
                                            game.home_qb_name) && (
                                            <Box sx={{ mb: 2 }}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    sx={{ mb: 1 }}
                                                >
                                                    <Sports
                                                        sx={{
                                                            fontSize: 16,
                                                            color: "primary.main",
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        color="primary"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        QB MATCHUP
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {game.away_qb_name || "TBD"}{" "}
                                                    vs{" "}
                                                    {game.home_qb_name || "TBD"}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Coaches */}
                                        {(game.away_coach_name ||
                                            game.home_coach_name) && (
                                            <Box sx={{ mb: 2 }}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    sx={{ mb: 1 }}
                                                >
                                                    <Person
                                                        sx={{
                                                            fontSize: 16,
                                                            color: "text.secondary",
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        COACHES
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    align="center"
                                                    sx={{ fontSize: "0.8rem" }}
                                                >
                                                    {game.away_coach_name ||
                                                        "TBD"}{" "}
                                                    vs{" "}
                                                    {game.home_coach_name ||
                                                        "TBD"}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Divider
                                            sx={{
                                                my: 2,
                                                borderColor:
                                                    "rgba(255,255,255,0.05)",
                                            }}
                                        />

                                        {/* Stadium & Weather Info */}
                                        <Grid
                                            container
                                            spacing={2}
                                            sx={{ mb: 2 }}
                                        >
                                            <Grid item xs={12}>
                                                {game.stadium_name && (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                            mb: 1,
                                                        }}
                                                    >
                                                        <StadiumIcon
                                                            sx={{
                                                                fontSize: 16,
                                                                color: "text.secondary",
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {game.stadium_name}
                                                        </Typography>
                                                        {game.stadium_roof && (
                                                            <Chip
                                                                label={
                                                                    getRoofIcon(
                                                                        game.stadium_roof,
                                                                    ) +
                                                                    " " +
                                                                    game.stadium_roof
                                                                }
                                                                size="small"
                                                                sx={{
                                                                    height: 18,
                                                                    fontSize:
                                                                        "0.65rem",
                                                                    bgcolor:
                                                                        "rgba(255,255,255,0.05)",
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                )}
                                            </Grid>

                                            {/* Weather */}
                                            {(game.temp || game.wind) && (
                                                <Grid item xs={12}>
                                                    <Stack
                                                        direction="row"
                                                        spacing={2}
                                                        sx={{
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        {game.temp && (
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <WbSunny
                                                                    sx={{
                                                                        fontSize: 14,
                                                                        color: "#FFA500",
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {getWeatherIcon(
                                                                        game.temp,
                                                                    )}{" "}
                                                                    {game.temp}
                                                                    °F
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {game.wind && (
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <Air
                                                                    sx={{
                                                                        fontSize: 14,
                                                                        color: "#87CEEB",
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    💨{" "}
                                                                    {game.wind}{" "}
                                                                    mph
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </Grid>
                                            )}

                                            {/* Rest Days */}
                                            {(game.away_rest ||
                                                game.home_rest) && (
                                                <Grid item xs={12}>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Bed
                                                            sx={{
                                                                fontSize: 14,
                                                                color: "text.secondary",
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Rest:{" "}
                                                            {game.away_rest ||
                                                                0}
                                                            d vs{" "}
                                                            {game.home_rest ||
                                                                0}
                                                            d
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}

                                            {/* Referee */}
                                            {game.referee_name && (
                                                <Grid item xs={12}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize: "0.7rem",
                                                        }}
                                                    >
                                                        👨‍⚖️ Referee:{" "}
                                                        {game.referee_name}
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>

                                        {/* Betting Lines */}
                                        {(game.spread_line ||
                                            game.total_line) && (
                                            <>
                                                <Divider
                                                    sx={{
                                                        my: 2,
                                                        borderColor:
                                                            "rgba(255,255,255,0.05)",
                                                    }}
                                                />
                                                <Box sx={{ mb: 2 }}>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        sx={{ mb: 1 }}
                                                    >
                                                        <ShowChart
                                                            sx={{
                                                                fontSize: 16,
                                                                color: "#FFD700",
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: "#FFD700",
                                                            }}
                                                        >
                                                            BETTING LINES
                                                        </Typography>
                                                    </Stack>
                                                    <Grid container spacing={1}>
                                                        {game.spread_line && (
                                                            <Grid item xs={6}>
                                                                <Box
                                                                    sx={{
                                                                        bgcolor:
                                                                            "rgba(255,255,255,0.03)",
                                                                        p: 1,
                                                                        borderRadius: 1,
                                                                        textAlign:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                        display="block"
                                                                    >
                                                                        Spread
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        fontWeight="600"
                                                                        sx={{
                                                                            color: "#FFD700",
                                                                        }}
                                                                    >
                                                                        {game.spread_line >
                                                                        0
                                                                            ? "+"
                                                                            : ""}
                                                                        {
                                                                            game.spread_line
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                        {game.total_line && (
                                                            <Grid item xs={6}>
                                                                <Box
                                                                    sx={{
                                                                        bgcolor:
                                                                            "rgba(255,255,255,0.03)",
                                                                        p: 1,
                                                                        borderRadius: 1,
                                                                        textAlign:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                        display="block"
                                                                    >
                                                                        O/U
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        fontWeight="600"
                                                                        sx={{
                                                                            color: "#FFD700",
                                                                        }}
                                                                    >
                                                                        {
                                                                            game.total_line
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Box>
                                            </>
                                        )}

                                        <Divider
                                            sx={{
                                                my: 2,
                                                borderColor:
                                                    "rgba(255,255,255,0.05)",
                                            }}
                                        />

                                        {/* Footer Links */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                gap: 2,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <Box
                                                component={Link}
                                                to={`/teams`}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    color: "text.secondary",
                                                    textDecoration: "none",
                                                    fontSize: "0.875rem",
                                                    "&:hover": {
                                                        color: "primary.main",
                                                    },
                                                }}
                                            >
                                                <SportsFootball
                                                    sx={{ fontSize: 16 }}
                                                />
                                                Team Stats
                                            </Box>
                                            {game.espn && (
                                                <Box
                                                    component="a"
                                                    href={`https://www.espn.com/nfl/game/_/gameId/${game.espn}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        color: "text.secondary",
                                                        textDecoration: "none",
                                                        fontSize: "0.875rem",
                                                        "&:hover": {
                                                            color: "primary.main",
                                                        },
                                                    }}
                                                >
                                                    📊 ESPN
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
};

export default Games;
