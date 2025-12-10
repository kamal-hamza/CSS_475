import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Container,
    Box,
    TextField,
    Grid,
    Card,
    CardContent,
    Typography,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    CircularProgress,
    Chip,
    Avatar,
    IconButton,
    Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import PageHeader from "../components/PageHeader";
import { searchPlayersPaginated, getTeams } from "../services/api";

const Search = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [position, setPosition] = useState(
        searchParams.get("position") || "",
    );
    const [team, setTeam] = useState(searchParams.get("team") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "name");
    const [sortOrder, setSortOrder] = useState(
        searchParams.get("sort_order") || "asc",
    );
    const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
    const [perPage] = useState(20);

    const [players, setPlayers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);

    // Available positions (you could also fetch this from the API)
    const positions = ["QB", "RB", "WR", "TE", "K", "DEF"];

    // Fetch teams on mount
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teamsData = await getTeams();
                setTeams(teamsData);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };
        fetchTeams();
    }, []);

    // Search players when filters change
    useEffect(() => {
        const fetchPlayers = async () => {
            setLoading(true);
            try {
                const params = {
                    q: searchQuery,
                    position,
                    team,
                    page,
                    per_page: perPage,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                };

                // Update URL params
                const newParams = {};
                if (searchQuery) newParams.q = searchQuery;
                if (position) newParams.position = position;
                if (team) newParams.team = team;
                if (page > 1) newParams.page = page;
                if (sortBy !== "name") newParams.sort_by = sortBy;
                if (sortOrder !== "asc") newParams.sort_order = sortOrder;
                setSearchParams(newParams);

                const data = await searchPlayersPaginated(params);
                setPlayers(data.players);
                setPagination(data.pagination);
            } catch (error) {
                console.error("Error searching players:", error);
                setPlayers([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        };

        // Only search if there's a query or filters applied
        if (searchQuery.length >= 2 || position || team) {
            fetchPlayers();
        } else {
            setPlayers([]);
            setPagination(null);
        }
    }, [searchQuery, position, team, page, perPage, sortBy, sortOrder]);

    const handleClearFilters = () => {
        setSearchQuery("");
        setPosition("");
        setTeam("");
        setSortBy("name");
        setSortOrder("asc");
        setPage(1);
        setSearchParams({});
    };

    const handlePlayerClick = (playerId) => {
        navigate(`/player/${playerId}`);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const activeFiltersCount = [searchQuery, position, team].filter(
        Boolean,
    ).length;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <PageHeader
                title="Search Players"
                subtitle="Find NFL players by name, position, or team"
                icon={<SearchIcon />}
            />

            {/* Search and Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: "#131B2F",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 4,
                }}
            >
                <Grid container spacing={2}>
                    {/* Search Input */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search by player name..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon
                                            sx={{ color: "text.secondary" }}
                                        />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setPage(1);
                                            }}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "rgba(255,255,255,0.02)",
                                },
                            }}
                        />
                    </Grid>

                    {/* Position Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel id="position-label">
                                Position
                            </InputLabel>
                            <Select
                                labelId="position-label"
                                id="position-select"
                                value={position}
                                label="Position"
                                onChange={(e) => {
                                    setPosition(e.target.value);
                                    setPage(1);
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(255,255,255,0.02)",
                                    },
                                }}
                            >
                                <MenuItem value="">All Positions</MenuItem>
                                {positions.map((pos) => (
                                    <MenuItem key={pos} value={pos}>
                                        {pos}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Team Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel id="team-label">Team</InputLabel>
                            <Select
                                labelId="team-label"
                                id="team-select"
                                value={team}
                                label="Team"
                                onChange={(e) => {
                                    setTeam(e.target.value);
                                    setPage(1);
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(255,255,255,0.02)",
                                    },
                                }}
                            >
                                <MenuItem value="">All Teams</MenuItem>
                                {teams.map((t) => (
                                    <MenuItem
                                        key={t.team_abbr}
                                        value={t.team_abbr}
                                    >
                                        {t.team_abbr} - {t.team_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Sort By */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel id="sortby-label">Sort By</InputLabel>
                            <Select
                                labelId="sortby-label"
                                id="sortby-select"
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(255,255,255,0.02)",
                                    },
                                }}
                            >
                                <MenuItem value="name">Name</MenuItem>
                                <MenuItem value="position">Position</MenuItem>
                                <MenuItem value="team">Team</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Sort Order */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel id="order-label">Order</InputLabel>
                            <Select
                                labelId="order-label"
                                id="order-select"
                                value={sortOrder}
                                label="Order"
                                onChange={(e) => setSortOrder(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(255,255,255,0.02)",
                                    },
                                }}
                            >
                                <MenuItem value="asc">A → Z</MenuItem>
                                <MenuItem value="desc">Z → A</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Active Filters & Clear */}
                {activeFiltersCount > 0 && (
                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            <FilterListIcon
                                sx={{
                                    fontSize: 16,
                                    verticalAlign: "middle",
                                    mr: 0.5,
                                }}
                            />
                            Active filters:
                        </Typography>
                        {searchQuery && (
                            <Chip
                                size="small"
                                label={`Query: "${searchQuery}"`}
                                onDelete={() => {
                                    setSearchQuery("");
                                    setPage(1);
                                }}
                            />
                        )}
                        {position && (
                            <Chip
                                size="small"
                                label={`Position: ${position}`}
                                onDelete={() => {
                                    setPosition("");
                                    setPage(1);
                                }}
                            />
                        )}
                        {team && (
                            <Chip
                                size="small"
                                label={`Team: ${team}`}
                                onDelete={() => {
                                    setTeam("");
                                    setPage(1);
                                }}
                            />
                        )}
                        <Chip
                            size="small"
                            label="Clear All"
                            onClick={handleClearFilters}
                            color="error"
                            variant="outlined"
                        />
                    </Box>
                )}
            </Paper>

            {/* Results */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : players.length > 0 ? (
                <>
                    {/* Results Header */}
                    <Box
                        sx={{
                            mb: 3,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {(page - 1) * perPage + 1} -{" "}
                            {Math.min(page * perPage, pagination?.total || 0)}{" "}
                            of {pagination?.total || 0} players
                        </Typography>
                        {pagination && pagination.pages > 1 && (
                            <Pagination
                                count={pagination.pages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        )}
                    </Box>

                    {/* Player Cards */}
                    <Grid container spacing={2}>
                        {players.map((player) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={player.player_id}
                            >
                                <Card
                                    elevation={0}
                                    sx={{
                                        bgcolor: "#131B2F",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                            transform: "translateY(-2px)",
                                            boxShadow:
                                                "0 8px 16px rgba(59, 130, 246, 0.2)",
                                        },
                                    }}
                                    onClick={() =>
                                        handlePlayerClick(player.player_id)
                                    }
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                mb: 2,
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor: "primary.main",
                                                    width: 48,
                                                    height: 48,
                                                }}
                                            >
                                                <PersonIcon />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    noWrap
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {player.player_name}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        mt: 0.5,
                                                    }}
                                                >
                                                    <Chip
                                                        label={player.position}
                                                        size="small"
                                                        color="primary"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: "0.7rem",
                                                        }}
                                                    />
                                                    <Chip
                                                        label={player.team}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: "0.7rem",
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Bottom Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <Box
                            sx={{
                                mt: 4,
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Pagination
                                count={pagination.pages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 8,
                        textAlign: "center",
                        bgcolor: "#131B2F",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 4,
                    }}
                >
                    <SearchIcon
                        sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                    >
                        {searchQuery.length < 2 && !position && !team
                            ? "Enter a search term or select filters to find players"
                            : "No players found"}
                    </Typography>
                    {(searchQuery.length >= 2 || position || team) && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Try adjusting your search or filters
                        </Typography>
                    )}
                </Paper>
            )}
        </Container>
    );
};

export default Search;
