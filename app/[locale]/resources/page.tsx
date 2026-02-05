import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { BreadcrumbJsonLd } from "@/app/components/json-ld";
import { withLocale } from "@/app/utils/locale";
import { InteractiveCourseCard } from "@/app/components/interactive-course-card";
import { LazyYouTubeEmbed } from "@/app/components/lazy-youtube-embed";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Video01Icon,
  GraduationScrollIcon,
  ArrowRight01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
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

// Lazy load heavy components for better initial load performance
const AirtableEmbed = dynamic(() => import("@/app/components/airtable-embed"));

export default async function Resources({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const externalOpportunities = dict.resources.sections.externalOpportunities;
  const timelineCopy = externalOpportunities.timeline;
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

        {/* Featured Video */}
        <FadeInSection variant="slide-up" delay={100} as="section">
          <section className="section-container">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                  <HugeiconsIcon
                    icon={Video01Icon}
                    size={28}
                    className="text-[var(--color-accent-primary)]"
                  />
                  {dict.resources.sections.featuredVideo.title}
                </h2>
                <p className="text-base text-slate-600">
                  {dict.resources.sections.featuredVideo.description}
                </p>
              </div>
              <div
                className="relative w-full overflow-hidden rounded-xl"
                style={{ paddingBottom: "56.25%" }}
              >
                <LazyYouTubeEmbed
                  videoId="oAJUuY6gAnY"
                  title="Why experts fear superintelligent AI – and what we can do about it"
                />
              </div>
            </div>
          </section>
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

        {/* External Training Opportunities Timeline */}
        <FadeInSection variant="slide-up" delay={200} as="section">
          <section className="section-container space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
                    <HugeiconsIcon
                      icon={GraduationScrollIcon}
                      size={32}
                      className="text-[var(--color-accent-primary)]"
                    />
                    {externalOpportunities.title}
                  </h2>
                  <p className="text-base text-slate-600">
                    {externalOpportunities.subtitle}
                  </p>
                </div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {externalOpportunities.description}
                </p>
              </div>

              {/* Newsletter CTA */}
              <div className="card-glass py-4 px-6 shadow-md" style={{ minHeight: "auto" }}>
                <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                  <div className="flex-1 space-y-1">
                    <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-900 sm:justify-start">
                      <HugeiconsIcon
                        icon={Mail01Icon}
                        size={22}
                        className="text-[var(--color-accent-primary)]"
                      />
                      {externalOpportunities.newsletter.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {externalOpportunities.newsletter.description}
                    </p>
                  </div>
                  <a
                    href="https://aisafetyeventsandtraining.substack.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary flex-shrink-0"
                  >
                    {externalOpportunities.newsletter.cta}
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-lg">
                <Suspense
                  fallback={
                    <div className="flex h-[800px] w-full items-center justify-center bg-slate-50 animate-pulse">
                      <div className="text-slate-400">
                        {timelineCopy.loading}
                      </div>
                    </div>
                  }
                >
                  <AirtableEmbed
                    appId="appdsx5KxeooxGPFO"
                    shareId="shrgXV0z193dC7uyI"
                    tableId="tblD1rFhCfD8p5lfU"
                    viewId="viwFUfEv4CfXQemqD"
                    showViewControls={false}
                    height="800px"
                    title={timelineCopy.title}
                    loadingText={timelineCopy.loading}
                  />
                </Suspense>
              </div>
            </div>
          </section>
        </FadeInSection>
        </div>
      </main>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
