/* eslint-disable no-undef */

// scripts/release-flow.mjs

import { execSync } from 'child_process';
const { log, error, success } = await import('./lib/log-utils.js').then(m => m.default || m);

const type = process.argv[2];

if (!['patch', 'minor', 'major'].includes(type)) {
  error('Usage: node scripts/release-flow.mjs [patch|minor|major]');
  process.exit(1);
}

try {
  log(`🚀 Starting release flow: ${type}`);
  // ✅ Ensure script is explicitly resolved relative to this file
  execSync(`node ${new URL('./release.mjs', import.meta.url).pathname} ${type}`, {
    stdio: 'inherit'
  });
  success(`Release flow (${type}) completed.`);
} catch (err) {
  error(`Release flow failed: ${err?.message || err}`);
  process.exit(1);
}
