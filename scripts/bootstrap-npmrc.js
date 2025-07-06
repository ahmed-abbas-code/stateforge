/* eslint-disable no-undef */
// scripts/bootstrap-npmrc.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { log, error, success } from './lib/log-utils.js';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if GITHUB_TOKEN is not already set
if (!process.env.GITHUB_TOKEN) {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) throw result.error;

    if (process.env.GITHUB_TOKEN) {
      success('Loaded GITHUB_TOKEN from .env');
    } else {
      log('.env file found but GITHUB_TOKEN is missing');
    }
  } else {
    log('No .env file found and GITHUB_TOKEN not set');
  }
}

// Abort if token still missing
if (!process.env.GITHUB_TOKEN) {
  error('GITHUB_TOKEN is required to proceed');
  process.exit(1);
}

// Registry and scope config
const registry = process.env.NPM_REGISTRY || 'npm.pkg.github.com';
const npmrcPath = path.resolve(__dirname, '../.npmrc');
const authLine = `//${registry}/:_authToken=${process.env.GITHUB_TOKEN}`;

// Read and update .npmrc content
let content = '';
if (fs.existsSync(npmrcPath)) {
  content = fs.readFileSync(npmrcPath, 'utf-8');
  content = content.replace(/\/\/.*npm\.pkg\.github\.com\/:_authToken=.*\n?/g, '');
}

if (!content.includes(authLine)) {
  content += `\n${authLine}\n`;
  fs.writeFileSync(npmrcPath, content.trim() + '\n');
  success(`Updated .npmrc with token for ${registry}`);
} else {
  log('.npmrc already contains correct token line');
}
