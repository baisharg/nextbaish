import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

type PathwayStep = {
  number: string;
  title: string;
  program: string;
  description: string;
  duration: string;
};

type FocusArea = {
  title: string;
  description: string;
  icon: string;
};

type Publication = {
  title: string;
  authors: string;
  venue: string;
  description: string;
  links: { label: string; url: string }[];
};

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.research;

  const pathwaySteps = t.pathway.steps as PathwayStep[];
  const focusAreas = t.focusAreas.areas as FocusArea[];
  const publications = t.publications.items as Publication[];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl px-6 py-16 sm:px-10">
        <div className="main-sections w-full">
          {/* Page Header */}
          <FadeInSection variant="fade" as="section" startVisible>
            <section className="space-y-6">
              <div className="text-sm text-slate-600">
                <Link
                  href={withLocale(currentLocale, "/")}
                  className="hover:text-slate-900 transition"
                >
                  {t.breadcrumb.home}
                </Link>
                {" / "}
                <span>{t.breadcrumb.current}</span>
              </div>
              <div className="space-y-4 max-w-3xl">
                <AnimatedTitle
                  text={t.title}
                  slug="research"
                  className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                  as="h1"
                />
                <p className="text-xl text-slate-600 leading-relaxed">
                  {t.intro}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={withLocale(currentLocale, "/activities")}
                  className="button-primary"
                >
                  {t.ctaPrograms}
                </Link>
              </div>
            </section>
          </FadeInSection>

          {/* Research Pathway */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section
              id="pathway"
              className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12"
            >
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {t.pathway.title}
                  </h2>
                  <p className="text-lg text-slate-600">
                    {t.pathway.subtitle}
                  </p>
                </div>

                {/* Pathway Steps */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {pathwaySteps.map((step, index) => (
                    <div
                      key={step.number}
                      className="relative flex flex-col"
                    >
                      {/* Connector line for larger screens */}
                      {index < pathwaySteps.length - 1 && (
                        <div className="hidden lg:block absolute top-8 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-0.5 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] opacity-30" />
                      )}

                      <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-[var(--color-accent-primary)]/30 hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-sm font-bold text-white">
                            {step.number}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {step.duration}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm font-medium text-[var(--color-accent-primary)] mb-3">
                          {step.program}
                        </p>
                        <p className="text-sm text-slate-600 flex-grow">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Focus Areas */}
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.focusAreas.title}
                </h2>
                <p className="text-lg text-slate-600">
                  {t.focusAreas.subtitle}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {focusAreas.map((area) => (
                  <article
                    key={area.title}
                    className="card-glass group"
                  >
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                        {area.icon === "microscope" && (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                          </svg>
                        )}
                        {area.icon === "chart" && (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                          </svg>
                        )}
                        {area.icon === "compass" && (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {area.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {area.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </FadeInSection>

          {/* Community Publications */}
          <FadeInSection variant="slide-up" delay={300} as="section">
            <section className="section-container space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.publications.title}
                </h2>
                <p className="text-lg text-slate-600">
                  {t.publications.subtitle}
                </p>
              </div>

              <div className="space-y-4">
                {publications.map((pub) => (
                  <article
                    key={pub.title}
                    className="card-glass"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-semibold text-slate-900">
                          {pub.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {pub.authors}
                        </p>
                        <p className="text-sm text-slate-500">
                          {pub.venue}
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          {pub.description}
                        </p>
                      </div>
                      {pub.links.length > 0 && (
                        <div className="flex gap-3 flex-shrink-0">
                          {pub.links.map((link) => (
                            <a
                              key={`${pub.title}-${link.label}`}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button-secondary"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {/* Note about growing publications */}
              <p className="text-sm text-slate-500 italic text-center">
                {t.publications.note}
              </p>
            </section>
          </FadeInSection>

          {/* Express Interest Section */}
          <FadeInSection variant="slide-up" delay={400} as="section">
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-primary)]">
                    {t.expressInterest.eyebrow}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t.expressInterest.title}
                  </h2>
                  <p className="text-base text-slate-600">
                    {t.expressInterest.description}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    {t.expressInterest.formLabel}
                  </p>
                  <Link
                    href={withLocale(currentLocale, t.expressInterest.link)}
                    className="button-primary w-full text-center block"
                  >
                    {t.expressInterest.cta}
                  </Link>
                  <p className="text-xs text-slate-500 text-center">
                    {t.expressInterest.note}
                  </p>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* CTA Section */}
          <FadeInSection variant="slide-up" delay={500} as="section">
            <section className="rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)]/5 to-[var(--color-accent-secondary)]/5 border border-slate-200 p-8 text-center">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                {t.cta.title}
              </h2>
              <p className="text-base text-slate-600 mb-6 max-w-xl mx-auto">
                {t.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://calendly.com/eitusprejer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary inline-flex items-center justify-center gap-2"
                >
                  {t.cta.bookWithEitan}
                </a>
                <a
                  href="https://calendar.notion.so/meet/ldeleo/gcge74os2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary inline-flex items-center justify-center gap-2"
                >
                  {t.cta.bookWithLuca}
                </a>
              </div>
            </section>
          </FadeInSection>
        </div>
      </main>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
