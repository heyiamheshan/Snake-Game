import axios from 'axios';

// In production (Render), VITE_API_URL is the full backend URL e.g. https://snake-backend.onrender.com
// In local dev it is empty and Vite's dev proxy routes /api → localhost:5000
const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/scores`;


export const api = {
    saveScore: (playerName, score, level) =>
        axios.post(BASE, { playerName, score, level }),

    getLeaderboard: () =>
        axios.get(`${BASE}/leaderboard`),

    getHighscore: (player) =>
        axios.get(`${BASE}/highscore?player=${encodeURIComponent(player)}`),

    getStats: () =>
        axios.get(`${BASE}/stats`),

    deleteScore: (id) =>
        axios.delete(`${BASE}/${id}`),
};
