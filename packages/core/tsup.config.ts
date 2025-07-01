import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      client: 'src/client/index.ts',
    },
    outDir: 'dist/client',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    target: 'node18',
    clean: true,
    minify: false,
    splitting: false,
  },
  {
    entry: {
      server: 'src/server/index.ts',
    },
    outDir: 'dist/server',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    target: 'node18',
    clean: false,
    minify: false,
    splitting: false,
  },
  {
    entry: {
      common: 'src/common/index.ts',
    },
    outDir: 'dist/common',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    target: 'node18',
    clean: false,
    minify: false,
    splitting: false,
  }
]);
