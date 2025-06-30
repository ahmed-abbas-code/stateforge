import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],        // CommonJS + ES Module output
  target: 'node18',              // Target modern Node.js version
  sourcemap: true,
  clean: true,                  // Clean 'dist' folder before build
  dts: true,                   // Generate declaration files (.d.ts)
  minify: false,
  splitting: false,            // No code splitting for libraries
  external: [],                // External dependencies to exclude
});
