/* eslint-disable no-undef */

// scripts/bootstrap-npmrc.js

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { log, error, success } = await import('./lib/log-utils.js').then(m => m.default || m);

// Load .env if GITHUB_TOKEN is not already set
if (!process.env.GITHUB_TOKEN) {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) throw result.error;

    if (process.env.GITHUB_TOKEN) {
      success('Loaded GITHUB_TOKEN from .env');
    } else {
      error('.env loaded but GITHUB_TOKEN is still missing');
    }
  } else {
    error('No .env file found and GITHUB_TOKEN is not set');
  }
}

// Abort if token is still missing
if (!process.env.GITHUB_TOKEN) {
  error('GITHUB_TOKEN is required to proceed. Aborting.');
  process.exit(1);
}

// Determine registry
const registry = process.env.NPM_REGISTRY || 'npm.pkg.github.com';
const npmrcPath = path.resolve(__dirname, '../.npmrc');
const authLine = `//${registry}/:_authToken=${process.env.GITHUB_TOKEN}`;

// Read and update .npmrc
let content = '';
if (fs.existsSync(npmrcPath)) {
  content = fs.readFileSync(npmrcPath, 'utf-8');
  content = content.replace(/\/\/.*npm\.pkg\.github\.com\/:_authToken=.*\n?/g, '');
}

// Append only if needed
if (!content.includes(authLine)) {
  content += `\n${authLine}\n`;
  fs.writeFileSync(npmrcPath, content.trim() + '\n');
  success(`.npmrc updated with token for ${registry}`);
} else {
  log('.npmrc already contains the correct token line');
}
