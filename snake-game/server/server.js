require('dotenv').config();
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const createApp = require('./app');

// Prisma v7 requires a driver adapter for PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = createApp(prisma);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🐍 Snake Game Server running on http://localhost:${PORT}`);
});

module.exports = app;
