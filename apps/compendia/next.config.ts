import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@radix-ui/react-toast",
    "class-variance-authority",
    "lucide-react",
  ],
};

export default nextConfig;
