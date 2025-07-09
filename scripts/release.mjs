/* eslint-disable no-undef */

// scripts/release.mjs

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { log, error, success } from './lib/log-utils.mjs';

// ✅ Import CommonJS module safely in ESM
import pkg from './lib/replace-workspace-versions.js';
const { replaceWorkspaceVersions } = pkg;

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Step 1: Ensure GITHUB_TOKEN and .npmrc are configured
await import(path.resolve(__dirname, './bootstrap-npmrc.js'));

const versionType = process.argv[2];

if (!['patch', 'minor', 'major'].includes(versionType)) {
  error('Usage: node scripts/release.mjs [patch|minor|major]');
  process.exit(1);
}

const rootPath = path.resolve(__dirname, '..');
const pkgPath = path.join(rootPath, 'package.json');

if (!fs.existsSync(pkgPath)) {
  error('package.json not found in project root.');
  process.exit(1);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Step 2: Replace any "workspace:*" versions
const replaced = replaceWorkspaceVersions(pkgJson, console);
if (replaced) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
  log('📦 Updated package.json with pinned workspace versions.');
}

try {
  log(`🔖 Bumping version: ${versionType}`);
  execSync(`npm version ${versionType}`, { cwd: rootPath, stdio: 'inherit' });

  log('🏗️ Building package...');
  execSync('pnpm build', { cwd: rootPath, stdio: 'inherit' });

  log('🚀 Publishing to GitHub npm registry...');
  execSync(
    'npm publish --access=public --registry=https://npm.pkg.github.com',
    { cwd: rootPath, stdio: 'inherit' }
  );

  success('Package published successfully.');
} catch (err) {
  error(`Publish failed: ${err?.message || err}`);
  process.exit(1);
}
