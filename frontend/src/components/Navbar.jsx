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
  const [searchResults, setSearchResults] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (inputValue.length > 2) {
        try {
          const results = await searchPlayers(inputValue);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const handlePlayerSelect = (event, value) => {
    if (value && typeof value === "object" && value.player_id) {
      navigate(`/player/${value.player_id}`);
      setInputValue("");
      setSearchResults([]);
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter" && inputValue.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(inputValue)}`);
      setInputValue("");
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
            <Button
              component={Link}
              to="/search"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Search
            </Button>
            <Button
              component={Link}
              to="/queries"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Queries
            </Button>
            <Button
              component={Link}
              to="/admin"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Admin
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0, width: 300 }}>
            <Autocomplete
              freeSolo
              value={null}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              options={
                inputValue.length >= 2 && searchResults.length > 0
                  ? [
                      ...searchResults,
                      {
                        player_id: "view-all",
                        player_name: "View all results...",
                        isAction: true,
                      },
                    ]
                  : searchResults
              }
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.player_name || ""
              }
              onChange={(event, value) => {
                if (value && typeof value === "object" && value.isAction) {
                  navigate(`/search?q=${encodeURIComponent(inputValue)}`);
                  setInputValue("");
                  setSearchResults([]);
                } else if (value && typeof value === "object") {
                  handlePlayerSelect(event, value);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search Players..."
                  variant="outlined"
                  size="small"
                  onKeyPress={handleSearchKeyPress}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.3)",
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
                  {option.isAction ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                        py: 1,
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        color: "primary.main",
                        fontWeight: "bold",
                      }}
                    >
                      <SearchIcon fontSize="small" />
                      <Typography variant="body2">
                        {option.player_name}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant="body1">
                        {option.player_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.position} - {option.team}
                      </Typography>
                    </Box>
                  )}
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
