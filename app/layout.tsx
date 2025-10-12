import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TimelineThreads from "./components/timeline-threads";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BAISH — Ensuring AI Benefits Humanity",
  description:
    "We support students and communities so that advanced artificial intelligence remains safe, transparent, and accountable.",
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
        <TimelineThreads className="fixed inset-0 z-0 opacity-60" />
        {children}
      </body>
    </html>
  );
}
