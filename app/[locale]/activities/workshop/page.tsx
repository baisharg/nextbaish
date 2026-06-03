import type { Metadata } from "next";
import { AnimatedTitle } from "@/app/components/animated-title";
import { FadeInSection } from "@/app/components/fade-in-section";
import Footer from "@/app/components/footer";
import { TransitionLink } from "@/app/components/transition-link";
import { BreadcrumbJsonLd, CourseJsonLd } from "@/app/components/json-ld";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { AiChemistry01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getDictionary } from "../../dictionaries";
import { generatePageMetadata, SEO_CONTENT } from "@/app/utils/seo";
import {
  COURSE_OPPORTUNITY_CTA_LABELS,
  COURSE_OPPORTUNITY_STATUS_LABELS,
  getCourseOpportunities,
} from "@/app/data/course-opportunities";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const content = SEO_CONTENT["activities/workshop"][currentLocale];

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    path: "/activities/workshop",
    locale: currentLocale,
  });
}

export default async function WorkshopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const [dict, courseOpportunities] = await Promise.all([
    getDictionary(currentLocale),
    getCourseOpportunities(),
  ]);
  const t = dict.activities;
  const aisWorkshop = t.aisWorkshop;
  const common = t.common;
  const technicalAiSafetyProject = courseOpportunities.find(
    (opportunity) => opportunity.id === "technical-ai-safety-project",
  );

  if (!technicalAiSafetyProject) {
    throw new Error("Technical AI Safety Project opportunity is missing");
  }

  const courseStatusLabels = COURSE_OPPORTUNITY_STATUS_LABELS[currentLocale];
  const courseCtaLabels = COURSE_OPPORTUNITY_CTA_LABELS[currentLocale];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: t.breadcrumb.home, url: "" },
          { name: t.breadcrumb.current, url: "/activities" },
          { name: aisWorkshop.title, url: "/activities/workshop" },
        ]}
        locale={currentLocale}
      />
      <CourseJsonLd
        name={aisWorkshop.title}
        description={aisWorkshop.description}
        duration={aisWorkshop.time}
      />
      {/* Constrained Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <div className="main-sections py-16">
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
              <span className="text-slate-900">{aisWorkshop.title}</span>
            </div>
          </FadeInSection>

          {/* Technical AI Safety Project */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section className="section-container">
              <div className="space-y-8">
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
                      as="h1"
                    />
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">
                      {courseStatusLabels[technicalAiSafetyProject.status]}
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
                      <h2 className="text-xl font-semibold text-slate-900">
                        {aisWorkshop.whoWeSeek}
                      </h2>
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
                      <h2 className="text-xl font-semibold text-slate-900">
                        {aisWorkshop.formatTitle}
                      </h2>
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
                    <article className="card-glass p-6">
                      <h2 className="mb-4 text-xl font-semibold text-slate-900">
                        {aisWorkshop.nextSession}
                      </h2>
                      <dl className="space-y-3 text-sm">
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
                      <div className="mt-6 flex flex-col gap-3">
                        <a
                          href={technicalAiSafetyProject.applyUrl}
                          className="button-primary w-full flex items-center justify-center gap-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {courseCtaLabels[technicalAiSafetyProject.status]}
                          <span aria-hidden="true">→</span>
                        </a>
                        <a
                          href={technicalAiSafetyProject.learnMoreUrl}
                          className="link-arrow justify-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {aisWorkshop.learnMore}
                          <span aria-hidden="true">→</span>
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
