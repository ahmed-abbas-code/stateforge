// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    shared: 'src/shared/index.ts',
    'authentication-client': 'src/authentication/client/index.ts',
    'authentication-server': 'src/authentication/server/index.ts',
    'authentication-shared': 'src/authentication/shared/index.ts',
    'state-client': 'src/state/client/index.ts',
    'state-server': 'src/state/server/index.ts',
    'state-shared': 'src/state/shared/index.ts',
    state: 'src/state/index.ts',
  },
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  target: 'es2021',
  platform: 'node',
  clean: true,
  splitting: false,
  minify: false,
  external: ['next']
});
