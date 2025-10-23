import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n.config";

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(${i18n.locales.join("|")})(/|$)`);

function prefersLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return i18n.defaultLocale;

  const accepted = header
    .split(",")
    .map((value) => value.trim().split(";")[0])
    .filter(Boolean);

  for (const language of accepted) {
    const base = language.toLowerCase();
    const exact = i18n.locales.find((locale) => locale.toLowerCase() === base);
    if (exact) return exact;

    const prefix = base.split("-")[0];
    const fuzzy = i18n.locales.find((locale) => locale.split("-")[0].toLowerCase() === prefix);
    if (fuzzy) return fuzzy;
  }

  return i18n.defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (LOCALE_PREFIX_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  const locale = prefersLocale(request);
  const url = request.nextUrl.clone();
  const suffix = pathname === "/" ? "" : pathname;
  url.pathname = `/${locale}${suffix}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/((?!_next|api|.*\\..*).*)",
};
