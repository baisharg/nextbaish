import { AnimatedTitle } from "@/app/components/animated-title";
import CalendarSection from "@/app/components/calendar-section";
import { FadeInSection } from "@/app/components/fade-in-section";
import Footer from "@/app/components/footer";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import {
  AiChemistry01Icon,
  Book02Icon,
  Calendar03Icon,
  NoteEditIcon,
} from "@hugeicons/core-free-icons";
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
  const agiSafety = t.agiSafety;
  const aisWorkshop = t.aisWorkshop;
  const paperReading = t.paperReading;
  const common = t.common;
  const gallery = t.gallery;

  // Gallery images - replace these paths with your actual event photos
  const galleryImages = [
    {
      src: "https://placehold.co/800x600/9275E5/white?text=Event+Photo+1",
      alt: "Community event",
    },
    {
      src: "https://placehold.co/800x600/A8C5FF/white?text=Event+Photo+2",
      alt: "Community event",
    },
    {
      src: "https://placehold.co/800x600/C77DDA/white?text=Event+Photo+3",
      alt: "Community event",
    },
    {
      src: "https://placehold.co/800x600/9275E5/white?text=Event+Photo+4",
      alt: "Community event",
    },
    {
      src: "https://placehold.co/800x600/A8C5FF/white?text=Event+Photo+5",
      alt: "Community event",
    },
    {
      src: "https://placehold.co/800x600/C77DDA/white?text=Event+Photo+6",
      alt: "Community event",
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
                    className="button-secondary"
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

      {/* Constrained Content Continues */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col gap-20">
          {/* AI Safety Fundamentals */}
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section
              id="fundamentals"
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 sm:px-12"
            >
              <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
              <div className="relative space-y-8">
                <div className="space-y-4">
                  <div>
                    <HugeiconsIcon
                      icon={Book02Icon}
                      size={48}
                      className="text-[var(--color-accent-primary)]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <AnimatedTitle
                      text={agiSafety.title}
                      slug="activity-fundamentals"
                      className="text-3xl font-semibold text-slate-900"
                      as="h2"
                    />
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                      {agiSafety.status}
                    </span>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-4 text-base text-slate-700">
                      <p>{agiSafety.description}</p>
                      <p>{agiSafety.overview}</p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {agiSafety.whatToExpect}
                      </h3>
                      <ul className="space-y-2 text-base text-slate-700">
                        {agiSafety.expectations.map((item, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="text-[var(--color-accent-primary)]">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {agiSafety.whoWeSeek}
                      </h3>
                      <ul className="space-y-2 text-base text-slate-700">
                        {agiSafety.seekCriteria.map((item, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="text-[var(--color-accent-primary)]">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <article className="card-glass dither-macrogrid relative overflow-hidden p-6">
                      <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                      <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                        {agiSafety.programDetails}
                      </h3>
                      <dl className="relative space-y-3 text-sm">
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.duration}
                          </dt>
                          <dd className="text-slate-700">
                            {agiSafety.duration}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.time}
                          </dt>
                          <dd className="text-slate-700">
                            {agiSafety.fellowshipPeriod}
                          </dd>
                        </div>
                      </dl>
                      <div className="relative mt-6 space-y-3">
                        <a
                          href="https://course.aisafetyfundamentals.com/alignment"
                          className="button-primary w-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {agiSafety.viewCurriculum}
                        </a>
                        <Link
                          href={`/${currentLocale}/contact`}
                          className="button-secondary w-full"
                        >
                          {agiSafety.applyNow}
                        </Link>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* AIS Research Workshop */}
          <FadeInSection variant="slide-up" delay={300} as="section">
            <section
              id="workshop"
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            >
              <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
              <div className="relative space-y-8">
                <div className="space-y-4">
                  <div>
                    <HugeiconsIcon
                      icon={AiChemistry01Icon}
                      size={48}
                      className="text-[var(--color-accent-primary)]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <AnimatedTitle
                      text={aisWorkshop.title}
                      slug="activity-workshop"
                      className="text-3xl font-semibold text-slate-900"
                      as="h2"
                    />
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">
                      {aisWorkshop.schedule}
                    </span>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-4 text-base text-slate-700">
                      <p>{aisWorkshop.description}</p>
                      <p>{aisWorkshop.overview}</p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {aisWorkshop.whoWeSeek}
                      </h3>
                      <ul className="space-y-2 text-base text-slate-700">
                        {aisWorkshop.seekCriteria.map((item, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="text-[var(--color-accent-primary)]">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {aisWorkshop.formatTitle}
                      </h3>
                      <ul className="space-y-2 text-base text-slate-700">
                        {aisWorkshop.format.map((item, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="text-[var(--color-accent-primary)]">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <article className="card-glass dither-macrogrid relative overflow-hidden p-6">
                      <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                      <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                        {aisWorkshop.nextSession}
                      </h3>
                      <dl className="relative space-y-3 text-sm">
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.date}
                          </dt>
                          <dd className="text-slate-700">{aisWorkshop.date}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.time}
                          </dt>
                          <dd className="text-slate-700">{aisWorkshop.time}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.location}
                          </dt>
                          <dd className="text-slate-700">
                            {aisWorkshop.location}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.topic}
                          </dt>
                          <dd className="text-slate-700">
                            {aisWorkshop.topic}
                          </dd>
                        </div>
                      </dl>
                      <div className="relative mt-6 space-y-3">
                        <a
                          href="https://t.me/+zhSGhXrn56g1YjVh"
                          className="button-secondary w-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {aisWorkshop.joinTelegram}
                        </a>
                        <Link
                          href={`/${currentLocale}/contact`}
                          className="button-primary w-full"
                        >
                          {aisWorkshop.applyNow}
                        </Link>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Paper Reading Club */}
          <FadeInSection variant="slide-up" delay={400} as="section">
            <section
              id="reading"
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 sm:px-12"
            >
              <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
              <div className="relative space-y-8">
                <div className="space-y-4">
                  <div>
                    <HugeiconsIcon
                      icon={NoteEditIcon}
                      size={48}
                      className="text-[var(--color-accent-primary)]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <AnimatedTitle
                      text={paperReading.title}
                      slug="activity-reading"
                      className="text-3xl font-semibold text-slate-900"
                      as="h2"
                    />
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">
                      {paperReading.schedule}
                    </span>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-4 text-base text-slate-700">
                      <p>{paperReading.description}</p>
                      <p>{paperReading.overview}</p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {paperReading.selectionCriteriaTitle}
                      </h3>
                      <ul className="space-y-2 text-base text-slate-700">
                        {paperReading.criteria.map((item, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="text-[var(--color-accent-primary)]">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {paperReading.sessionFormatTitle}
                      </h3>
                      <ul className="space-y-2 text-base text-slate-700">
                        {paperReading.format.map((item, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="text-[var(--color-accent-primary)]">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <article className="card-glass dither-macrogrid relative overflow-hidden p-6">
                      <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                      <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                        {paperReading.nextSession}
                      </h3>
                      <dl className="relative space-y-3 text-sm">
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.date}
                          </dt>
                          <dd className="text-slate-700">
                            {paperReading.date}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.time}
                          </dt>
                          <dd className="text-slate-700">
                            {paperReading.time}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.location}
                          </dt>
                          <dd className="text-slate-700">
                            {paperReading.location}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.paper}
                          </dt>
                          <dd className="text-slate-700">
                            {paperReading.paper}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            {common.discussionLead}
                          </dt>
                          <dd className="text-slate-700">
                            {paperReading.discussionLead}
                          </dd>
                        </div>
                      </dl>
                      <div className="relative mt-6 space-y-3">
                        <a
                          href="https://t.me/+zhSGhXrn56g1YjVh"
                          className="button-secondary w-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {paperReading.telegramGroup}
                        </a>
                        <a
                          href="https://youtube.com/@baish-ai"
                          className="button-primary w-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {paperReading.youtubeChannel}
                        </a>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>
        </div>
      </div>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
