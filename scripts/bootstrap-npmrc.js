// scripts/bootstrap-npmrc.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if needed
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

// Abort if token still missing
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

// Replace or inject token line
if (!content.includes(authLine)) {
  content = content.replace(/\/\/npm\.pkg\.github\.com\/:_authToken=.*\n?/g, '');
  content += `\n${authLine}\n`;
  fs.writeFileSync(npmrcPath, content.trim() + '\n');
  console.log('✅ Updated .npmrc with resolved GITHUB_TOKEN');
} else {
  console.log('ℹ️ .npmrc already contains correct token line');
}
