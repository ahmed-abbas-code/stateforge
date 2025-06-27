
// scripts/release-core-flow.js
const { execSync } = require('child_process');
const { log, success } = require('../lib/log-utils');

const type = process.argv[2];
if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('Usage: node scripts/release-core-flow.js [patch|minor|major]');
  process.exit(1);
}

log(`🚀 Starting core release flow: ${type}`);
execSync(`node scripts/release-core.js ${type}`, { stdio: 'inherit' });
execSync('node scripts/use-published-core.js', { stdio: 'inherit' });
execSync('pnpm install', { stdio: 'inherit' });
success('✅ Core release flow completed.');
