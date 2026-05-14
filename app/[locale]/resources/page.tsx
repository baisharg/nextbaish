import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { BreadcrumbJsonLd } from "@/app/components/json-ld";
import { withLocale } from "@/app/utils/locale";
import { InteractiveCourseCard } from "@/app/components/interactive-course-card";
import { ConcreteRisks, type Risk } from "@/app/components/concrete-risks";
import { AstnPromo } from "@/app/components/astn-promo";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { getDictionary } from "../dictionaries";
import { generatePageMetadata, SEO_CONTENT } from "@/app/utils/seo";
import { isAppLocale, type AppLocale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const content = SEO_CONTENT.resources[currentLocale];

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    path: "/resources",
    locale: currentLocale,
  });
}

type SelfStudyResourceItem = {
  name: string;
  description: string;
  category: string;
  createdBy: string;
  url: string;
};

export default async function Resources({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const fundamentalReadingItems = dict.resources.sections.selfStudy
    .fundamentalReading.items as SelfStudyResourceItem[];
  const standardCourseItems = dict.resources.sections.selfStudy.standardCourses
    .items as SelfStudyResourceItem[];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: dict.resources.breadcrumb.home, url: "" },
          { name: dict.resources.breadcrumb.current, url: "/resources" },
        ]}
        locale={currentLocale}
      />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl px-6 py-16 sm:px-10">
        <div className="main-sections">
        {/* Page Header */}
        <FadeInSection variant="fade" as="section">
          <section className="space-y-6">
            <div className="text-sm text-slate-600">
              <Link
                href={withLocale(currentLocale, "/")}
                className="hover:text-[var(--color-accent-primary)] transition"
              >
                {dict.resources.breadcrumb.home}
              </Link>
              {" / "}
              <span className="text-slate-900">
                {dict.resources.breadcrumb.current}
              </span>
            </div>
            <div className="space-y-4">
              <AnimatedTitle
                text={dict.resources.title}
                slug="resources"
                className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                as="h1"
              />
              <p className="text-lg text-slate-700">
                {dict.resources.description}
              </p>
            </div>
          </section>
        </FadeInSection>

        {/* Concrete Risks Panel */}
        <FadeInSection variant="slide-up" delay={100} as="section">
          <ConcreteRisks
            heading={dict.resources.sections.concreteRisks.heading}
            intro={dict.resources.sections.concreteRisks.intro}
            risks={dict.resources.sections.concreteRisks.risks as Risk[]}
            readMoreLabel={dict.resources.sections.concreteRisks.readMoreLabel}
            podcastLabel={dict.resources.sections.concreteRisks.podcastLabel}
          />
        </FadeInSection>

        {/* Self-Study Section */}
        <FadeInSection variant="slide-up" delay={150} as="section">
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900">
                {dict.resources.sections.selfStudy.title}
              </h2>
              <p className="text-sm text-slate-500">
                {dict.resources.sections.selfStudy.lastUpdated}
              </p>
              <p className="text-lg text-slate-700">
                {dict.resources.sections.selfStudy.description}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Fundamental Reading */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {dict.resources.sections.selfStudy.fundamentalReading.title}
                  </p>
                  {fundamentalReadingItems.map((item, idx) => (
                    <InteractiveCourseCard
                      key={idx}
                      title={item.name}
                      description={item.description}
                      category={item.category}
                      createdBy={item.createdBy}
                      url={item.url}
                      icon="book"
                      accentColor="#9275E5"
                    />
                  ))}
                </div>

                {/* Standard Courses */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {dict.resources.sections.selfStudy.standardCourses.title}
                  </p>
                  {standardCourseItems.map((item, idx) => (
                    <InteractiveCourseCard
                      key={idx}
                      title={item.name}
                      description={item.description}
                      category={item.category}
                      createdBy={item.createdBy}
                      url={item.url}
                      icon="graduation"
                      accentColor="#A8C5FF"
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar - Related Resources */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {dict.resources.sections.selfStudy.relatedResources.title}
                </h3>

                {/* Events & Training */}
                <a
                  href={
                    dict.resources.sections.selfStudy.relatedResources
                      .eventsTraining.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {
                          dict.resources.sections.selfStudy.relatedResources
                            .eventsTraining.title
                        }
                      </h4>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        className="text-slate-400"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      {
                        dict.resources.sections.selfStudy.relatedResources
                          .eventsTraining.description
                      }
                    </p>
                  </div>
                </a>

                {/* AI Digest */}
                <a
                  href={
                    dict.resources.sections.selfStudy.relatedResources.aiDigest
                      .url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {
                          dict.resources.sections.selfStudy.relatedResources
                            .aiDigest.title
                        }
                      </h4>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        className="text-slate-400"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      {
                        dict.resources.sections.selfStudy.relatedResources
                          .aiDigest.description
                      }
                    </p>
                  </div>
                </a>

                {/* Agentic Coding Workshop */}
                <Link
                  href={withLocale(
                    currentLocale,
                    dict.resources.sections.selfStudy.relatedResources
                      .agenticCoding.url
                  )}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {
                          dict.resources.sections.selfStudy.relatedResources
                            .agenticCoding.title
                        }
                      </h4>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        className="text-slate-400"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      {
                        dict.resources.sections.selfStudy.relatedResources
                          .agenticCoding.description
                      }
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* ASTN Promo */}
        <FadeInSection variant="slide-up" delay={200} as="section">
          <AstnPromo t={dict.home.astn} />
        </FadeInSection>
        </div>
      </main>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
