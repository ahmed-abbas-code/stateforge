// scripts/bootstrap-npmrc.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Attempt to load .env if GITHUB_TOKEN not already in env
if (!process.env.GITHUB_TOKEN) {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) throw result.error;
    if (process.env.GITHUB_TOKEN) {
      console.log('🔐 Loaded GITHUB_TOKEN from .env');
    } else {
      console.warn('⚠️ .env file found but GITHUB_TOKEN is missing.');
    }
  } else {
    console.warn('⚠️ No GITHUB_TOKEN set and no .env file found.');
  }
}

// Abort if GITHUB_TOKEN is still not present
if (!process.env.GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN is required to proceed.');
  process.exit(1);
}

const npmrcPath = path.resolve(__dirname, '../.npmrc');
let content = '';

if (fs.existsSync(npmrcPath)) {
  content = fs.readFileSync(npmrcPath, 'utf-8');
}

const authLine = `//npm.pkg.github.com/:_authToken=${process.env.GITHUB_TOKEN}`;

// Replace old auth line or append new one
if (!content.includes(authLine)) {
  content = content.replace(/\/\/npm\.pkg\.github\.com\/:_authToken=.*\n?/g, '');
  content += `\n${authLine}\n`;
  fs.writeFileSync(npmrcPath, content.trim() + '\n');
  console.log('✅ Updated .npmrc with resolved GITHUB_TOKEN');
} else {
  console.log('ℹ️ .npmrc already contains correct token line');
}
