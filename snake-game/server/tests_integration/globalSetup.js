'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, 'test.db');
const SERVER_ROOT = path.join(__dirname, '..');

module.exports = async function globalSetup() {
    // Clean up any previous test DB
    if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
    }

    const env = {
        ...process.env,
        NODE_ENV: 'test',
        DATABASE_URL: `file:${TEST_DB_PATH}`,
        NODE_TLS_REJECT_UNAUTHORIZED: '0',
    };

    console.log('\n🔧 Generating SQLite Prisma client...');
    execSync(
        'npx prisma generate --schema prisma/schema.sqlite.prisma',
        { cwd: SERVER_ROOT, env, stdio: 'inherit' }
    );

    console.log('🗄️  Pushing schema to SQLite test database...');
    // Use --url to override the datasource URL (Prisma v7 supports this flag on db push)
    execSync(
        `npx prisma db push --schema prisma/schema.sqlite.prisma --url "file:${TEST_DB_PATH}"`,
        { cwd: SERVER_ROOT, env, stdio: 'inherit' }
    );

    console.log('✅ Test database ready\n');
};
