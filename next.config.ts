import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? [...config.externals]
        : config.externals
        ? [config.externals as any]
        : [];
      externals.push('fluent-ffmpeg', 'whatsapp-web.js');
      config.externals = externals;

import webpack from 'webpack';

const nextConfig: NextConfig = {
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
