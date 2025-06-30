// scripts/use-published-core.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log, success } from '../lib/log-utils.js'; // Optional: reuse formatting helpers

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionArg = process.argv[2];
const targetVersion = versionArg || '^0.1.2';
const targetPackage = '@ahmed-abbas-code/core';

const starterPkgPath = path.join(__dirname, '../packages/starter/package.json');
const pkg = JSON.parse(fs.readFileSync(starterPkgPath, 'utf8'));

if (pkg.dependencies?.['@stateforge/core']) {
  delete pkg.dependencies['@stateforge/core'];
  pkg.dependencies[targetPackage] = targetVersion;
  log(`🔁 Replaced @stateforge/core with ${targetPackage}@${targetVersion}`);
} else {
  log('ℹ️ No @stateforge/core found in dependencies.');
}

fs.writeFileSync(starterPkgPath, JSON.stringify(pkg, null, 2));
success('File: package.json updated.');
