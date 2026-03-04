# 🐍 Snake Arcade — Full-Stack Snake Game

A retro arcade-style Snake game with a React frontend, Node.js/Express backend, and PostgreSQL database.

## Project Structure

```
snake-game/
├── client/                   # React + Vite + Tailwind CSS
│   └── src/
│       ├── api/scores.js     # Axios API client
│       ├── components/
│       │   ├── GameBoard.jsx # Canvas rendering (snake, food, grid, overlays)
│       │   ├── ScorePanel.jsx
│       │   ├── Leaderboard.jsx
│       │   ├── NameInput.jsx
│       │   └── Controls.jsx  # Keyboard hints + D-pad
│       ├── hooks/
│       │   └── gameReducer.js # useReducer game logic
│       ├── App.jsx           # Game loop, keyboard, API integration
│       └── index.css         # Arcade theme + all animations
└── server/                   # Node.js + Express + Prisma
    ├── routes/scores.js      # 5 REST endpoints
    ├── prisma/
    │   ├── schema.prisma     # Score model
    │   └── seed.js           # 5 sample scores
    ├── prisma.config.ts      # Prisma v7 config (DATABASE_URL)
    ├── server.js             # Express app
    └── .env                  # Set your DATABASE_URL here
```

## Prerequisites

- Node.js 18+
- PostgreSQL running locally

## Setup

### 1. Configure Database

Edit `server/.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/snakegame?schema=public"
```

### 2. Run Migrations & Seed

```bash
cd server
npx prisma migrate dev --name init
node prisma/seed.js
```

### 3. Start Backend

```bash
cd server
npm start
# → http://localhost:5000
```

### 4. Start Frontend

```bash
cd client
npm run dev
# → http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scores` | Save a new score |
| `GET` | `/api/scores/leaderboard` | Top 10 all-time |
| `GET` | `/api/scores/highscore?player=NAME` | Personal best |
| `GET` | `/api/scores/stats` | Total games & avg score |
| `DELETE` | `/api/scores/:id` | Delete a score |

## Controls

| Key | Action |
|-----|--------|
| `↑ ↓ ← →` or `W A S D` | Move snake |
| `P` | Pause / Resume |
| D-Pad | Mobile touch controls |

## Features

- 🎮 Smooth 150ms tick rate, speeds up every 5 foods eaten
- 🏆 Leaderboard with top 10 scores from PostgreSQL
- 🥇 Personal best tracking per player name
- 💀 Death shake animation + game over overlay
- ✨ Neon green glow on snake head (canvas `shadowBlur`)
- 🌈 Animated gradient border around canvas
- 📺 Retro CRT scanline overlay effect
- 📱 Mobile D-pad touch controls
- 🏅 Golden high score celebration animation
