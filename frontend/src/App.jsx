import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import Players from "./pages/Players";
import Teams from "./pages/Teams";
import Games from "./pages/Games";
import PlayerProfile from "./pages/PlayerProfile";
import Admin from "./pages/Admin";
import Queries from "./pages/Queries";
import Search from "./pages/Search";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/players" element={<Players />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/games" element={<Games />} />
              <Route path="/search" element={<Search />} />
              <Route path="/player/:id" element={<PlayerProfile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/queries" element={<Queries />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
