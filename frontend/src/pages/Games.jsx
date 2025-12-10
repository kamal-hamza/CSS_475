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
} from "@mui/material";
import {
  CalendarMonth,
  SportsFootball,
  Stadium as StadiumIcon,
  EmojiEvents,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(1);
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Schedules & Results"
        subtitle="Track game outcomes, scores, QB matchups, and coaching duels throughout the 2024 NFL season."
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
          <Typography variant="h5" color="text.secondary" gutterBottom>
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

            return (
              <Grid item xs={12} md={6} lg={4} key={game.game_id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "primary.main",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Game Info Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {game.gameday} • {game.gametime}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                        }}
                      >
                        {game.div_game === 1 && (
                          <Chip
                            icon={
                              <EmojiEvents
                                sx={{
                                  fontSize: 12,
                                }}
                              />
                            }
                            label="DIV"
                            size="small"
                            color="primary"
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
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Score Display */}
                    <Box sx={{ mb: 2 }}>
                      {/* Away Team */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          py: 1,
                          px: 1.5,
                          borderRadius: 1,
                          bgcolor: awayWinner
                            ? "rgba(59, 130, 246, 0.1)"
                            : "transparent",
                          border: awayWinner
                            ? "1px solid rgba(59, 130, 246, 0.3)"
                            : "1px solid transparent",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="700"
                          sx={{
                            color: awayWinner ? "white" : "text.secondary",
                          }}
                        >
                          {game.away_team}
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{
                            color: awayWinner ? "#3B82F6" : "text.secondary",
                          }}
                        >
                          {game.away_score}
                        </Typography>
                      </Box>

                      {/* Home Team */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                          px: 1.5,
                          borderRadius: 1,
                          bgcolor: homeWinner
                            ? "rgba(59, 130, 246, 0.1)"
                            : "transparent",
                          border: homeWinner
                            ? "1px solid rgba(59, 130, 246, 0.3)"
                            : "1px solid transparent",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="700"
                          sx={{
                            color: homeWinner ? "white" : "text.secondary",
                          }}
                        >
                          {game.home_team}
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{
                            color: homeWinner ? "#3B82F6" : "text.secondary",
                          }}
                        >
                          {game.home_score}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider
                      sx={{
                        my: 1.5,
                        borderColor: "rgba(255,255,255,0.05)",
                      }}
                    />

                    {/* Game Details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      {/* QBs */}
                      {(game.away_qb_name || game.home_qb_name) && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.7rem",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            QBs
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              fontSize: "0.8rem",
                            }}
                          >
                            {game.away_qb_name || "TBD"} vs{" "}
                            {game.home_qb_name || "TBD"}
                          </Typography>
                        </Box>
                      )}

                      {/* Coaches */}
                      {(game.away_coach_name || game.home_coach_name) && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.7rem",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Coaches
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              fontSize: "0.8rem",
                            }}
                          >
                            {game.away_coach_name || "TBD"} vs{" "}
                            {game.home_coach_name || "TBD"}
                          </Typography>
                        </Box>
                      )}

                      {/* Stadium */}
                      {game.stadium_name && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.7rem",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Venue
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              fontSize: "0.8rem",
                            }}
                          >
                            {game.stadium_name}
                          </Typography>
                        </Box>
                      )}

                      {/* Referee */}
                      {game.referee_name && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.7rem",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Referee
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              fontSize: "0.8rem",
                            }}
                          >
                            {game.referee_name}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Footer */}
                    {game.espn && (
                      <>
                        <Divider
                          sx={{
                            my: 1.5,
                            borderColor: "rgba(255,255,255,0.05)",
                          }}
                        />
                        <Box
                          component="a"
                          href={`https://www.espn.com/nfl/game/_/gameId/${game.espn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "text.secondary",
                            textDecoration: "none",
                            fontSize: "0.75rem",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          View on ESPN →
                        </Box>
                      </>
                    )}
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
