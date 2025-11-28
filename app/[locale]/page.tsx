import dynamic from "next/dynamic";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { TransitionLink } from "@/app/components/transition-link";
import { HeroTimeline } from "@/app/components/hero-timeline";
import { getDictionary } from "./dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
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
} from "@hugeicons/core-free-icons";


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

                {/* Timeline integrated into hero */}
                <HeroTimeline
                  steps={[
                    {
                      icon: UserGroupIcon,
                      shortLabel: "Join",
                      fullTitle: "Join our community",
                      description: "Connect with 200+ members on WhatsApp and Telegram",
                      link: "https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P",
                      isExternal: true,
                    },
                    {
                      icon: Book02Icon,
                      shortLabel: "Learn",
                      fullTitle: "Learn the fundamentals",
                      description: "13-week AI Safety Fundamentals course",
                      link: "/activities/fundamentals",
                    },
                    {
                      icon: Wrench01Icon,
                      shortLabel: "Build",
                      fullTitle: "Build technical skills",
                      description: "Weekly workshop replicating AI safety papers",
                      link: "/activities/workshop",
                    },
                    {
                      icon: MicroscopeIcon,
                      shortLabel: "Research",
                      fullTitle: "Contribute to research",
                      description: "6-month fellowship with mentorship & stipend",
                      link: "https://scholarship.aisafety.ar/",
                      isExternal: true,
                    },
                  ]}
                  locale={currentLocale}
                />
              </div>
            </section>
          </FadeInSection>

          {/* Events Section */}
          <FadeInSection variant="slide-up" delay={50} as="section">
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
          <FadeInSection variant="slide-up" delay={100} as="section">
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

          {/* Get Involved Section */}
          <FadeInSection variant="slide-up" delay={150} as="section">
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
