// scripts/prepare-publish-core-dist.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const TEMP_DIR = path.join(ROOT, 'dist-temp-core');
const CORE_SRC = path.join(ROOT, 'packages/core');
const CORE_DEST = path.join(TEMP_DIR, 'packages/core');

console.log('♻️  Cleaning up old temp directory...');
fs.rmSync(TEMP_DIR, { recursive: true, force: true });

console.log('📁 Copying core package to temp directory...');
fs.mkdirSync(CORE_DEST, { recursive: true });
execSync(`cp -R ${CORE_SRC}/. ${CORE_DEST}`);

console.log('📝 Rewriting package.json...');
const pkgPath = path.join(CORE_DEST, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

// Remove workspace references (if any)
['dependencies', 'peerDependencies', 'devDependencies'].forEach((depType) => {
  const deps = pkg[depType] || {};
  for (const [key, val] of Object.entries(deps)) {
    if (val.startsWith('workspace:')) {
      console.log(`  → removing ${key} from ${depType}`);
      delete deps[key];
    }
  }
});
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Create minimal root package.json for npm publish
const minimalRootPkg = {
  name: 'temp-publish-root',
  private: true,
  workspaces: [],
};
fs.writeFileSync(path.join(TEMP_DIR, 'package.json'), JSON.stringify(minimalRootPkg, null, 2));

console.log('✅ Temp publish folder ready at ./dist-temp-core/packages/core');
