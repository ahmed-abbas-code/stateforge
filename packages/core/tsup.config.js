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
        target: 'es2020',
        platform: 'browser', // ✅ Important
        clean: false,
        minify: false,
        splitting: false,
        external: [
            'fs',
            'path',
            'os',
            'crypto',
            'dotenv', // ✅ Mark dotenv as external
        ],
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
