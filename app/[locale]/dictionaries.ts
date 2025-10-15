import "server-only";
import type { AppLocale } from "@/i18n.config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
};

export const getDictionary = async (locale: AppLocale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
