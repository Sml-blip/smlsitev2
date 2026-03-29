import type { NextConfig } from "next";
import path from "node:path";
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
    async redirects() {
      return [
        {
          source: '/shop',
          has: [{ type: 'query', key: 'category', value: 'Computers' }],
          destination: '/shop?category=PC%20PORTABLE',
          permanent: true,
        },
        // Redirect old WordPress /product/ URLs to new /shop/ URLs (301 permanent)
        {
          source: '/product/:slug',
          destination: '/shop/:slug',
          permanent: true,
        },
      ];
    },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  }
};

export default nextConfig;
// Orchids restart: 1771762881043
