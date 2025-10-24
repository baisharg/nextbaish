import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";
import { InteractiveCourseCard } from "@/app/components/interactive-course-card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Video01Icon,
  GraduationScrollIcon,
  ArrowRight01Icon,
  Mail01Icon
} from "@hugeicons/core-free-icons";
import { getDictionary } from "../dictionaries";
import { isAppLocale, type AppLocale } from "@/i18n.config";

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

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <FadeInSection variant="fade" as="section">
        <section className="space-y-6">
          <div className="text-sm text-slate-600">
            <Link href={withLocale(currentLocale, "/")} className="hover:text-[var(--color-accent-primary)] transition">
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
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-8 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-4">
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <HugeiconsIcon icon={Video01Icon} size={28} className="text-[var(--color-accent-primary)]" />
                {dict.resources.sections.featuredVideo.title}
              </h2>
              <p className="text-base text-slate-600">
                {dict.resources.sections.featuredVideo.description}
              </p>
            </div>
            <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/oAJUuY6gAnY"
                title="Why experts fear superintelligent AI – and what we can do about it"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: 0 }}
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
                {dict.resources.sections.selfStudy.fundamentalReading.items.map((item: any, idx: number) => (
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
                {dict.resources.sections.selfStudy.standardCourses.items.map((item: any, idx: number) => (
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
                href={dict.resources.sections.selfStudy.relatedResources.eventsTraining.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {dict.resources.sections.selfStudy.relatedResources.eventsTraining.title}
                    </h4>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">
                    {dict.resources.sections.selfStudy.relatedResources.eventsTraining.description}
                  </p>
                </div>
              </a>

              {/* AI Digest */}
              <a
                href={dict.resources.sections.selfStudy.relatedResources.aiDigest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {dict.resources.sections.selfStudy.relatedResources.aiDigest.title}
                    </h4>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">
                    {dict.resources.sections.selfStudy.relatedResources.aiDigest.description}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>
        </FadeInSection>

        {/* External Training Opportunities Timeline */}
        <FadeInSection variant="slide-up" delay={200} as="section">
        <section className="relative overflow-hidden space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
                  <HugeiconsIcon icon={GraduationScrollIcon} size={32} className="text-[var(--color-accent-primary)]" />
                  {dict.resources.sections.externalOpportunities.title}
                </h2>
                <p className="text-base text-slate-600">
                  {dict.resources.sections.externalOpportunities.subtitle}
                </p>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                {dict.resources.sections.externalOpportunities.description}
              </p>
            </div>

            {/* Newsletter CTA */}
            <div className="card-glass dither-macrogrid relative overflow-hidden py-4 px-6 shadow-md" style={{ minHeight: 'auto' }}>
              <div className="absolute inset-y-0 right-[-30%] w-2/3 rounded-full bg-[#9275E533] blur-3xl opacity-40" />
              <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                <div className="flex-1 space-y-1">
                  <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-900 sm:justify-start">
                    <HugeiconsIcon icon={Mail01Icon} size={22} className="text-[var(--color-accent-primary)]" />
                    {dict.resources.sections.externalOpportunities.newsletter.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {dict.resources.sections.externalOpportunities.newsletter.description}
                  </p>
                </div>
                <a
                  href="https://aisafetyeventsandtraining.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary flex-shrink-0"
                >
                  {dict.resources.sections.externalOpportunities.newsletter.cta}
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-lg">
              <Suspense fallback={
                <div className="flex h-[800px] w-full items-center justify-center bg-slate-50 animate-pulse">
                  <div className="text-slate-400">Loading timeline...</div>
                </div>
              }>
                <AirtableEmbed
                  appId="appdsx5KxeooxGPFO"
                  shareId="shrgXV0z193dC7uyI"
                  tableId="tblD1rFhCfD8p5lfU"
                  viewId="viwFUfEv4CfXQemqD"
                  showViewControls={false}
                  height="800px"
                  title="Open Applications Timeline"
                />
              </Suspense>
            </div>
          </div>
        </section>
        </FadeInSection>
      </main>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
