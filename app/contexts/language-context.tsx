"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppLocale } from "../../i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";

interface LanguageContextType {
  locale: AppLocale;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage,
  dictionary,
}: {
  children: ReactNode;
  initialLanguage: AppLocale;
  dictionary: Dictionary;
}) {
  return <LanguageContext.Provider value={{ locale: initialLanguage, dict: dictionary }}>{children}</LanguageContext.Provider>;
}

export function useLocale() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LanguageProvider");
  }
  return context.locale;
}

export function useDict() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useDict must be used within a LanguageProvider");
  }
  return context.dict;
}
