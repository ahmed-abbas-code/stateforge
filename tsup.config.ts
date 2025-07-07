// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/authentication/shared/index.ts',
    'src/authentication/client/index.ts',
    'src/authentication/server/index.ts',
    'src/state/shared/index.ts',
    'src/state/client/index.ts',
    'src/state/server/index.ts',
    'src/shared/index.ts',
  ],
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
