import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    Autocomplete,
    TextField,
    InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import { searchPlayers } from "../services/api";

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                try {
                    const results = await searchPlayers(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search error:", error);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handlePlayerSelect = (event, value) => {
        if (value) {
            navigate(`/ player / ${value.player_id} `);
            setSearchQuery("");
            setSearchResults([]);
        }
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <SportsFootballIcon
                        sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
                    />
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        to="/"
                        sx={{
                            mr: 2,
                            display: { xs: "none", md: "flex" },
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: ".3rem",
                            color: "inherit",
                            textDecoration: "none",
                        }}
                    >
                        NFL STATS
                    </Typography>

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: { xs: "none", md: "flex" },
                        }}
                    >
                        <Button
                            component={Link}
                            to="/players"
                            sx={{ my: 2, color: "white", display: "block" }}
                        >
                            Players
                        </Button>
                        <Button
                            component={Link}
                            to="/teams"
                            sx={{ my: 2, color: "white", display: "block" }}
                        >
                            Teams
                        </Button>
                        <Button
                            component={Link}
                            to="/games"
                            sx={{ my: 2, color: "white", display: "block" }}
                        >
                            Games
                        </Button>
                    </Box>

                    <Box sx={{ flexGrow: 0, width: 300 }}>
                        <Autocomplete
                            freeSolo
                            options={searchResults}
                            getOptionLabel={(option) =>
                                option.player_name || ""
                            }
                            onChange={handlePlayerSelect}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search Players..."
                                    variant="outlined"
                                    size="small"
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    sx={{
                                        backgroundColor:
                                            "rgba(255,255,255,0.1)",
                                        borderRadius: 1,
                                        "& .MuiOutlinedInput-root": {
                                            color: "white",
                                            "& fieldset": {
                                                borderColor: "transparent",
                                            },
                                            "&:hover fieldset": {
                                                borderColor:
                                                    "rgba(255,255,255,0.3)",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "white",
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.player_id}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <Typography variant="body1">
                                            {option.player_name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {option.position} - {option.team}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                        />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
