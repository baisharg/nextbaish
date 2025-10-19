import type { Metadata } from "next";
import type { ReactNode, CSSProperties } from "react";
import { Suspense } from "react";
import { Geist, Geist_Mono, IBM_Plex_Serif } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import TimelineThreads from "../components/timeline-threads-loader";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "../contexts/language-context";
import { i18n, isAppLocale, type AppLocale } from "../../i18n.config";
import { getDictionary } from "./dictionaries";
import Head from "../head";
import "../globals.css";

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin"],
  weight: ["400", "600"], // Reduced to only essential weights
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
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
          className={`${ibmPlexSerif.variable} ${geistSans.variable} ${geistMono.variable} antialiased relative bg-[#f5f5f5] text-slate-900 overflow-x-hidden`}
        >
          <Suspense fallback={null}>
            <LanguageProvider initialLanguage={currentLocale} dictionary={dict}>
              <TimelineThreads className="fixed inset-0 -z-10" style={TIMELINE_STYLE} />
              {children}
              <SpeedInsights />
              <Analytics />
            </LanguageProvider>
          </Suspense>
        </body>
      </html>
    </ViewTransitions>
  );
}
