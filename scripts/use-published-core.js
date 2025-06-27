// scripts/use-published-core.js
const fs = require('fs');
const path = require('path');

const versionArg = process.argv[2];
const targetVersion = versionArg || '^0.1.2'; // fallback if not provided
const targetPackage = '@ahmed-abbas-code/core';

const starterPkgPath = path.join(__dirname, '../packages/starter/package.json');
const pkg = JSON.parse(fs.readFileSync(starterPkgPath, 'utf8'));

if (pkg.dependencies && pkg.dependencies['@stateforge/core']) {
  delete pkg.dependencies['@stateforge/core'];
  pkg.dependencies[targetPackage] = targetVersion;
  console.log(`🔁 Replaced @stateforge/core with ${targetPackage}@${targetVersion}`);
} else {
  console.log('ℹ️ No @stateforge/core found in dependencies.');
}

fs.writeFileSync(starterPkgPath, JSON.stringify(pkg, null, 2));
console.log('✅ package.json updated.');
