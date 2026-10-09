import type { MetadataRoute } from "next";

const BASE_URL = "https://baish.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // API routes (if any)
          "/_next/", // Next.js internal routes
          "/private/", // Any private routes
          // Redesign prototype copies; the same pages are served at the main
          // routes, whose canonical URLs they point to
          "/en/lab",
          "/es/lab",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
