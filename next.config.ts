import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow cross-origin requests in development mode
  allowedDevOrigins: ['chinahuib2b.top', 'www.chinahuib2b.top', '139.59.108.156'],
  
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
