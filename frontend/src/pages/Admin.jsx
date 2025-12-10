import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TablePagination,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import api from "../services/api";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Debounce hook for search inputs
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Admin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [players, setPlayers] = useState([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [_currentEntity, setCurrentEntity] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Pagination states
  const [playerPage, setPlayerPage] = useState(0);
  const [playerRowsPerPage, setPlayerRowsPerPage] = useState(50);
  const [gamePage, setGamePage] = useState(0);
  const [gameRowsPerPage, setGameRowsPerPage] = useState(50);

  // Search/Filter states
  const [playerSearch, setPlayerSearch] = useState({
    name: "",
    position: "",
    team: "",
  });
  const [teamSearch, setTeamSearch] = useState({
    name: "",
    conference: "",
    division: "",
  });
  const [gameSearch, setGameSearch] = useState({
    season: 2024,
    week: "",
    team: "",
  });

  // Form states
  // Debounced search values
  const debouncedPlayerName = useDebounce(playerSearch.name, 500);

  const [playerForm, setPlayerForm] = useState({
    player_id: "",
    player_name: "",
    position: "",
    team: "",
  });

  const [teamForm, setTeamForm] = useState({
    team_abbr: "",
    team_name: "",
    team_conf: "",
    team_division: "",
    team_color: "",
    team_logo_espn: "",
  });

  const [gameForm, setGameForm] = useState({
    game_id: "",
    season: 2024,
    week: 1,
    game_type: "REG",
    away_team: "",
    home_team: "",
    away_score: 0,
    home_score: 0,
    gameday: "",
    weekday: "",
    gametime: "",
    stadium: "",
    location: "",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        const params = new URLSearchParams();
        // Add pagination
        params.append("limit", playerRowsPerPage);
        params.append("offset", playerPage * playerRowsPerPage);

        // Server-side name search (searches ALL players in database)
        if (debouncedPlayerName) params.append("name", debouncedPlayerName);
        if (playerSearch.position)
          params.append("position", playerSearch.position);
        if (playerSearch.team) params.append("team", playerSearch.team);

        const response = await api.get(`/api/players?${params.toString()}`);

        // Handle both old and new response formats
        if (response.data.players) {
          setPlayers(response.data.players);
          setPlayerTotal(response.data.total || 0);
        } else {
          // Backwards compatibility
          setPlayers(response.data);
          setPlayerTotal(response.data.length);
        }
      } else if (tabValue === 1) {
        // Teams are small, load all
        const response = await api.get("/api/teams");
        setTeams(response.data);
      } else if (tabValue === 2) {
        const params = new URLSearchParams();
        // Add pagination
        params.append("limit", gameRowsPerPage);
        params.append("offset", gamePage * gameRowsPerPage);
        params.append("season", gameSearch.season || 2024);

        if (gameSearch.week) params.append("week", gameSearch.week);
        if (gameSearch.team) params.append("team", gameSearch.team);

        const response = await api.get(`/api/games?${params.toString()}`);
        setGames(response.data);
      }
    } catch (error) {
      showSnackbar("Error fetching data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [
    tabValue,
    debouncedPlayerName,
    playerSearch.position,
    playerSearch.team,
    playerPage,
    playerRowsPerPage,
    gameSearch.season,
    gameSearch.week,
    gameSearch.team,
    gamePage,
    gameRowsPerPage,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (mode, entity = null) => {
    setDialogMode(mode);
    setCurrentEntity(entity);

    if (mode === "edit" && entity) {
      if (tabValue === 0) {
        setPlayerForm(entity);
      } else if (tabValue === 1) {
        setTeamForm(entity);
      } else if (tabValue === 2) {
        setGameForm(entity);
      }
    } else {
      // Reset forms for create mode
      if (tabValue === 0) {
        setPlayerForm({
          player_id: "",
          player_name: "",
          position: "",
          team: "",
        });
      } else if (tabValue === 1) {
        setTeamForm({
          team_abbr: "",
          team_name: "",
          team_conf: "",
          team_division: "",
          team_color: "",
          team_logo_espn: "",
        });
      } else if (tabValue === 2) {
        setGameForm({
          game_id: "",
          season: 2024,
          week: 1,
          game_type: "REG",
          away_team: "",
          home_team: "",
          away_score: 0,
          home_score: 0,
          gameday: "",
          weekday: "",
          gametime: "",
          stadium: "",
          location: "",
        });
      }
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEntity(null);
  };

  const handleDelete = async (id, endpoint) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await api.delete(`/api/${endpoint}/${id}`);
      showSnackbar("Item deleted successfully");
      fetchData();
    } catch (error) {
      showSnackbar("Error deleting item: " + error.message, "error");
    }
  };

  const handleSubmit = async () => {
    try {
      let endpoint = "";
      let data = {};

      if (tabValue === 0) {
        endpoint = "players";
        data = playerForm;
      } else if (tabValue === 1) {
        endpoint = "teams";
        data = teamForm;
      } else if (tabValue === 2) {
        endpoint = "games";
        data = gameForm;
      }

      if (dialogMode === "create") {
        await api.post(`/api/${endpoint}`, data);
        showSnackbar("Item created successfully");
      } else {
        const id =
          tabValue === 0
            ? data.player_id
            : tabValue === 1
              ? data.team_abbr
              : data.game_id;
        await api.put(`/api/${endpoint}/${id}`, data);
        showSnackbar("Item updated successfully");
      }

      handleCloseDialog();
      fetchData();
    } catch (error) {
      showSnackbar("Error saving item: " + error.message, "error");
    }
  };

  const renderPlayerDialog = () => (
    <DialogContent>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Player ID"
            value={playerForm.player_id}
            onChange={(e) =>
              setPlayerForm({
                ...playerForm,
                player_id: e.target.value,
              })
            }
            disabled={dialogMode === "edit"}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Player Name"
            value={playerForm.player_name}
            onChange={(e) =>
              setPlayerForm({
                ...playerForm,
                player_name: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Position</InputLabel>
            <Select
              value={playerForm.position}
              label="Position"
              onChange={(e) =>
                setPlayerForm({
                  ...playerForm,
                  position: e.target.value,
                })
              }
            >
              <MenuItem value="QB">QB</MenuItem>
              <MenuItem value="RB">RB</MenuItem>
              <MenuItem value="WR">WR</MenuItem>
              <MenuItem value="TE">TE</MenuItem>
              <MenuItem value="K">K</MenuItem>
              <MenuItem value="DEF">DEF</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Team"
            value={playerForm.team}
            onChange={(e) =>
              setPlayerForm({
                ...playerForm,
                team: e.target.value,
              })
            }
          />
        </Grid>
      </Grid>
    </DialogContent>
  );

  const renderTeamDialog = () => (
    <DialogContent>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Team Abbreviation"
            value={teamForm.team_abbr}
            onChange={(e) =>
              setTeamForm({
                ...teamForm,
                team_abbr: e.target.value,
              })
            }
            disabled={dialogMode === "edit"}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Team Name"
            value={teamForm.team_name}
            onChange={(e) =>
              setTeamForm({
                ...teamForm,
                team_name: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Conference</InputLabel>
            <Select
              value={teamForm.team_conf}
              label="Conference"
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  team_conf: e.target.value,
                })
              }
            >
              <MenuItem value="AFC">AFC</MenuItem>
              <MenuItem value="NFC">NFC</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Division</InputLabel>
            <Select
              value={teamForm.team_division}
              label="Division"
              onChange={(e) =>
                setTeamForm({
                  ...teamForm,
                  team_division: e.target.value,
                })
              }
            >
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="East">East</MenuItem>
              <MenuItem value="West">West</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Team Color"
            value={teamForm.team_color}
            onChange={(e) =>
              setTeamForm({
                ...teamForm,
                team_color: e.target.value,
              })
            }
          />
        </Grid>
      </Grid>
    </DialogContent>
  );

  const renderGameDialog = () => (
    <DialogContent>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Game ID"
            value={gameForm.game_id}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                game_id: e.target.value,
              })
            }
            disabled={dialogMode === "edit"}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Season"
            type="number"
            value={gameForm.season}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                season: parseInt(e.target.value),
              })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Week"
            type="number"
            value={gameForm.week}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                week: parseInt(e.target.value),
              })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Away Team"
            value={gameForm.away_team}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                away_team: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Home Team"
            value={gameForm.home_team}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                home_team: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Away Score"
            type="number"
            value={gameForm.away_score}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                away_score: parseInt(e.target.value),
              })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Home Score"
            type="number"
            value={gameForm.home_score}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                home_score: parseInt(e.target.value),
              })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Game Date"
            type="date"
            value={gameForm.gameday}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                gameday: e.target.value,
              })
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Stadium"
            value={gameForm.stadium}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                stadium: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location"
            value={gameForm.location}
            onChange={(e) =>
              setGameForm({
                ...gameForm,
                location: e.target.value,
              })
            }
          />
        </Grid>
      </Grid>
    </DialogContent>
  );

  // Players already filtered server-side (including name search)
  const filteredPlayers = players;

  const filteredTeams = teams.filter((team) => {
    const nameMatch =
      !teamSearch.name ||
      team.team_name.toLowerCase().includes(teamSearch.name.toLowerCase()) ||
      team.team_abbr.toLowerCase().includes(teamSearch.name.toLowerCase());
    const confMatch =
      !teamSearch.conference || team.team_conf === teamSearch.conference;
    const divMatch =
      !teamSearch.division || team.team_division === teamSearch.division;
    return nameMatch && confMatch && divMatch;
  });

  const filteredGames = games; // Already filtered server-side

  const handleClearFilters = () => {
    if (tabValue === 0) {
      setPlayerSearch({ name: "", position: "", team: "" });
    } else if (tabValue === 1) {
      setTeamSearch({ name: "", conference: "", division: "" });
    } else if (tabValue === 2) {
      setGameSearch({ season: 2024, week: "", team: "" });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage players, teams, and games
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              setPlayerPage(0);
              setGamePage(0);
            }}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Players" />
            <Tab label="Teams" />
            <Tab label="Games" />
          </Tabs>
        </Box>

        {/* Players Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Player Search */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon /> Search & Filter Players
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Name"
                  value={playerSearch.name}
                  onChange={(e) => {
                    setPlayerSearch({
                      ...playerSearch,
                      name: e.target.value,
                    });
                    setPlayerPage(0); // Reset to first page when searching
                  }}
                  helperText="Searches all players (debounced 500ms)"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={playerSearch.position}
                    label="Position"
                    onChange={(e) => {
                      setPlayerSearch({
                        ...playerSearch,
                        position: e.target.value,
                      });
                      setPlayerPage(0);
                    }}
                  >
                    <MenuItem value="">All Positions</MenuItem>
                    <MenuItem value="QB">QB</MenuItem>
                    <MenuItem value="RB">RB</MenuItem>
                    <MenuItem value="WR">WR</MenuItem>
                    <MenuItem value="TE">TE</MenuItem>
                    <MenuItem value="K">K</MenuItem>
                    <MenuItem value="DEF">DEF</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Team"
                  value={playerSearch.team}
                  onChange={(e) => {
                    setPlayerSearch({
                      ...playerSearch,
                      team: e.target.value,
                    });
                    setPlayerPage(0);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{ height: "40px" }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Showing {playerPage * playerRowsPerPage + 1}-
              {playerPage * playerRowsPerPage + players.length}
              {playerTotal > 0 && ` of ${playerTotal}`} results
              {playerSearch.name && ` for "${playerSearch.name}"`}
              {playerSearch.position && ` | Position: ${playerSearch.position}`}
              {playerSearch.team && ` | Team: ${playerSearch.team}`}
            </Typography>
          </Box>

          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Add Player
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
            {loading && <CircularProgress size={24} />}
            <Chip
              label={`${filteredPlayers.length} results`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No players found. Try adjusting your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow key={player.player_id}>
                      <TableCell>{player.player_id}</TableCell>
                      <TableCell>{player.player_name}</TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell>{player.team}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog("edit", player)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleDelete(player.player_id, "players")
                          }
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination for Players */}
          <TablePagination
            component="div"
            count={playerTotal}
            page={playerPage}
            onPageChange={(e, newPage) => setPlayerPage(newPage)}
            rowsPerPage={playerRowsPerPage}
            onRowsPerPageChange={(e) => {
              setPlayerRowsPerPage(parseInt(e.target.value, 10));
              setPlayerPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100, 200]}
            labelDisplayedRows={({ from, to, count }) =>
              count > 0 ? `${from}-${to} of ${count}` : `${from}-${to}`
            }
          />
        </TabPanel>

        {/* Teams Tab */}
        <TabPanel value={tabValue} index={1}>
          {/* Team Search */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon /> Search & Filter Teams
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by Name or Abbreviation"
                  placeholder="Enter team name or abbr..."
                  value={teamSearch.name}
                  onChange={(e) =>
                    setTeamSearch({
                      ...teamSearch,
                      name: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Conference</InputLabel>
                  <Select
                    value={teamSearch.conference}
                    label="Conference"
                    onChange={(e) =>
                      setTeamSearch({
                        ...teamSearch,
                        conference: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">All Conferences</MenuItem>
                    <MenuItem value="AFC">AFC</MenuItem>
                    <MenuItem value="NFC">NFC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Division</InputLabel>
                  <Select
                    value={teamSearch.division}
                    label="Division"
                    onChange={(e) =>
                      setTeamSearch({
                        ...teamSearch,
                        division: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">All Divisions</MenuItem>
                    <MenuItem value="North">North</MenuItem>
                    <MenuItem value="South">South</MenuItem>
                    <MenuItem value="East">East</MenuItem>
                    <MenuItem value="West">West</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{ height: "40px" }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Showing {filteredTeams.length} of {teams.length} teams
            </Typography>
          </Box>

          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Add Team
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
            {loading && <CircularProgress size={24} />}
            <Chip
              label={`${filteredTeams.length} teams`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Abbreviation</TableCell>
                  <TableCell>Team Name</TableCell>
                  <TableCell>Conference</TableCell>
                  <TableCell>Division</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No teams found. Try adjusting your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeams.map((team) => (
                    <TableRow key={team.team_abbr}>
                      <TableCell>{team.team_abbr}</TableCell>
                      <TableCell>{team.team_name}</TableCell>
                      <TableCell>{team.team_conf}</TableCell>
                      <TableCell>{team.team_division}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog("edit", team)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(team.team_abbr, "teams")}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Games Tab */}
        <TabPanel value={tabValue} index={2}>
          {/* Game Search */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon /> Search & Filter Games
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Season"
                  value={gameSearch.season}
                  onChange={(e) => {
                    setGameSearch({
                      ...gameSearch,
                      season: parseInt(e.target.value) || 2024,
                    });
                    setGamePage(0);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Week"
                  placeholder="All weeks"
                  value={gameSearch.week}
                  onChange={(e) => {
                    setGameSearch({
                      ...gameSearch,
                      week: e.target.value,
                    });
                    setGamePage(0);
                  }}
                  inputProps={{ min: 1, max: 18 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Team (Home or Away)"
                  placeholder="e.g., KC, BAL"
                  value={gameSearch.team}
                  onChange={(e) => {
                    setGameSearch({
                      ...gameSearch,
                      team: e.target.value,
                    });
                    setGamePage(0);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{ height: "40px" }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Showing {filteredGames.length} games
            </Typography>
          </Box>

          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Add Game
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
            {loading && <CircularProgress size={24} />}
            <Chip
              label={`${filteredGames.length} results`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Game ID</TableCell>
                  <TableCell>Week</TableCell>
                  <TableCell>Away Team</TableCell>
                  <TableCell>Home Team</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredGames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No games found. Try adjusting your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGames.map((game) => (
                    <TableRow key={game.game_id}>
                      <TableCell>{game.game_id}</TableCell>
                      <TableCell>{game.week}</TableCell>
                      <TableCell>{game.away_team}</TableCell>
                      <TableCell>{game.home_team}</TableCell>
                      <TableCell>
                        {game.away_score} - {game.home_score}
                      </TableCell>
                      <TableCell>{game.gameday}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog("edit", game)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(game.game_id, "games")}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination for Games */}
          <TablePagination
            component="div"
            count={-1}
            page={gamePage}
            onPageChange={(e, newPage) => setGamePage(newPage)}
            rowsPerPage={gameRowsPerPage}
            onRowsPerPageChange={(e) => {
              setGameRowsPerPage(parseInt(e.target.value, 10));
              setGamePage(0);
            }}
            rowsPerPageOptions={[25, 50, 100, 200]}
            labelDisplayedRows={({ from, to }) => `${from}-${to}`}
          />
        </TabPanel>
      </Card>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Create" : "Edit"}{" "}
          {tabValue === 0 ? "Player" : tabValue === 1 ? "Team" : "Game"}
        </DialogTitle>
        {tabValue === 0 && renderPlayerDialog()}
        {tabValue === 1 && renderTeamDialog()}
        {tabValue === 2 && renderGameDialog()}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admin;
