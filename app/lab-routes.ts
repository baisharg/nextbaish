/**
 * Redesign prototype: while this is on, the main routes serve the pages in
 * app/[locale]/lab (the original pages stay in the code, unused). Set to
 * false to get the original pages back at the main routes; /lab keeps
 * working either way.
 *
 * Shared by next.config.ts (the rewrites) and the header (current page and
 * language links), so keep it free of framework imports.
 */
export const SERVE_LAB_AT_MAIN_ROUTES = true;

/** Main route and the lab page served there */
export const LAB_ROUTES: [live: string, lab: string][] = [
  ["", "/lab"],
  ["/about", "/lab/about"],
  ["/activities", "/lab/programs"],
  ["/research", "/lab/research"],
  ["/resources", "/lab/resources"],
  ["/contact", "/lab/contact"],
];

/**
 * The address a visitor sees for a pathname. With the rewrites on,
 * usePathname() reports the rewritten lab path (/es/lab/programs) while the
 * browser shows the main route (/es/activities); map it back so links and
 * the current-page marker use the main routes.
 */
export function publicPathname(pathname: string): string {
  if (!SERVE_LAB_AT_MAIN_ROUTES) return pathname;
  const match = pathname.match(/^\/(en|es)(\/lab(?:\/[^/]+)?)\/?$/);
  if (!match) return pathname;
  const route = LAB_ROUTES.find(([, lab]) => lab === match[2]);
  return route ? `/${match[1]}${route[0]}` : pathname;
}
