module.exports = {
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!(axios|is-retry-allowed)).+\\.(js|jsx)$'],
  setupFilesAfterEnv: ['<rootDir>/test/crypto.ts'],
};
