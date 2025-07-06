// scripts/release.mjs

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { log, error, success } from '../lib/log-utils.js';
import { replaceWorkspaceVersions } from '../lib/replace-workspace-versions.js';

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Step 1: Ensure GITHUB_TOKEN exists and .npmrc is bootstrapped
await import(path.resolve(__dirname, './bootstrap-npmrc.js'));

const versionType = process.argv[2];
if (!['patch', 'minor', 'major'].includes(versionType)) {
  error('Usage: node scripts/release.mjs [patch|minor|major]');
  process.exit(1);
}

const rootPath = path.resolve(__dirname, '..');
const pkgPath = path.join(rootPath, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Replace any "workspace:*" versions with pinned versions
if (replaceWorkspaceVersions(pkg, console)) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  log('Updated package.json with non-workspace versions.');
}

try {
  // Bump version
  execSync(`npm version ${versionType}`, { cwd: rootPath, stdio: 'inherit' });

  // Build the dist
  execSync('pnpm build', { cwd: rootPath, stdio: 'inherit' });

  // Publish to GitHub registry
  execSync(
    'npm publish --access=public --registry=https://npm.pkg.github.com',
    { cwd: rootPath, stdio: 'inherit' }
  );

  success('Package published successfully.');
} catch (e) {
  error(`Publish failed: ${e.message}`);
  process.exit(1);
}
