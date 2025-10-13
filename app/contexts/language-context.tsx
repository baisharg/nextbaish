"use client";

import { createContext, useContext, useState, useLayoutEffect, useEffect, ReactNode } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language preference from localStorage synchronously before paint
  useLayoutEffect(() => {
    const savedLanguage = localStorage.getItem("baish-language");
    if (savedLanguage === "en" || savedLanguage === "es") {
      setLanguage(savedLanguage);
    }
    setIsInitialized(true);
  }, []);

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("baish-language", language);
    }
  }, [language, isInitialized]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
