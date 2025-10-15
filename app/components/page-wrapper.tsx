"use client";

import { useState, useEffect, type ReactNode } from "react";
import Header from "./header";
import Footer from "./footer";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";

interface PageWrapperProps {
  locale: AppLocale;
  headerTranslations: Dictionary["header"];
  footerTranslations: Dictionary["footer"];
  children: ReactNode;
}

export default function PageWrapper({
  locale,
  headerTranslations,
  footerTranslations,
  children,
}: PageWrapperProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <Header locale={locale} t={headerTranslations} scrolled={scrolled} />
      {children}
      <Footer locale={locale} t={footerTranslations} />
    </div>
  );
}
