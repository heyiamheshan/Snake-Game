const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware helper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// POST /api/scores — Save a new score
router.post(
    '/',
    [
        body('playerName')
            .trim()
            .isLength({ min: 2, max: 20 }).withMessage('playerName must be 2–20 characters')
            .matches(/^[a-zA-Z0-9]+$/).withMessage('playerName must be alphanumeric only'),
        body('score')
            .isInt({ min: 0 }).withMessage('score must be a non-negative integer'),
        body('level')
            .isInt({ min: 1 }).withMessage('level must be an integer >= 1'),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { playerName, score, level } = req.body;
            const newScore = await prisma.score.create({
                data: { playerName, score: parseInt(score), level: parseInt(level) },
            });
            res.status(201).json({ message: 'Score saved successfully', score: newScore });
        } catch (err) {
            next(err);
        }
    }
);

// GET /api/scores/leaderboard — Top 10 all-time scores
router.get('/leaderboard', async (req, res, next) => {
    try {
        const scores = await prisma.score.findMany({
            orderBy: { score: 'desc' },
            take: 10,
            select: {
                id: true,
                playerName: true,
                score: true,
                level: true,
                createdAt: true,
            },
        });
        res.json({ leaderboard: scores });
    } catch (err) {
        next(err);
    }
});

// GET /api/scores/stats — Total games played, average score
router.get('/stats', async (req, res, next) => {
    try {
        const totalGames = await prisma.score.count();
        const avgScoreResult = await prisma.score.aggregate({
            _avg: { score: true },
        });
        res.json({
            totalGames,
            averageScore: Math.round(avgScoreResult._avg.score || 0),
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/scores/highscore?player=NAME — Player's personal best
router.get(
    '/highscore',
    [
        query('player')
            .trim()
            .isLength({ min: 2, max: 20 }).withMessage('player must be 2–20 characters')
            .matches(/^[a-zA-Z0-9]+$/).withMessage('player must be alphanumeric only'),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { player } = req.query;
            const highscore = await prisma.score.findFirst({
                where: { playerName: player },
                orderBy: { score: 'desc' },
            });
            if (!highscore) {
                return res.json({ playerName: player, highscore: 0, level: 0 });
            }
            res.json({
                playerName: highscore.playerName,
                highscore: highscore.score,
                level: highscore.level,
                date: highscore.createdAt,
            });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE /api/scores/:id — Admin: delete a score
router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    ],
    validate,
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const existing = await prisma.score.findUnique({ where: { id } });
            if (!existing) {
                return res.status(404).json({ error: `Score with id ${id} not found` });
            }
            await prisma.score.delete({ where: { id } });
            res.json({ message: `Score ${id} deleted successfully` });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
