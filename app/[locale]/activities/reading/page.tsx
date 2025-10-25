import { AnimatedTitle } from "@/app/components/animated-title";
import { FadeInSection } from "@/app/components/fade-in-section";
import Footer from "@/app/components/footer";
import { TransitionLink } from "@/app/components/transition-link";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { NoteEditIcon, TelegramIcon, YoutubeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getDictionary } from "../../dictionaries";

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.activities;
  const paperReading = t.paperReading;
  const common = t.common;

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      {/* Constrained Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col gap-20 py-16 pb-32">
          {/* Breadcrumb */}
          <FadeInSection variant="fade" as="div">
            <div className="text-sm text-slate-600">
              <TransitionLink
                href={`/${currentLocale}`}
                className="hover:text-slate-900"
              >
                {t.breadcrumb.home}
              </TransitionLink>
              {" / "}
              <TransitionLink
                href={`/${currentLocale}/activities`}
                className="hover:text-slate-900"
              >
                {t.breadcrumb.current}
              </TransitionLink>
              {" / "}
              <span className="text-slate-900">{paperReading.title}</span>
            </div>
          </FadeInSection>

          {/* Paper Reading Club */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 sm:px-12">
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
                      as="h1"
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
                      <h2 className="text-xl font-semibold text-slate-900">
                        {paperReading.selectionCriteriaTitle}
                      </h2>
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
                      <h2 className="text-xl font-semibold text-slate-900">
                        {paperReading.sessionFormatTitle}
                      </h2>
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
                      <h2 className="relative mb-4 text-xl font-semibold text-slate-900">
                        {paperReading.nextSession}
                      </h2>
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
                          href="https://t.me/clubdelpaper"
                          className="button-secondary w-full flex items-center justify-center gap-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <HugeiconsIcon icon={TelegramIcon} size={20} />
                          {paperReading.telegramGroup}
                        </a>
                        <a
                          href="https://www.youtube.com/@clubdelpaper"
                          className="button-primary w-full flex items-center justify-center gap-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <HugeiconsIcon icon={YoutubeIcon} size={20} />
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
