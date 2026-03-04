'use strict';

const request = require('supertest');
const path = require('path');
const createApp = require('../app');
// @libsql/client is used internally by PrismaLibSql — no need to import createClient directly
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const TEST_DB_PATH = path.join(__dirname, 'test.db');
// @libsql/client accepts relative paths with file: prefix (not absolute)
const TEST_DB_URL = 'file:tests_integration/test.db';

// Import from the SQLite-generated client (built by globalSetup before this file loads)
const { PrismaClient } = require('./generated');

let app;
let prisma;

beforeAll(async () => {
    // PrismaLibSql stores the config and passes it to @libsql/client internally on connect()
    const adapter = new PrismaLibSql({ url: TEST_DB_URL });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();
    app = createApp(prisma);
});

afterAll(async () => {
    if (prisma) await prisma.$disconnect();
});

// Wipe all rows before each test for isolation
beforeEach(async () => {
    await prisma.score.deleteMany();
});

// ---------------------------------------------------------------------------
// Helper: seed a score directly through Prisma (bypasses API validation)
// ---------------------------------------------------------------------------
async function seedScore(data) {
    return prisma.score.create({ data });
}

// ===========================================================================
// POST /api/scores
// ===========================================================================
describe('POST /api/scores', () => {
    test('201 — saves a valid score', async () => {
        const res = await request(app)
            .post('/api/scores')
            .send({ playerName: 'Alice', score: 100, level: 2 });

        expect(res.status).toBe(201);
        expect(res.body.score).toMatchObject({
            playerName: 'Alice',
            score: 100,
            level: 2,
        });
        expect(res.body.score.id).toBeDefined();
    });

    test('201 — persists to database', async () => {
        await request(app)
            .post('/api/scores')
            .send({ playerName: 'Bob', score: 250, level: 3 });

        const rows = await prisma.score.findMany();
        expect(rows).toHaveLength(1);
        expect(rows[0].playerName).toBe('Bob');
        expect(rows[0].score).toBe(250);
    });

    test('400 — rejects playerName shorter than 2 chars', async () => {
        const res = await request(app)
            .post('/api/scores')
            .send({ playerName: 'A', score: 100, level: 1 });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    test('400 — rejects playerName longer than 20 chars', async () => {
        const res = await request(app)
            .post('/api/scores')
            .send({ playerName: 'A'.repeat(21), score: 100, level: 1 });

        expect(res.status).toBe(400);
    });

    test('400 — rejects non-alphanumeric playerName', async () => {
        const res = await request(app)
            .post('/api/scores')
            .send({ playerName: 'badname!', score: 100, level: 1 });

        expect(res.status).toBe(400);
    });

    test('400 — rejects negative score', async () => {
        const res = await request(app)
            .post('/api/scores')
            .send({ playerName: 'Alice', score: -1, level: 1 });

        expect(res.status).toBe(400);
    });

    test('400 — rejects level less than 1', async () => {
        const res = await request(app)
            .post('/api/scores')
            .send({ playerName: 'Alice', score: 100, level: 0 });

        expect(res.status).toBe(400);
    });

    test('400 — rejects missing fields', async () => {
        const res = await request(app)
            .post('/api/scores')
            .send({ playerName: 'Alice' });

        expect(res.status).toBe(400);
    });
});

// ===========================================================================
// GET /api/scores/leaderboard
// ===========================================================================
describe('GET /api/scores/leaderboard', () => {
    test('200 — returns empty leaderboard when no scores', async () => {
        const res = await request(app).get('/api/scores/leaderboard');

        expect(res.status).toBe(200);
        expect(res.body.leaderboard).toEqual([]);
    });

    test('200 — returns scores ordered by score descending', async () => {
        await seedScore({ playerName: 'Low', score: 50, level: 1 });
        await seedScore({ playerName: 'High', score: 500, level: 5 });
        await seedScore({ playerName: 'Mid', score: 200, level: 3 });

        const res = await request(app).get('/api/scores/leaderboard');

        expect(res.status).toBe(200);
        const lb = res.body.leaderboard;
        expect(lb[0].score).toBe(500);
        expect(lb[1].score).toBe(200);
        expect(lb[2].score).toBe(50);
    });

    test('200 — returns at most 10 scores', async () => {
        for (let i = 0; i < 15; i++) {
            await seedScore({ playerName: `Player${i}`, score: i * 10, level: 1 });
        }

        const res = await request(app).get('/api/scores/leaderboard');

        expect(res.status).toBe(200);
        expect(res.body.leaderboard).toHaveLength(10);
    });

    test('200 — each row has required fields', async () => {
        await seedScore({ playerName: 'Charlie', score: 300, level: 4 });

        const res = await request(app).get('/api/scores/leaderboard');
        const entry = res.body.leaderboard[0];

        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('playerName');
        expect(entry).toHaveProperty('score');
        expect(entry).toHaveProperty('level');
        expect(entry).toHaveProperty('createdAt');
    });
});

// ===========================================================================
// GET /api/scores/highscore?player=NAME
// ===========================================================================
describe('GET /api/scores/highscore', () => {
    test('200 — returns 0 highscore for unknown player', async () => {
        const res = await request(app).get('/api/scores/highscore?player=Unknown');

        expect(res.status).toBe(200);
        expect(res.body.highscore).toBe(0);
        expect(res.body.playerName).toBe('Unknown');
    });

    test('200 — returns personal best for a known player', async () => {
        await seedScore({ playerName: 'Dave', score: 100, level: 1 });
        await seedScore({ playerName: 'Dave', score: 450, level: 3 });
        await seedScore({ playerName: 'Dave', score: 200, level: 2 });

        const res = await request(app).get('/api/scores/highscore?player=Dave');

        expect(res.status).toBe(200);
        expect(res.body.highscore).toBe(450);
        expect(res.body.playerName).toBe('Dave');
    });

    test('200 — does not return other players scores', async () => {
        await seedScore({ playerName: 'Eve', score: 999, level: 10 });
        await seedScore({ playerName: 'Frank', score: 10, level: 1 });

        const res = await request(app).get('/api/scores/highscore?player=Frank');

        expect(res.body.highscore).toBe(10);
    });

    test('400 — rejects missing player query param', async () => {
        const res = await request(app).get('/api/scores/highscore');

        expect(res.status).toBe(400);
    });

    test('400 — rejects player name with special chars', async () => {
        const res = await request(app).get('/api/scores/highscore?player=bad123!me');

        expect(res.status).toBe(400);
    });
});

// ===========================================================================
// GET /api/scores/stats
// ===========================================================================
describe('GET /api/scores/stats', () => {
    test('200 — returns zeros when no scores exist', async () => {
        const res = await request(app).get('/api/scores/stats');

        expect(res.status).toBe(200);
        expect(res.body.totalGames).toBe(0);
        expect(res.body.averageScore).toBe(0);
    });

    test('200 — returns correct total game count', async () => {
        await seedScore({ playerName: 'Alice', score: 100, level: 1 });
        await seedScore({ playerName: 'Bob', score: 200, level: 2 });
        await seedScore({ playerName: 'Alice', score: 300, level: 3 });

        const res = await request(app).get('/api/scores/stats');

        expect(res.body.totalGames).toBe(3);
    });

    test('200 — returns correct average score', async () => {
        await seedScore({ playerName: 'Alice', score: 100, level: 1 });
        await seedScore({ playerName: 'Bob', score: 200, level: 2 });
        await seedScore({ playerName: 'Carol', score: 300, level: 3 });

        const res = await request(app).get('/api/scores/stats');

        // (100 + 200 + 300) / 3 = 200
        expect(res.body.averageScore).toBe(200);
    });
});

// ===========================================================================
// DELETE /api/scores/:id
// ===========================================================================
describe('DELETE /api/scores/:id', () => {
    test('200 — deletes an existing score', async () => {
        const created = await seedScore({ playerName: 'ToDelete', score: 50, level: 1 });

        const res = await request(app).delete(`/api/scores/${created.id}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain(`${created.id}`);

        const remaining = await prisma.score.findUnique({ where: { id: created.id } });
        expect(remaining).toBeNull();
    });

    test('404 — returns 404 for a non-existent id', async () => {
        const res = await request(app).delete('/api/scores/99999');

        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    test('400 — rejects a non-integer id', async () => {
        const res = await request(app).delete('/api/scores/abc');

        expect(res.status).toBe(400);
    });

    test('200 — does not affect other scores when deleting one', async () => {
        const a = await seedScore({ playerName: 'KeepA', score: 100, level: 1 });
        const b = await seedScore({ playerName: 'KeepB', score: 200, level: 2 });
        const del = await seedScore({ playerName: 'RemoveMe', score: 300, level: 3 });

        await request(app).delete(`/api/scores/${del.id}`);

        const remaining = await prisma.score.findMany();
        const ids = remaining.map(r => r.id);
        expect(ids).toContain(a.id);
        expect(ids).toContain(b.id);
        expect(ids).not.toContain(del.id);
    });
});

// ===========================================================================
// GET /health (sanity check)
// ===========================================================================
describe('GET /health', () => {
    test('200 — returns OK status', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.timestamp).toBeDefined();
    });
});

// ===========================================================================
// 404 handler
// ===========================================================================
describe('Unknown route', () => {
    test('404 — returns error for unknown path', async () => {
        const res = await request(app).get('/api/nonexistent');

        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });
});
