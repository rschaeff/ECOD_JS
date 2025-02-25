import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    config.resolve.alias['@/services'] = path.resolve(__dirname, 'services');
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'components');
    config.resolve.alias['@/pages'] = path.resolve(__dirname, 'pages');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'lib');
    return config;
  }
};

export default nextConfig;