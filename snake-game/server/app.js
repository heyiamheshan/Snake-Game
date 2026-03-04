const express = require('express');
const cors = require('cors');
const createScoresRouter = require('./routes/scores');

/**
 * Creates and returns the configured Express app.
 * Accepts a Prisma client instance to enable dependency injection for testing.
 */
function createApp(prisma) {
    const app = express();

    // Middleware
    // In Docker, the frontend nginx proxy adds the right host header so
    // browser requests arrive from the public origin the user types.
    // CORS_ORIGIN env var can override; defaults cover local dev + Docker.
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'];
    app.use(cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'DELETE'],
        credentials: true,
    }));
    app.use(express.json());

    // Routes
    app.use('/api/scores', createScoresRouter(prisma));

    // Health check
    app.get('/health', (req, res) =>
        res.json({ status: 'OK', timestamp: new Date().toISOString() })
    );

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error('Error:', err.message);
        res.status(err.status || 500).json({
            error: err.message || 'Internal Server Error',
        });
    });

    return app;
}

module.exports = createApp;
