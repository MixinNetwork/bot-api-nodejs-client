module.exports = {
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!(axios|is-retry-allowed)).+\\.(js|jsx)$'],
  testTimeout: 1000 * 30,
};
