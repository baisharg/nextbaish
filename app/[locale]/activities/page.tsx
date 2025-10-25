import { AnimatedTitle } from "@/app/components/animated-title";
import CalendarSection from "@/app/components/calendar-section";
import { FadeInSection } from "@/app/components/fade-in-section";
import Footer from "@/app/components/footer";
import { TransitionLink } from "@/app/components/transition-link";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getDictionary } from "../dictionaries";

// Lazy load EventsCarousel since it's below the fold
const EventsCarousel = dynamic(
  () => import("@/app/components/events-carousel"),
  {
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
    ),
  },
);

export default async function Activities({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.activities;
  const gallery = t.gallery;

  // Gallery images from past BAISH events
  const galleryImages = [
    {
      src: "/images/events/baish-team-branding.jpg",
      alt: "BAISH team photo with branding and Argentine flag at AI safety conference",
    },
    {
      src: "/images/events/community-group-photo.jpg",
      alt: "Large group photo from AI Safety Connect event showing community members",
    },
    {
      src: "/images/events/coding-workshop-golden-hour.jpg",
      alt: "Vibe coding workshop participants during golden hour",
    },
    {
      src: "/images/events/ai-safety-banner.jpg",
      alt: "AI Safety Argentina banner at community event entrance",
    },
    {
      src: "/images/events/retreat-study-session.jpg",
      alt: "Study group retreat session with natural lighting",
    },
    {
      src: "/images/events/team-argentina-flag.jpg",
      alt: "Team photo holding Argentine flag at international AI safety event",
    },
  ];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      {/* Constrained Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col gap-20 py-16">
          {/* Page Header */}
          <FadeInSection variant="fade" as="section">
            <section className="space-y-6">
              <div className="text-sm text-slate-600">
                <Link
                  href={`/${currentLocale}`}
                  className="hover:text-slate-900"
                >
                  {t.breadcrumb.home}
                </Link>
                {" / "}
                <span className="text-slate-900">{t.breadcrumb.current}</span>
              </div>
              <div className="space-y-4">
                <AnimatedTitle
                  text={t.title}
                  slug="activities"
                  className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                  as="h1"
                />
                <p className="text-lg text-slate-700 max-w-3xl">
                  {t.description}
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.google.com/calendar/render?cid=http%3A%2F%2Fapi.lu.ma%2Fics%2Fget%3Fentity%3Dcalendar%26id%3Dcal-0oFAsTn5vpwcAwb"
                    className="button-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <HugeiconsIcon icon={Calendar03Icon} size={18} />
                    {t.subscribeCalendar}
                  </a>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Events Calendar Section */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section className="relative overflow-hidden space-y-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
              <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
              <div className="relative space-y-4 text-center">
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-accent-tertiary)]">
                  {dict.home.events.eyebrow}
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {dict.home.events.title}
                </h2>
              </div>
              <CalendarSection
                calendarPlaceholder={dict.home.events.calendarPlaceholder}
                subscribeText={dict.home.events.subscribe}
              />
            </section>
          </FadeInSection>
        </div>
      </div>

      {/* Past Events Carousel - Full Width */}
      <FadeInSection variant="fade" delay={150}>
        <section className="relative bg-white pt-8 pb-16 mb-20 shadow-sm">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <div className="space-y-4 text-center mb-12">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-accent-tertiary)]">
                {gallery.eyebrow}
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                {gallery.title}
              </h2>
              <p className="text-base text-slate-700 max-w-2xl mx-auto">
                {gallery.description}
              </p>
            </div>
          </div>

          <EventsCarousel images={galleryImages} />
        </section>
      </FadeInSection>

      {/* Program Cards */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col gap-20 pb-16">
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  Our Programs
                </h2>
                <p className="text-base text-slate-600">
                  Explore our programs and choose the one that fits your interests.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    slug: "activity-fundamentals",
                    route: "fundamentals",
                    eyebrow: dict.home.activities.items.fundamentals.eyebrow,
                    title: dict.home.activities.items.fundamentals.title,
                    description: dict.home.activities.items.fundamentals.description,
                    metaItems: [
                      { icon: "calendar", text: dict.home.activities.items.fundamentals.schedule },
                      { icon: "clock", text: dict.home.activities.items.fundamentals.duration },
                    ],
                    isExternal: false,
                  },
                  {
                    slug: "activity-workshop",
                    route: "workshop",
                    eyebrow: dict.home.activities.items.workshop.eyebrow,
                    title: dict.home.activities.items.workshop.title,
                    description: dict.home.activities.items.workshop.description,
                    metaItems: [
                      { icon: "calendar", text: dict.home.activities.items.workshop.schedule },
                      { icon: "clock", text: dict.home.activities.items.workshop.duration },
                    ],
                    isExternal: false,
                  },
                  {
                    slug: "activity-reading",
                    route: "reading",
                    eyebrow: dict.home.activities.items.reading.eyebrow,
                    title: dict.home.activities.items.reading.title,
                    description: dict.home.activities.items.reading.description,
                    metaItems: [
                      { icon: "calendar", text: dict.home.activities.items.reading.schedule },
                      { icon: "clock", text: dict.home.activities.items.reading.duration },
                    ],
                    isExternal: false,
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
                      <TransitionLink
                        className="button-primary w-full"
                        href={`/${currentLocale}/activities/${activity.route}`}
                      >
                        {dict.home.activities.learnMore}
                        <span>→</span>
                      </TransitionLink>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </FadeInSection>
        </div>
      </div>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
