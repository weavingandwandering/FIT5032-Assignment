require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    node: true,           // Ensures Node.js globals are available
    es6: true             // Allows ES6+ features (e.g., `let`, `const`)
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest',  // Enables modern JavaScript features
    sourceType: 'module'    // Ensures ES modules are supported
  },
  rules: {
    // You can add or adjust rules here as needed
  }
};