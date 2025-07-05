// scripts/release-core-flow.mjs

import { execSync } from 'child_process';
import { log, success, error } from '../lib/log-utils.js';

const type = process.argv[2];
if (!['patch', 'minor', 'major'].includes(type)) {
  error('Usage: node scripts/release-core-flow.mjs [patch|minor|major]');
  process.exit(1);
}

try {
  log(`🚀 Starting core release flow: ${type}`);
  execSync(`node scripts/release-core.mjs ${type}`, { stdio: 'inherit' });

  success('Core release flow completed.');
} catch (e) {
  error(`Release flow failed: ${e.message}`);
  process.exit(1);
}
