module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    "jest/globals": true,
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  rules: {
    'no-bitwise': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    camelcase: 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'no-shadow': 'off',
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": ["error"],

    "semi": "off",
    "@typescript-eslint/semi": ["error"],

    // todo remove
    // 'no-redeclare': 'off',
    'no-use-before-define': 'off',
    'no-param-reassign': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
