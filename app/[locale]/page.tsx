import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { TransitionLink } from "@/app/components/transition-link";
import { HeroTimeline } from "@/app/components/hero-timeline";
import { AstnPromo } from "@/app/components/astn-promo";
import { OrganizationJsonLd, BreadcrumbJsonLd } from "@/app/components/json-ld";
import { getDictionary } from "./dictionaries";
import { generatePageMetadata, SEO_CONTENT } from "@/app/utils/seo";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const content = SEO_CONTENT.home[currentLocale];

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    path: "",
    locale: currentLocale,
  });
}
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  TelegramIcon,
  WhatsappIcon,
  UserGroupIcon,
  Book02Icon,
  Wrench01Icon,
  MicroscopeIcon,
  TickDouble02Icon,
} from "@hugeicons/core-free-icons";


// Lazy load below-the-fold components for better initial load
const CalendarSection = dynamic(() => import("@/app/components/calendar-section"), {
  loading: () => (
    <div className="calendar-skeleton flex h-[450px] w-full items-center justify-center rounded-xl bg-slate-50/50 border border-slate-200/50">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 mx-auto rounded-full bg-slate-200 animate-pulse" />
        <p className="text-sm text-slate-400">Loading events...</p>
      </div>
    </div>
  ),
});

const SupascribeSignup = dynamic(() => import("@/app/components/supascribe-signup"), {
  loading: () => <div className="card-glass h-64 animate-pulse" />,
});

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.home;

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[{ name: t.breadcrumb.home, url: "" }]}
        locale={currentLocale}
      />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="main-sections">
          {/* Hero Section - Lead with Value Prop */}
          <FadeInSection variant="slide-up" as="section" startVisible={true}>
            <section
              className="relative px-6 py-16 sm:px-16 lg:py-20"
              id="about"
            >
              <div className="max-w-4xl mx-auto text-center">
                {/* Larger headline */}
                <AnimatedTitle
                  text={t.mission.title}
                  slug="home"
                  className="mb-6"
                  as="h1"
                />

                {/* Punchy tagline */}
                <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto">
                  {t.mission.tagline}
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <TransitionLink
                    href={`/${currentLocale}/resources`}
                    className="button-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold"
                  >
                    {t.hero.primaryCta}
                    <span aria-hidden="true">→</span>
                  </TransitionLink>
                  <TransitionLink
                    href={`/${currentLocale}/activities`}
                    className="button-secondary inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold"
                  >
                    {t.hero.secondaryCta}
                  </TransitionLink>
                </div>

                {/* Social Proof Stats - Above the fold */}
                <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8 text-center">
                  <div className="social-proof-stat">
                    <span className="stat-number">120+</span>
                    <span className="stat-label">{t.hero.communityMembers}</span>
                  </div>
                  <div className="social-proof-stat">
                    <span className="stat-number">3</span>
                    <span className="stat-label">{t.hero.weeklyPrograms}</span>
                  </div>
                  <div className="social-proof-stat">
                    <span className="stat-number">3+</span>
                    <span className="stat-label">{t.hero.publishedPapers}</span>
                  </div>
                </div>

                {/* Timeline integrated into hero - BAISH-specific journey */}
                <HeroTimeline
                  steps={[
                    {
                      icon: UserGroupIcon,
                      shortLabel: t.timeline?.connect || "Connect",
                      fullTitle: t.timeline?.connectTitle || "Join our community",
                      description: t.timeline?.connectDesc || "200+ members on WhatsApp & Telegram",
                      badge: "120+",
                      link: "https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P",
                      isExternal: true,
                    },
                    {
                      icon: Book02Icon,
                      shortLabel: t.timeline?.foundations || "Foundations",
                      fullTitle: t.timeline?.foundationsTitle || "AI Safety Fundamentals",
                      description: t.timeline?.foundationsDesc || "13-week inverted classroom course",
                      badge: "13 weeks",
                      link: "/activities/fundamentals",
                    },
                    {
                      icon: Wrench01Icon,
                      shortLabel: t.timeline?.replicate || "Replicate",
                      fullTitle: t.timeline?.replicateTitle || "Paper replication workshop",
                      description: t.timeline?.replicateDesc || "Weekly hands-on technical practice",
                      badge: "Weekly",
                      link: "/activities/workshop",
                    },
                    {
                      icon: MicroscopeIcon,
                      shortLabel: t.timeline?.publish || "Publish",
                      fullTitle: t.timeline?.publishTitle || "Research fellowship",
                      description: t.timeline?.publishDesc || "6-month program with mentorship & stipend",
                      badge: "6 months",
                      link: "/research",
                    },
                  ]}
                  locale={currentLocale}
                />
              </div>
            </section>
          </FadeInSection>

          <FadeInSection variant="slide-up" delay={50}>
            <section className="section-open" id="course">
              <div className="relative rounded-3xl border-2 border-[var(--color-accent-primary)]/20 bg-gradient-to-br from-[var(--color-accent-primary)]/[0.06] via-white to-[var(--color-accent-secondary)]/[0.06] p-8 sm:p-12 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-primary)] via-[var(--color-accent-tertiary)] to-[var(--color-accent-secondary)]" />

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-primary)]">
                      {t.courseSpotlight.eyebrow}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
                      {t.courseSpotlight.badge}
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 mb-1 tracking-tight">
                    {t.courseSpotlight.title}
                  </h2>
                  <p className="text-lg text-[var(--color-accent-primary)] font-medium mb-4">
                    {t.courseSpotlight.subtitle}
                  </p>

                  <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
                    {t.courseSpotlight.description}
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 mb-10">
                    <span className="pill">
                      <HugeiconsIcon icon={Calendar03Icon} size={16} />
                      {t.courseSpotlight.details.duration}
                    </span>
                    <span className="pill">
                      <HugeiconsIcon icon={Book02Icon} size={16} />
                      {t.courseSpotlight.details.format}
                    </span>
                    <span className="pill">
                      <HugeiconsIcon icon={TickDouble02Icon} size={16} />
                      {t.courseSpotlight.details.cost}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <a
                      href={t.courseSpotlight.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-primary inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold"
                    >
                      {t.courseSpotlight.cta}
                      <span aria-hidden="true">→</span>
                    </a>
                    <span className="text-sm font-medium text-[var(--color-accent-primary)]">
                      {t.courseSpotlight.deadline}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* ASTN Promo Section - Launch Your Career */}
          <FadeInSection variant="slide-up" delay={50} as="section">
            <AstnPromo t={t.astn} />
          </FadeInSection>

          {/* Get Involved Section - MOVED UP for conversion */}
          <FadeInSection variant="slide-up" delay={50} as="section">
            <section
              className="section-container"
              id="get-involved"
            >
              <div className="space-y-4 text-center mb-10">
                <p className="eyebrow">{t.getInvolved.eyebrow || "Get Started"}</p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.getInvolved.sectionTitle || "Join Our Community"}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {t.getInvolved.sectionDescription || "Connect with researchers, stay updated, and start your journey"}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <SupascribeSignup t={dict.substack} />

                <article className="card-glass card-refined">
                  <div className="card-eyebrow">{t.getInvolved.communityEyebrow}</div>
                  <h3 className="card-title">
                    {t.getInvolved.communityTitle}
                  </h3>
                  <p className="card-body">
                    {t.getInvolved.communityDescription}
                  </p>
                  <div className="flex flex-col gap-3 mt-auto">
                    <a
                      className="button-primary flex flex-col items-center justify-center gap-1 py-4"
                      href="https://t.me/+zhSGhXrn56g1YjVh"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={TelegramIcon} size={20} />
                        <span className="font-semibold">{t.getInvolved.telegramCta}</span>
                      </div>
                      <span className="text-xs opacity-90">{t.getInvolved.telegramMembers}</span>
                    </a>
                    <a
                      className="button-primary flex flex-col items-center justify-center gap-1 py-4"
                      href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={WhatsappIcon} size={20} />
                        <span className="font-semibold">{t.getInvolved.whatsappCta}</span>
                      </div>
                      <span className="text-xs opacity-90">{t.getInvolved.whatsappMembers}</span>
                    </a>
                  </div>
                </article>
              </div>
            </section>
          </FadeInSection>

          {/* Events Section */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section
              className="section-container"
              id="events"
            >
              <div className="space-y-4 text-center mb-12">
                <p className="eyebrow">
                  {t.events.eyebrow}
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.events.title}
                </h2>
                <p className="text-lg text-slate-700 max-w-2xl mx-auto">
                  {t.events.description}
                </p>
              </div>
              <CalendarSection
                calendarPlaceholder={t.events.calendarPlaceholder}
                subscribeText={t.events.subscribe}
              />
            </section>
          </FadeInSection>

          {/* Activities Section - with visual grouping */}
          <FadeInSection variant="slide-up" delay={150} as="section">
            <section className="section-content" id="activities">
              <div className="space-y-4 text-center mb-10">
                <p className="eyebrow">{t.activities.eyebrow || "Programs"}</p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.activities.title}
                </h2>
                <p className="text-lg text-slate-700 max-w-2xl mx-auto">
                  {t.activities.description}
                </p>
              </div>
              {/* Visual grouping container for program cards */}
              <div className="programs-container">
                <div className="card-grid">
                  {[
                    {
                      slug: "activity-fundamentals",
                      route: "fundamentals",
                      eyebrow: t.activities.items.fundamentals.eyebrow,
                      title: t.activities.items.fundamentals.title,
                      description: t.activities.items.fundamentals.description,
                      metaItems: [
                        { icon: "calendar", text: t.activities.items.fundamentals.schedule },
                        { icon: "clock", text: t.activities.items.fundamentals.duration },
                      ],
                    },
                    {
                      slug: "activity-workshop",
                      route: "workshop",
                      eyebrow: t.activities.items.workshop.eyebrow,
                      title: t.activities.items.workshop.title,
                      description: t.activities.items.workshop.description,
                      metaItems: [
                        { icon: "calendar", text: t.activities.items.workshop.schedule },
                        { icon: "clock", text: t.activities.items.workshop.duration },
                      ],
                    },
                    {
                      slug: "activity-reading",
                      route: "reading",
                      eyebrow: t.activities.items.reading.eyebrow,
                      title: t.activities.items.reading.title,
                      description: t.activities.items.reading.description,
                      metaItems: [
                        { icon: "calendar", text: t.activities.items.reading.schedule },
                        { icon: "clock", text: t.activities.items.reading.duration },
                      ],
                    },
                  ].map((activity) => (
                    <article
                      key={activity.title}
                      className="card-glass card-refined"
                    >
                      <div className="card-eyebrow">{activity.eyebrow}</div>
                      <AnimatedTitle
                        text={activity.title}
                        slug={activity.slug}
                        className="card-title"
                        as="h3"
                      />
                      <p className="card-body">{activity.description}</p>

                      <div className="card-meta">
                        {activity.metaItems.map((item, idx) => (
                          <span key={idx} className="pill">
                            {item.icon === "calendar" ? (
                              <HugeiconsIcon icon={Calendar03Icon} size={16} />
                            ) : (
                              <HugeiconsIcon icon={Clock01Icon} size={16} />
                            )}
                            {item.text}
                          </span>
                        ))}
                      </div>

                      <div className="card-footer">
                        {activity.route === "reading" && (
                          <a
                            className="button-primary"
                            href="https://t.me/+zhSGhXrn56g1YjVh"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <HugeiconsIcon icon={TelegramIcon} size={18} />
                            {t.activities.joinTelegram}
                          </a>
                        )}
                        <TransitionLink
                          className="link-arrow"
                          href={`/${currentLocale}/activities/${activity.route}`}
                        >
                          {t.activities.learnMore}
                          <span>→</span>
                        </TransitionLink>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </FadeInSection>

        </div>
      </main>
      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
