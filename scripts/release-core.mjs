// scripts/release-core.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { log, error, success } from '../lib/log-utils.js';
import { replaceWorkspaceVersions } from '../lib/replace-workspace-versions.js';

// Workaround for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Step 1: Ensure GITHUB_TOKEN exists and .npmrc is bootstrapped
await import(path.resolve(__dirname, './bootstrap-npmrc.js'));

const versionType = process.argv[2];
if (!['patch', 'minor', 'major'].includes(versionType)) {
  error('Usage: node scripts/release-core.mjs [patch|minor|major]');
  process.exit(1);
}

const corePath = path.resolve(__dirname, '../packages/core');
const pkgPath = path.join(corePath, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

if (replaceWorkspaceVersions(pkg, console)) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  log('Updated package.json with non-workspace versions.');
}

try {
  execSync(`npm version ${versionType}`, { cwd: corePath, stdio: 'inherit' });

  // Build using workspace-aware filter (safer in monorepo)
  execSync('pnpm --filter @stateforge-framework/core build', { stdio: 'inherit' });

  // Publish from within the package dir
  execSync(
    'npm publish --access=restricted --registry=https://npm.pkg.github.com',
    { cwd: corePath, stdio: 'inherit' }
  );

  success('Core package published successfully.');
} catch (e) {
  error(`Publish failed: ${e.message}`);
  process.exit(1);
}
