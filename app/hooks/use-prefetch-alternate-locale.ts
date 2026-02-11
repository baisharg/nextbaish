"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLCPComplete } from "./use-lcp-complete";
import { buildLangSwitchHref } from "@/app/utils/locale";
import type { AppLocale } from "@/i18n.config";

export function usePrefetchAlternateLocale(
  locale: AppLocale,
  pathname: string,
) {
  const router = useRouter();
  const isLCPComplete = useLCPComplete();

  useEffect(() => {
    if (!isLCPComplete) return;
    const altLocale = locale === "en" ? "es" : "en";
    router.prefetch(buildLangSwitchHref(pathname, altLocale));
  }, [locale, pathname, isLCPComplete, router]);
}
