"use client";

import { lazy, Suspense } from "react";
import Link from "next/link";
import Footer from "@/app/components/footer";
import { useLocale, useDict } from "@/app/contexts/language-context";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";

// Lazy load heavy components for better initial load performance
const AirtableEmbed = lazy(() => import("@/app/components/airtable-embed"));

export default function Resources() {
  const locale = useLocale();
  const dict = useDict();

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <FadeInSection variant="fade" as="section">
        <section className="space-y-6">
          <div className="text-sm text-slate-600">
            <Link href={withLocale(locale, "/")} className="hover:text-[var(--color-accent-primary)] transition">
              {dict.resources.breadcrumb.home}
            </Link>
            {" / "}
            <span className="text-slate-900">
              {dict.resources.breadcrumb.current}
            </span>
          </div>
          <div className="space-y-4">
            <AnimatedTitle
              text={dict.resources.title}
              slug="resources"
              className="text-4xl font-semibold text-slate-900 sm:text-5xl"
              as="h1"
            />
            <p className="text-lg text-slate-700">
              {dict.resources.description}
            </p>
          </div>
        </section>
        </FadeInSection>

        {/* Featured Video */}
        <FadeInSection variant="slide-up" delay={100} as="section">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-8 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                🎥 {dict.resources.sections.featuredVideo.title}
              </h2>
              <p className="text-base text-slate-600">
                {dict.resources.sections.featuredVideo.description}
              </p>
            </div>
            <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/oAJUuY6gAnY"
                title="Why experts fear superintelligent AI – and what we can do about it"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          </div>
        </section>
        </FadeInSection>

        {/* External Training Opportunities Timeline */}
        <FadeInSection variant="slide-up" delay={200} as="section">
        <section className="relative overflow-hidden space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  🎓 {dict.resources.sections.externalOpportunities.title}
                </h2>
                <p className="text-base text-slate-600">
                  {dict.resources.sections.externalOpportunities.subtitle}
                </p>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                {dict.resources.sections.externalOpportunities.description}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-lg">
              <Suspense fallback={
                <div className="flex h-[800px] w-full items-center justify-center bg-slate-50 animate-pulse">
                  <div className="text-slate-400">Loading timeline...</div>
                </div>
              }>
                <AirtableEmbed
                  appId="appdsx5KxeooxGPFO"
                  shareId="shrgXV0z193dC7uyI"
                  tableId="tblD1rFhCfD8p5lfU"
                  viewId="viwFUfEv4CfXQemqD"
                  showViewControls={false}
                  height="800px"
                  title="Open Applications Timeline"
                />
              </Suspense>
            </div>
          </div>
        </section>
        </FadeInSection>
      </main>

      <Footer locale={locale} t={dict.footer} />
    </div>
  );
}
