import type { AppLocale } from "@/i18n.config";
import { LOCALE_PREFIX_REGEX } from "@/i18n.config";

/**
 * Prefixes a path with the given locale
 *
 * @param locale - The locale to prefix the path with (e.g., "en", "es")
 * @param path - The path to prefix (e.g., "/about", "/")
 * @returns The path prefixed with the locale
 *
 * @example
 * withLocale("en", "/about") // => "/en/about"
 * withLocale("es", "/") // => "/es"
 * withLocale("en", "about") // => "about" (paths without leading slash are returned as-is)
 */
export function withLocale(locale: AppLocale, path: string): string {
  // Return path as-is if it doesn't start with "/"
  if (!path.startsWith("/")) {
    return path;
  }

  // Handle root path specially
  if (path === "/") {
    return `/${locale}`;
  }

  // Prefix the path with the locale
  return `/${locale}${path}`;
}

/**
 * Builds a language switch href by replacing the locale in the current path
 *
 * @param pathname - The current pathname (e.g., "/en/about", "/es/")
 * @param newLocale - The new locale to switch to (e.g., "en", "es")
 * @returns The new path with the locale replaced
 *
 * @example
 * buildLangSwitchHref("/en/about", "es") // => "/es/about"
 * buildLangSwitchHref("/es/", "en") // => "/en"
 * buildLangSwitchHref("/en/research", "es") // => "/es/research"
 */
export function buildLangSwitchHref(
  pathname: string,
  newLocale: AppLocale
): string {
  // Remove existing locale prefix using the regex from i18n.config
  const withoutLocale = pathname.replace(LOCALE_PREFIX_REGEX, "") || "/";

  // Normalize the path to ensure it starts with "/"
  const normalisedPath = withoutLocale.startsWith("/")
    ? withoutLocale
    : `/${withoutLocale}`;

  // For root path, return just the locale
  const pathSegment = normalisedPath === "/" ? "" : normalisedPath;

  // Combine new locale with the path
  return `/${newLocale}${pathSegment}`;
}
