import { resolve } from 'path';
import { spawnSync } from 'child_process';

const dotenvPath = resolve('../../.env.dryrun'); // relative to packages/starter/scripts
console.log('[build:dryrun] Using dotenv:', dotenvPath);

const result = spawnSync(
  'node',
  [
    '--require',
    'dotenv/config',
    'node_modules/next/dist/bin/next',
    'build',
  ],
  {
    stdio: 'inherit',
    cwd: resolve('.'),
    env: {
      ...process.env,
      DOTENV_CONFIG_PATH: dotenvPath,
    },
  }
);

process.exit(result.status);
