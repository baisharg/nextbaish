import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TimelineThreads from "./components/timeline-threads";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "./contexts/language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BAISH — Buenos Aires AI Safety Hub",
  description:
    "We support students and communities so that advanced artificial intelligence remains safe, transparent, and accountable.",
  metadataBase: new URL("https://baish.com.ar"),
  openGraph: {
    title: "BAISH — Buenos Aires AI Safety Hub",
    description: "Ensuring AI benefits humanity through research, education, and community",
    url: "https://baish.com.ar",
    siteName: "BAISH",
    locale: "en_US",
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
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-[#f5f5f5] text-slate-900 overflow-x-hidden`}
      >
        <LanguageProvider>
          <TimelineThreads className="fixed inset-0 -z-10" style={{ opacity: 0.32 }} />
          {children}
          <SpeedInsights />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
