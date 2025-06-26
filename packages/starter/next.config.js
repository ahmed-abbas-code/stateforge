/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@stateforge/core'], // Ensures TypeScript from core gets transpiled
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose', // Helps with mixed ESM/CommonJS in monorepo deps
  }
};

module.exports = nextConfig;
