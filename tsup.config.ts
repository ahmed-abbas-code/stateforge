// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
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