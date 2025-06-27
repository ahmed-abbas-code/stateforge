// scripts/release-core.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { log, error, success } = require('../lib/log-utils');
const { replaceWorkspaceVersions } = require('../lib/replace-workspace-versions');

// Step 1: Ensure GITHUB_TOKEN exists and .npmrc is bootstrapped
require(path.resolve(__dirname, 'bootstrap-npmrc.js'));

const versionType = process.argv[2];
if (!['patch', 'minor', 'major'].includes(versionType)) {
  error('Usage: node scripts/release-core.js [patch|minor|major]');
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
  execSync('pnpm install --lockfile-only', { cwd: corePath, stdio: 'inherit' });
  execSync('pnpm build', { cwd: corePath, stdio: 'inherit' });
  execSync(
    'npx npm@latest publish --access=restricted --registry=https://npm.pkg.github.com --legacy-peer-deps --force',
    { cwd: corePath, stdio: 'inherit' }
  );
  success('Core package published successfully.');
} catch (e) {
  error(`Publish failed: ${e.message}`);
  process.exit(1);
}
