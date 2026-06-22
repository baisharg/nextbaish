import type { Metadata } from "next";
import { AnimatedTitle } from "@/app/components/animated-title";
import { FadeInSection } from "@/app/components/fade-in-section";
import Footer from "@/app/components/footer";
import { TransitionLink } from "@/app/components/transition-link";
import {
  BreadcrumbJsonLd,
  ActivitiesEventsJsonLd,
} from "@/app/components/json-ld";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import {
  Calendar03Icon,
  Clock01Icon,
  PinLocation01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getDictionary } from "../dictionaries";
import {
  COURSE_OPPORTUNITY_CTA_LABELS,
  COURSE_OPPORTUNITY_STATUS_LABELS,
  getCourseOpportunities,
  resolveApplyUrl,
} from "@/app/data/course-opportunities";
import { generatePageMetadata, SEO_CONTENT } from "@/app/utils/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const content = SEO_CONTENT.activities[currentLocale];

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    path: "/activities",
    locale: currentLocale,
  });
}

type PastProgramCard = {
  eyebrow: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  cta: string;
  link: string;
  slug?: string;
  external?: boolean;
};

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
  const pastPrograms = t.pastPrograms;
  const pastProgramCards: PastProgramCard[] = Array.isArray(pastPrograms?.cards)
    ? pastPrograms.cards
    : [];
  const pastProgramCount = pastProgramCards.length;
  const courseOpportunities = await getCourseOpportunities();
  const courseStatusLabels = COURSE_OPPORTUNITY_STATUS_LABELS[currentLocale];
  const courseCtaLabels = COURSE_OPPORTUNITY_CTA_LABELS[currentLocale];

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
      <BreadcrumbJsonLd
        items={[
          { name: t.breadcrumb.home, url: "" },
          { name: t.breadcrumb.current, url: "/activities" },
        ]}
        locale={currentLocale}
      />
      <ActivitiesEventsJsonLd locale={currentLocale} />
      {/* Constrained Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="py-16">
          <div className="main-sections">
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
              </div>
            </section>
          </FadeInSection>

        </div>
      </div>

      {/* Program Cards */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col gap-20 pb-16">
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {dict.home.activities.title}
                </h2>
                <p className="text-base text-slate-600">
                  {dict.home.activities.description}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courseOpportunities.map((opportunity) => {
                  const activity = dict.home.activities.items[opportunity.id];

                  return (
                    <article
                      key={opportunity.id}
                      id={opportunity.id}
                      className="card-glass scroll-mt-24"
                    >
                      <div className="card-eyebrow">{activity.eyebrow}</div>
                      <AnimatedTitle
                        text={activity.title}
                        slug={`activity-${opportunity.id}`}
                        className="card-title"
                        as="h3"
                      />
                      <p className="card-body">{activity.description}</p>

                      <div className="card-meta">
                        <span className="pill">
                          <HugeiconsIcon icon={Calendar03Icon} size={16} />
                          {courseStatusLabels[opportunity.status]}
                        </span>
                        <span className="pill">
                          <HugeiconsIcon icon={Clock01Icon} size={16} />
                          {activity.duration}
                        </span>
                      </div>

                      <div className="card-footer">
                        <a
                          className="button-primary w-full"
                          href={resolveApplyUrl(opportunity)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {courseCtaLabels[opportunity.status]}
                        </a>
                        <a
                          className="link-arrow"
                          href={opportunity.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {dict.home.activities.learnMore}
                          <span>→</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </FadeInSection>


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

          {/* Past Programs */}
          {pastProgramCount ? (
            <FadeInSection variant="slide-up" delay={240} as="section">
              <section className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {pastPrograms?.title ?? ""}
                  </h2>
                  <p className="text-base text-slate-600">
                    {pastPrograms?.description ?? ""}
                  </p>
                </div>
                <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
                  {pastProgramCards.map((program) => {
                    const programSlug =
                      program.slug ??
                      program.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    const metaItems = [
                      { icon: "calendar" as const, text: program.date },
                      ...(program.location
                        ? [
                            {
                              icon: "location" as const,
                              text: program.location,
                            },
                          ]
                        : []),
                    ];
                    return (
                      <article
                        key={program.title}
                        className="card-glass"
                      >
                        <div className="card-eyebrow">{program.eyebrow}</div>
                        <AnimatedTitle
                          text={program.title}
                          slug={programSlug}
                          className="card-title"
                          as="h3"
                        />
                        <p className="card-body">{program.description}</p>

                        <div className="card-meta">
                          {metaItems.map((item, idx) => (
                            <span key={idx} className="pill">
                              <HugeiconsIcon
                                icon={
                                  item.icon === "calendar"
                                    ? Calendar03Icon
                                    : PinLocation01Icon
                                }
                                size={16}
                              />
                              {item.text}
                            </span>
                          ))}
                        </div>

                        <div className="card-footer">
                          <TransitionLink
                            className="button-primary w-full"
                            href={`/${currentLocale}${program.link}`}
                          >
                            {program.cta}
                            <span>→</span>
                          </TransitionLink>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </FadeInSection>
          ) : null}

          {/* Sister Projects Section */}
          <FadeInSection variant="slide-up" delay={300} as="section">
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.sisterProjects.title}
                </h2>
                <p className="text-base text-slate-600">
                  {t.sisterProjects.description}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <article className="card-glass">
                  <div className="card-eyebrow">{dict.home.aisar.eyebrow}</div>
                  <AnimatedTitle
                    text={dict.home.aisar.title}
                    slug="aisar"
                    className="card-title"
                    as="h3"
                  />
                  <p className="card-body">{dict.home.aisar.description}</p>

                  <div className="card-meta">
                    <span className="pill">
                      <HugeiconsIcon icon={Clock01Icon} size={16} />
                      {dict.home.aisar.duration}
                    </span>
                    <span className="pill">
                      <HugeiconsIcon icon={Calendar03Icon} size={16} />
                      {dict.home.aisar.commitment}
                    </span>
                  </div>

                  <div className="card-footer">
                    <a
                      className="button-primary w-full"
                      href="https://scholarship.aisafety.ar/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {dict.home.aisar.visitWebsite}
                      <span>→</span>
                    </a>
                  </div>
                </article>

                <article className="card-glass">
                  <div className="card-eyebrow">{t.lanais.eyebrow}</div>
                  <AnimatedTitle
                    text={t.lanais.title}
                    slug="lanais"
                    className="card-title"
                    as="h3"
                  />
                  <p className="text-sm font-medium text-slate-600 mb-3">
                    {t.lanais.subtitle}
                  </p>
                  <p className="card-body">{t.lanais.description}</p>

                  <div className="card-footer">
                    <a
                      className="button-primary w-full"
                      href="https://lanais.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.lanais.visitWebsite}
                      <span>→</span>
                    </a>
                  </div>
                </article>

                <article className="card-glass">
                  <div className="card-eyebrow">{t.fair.eyebrow}</div>
                  <AnimatedTitle
                    text={t.fair.title}
                    slug="fair"
                    className="card-title"
                    as="h3"
                  />
                  <p className="text-sm font-medium text-slate-600 mb-3">
                    {t.fair.subtitle}
                  </p>
                  <p className="card-body">{t.fair.description}</p>

                  <div className="card-footer">
                    <a
                      className="button-primary w-full"
                      href="https://frontierartificialinteligenceresearch.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.fair.visitWebsite}
                      <span>→</span>
                    </a>
                  </div>
                </article>
              </div>
            </section>
          </FadeInSection>
          </div>
        </div>
      </div>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
