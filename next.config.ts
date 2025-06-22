import type { NextConfig } from 'next';
// Turbopack doesn't support custom webpack configuration.

const nextConfig: NextConfig = {
  serverExternalPackages: ['fluent-ffmpeg'],
};

export default nextConfig;
