/* eslint-disable no-undef */

// scripts/release-flow.mjs

import { execSync } from 'child_process';

// ✅ Dynamically import CommonJS log-utils.js
const { log, error, success } = await import(new URL('./lib/log-utils.js', import.meta.url));

// Parse release type
const type = process.argv[2];

if (!['patch', 'minor', 'major'].includes(type)) {
  error('Usage: node scripts/release-flow.mjs [patch|minor|major]');
  process.exit(1);
}

try {
  log(`🚀 Starting release flow: ${type}`);

  const releaseScript = new URL('./release.mjs', import.meta.url).pathname;
  execSync(`node ${releaseScript} ${type}`, { stdio: 'inherit' });

  success(`Release flow (${type}) completed.`);
} catch (err) {
  error(`Release flow failed: ${err?.message || err}`);
  process.exit(1);
}
