'use strict';

/** @type {import('jest').Config} */
module.exports = {
    // Run tests in this directory
    testMatch: ['<rootDir>/**/*.test.js'],
    rootDir: __dirname,

    // Use Node test environment
    testEnvironment: 'node',

    // Global setup and teardown (runs once per test suite)
    globalSetup: '<rootDir>/globalSetup.js',
    globalTeardown: '<rootDir>/globalTeardown.js',

    // Timeout for slow DB operations
    testTimeout: 30000,

    // Run tests serially to avoid DB race conditions
    maxWorkers: 1,
};
