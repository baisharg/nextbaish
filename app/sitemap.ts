import type { MetadataRoute } from "next";
import { i18n } from "@/i18n.config";

const BASE_URL = "https://baish.com.ar";

// All routes in the application
const routes = [
  "", // homepage
  "/about",
  "/activities",
  "/activities/fundamentals",
  "/activities/workshop",
  "/activities/reading",
  "/research",
  "/resources",
  "/contact",
  "/privacy-policy",
  "/agentic-coding-workshop",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Generate entries for each route in each locale
  for (const route of routes) {
    for (const locale of i18n.locales) {
      const url = `${BASE_URL}/${locale}${route}`;

      // Build alternates for hreflang
      const languages: Record<string, string> = {};
      for (const loc of i18n.locales) {
        languages[loc] = `${BASE_URL}/${loc}${route}`;
      }
      // Add x-default pointing to English version
      languages["x-default"] = `${BASE_URL}/en${route}`;

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: getChangeFrequency(route),
        priority: getPriority(route),
        alternates: {
          languages,
        },
      });
    }
  }

  return entries;
}

function getChangeFrequency(
  route: string
): "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" {
  // Activities and events change more frequently
  if (route.includes("activities") || route === "") {
    return "weekly";
  }
  // Research and resources get updated periodically
  if (route === "/research" || route === "/resources") {
    return "weekly";
  }
  // Static pages change less often
  if (route === "/privacy-policy" || route === "/about") {
    return "monthly";
  }
  return "monthly";
}

function getPriority(route: string): number {
  // Homepage is most important
  if (route === "") return 1.0;
  // Main navigation pages
  if (
    ["/about", "/activities", "/research", "/resources", "/contact"].includes(
      route
    )
  ) {
    return 0.8;
  }
  // Activity sub-pages
  if (route.startsWith("/activities/")) return 0.7;
  // Workshop page (special content)
  if (route === "/agentic-coding-workshop") return 0.7;
  // Legal pages
  if (route === "/privacy-policy") return 0.3;
  return 0.5;
}
