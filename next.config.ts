import type { NextConfig } from "next";
const bundleAnalyzer = require("@next/bundle-analyzer");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const projectRoot = process.cwd();

/**
 * Redesign prototype: while this is on, the main routes serve the pages in
 * app/[locale]/lab (the original pages stay in the code, unused). Set to
 * false to get the original pages back at the main routes; /lab keeps
 * working either way.
 */
const SERVE_LAB_AT_MAIN_ROUTES = true;

const LAB_ROUTES: [live: string, lab: string][] = [
  ["", "/lab"],
  ["/about", "/lab/about"],
  ["/activities", "/lab/programs"],
  ["/research", "/lab/research"],
  ["/resources", "/lab/resources"],
  ["/contact", "/lab/contact"],
];

const nextConfig: NextConfig = {
  // beforeFiles, because app/[locale]/* would otherwise match first
  async rewrites() {
    return {
      beforeFiles: SERVE_LAB_AT_MAIN_ROUTES
        ? LAB_ROUTES.map(([live, lab]) => ({
            source: `/:locale(en|es)${live}`,
            destination: `/:locale${lab}`,
          }))
        : [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Dev only: let Orca's per-worktree hosts (e.g. nextbaish.orca.localhost)
  // load /_next dev resources. Without this the page renders without JS.
  allowedDevOrigins: ["*.orca.localhost"],

  // Production optimizations
  // Note: Next.js 16+ uses SWC minification by default (no config needed)
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Enable React Compiler for automatic memoization (Next.js 16+)
  reactCompiler: true,

  // Security & performance
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: projectRoot,

  turbopack: {
    root: projectRoot,
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimizePackageImports for better tree-shaking
    optimizePackageImports: [
      "@vercel/analytics",
      "@vercel/speed-insights",
      "@tanstack/react-virtual", // Optimize virtualization library
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
