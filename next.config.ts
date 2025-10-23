import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },

  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Enable React Compiler for automatic memoization (Next.js 16+)
  reactCompiler: true,

  // Security & performance
  poweredByHeader: false,
  compress: true,

  // Experimental features for better performance
  experimental: {
    // Enable optimizePackageImports for better tree-shaking
    optimizePackageImports: ["@vercel/analytics", "@vercel/speed-insights"],
  },
};

export default nextConfig;
