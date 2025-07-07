/* eslint-disable no-undef */

// scripts/release-flow.mjs

import { execSync } from 'child_process';
import { log, success, error } from './lib/log-utils.mjs';

const type = process.argv[2];

if (!['patch', 'minor', 'major'].includes(type)) {
  error('Usage: node scripts/release-flow.mjs [patch|minor|major]');
  process.exit(1);
}

try {
  log(`🚀 Starting release flow: ${type}`);
  execSync(`node scripts/release.mjs ${type}`, { stdio: 'inherit' });
  success(`Release flow (${type}) completed.`);
} catch (err) {
  error(`Release flow failed: ${err?.message || err}`);
  process.exit(1);
}
