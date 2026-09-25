import type { ReactNode } from "react";
import { TransitionLink } from "@/app/components/transition-link";
import { withLocale } from "@/app/utils/locale";
import type { AppLocale } from "@/i18n.config";

export const isExternal = (href: string) =>
  href.startsWith("http") || href.startsWith("mailto:");

/**
 * Live pages that have a prototype counterpart. While the redesign lives
 * under /lab, links between redesigned pages stay inside it; drop this map
 * when the lab pages replace the live ones.
 */
const LAB_ROUTES: [live: string, lab: string][] = [
  ["/activities", "/lab/programs"],
  ["/about", "/lab/about"],
  ["/contact", "/lab/contact"],
  ["/research", "/lab/research"],
  ["/resources", "/lab/resources"],
];

/** Rewrite a live path to its lab counterpart, keeping any #hash or ?query */
export function labHref(href: string): string {
  if (href === "/") return "/lab";
  for (const [live, lab] of LAB_ROUTES) {
    const rest = href.slice(live.length);
    if (href.startsWith(live) && (rest === "" || /^[#?]/.test(rest))) {
      return lab + rest;
    }
  }
  return href;
}

/**
 * Internal paths get the locale prefix and a view transition; in-page anchors
 * and external URLs are plain links (external ones open in a new tab).
 */
export function SmartLink({
  href,
  locale,
  className,
  children,
  ...rest
}: {
  href: string;
  locale: AppLocale;
  className?: string;
  children: ReactNode;
  "data-thread-pulse"?: boolean;
}) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <TransitionLink
      href={withLocale(locale, labHref(href))}
      className={className}
      {...rest}
    >
      {children}
    </TransitionLink>
  );
}
