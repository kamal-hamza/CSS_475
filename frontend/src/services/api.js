import axios from "axios";

const API_URL = "http://localhost:5002/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getTeams = async () => {
    const response = await api.get("/teams");
    return response.data;
};

export const getTeamStats = async (season = 2024) => {
    const response = await api.get("/teams/stats", { params: { season } });
    return response.data;
};

export const getTopPlayers = async (params) => {
    const response = await api.get("/stats/top-players", { params });
    return response.data;
};

export const searchPlayers = async (query) => {
    const response = await api.get("/search", { params: { q: query } });
    return response.data;
};

export const getPlayerStats = async (playerId, season = 2024) => {
    const response = await api.get(`/stats/player/${playerId}`, {
        params: { season },
    });
    return response.data;
};

export const getPlayerDetails = async (playerId) => {
    const response = await api.get(`/stats/player-details/${playerId}`);
    return response.data;
};

export const comparePlayers = async (playerIds, season = 2024) => {
    const params = new URLSearchParams();
    playerIds.forEach((id) => params.append("player_ids", id));
    params.append("season", season);

    const response = await api.get("/stats/compare", { params });
    return response.data;
};

export const getGames = async (params) => {
    const response = await api.get("/games", { params });
    return response.data;
};

export const getCoaches = async () => {
    const response = await api.get("/coaches");
    return response.data;
};

export const getReferees = async () => {
    const response = await api.get("/referees");
    return response.data;
};

export const getStadiums = async () => {
    const response = await api.get("/stadiums");
    return response.data;
};

export default api;
