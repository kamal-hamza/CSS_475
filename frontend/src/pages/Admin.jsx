import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
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

const Admin = () => {
    const [tabValue, setTabValue] = useState(0);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [games, setGames] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("create");
    const [currentEntity, setCurrentEntity] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Form states
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

    useEffect(() => {
        fetchData();
    }, [tabValue]);

    const fetchData = async () => {
        try {
            if (tabValue === 0) {
                const response = await api.get("/players?limit=100");
                setPlayers(response.data);
            } else if (tabValue === 1) {
                const response = await api.get("/teams");
                setTeams(response.data);
            } else if (tabValue === 2) {
                const response = await api.get("/games?season=2024");
                setGames(response.data);
            }
        } catch (error) {
            showSnackbar("Error fetching data", "error");
        }
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

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
            await api.delete(`/${endpoint}/${id}`);
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
                await api.post(`/${endpoint}`, data);
                showSnackbar("Item created successfully");
            } else {
                const id =
                    tabValue === 0
                        ? data.player_id
                        : tabValue === 1
                        ? data.team_abbr
                        : data.game_id;
                await api.put(`/${endpoint}/${id}`, data);
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
                            setPlayerForm({ ...playerForm, team: e.target.value })
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
                            setTeamForm({ ...teamForm, team_abbr: e.target.value })
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
                            setTeamForm({ ...teamForm, team_name: e.target.value })
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
                            setTeamForm({ ...teamForm, team_color: e.target.value })
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
                            setGameForm({ ...gameForm, game_id: e.target.value })
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
                            setGameForm({ ...gameForm, season: parseInt(e.target.value) })
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
                            setGameForm({ ...gameForm, week: parseInt(e.target.value) })
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Away Team"
                        value={gameForm.away_team}
                        onChange={(e) =>
                            setGameForm({ ...gameForm, away_team: e.target.value })
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Home Team"
                        value={gameForm.home_team}
                        onChange={(e) =>
                            setGameForm({ ...gameForm, home_team: e.target.value })
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
                            setGameForm({ ...gameForm, gameday: e.target.value })
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
                            setGameForm({ ...gameForm, stadium: e.target.value })
                        }
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Location"
                        value={gameForm.location}
                        onChange={(e) =>
                            setGameForm({ ...gameForm, location: e.target.value })
                        }
                    />
                </Grid>
            </Grid>
        </DialogContent>
    );

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
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
                        onChange={(e, newValue) => setTabValue(newValue)}
                        aria-label="admin tabs"
                    >
                        <Tab label="Players" />
                        <Tab label="Teams" />
                        <Tab label="Games" />
                    </Tabs>
                </Box>

                {/* Players Tab */}
                <TabPanel value={tabValue} index={0}>
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
                        >
                            Refresh
                        </Button>
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
                                {players.map((player) => (
                                    <TableRow key={player.player_id}>
                                        <TableCell>{player.player_id}</TableCell>
                                        <TableCell>{player.player_name}</TableCell>
                                        <TableCell>{player.position}</TableCell>
                                        <TableCell>{player.team}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() =>
                                                    handleOpenDialog("edit", player)
                                                }
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() =>
                                                    handleDelete(
                                                        player.player_id,
                                                        "players"
                                                    )
                                                }
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Teams Tab */}
                <TabPanel value={tabValue} index={1}>
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
                        >
                            Refresh
                        </Button>
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
                                {teams.map((team) => (
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
                                                onClick={() =>
                                                    handleDelete(team.team_abbr, "teams")
                                                }
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Games Tab */}
                <TabPanel value={tabValue} index={2}>
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
                        >
                            Refresh
                        </Button>
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
                                {games.map((game) => (
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
                                                onClick={() =>
                                                    handleDelete(game.game_id, "games")
                                                }
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
