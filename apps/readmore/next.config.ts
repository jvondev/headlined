
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

// Disable PWA in production (static export for Cloudflare Pages)
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const withPWAConfig = isProduction
  ? (config: NextConfig) => config // No PWA for production static export
  : withPWA({
    dest: 'public',
    disable: isDevelopment,
  });

const nextConfig: NextConfig = {
  output: 'export', // Static export for Cloudflare Pages
  /* config options here */
  // Development: fast builds with checks disabled
  // Production: strict validation enabled
  typescript: {
    ignoreBuildErrors: !isProduction,
  },
  eslint: {
    ignoreDuringBuilds: !isProduction,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  transpilePackages: [
    "@radix-ui/react-toast",
    "class-variance-authority",
    "lucide-react",
  ],
};

export default withPWAConfig(nextConfig);
