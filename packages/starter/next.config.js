const nextConfig = {
  transpilePackages: ['@stateforge/core'],
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
