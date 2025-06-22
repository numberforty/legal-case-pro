import type { NextConfig } from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  experimental: {
    serverExternalPackages: ['fluent-ffmpeg'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, 'fluent-ffmpeg']
        : ['fluent-ffmpeg'];
    }
    return config;
  },
};

export default nextConfig;
