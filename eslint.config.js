const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      camelcase: 'off',
      'no-bitwise': 'off',
      'no-continue': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-redeclare': 'off',
      'no-shadow': 'off',
      'no-undef': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
