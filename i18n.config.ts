export const i18n = {
  defaultLocale: "en",
  locales: ["en", "es"] as const,
};

type LocaleTuple = typeof i18n.locales;
export type AppLocale = LocaleTuple[number];

export const isAppLocale = (value: string): value is AppLocale => {
  return i18n.locales.includes(value as AppLocale);
};

export const LOCALE_PREFIX_REGEX = new RegExp(
  `^/(?:${i18n.locales.join("|")})(?=/|$)`,
);
