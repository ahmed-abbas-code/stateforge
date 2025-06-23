import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],            // ✅ CommonJS output for CLI compatibility
  target: 'node18',
  outDir: 'dist',
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false                  // ✅ No type declaration needed for CLI
});
