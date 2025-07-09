/* eslint-disable no-undef */

// scripts/release.mjs

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Dynamically import CommonJS log utils
const logUtilsPath = new URL('./lib/log-utils.js', import.meta.url);
const { log, error, success } = await import(logUtilsPath);

// ✅ Dynamically import CommonJS workspace version replacer
const replacePath = new URL('./lib/replace-workspace-versions.js', import.meta.url);
const { replaceWorkspaceVersions } = await import(replacePath);

// ✅ Step 1: Load .env and set up .npmrc
const bootstrapPath = new URL('./bootstrap-npmrc.js', import.meta.url);
await import(bootstrapPath);

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

// ✅ Step 2: Replace workspace:* versions
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
