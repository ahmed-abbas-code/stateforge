// scripts/prepare-core-publish.js
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../packages/core/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

let replaced = false;

const replaceWorkspaceVersions = (sectionName, obj) => {
  if (!obj) return;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('workspace:')) {
      console.log(`🔁 Replacing ${sectionName}.${key}: ${value} → ^0.0.1`);
      obj[key] = '^0.0.1';
      replaced = true;
    }
  }
};

replaceWorkspaceVersions('dependencies', pkg.dependencies);
replaceWorkspaceVersions('devDependencies', pkg.devDependencies);
replaceWorkspaceVersions('peerDependencies', pkg.peerDependencies);
replaceWorkspaceVersions('optionalDependencies', pkg.optionalDependencies);

if (replaced) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Replaced all workspace:* versions');
} else {
  console.log('ℹ️ No workspace:* versions found');
}
