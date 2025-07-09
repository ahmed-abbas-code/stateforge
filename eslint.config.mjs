// eslint.config.mjs

import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,

  // ✅ Server-side & shared constants config
  {
    files: [
      'packages/**/server/**/*.{ts,tsx}',
      'packages/**/shared/**/*.{ts,tsx}',
      'src/**/server/**/*.{ts,tsx}',
      'src/**/shared/**/*.{ts,tsx}',
    ],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // ✅ Client-side config (React/Browser)
  {
    files: [
      'packages/**/client/**/*.{ts,tsx}',
      'packages/**/components/**/*.{ts,tsx}',
      'apps/**/pages/**/*.{ts,tsx}',
      'src/**/*.{ts,tsx}', // includes fetchAppApi.ts
    ],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        fetch: 'readonly',
        window: 'readonly',
        localStorage: 'readonly', 
        sessionStorage: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        RequestInit: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'no-dupe-class-members': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
];
