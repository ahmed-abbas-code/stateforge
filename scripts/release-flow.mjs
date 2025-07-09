/* eslint-disable no-undef */

// scripts/release-flow.mjs

import { execSync } from 'child_process';

// ✅ Import CommonJS log-utils correctly
const { log, error, success } = await import('./lib/log-utils.js');

// Get version type argument
const type = process.argv[2];

if (!['patch', 'minor', 'major'].includes(type)) {
  error('Usage: node scripts/release-flow.mjs [patch|minor|major]');
  process.exit(1);
}

try {
  log(`🚀 Starting release flow: ${type}`);

  // ✅ Ensure correct relative path resolution for release.mjs
  const releasePath = new URL('./release.mjs', import.meta.url).pathname;
  execSync(`node ${releasePath} ${type}`, { stdio: 'inherit' });

  success(`Release flow (${type}) completed.`);
} catch (err) {
  error(`Release flow failed: ${err?.message || err}`);
  process.exit(1);
}
