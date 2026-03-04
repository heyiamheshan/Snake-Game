'use strict';

const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, 'test.db');

module.exports = async function globalTeardown() {
    if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
        console.log('\n🧹 Cleaned up test.db');
    }
};
