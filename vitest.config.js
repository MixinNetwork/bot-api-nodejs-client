const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  resolve: {
    alias: {
      axios: require.resolve('axios/dist/node/axios.cjs'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./setup.jest.js', './test/crypto.ts'],
    testTimeout: 15000,
  },
});
