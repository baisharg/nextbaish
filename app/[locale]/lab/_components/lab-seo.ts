import type { Metadata } from "next";
import { generatePageMetadata, SEO_CONTENT } from "@/app/utils/seo";
import type { AppLocale } from "@/i18n.config";

type LabPageKey =
  | "home"
  | "about"
  | "activities"
  | "research"
  | "resources"
  | "contact";

/** Main route each lab page stands in for (see the rewrites in next.config.ts) */
export const LAB_PAGE_PATHS: Record<LabPageKey, string> = {
  home: "",
  about: "/about",
  activities: "/activities",
  research: "/research",
  resources: "/resources",
  contact: "/contact",
};

/**
 * The same metadata as the original page at the main route: title,
 * description, canonical URL, hreflang and social cards all point at the main
 * route, so serving a lab page there changes nothing for search engines. The
 * /lab URLs are duplicates; their canonical points at the main route and
 * robots.ts keeps crawlers off them.
 */
export function labPageMetadata(
  key: LabPageKey,
  locale: AppLocale,
): Metadata {
  const content = SEO_CONTENT[key][locale];
  return generatePageMetadata({
    title: content.title,
    description: content.description,
    path: LAB_PAGE_PATHS[key],
    locale,
  });
}
