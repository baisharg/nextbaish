import Link from "next/link";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import CalendarSection from "@/app/components/calendar-section";
import EventsCarousel from "@/app/components/events-carousel";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

export default async function Activities({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.activities;
  const mechInterp = t.mechInterp;
  const agiSafety = t.agiSafety;
  const weeklyDiscussion = t.weeklyDiscussion;
  const paperReading = t.paperReading;
  const common = t.common;
  const gallery = t.gallery;

  // Gallery images - replace these paths with your actual event photos
  const galleryImages = [
    { src: "/images/events/event-1.jpg", alt: "Community event" },
    { src: "/images/events/event-2.jpg", alt: "Community event" },
    { src: "/images/events/event-3.jpg", alt: "Community event" },
    { src: "/images/events/event-4.jpg", alt: "Community event" },
    { src: "/images/events/event-5.jpg", alt: "Community event" },
    { src: "/images/events/event-6.jpg", alt: "Community event" },
  ];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <Header locale={currentLocale} t={dict.header} />

      {/* Constrained Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col gap-20 py-16">
          {/* Page Header */}
          <FadeInSection variant="fade" as="section">
            <section className="space-y-6">
              <div className="text-sm text-slate-600">
                <Link href={`/${currentLocale}`} className="hover:text-slate-900">
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
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
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

        {/* Mech Interp Course */}
        <FadeInSection variant="slide-up" delay={200} as="section">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">🧠</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {mechInterp.title}
                  </h2>
                  <span className="inline-flex rounded-full bg-[#9275E51a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
                    {mechInterp.dates}
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-4 text-base text-slate-700">
                    <p>{mechInterp.description}</p>
                    <p>{mechInterp.overview}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {mechInterp.curriculumTitle}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      {mechInterp.curriculum.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="text-[var(--color-accent-primary)]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {mechInterp.timeCommitmentTitle}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      {mechInterp.timeCommitment.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="text-[var(--color-accent-primary)]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {mechInterp.prerequisitesTitle}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      {mechInterp.prerequisites.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="text-[var(--color-accent-primary)]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/${currentLocale}/mech-interp-course`}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                    >
                      {mechInterp.viewDetails}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {mechInterp.courseDetails}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.duration}
                        </dt>
                        <dd className="text-slate-700">{mechInterp.duration}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.startDate}
                        </dt>
                        <dd className="text-slate-700">{mechInterp.startDate}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.endDate}
                        </dt>
                        <dd className="text-slate-700">{mechInterp.endDate}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.applicationDeadline}
                        </dt>
                        <dd className="text-slate-700">{mechInterp.applicationDeadline}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.location}
                        </dt>
                        <dd className="text-slate-700">{mechInterp.location}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.instructors}
                        </dt>
                        <dd className="text-slate-700">{mechInterp.instructors}</dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <Link
                        href={`/${currentLocale}/contact#mech-interp`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                      >
                        {mechInterp.expressInterest}
                      </Link>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* AGI Safety Fundamentals */}
        <FadeInSection variant="slide-up" delay={300} as="section">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">📚</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {agiSafety.title}
                  </h2>
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
                          <span className="text-[var(--color-accent-primary)]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {agiSafety.programDetails}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.duration}
                        </dt>
                        <dd className="text-slate-700">{agiSafety.duration}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.fellowshipPeriod}
                        </dt>
                        <dd className="text-slate-700">{agiSafety.fellowshipPeriod}</dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <a
                        href="https://course.aisafetyfundamentals.com/alignment"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {agiSafety.viewCurriculum}
                      </a>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Weekly Discussion Group */}
        <FadeInSection variant="slide-up" delay={400} as="section">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">💬</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {weeklyDiscussion.title}
                  </h2>
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    {weeklyDiscussion.schedule}
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-4 text-base text-slate-700">
                    <p>{weeklyDiscussion.description}</p>
                    <p>{weeklyDiscussion.overview}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {weeklyDiscussion.formatTitle}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      {weeklyDiscussion.format.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="text-[var(--color-accent-primary)]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {weeklyDiscussion.participationTitle}
                    </h3>
                    <p className="text-base text-slate-700">
                      {weeklyDiscussion.participationText}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {weeklyDiscussion.nextDiscussion}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.date}
                        </dt>
                        <dd className="text-slate-700">{weeklyDiscussion.date}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.time}
                        </dt>
                        <dd className="text-slate-700">{weeklyDiscussion.time}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.location}
                        </dt>
                        <dd className="text-slate-700">{weeklyDiscussion.location}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.topic}
                        </dt>
                        <dd className="text-slate-700">{weeklyDiscussion.topic}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.facilitator}
                        </dt>
                        <dd className="text-slate-700">{weeklyDiscussion.facilitator}</dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <a
                        href="https://t.me/+zhSGhXrn56g1YjVh"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {weeklyDiscussion.joinTelegram}
                      </a>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Paper Reading Club */}
        <FadeInSection variant="slide-up" delay={500} as="section">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">📝</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {paperReading.title}
                  </h2>
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
                          <span className="text-[var(--color-accent-primary)]">•</span>
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
                          <span className="text-[var(--color-accent-primary)]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {paperReading.nextSession}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.date}
                        </dt>
                        <dd className="text-slate-700">{paperReading.date}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.time}
                        </dt>
                        <dd className="text-slate-700">{paperReading.time}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.location}
                        </dt>
                        <dd className="text-slate-700">{paperReading.location}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.paper}
                        </dt>
                        <dd className="text-slate-700">{paperReading.paper}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {common.discussionLead}
                        </dt>
                        <dd className="text-slate-700">{paperReading.discussionLead}</dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <Link
                        href={`/${currentLocale}/resources#papers`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                      >
                        {paperReading.accessList}
                      </Link>
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
