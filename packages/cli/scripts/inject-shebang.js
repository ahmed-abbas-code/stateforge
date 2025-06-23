const fs = require('fs-extra');
const path = require('path');

const filePath = path.resolve(__dirname, '../dist/index.js');
const content = fs.readFileSync(filePath, 'utf8');

if (!content.startsWith('#!')) {
  const updated = `#!/usr/bin/env node\n${content}`;
  fs.writeFileSync(filePath, updated);
  console.log('✅ Injected shebang into dist/index.js');
} else {
  console.log('ℹ️ Shebang already present.');
}
