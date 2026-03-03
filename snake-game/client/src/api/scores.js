import axios from 'axios';

const BASE = '/api/scores';

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
