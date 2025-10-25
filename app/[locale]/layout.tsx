import type { Metadata } from "next";
import type { ReactNode, CSSProperties } from "react";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import TimelineThreads from "../components/timeline-threads-loader";
// import TimelineThreads from "../components/timeline-threads-with-controls"; // Uncomment for testing
import { DeferredAnalytics } from "../components/deferred-analytics";
import { LCPDebugger } from "../components/lcp-debugger";
import { PerformanceMonitor } from "../components/performance-monitor";
import { LanguageProvider } from "../contexts/language-context";
import { i18n, isAppLocale, type AppLocale } from "../../i18n.config";
import { getDictionary } from "./dictionaries";
import Head from "../head";
import Header from "../components/header";
import RUMMonitor from "../components/rum-monitor";
import "../globals.css";

const signifier = localFont({
  src: [
    {
      path: "../../public/fonts/signifier/Signifier-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/signifier/Signifier-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/signifier/Signifier-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/signifier/Signifier-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/signifier/Signifier-Bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/signifier/Signifier-BoldItalic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-signifier",
  display: "swap",
  preload: true, // Preload since it's used for all headings (LCP element)
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const ttHovesPro = localFont({
  src: "../../public/fonts/tt-hoves-pro/TT-Hoves-Pro-Variable.woff2",
  variable: "--font-tt-hoves",
  display: "swap",
  preload: true,
  weight: "100 900", // Variable font supports full range
  style: "normal", // Explicitly set normal style to prevent italic rendering on some devices
  fallback: ["system-ui", "-apple-system", "Arial"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true, // Reduce layout shift
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Not critical for initial render
  fallback: ["monospace"],
});

const TIMELINE_STYLE: CSSProperties = { opacity: 0.32 };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isAppLocale(locale) ? locale : i18n.defaultLocale;

  return {
    title: "BAISH — Buenos Aires AI Safety Hub",
    description:
      "We support students and communities so that advanced artificial intelligence remains safe, transparent, and accountable.",
    metadataBase: new URL("https://baish.com.ar"),
    openGraph: {
      title: "BAISH — Buenos Aires AI Safety Hub",
      description: "Ensuring AI benefits humanity through research, education, and community",
      url: "https://baish.com.ar",
      siteName: "BAISH",
      locale: validLocale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "BAISH — Buenos Aires AI Safety Hub",
      description: "Ensuring AI benefits humanity through research, education, and community",
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = (isAppLocale(locale) ? locale : i18n.defaultLocale) as AppLocale;
  const dict = await getDictionary(currentLocale);

  return (
    <ViewTransitions>
      <html lang={currentLocale}>
        <Head />
        <body
          className={`${ttHovesPro.variable} ${signifier.variable} ${geistSans.variable} ${geistMono.variable} antialiased relative bg-[#f5f5f5] text-slate-900 overflow-x-hidden`}
        >
          <Suspense fallback={null}>
            <LanguageProvider initialLanguage={currentLocale} dictionary={dict}>
              <TimelineThreads className="fixed inset-0 -z-10" style={TIMELINE_STYLE} />
              <Header locale={currentLocale} t={dict.header} />
              {children}
              <DeferredAnalytics />
              <PerformanceMonitor />
              <RUMMonitor />
              {/* {process.env.NODE_ENV === "development" && <LCPDebugger />} */}
            </LanguageProvider>
          </Suspense>
        </body>
      </html>
    </ViewTransitions>
  );
}
