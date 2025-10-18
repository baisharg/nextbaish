import dynamic from "next/dynamic";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { getDictionary } from "./dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { renderWithFootnotes } from "@/app/utils/footnotes";

// Lazy load below-the-fold components for better initial load
const CalendarSection = dynamic(() => import("@/app/components/calendar-section"), {
  loading: () => (
    <div className="flex h-[450px] w-full items-center justify-center rounded-xl bg-slate-50 animate-pulse" />
  ),
});

const SubstackSignup = dynamic(() => import("@/app/components/substack-signup"), {
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
      <Header locale={currentLocale} t={dict.header} />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Mission Section */}
        <FadeInSection variant="slide-up" as="section">
          <section
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-16 sm:px-16"
            id="about"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-6 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-accent-tertiary)]">
              {t.mission.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {t.mission.title}
            </h1>

            <article className="space-y-6 text-lg text-slate-700">
              <p>{renderWithFootnotes(t.mission.paragraph1)}</p>
              <p>{renderWithFootnotes(t.mission.paragraph2)}</p>
              <p>{t.mission.paragraph3}</p>
            </article>

            <div>
              <a
                className="button-primary"
                href="https://baish.com.ar/#get-involved"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t.mission.cta}
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
          </section>
        </FadeInSection>

        {/* Events Section */}
        <FadeInSection variant="slide-up" delay={100} as="section">
          <section
            className="relative overflow-hidden space-y-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            id="events"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-accent-tertiary)]">
              {t.events.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              {t.events.title}
            </h2>
            <p className="text-base text-slate-600">
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
          <section className="space-y-8" id="activities">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900">
              {t.activities.title}
            </h2>
            <p className="text-base text-slate-600">
              {t.activities.description}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                eyebrow: t.activities.items.mechInterp.eyebrow,
                title: t.activities.items.mechInterp.title,
                description: t.activities.items.mechInterp.description,
                metaItems: [
                  { icon: "calendar", text: t.activities.items.mechInterp.schedule },
                  { icon: "clock", text: t.activities.items.mechInterp.duration },
                ],
              },
              {
                eyebrow: t.activities.items.discussion.eyebrow,
                title: t.activities.items.discussion.title,
                description: t.activities.items.discussion.description,
                metaItems: [
                  { icon: "calendar", text: t.activities.items.discussion.schedule },
                  { icon: "clock", text: t.activities.items.discussion.duration },
                ],
              },
              {
                eyebrow: t.activities.items.reading.eyebrow,
                title: t.activities.items.reading.title,
                description: t.activities.items.reading.description,
                metaItems: [
                  { icon: "calendar", text: t.activities.items.reading.schedule },
                  { icon: "clock", text: t.activities.items.reading.duration },
                ],
              },
              {
                eyebrow: t.activities.items.fundamentals.eyebrow,
                title: t.activities.items.fundamentals.title,
                description: t.activities.items.fundamentals.description,
                metaItems: [
                  { icon: "calendar", text: t.activities.items.fundamentals.schedule },
                  { icon: "clock", text: t.activities.items.fundamentals.duration },
                ],
              },
            ].map((activity) => (
              <article
                key={activity.title}
                className="card-glass"
              >
                <div className="card-eyebrow">{activity.eyebrow}</div>
                <h3 className="card-title">{activity.title}</h3>
                <p className="card-body">{activity.description}</p>

                <div className="card-meta">
                  {activity.metaItems.map((item, idx) => (
                    <span key={idx} className="pill">
                      {item.icon === "calendar" ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      )}
                      {item.text}
                    </span>
                  ))}
                </div>

                <div className="card-footer">
                  <a
                    className="button-primary"
                    href="#contact"
                  >
                    {t.activities.joinNow}
                  </a>
                  <a
                    className="link-arrow"
                    href="#contact"
                  >
                    {t.activities.learnMore}
                    <span>→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
          </section>
        </FadeInSection>

        {/* Resources Section */}
        <FadeInSection variant="slide-up" delay={300} as="section">
          <section
            className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] p-8 shadow-sm"
            id="resources"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900">
              {t.resources.title}
            </h2>
            <p className="text-base text-slate-600">
              {t.resources.description}
            </p>
          </div>
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                eyebrow: t.resources.items.reading.eyebrow,
                title: t.resources.items.reading.title,
                description: t.resources.items.reading.description,
                metaItems: [
                  { icon: "book", text: t.resources.items.reading.meta },
                ],
              },
              {
                eyebrow: t.resources.items.toolkit.eyebrow,
                title: t.resources.items.toolkit.title,
                description: t.resources.items.toolkit.description,
                metaItems: [
                  { icon: "book", text: t.resources.items.toolkit.meta },
                ],
              },
              {
                eyebrow: t.resources.items.handbook.eyebrow,
                title: t.resources.items.handbook.title,
                description: t.resources.items.handbook.description,
                metaItems: [
                  { icon: "book", text: t.resources.items.handbook.meta },
                ],
              },
            ].map((resource) => (
              <article
                key={resource.title}
                className="card-glass"
              >
                <div className="card-eyebrow">{resource.eyebrow}</div>
                <h3 className="card-title">{resource.title}</h3>
                <p className="card-body">{resource.description}</p>

                <div className="card-meta">
                  {resource.metaItems.map((item, idx) => (
                    <span key={idx} className="pill">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      {item.text}
                    </span>
                  ))}
                </div>

                <div className="card-footer">
                  <a
                    className="button-primary"
                    href="#contact"
                  >
                    {t.resources.viewResource}
                  </a>
                  <a
                    className="link-arrow"
                    href="#contact"
                  >
                    {t.resources.learnMore}
                    <span>→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
          </section>
        </FadeInSection>

        {/* Get Involved Section */}
        <FadeInSection variant="slide-up" delay={400} as="section">
          <section
            className="relative overflow-hidden grid gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] p-8 shadow-sm md:grid-cols-2"
            id="get-involved"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <SubstackSignup t={dict.substack} />

          <article className="card-glass">
            <div className="card-eyebrow">{t.getInvolved.communityEyebrow}</div>
            <h3 className="card-title">
              {t.getInvolved.communityTitle}
            </h3>
            <p className="card-body">
              {t.getInvolved.communityDescription}
            </p>
            <a
              className="button-outline mt-auto"
              href="https://t.me/+zhSGhXrn56g1YjVh"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t.getInvolved.telegramCta}
            </a>
          </article>
          </section>
        </FadeInSection>
      </main>
      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
