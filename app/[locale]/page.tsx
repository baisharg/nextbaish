import dynamic from "next/dynamic";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { TransitionLink } from "@/app/components/transition-link";
import { ScrollToButton } from "@/app/components/scroll-to-button";
import { getDictionary } from "./dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Clock01Icon, TelegramIcon, WhatsappIcon } from "@hugeicons/core-free-icons";

// Lazy load below-the-fold components for better initial load
const CalendarSection = dynamic(() => import("@/app/components/calendar-section"), {
  loading: () => (
    <div className="flex h-[450px] w-full items-center justify-center rounded-xl bg-slate-50 animate-pulse" />
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
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="main-sections">
          {/* Hero Section - Lead with Value Prop */}
          <FadeInSection variant="slide-up" as="section" startVisible={true}>
            <section
              className="relative px-6 py-20 sm:px-16 lg:py-28"
              id="about"
            >
              <div className="max-w-4xl mx-auto text-center">
                {/* Eyebrow */}
                <p className="eyebrow">
                  {t.mission.eyebrow}
                </p>

                {/* Larger headline */}
                <AnimatedTitle
                  text={t.mission.title}
                  slug="home"
                  className="mb-6"
                  as="h1"
                />

                {/* Punchy tagline */}
                <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto mb-10">
                  {t.mission.tagline}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <ScrollToButton targetId="getting-started">
                    {t.mission.cta}
                    <span aria-hidden>→</span>
                  </ScrollToButton>
                  <a
                    className="button-primary"
                    href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <HugeiconsIcon icon={WhatsappIcon} size={18} />
                    {t.getInvolved.whatsappCta}
                  </a>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Getting Started Pathway */}
          <FadeInSection variant="slide-up" delay={50} as="section">
            <section className="section-container" id="getting-started">
              <div className="space-y-4 text-center mb-10">
                <p className="eyebrow">{t.gettingStarted.eyebrow}</p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.gettingStarted.title}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {t.gettingStarted.description}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(t.gettingStarted.steps as Array<{number: string; title: string; description: string; cta: string; link: string}>).map((step) => (
                  <article
                    key={step.number}
                    className="card-glass relative group"
                  >
                    <span className="absolute top-4 right-4 text-4xl font-bold text-[var(--color-accent-primary)]/10 group-hover:text-[var(--color-accent-primary)]/20 transition">
                      {step.number}
                    </span>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      {step.link.startsWith("http") ? (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-arrow text-sm"
                        >
                          {step.cta} <span>→</span>
                        </a>
                      ) : (
                        <TransitionLink
                          href={`/${currentLocale}${step.link}`}
                          className="link-arrow text-sm"
                        >
                          {step.cta} <span>→</span>
                        </TransitionLink>
                      )}
                    </div>
                  </article>
                ))}
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

          {/* Activities Section */}
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section className="section-content" id="activities">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.activities.title}
                </h2>
                <p className="text-lg text-slate-700">
                  {t.activities.description}
                </p>
              </div>
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
                  className="card-glass dither-macrogrid"
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
          </section>
        </FadeInSection>

          {/* Success Stories / Impact Section */}
          <FadeInSection variant="slide-up" delay={250} as="section">
            <section className="section-container" id="impact">
              <div className="space-y-4 text-center mb-10">
                <p className="eyebrow">{t.successStories.eyebrow}</p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.successStories.title}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {t.successStories.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {(t.successStories.stats as Array<{number: string; label: string}>).map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-xl bg-white/50 border border-slate-200">
                    <div className="text-3xl font-bold text-[var(--color-accent-primary)]">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Story Cards */}
              <div className="grid gap-4 md:grid-cols-2 mb-8">
                {(t.successStories.stories as Array<{name: string; role: string; quote: string; link: string | null}>).map((story) => (
                  <article key={story.name} className="card-glass">
                    <blockquote className="text-slate-700 italic mb-4">
                      "{story.quote}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{story.name}</div>
                        <div className="text-sm text-[var(--color-accent-primary)]">{story.role}</div>
                      </div>
                      {story.link && (
                        <a
                          href={story.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-[var(--color-accent-primary)] transition"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {/* CTA to Research page */}
              <div className="text-center">
                <TransitionLink
                  href={`/${currentLocale}${t.successStories.ctaLink}`}
                  className="link-arrow"
                >
                  {t.successStories.cta} <span>→</span>
                </TransitionLink>
              </div>
            </section>
          </FadeInSection>

          {/* Get Involved Section */}
          <FadeInSection variant="slide-up" delay={350} as="section">
            <section
              className="section-container grid gap-6 md:grid-cols-2"
              id="get-involved"
            >
              <SupascribeSignup t={dict.substack} />

              <article className="card-glass">
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
          </section>
        </FadeInSection>
        </div>
      </main>
      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
