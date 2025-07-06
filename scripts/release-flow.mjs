// scripts/release-flow.mjs

import { execSync } from 'child_process';
import { log, success, error } from '../lib/log-utils.js';

const type = process.argv[2];

if (!['patch', 'minor', 'major'].includes(type)) {
  error('Usage: node scripts/release-flow.mjs [patch|minor|major]');
  process.exit(1);
}

try {
  log(`Starting release flow: ${type}`);
  execSync(`node scripts/release.mjs ${type}`, { stdio: 'inherit' });
  success('Release flow completed.');
} catch (e) {
  error(`Release flow failed: ${e.message}`);
  process.exit(1);
}
