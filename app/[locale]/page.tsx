import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { TransitionLink } from "@/app/components/transition-link";
import { AstnPromo } from "@/app/components/astn-promo";
import { OrganizationJsonLd, BreadcrumbJsonLd } from "@/app/components/json-ld";
import { getDictionary } from "./dictionaries";
import {
  COURSE_OPPORTUNITY_CTA_LABELS,
  COURSE_OPPORTUNITY_STATUS_LABELS,
  getCourseOpportunities,
} from "@/app/data/course-opportunities";
import { generatePageMetadata, SEO_CONTENT } from "@/app/utils/seo";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const content = SEO_CONTENT.home[currentLocale];

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    path: "",
    locale: currentLocale,
  });
}
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  TelegramIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";


// Lazy load below-the-fold components for better initial load
const SupascribeSignup = dynamic(() => import("@/app/components/supascribe-signup"), {
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
  const courseOpportunities = await getCourseOpportunities();
  const courseStatusLabels = COURSE_OPPORTUNITY_STATUS_LABELS[currentLocale];
  const courseCtaLabels = COURSE_OPPORTUNITY_CTA_LABELS[currentLocale];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[{ name: t.breadcrumb.home, url: "" }]}
        locale={currentLocale}
      />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="main-sections">
          {/* Hero Section - Lead with Value Prop */}
          <FadeInSection variant="slide-up" as="section" startVisible={true}>
            <section
              className="relative px-6 py-16 sm:px-16 lg:py-20"
              id="about"
            >
              <div className="max-w-4xl mx-auto text-center">
                {/* Larger headline */}
                <AnimatedTitle
                  text={t.mission.title}
                  slug="home"
                  className="mb-6"
                  as="h1"
                />

                {/* Punchy tagline */}
                <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto">
                  {t.mission.tagline}
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <TransitionLink
                    href={`/${currentLocale}/activities`}
                    className="button-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold"
                  >
                    {t.hero.primaryCta}
                    <span aria-hidden="true">→</span>
                  </TransitionLink>
                  <a
                    href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                    className="button-secondary inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.hero.secondaryCta}
                  </a>
                </div>

                {/* Social Proof Stats - Above the fold */}
                <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8 text-center">
                  <div className="social-proof-stat">
                    <span className="stat-number">120+</span>
                    <span className="stat-label">{t.hero.communityMembers}</span>
                  </div>
                  <div className="social-proof-stat">
                    <span className="stat-number">3</span>
                    <span className="stat-label">{t.hero.weeklyPrograms}</span>
                  </div>
                  <div className="social-proof-stat">
                    <span className="stat-number">3+</span>
                    <span className="stat-label">{t.hero.publishedPapers}</span>
                  </div>
                </div>

              </div>
            </section>
          </FadeInSection>

          {/* Courses Section - primary conversion path */}
          <FadeInSection variant="slide-up" delay={50} as="section">
            <section className="section-content" id="activities">
              <div className="space-y-4 text-center mb-10">
                <p className="eyebrow">{t.activities.eyebrow || "Programs"}</p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.activities.title}
                </h2>
                <p className="text-lg text-slate-700 max-w-2xl mx-auto">
                  {t.activities.description}
                </p>
              </div>
              <div className="programs-container">
                <div className="card-grid">
                  {courseOpportunities.map((opportunity) => {
                    const activity = t.activities.items[opportunity.id];

                    return (
                      <article
                        key={opportunity.id}
                        className="card-glass card-refined"
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
                            className="button-primary"
                            href={opportunity.applyUrl}
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
                            {t.activities.learnMore}
                            <span>→</span>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* ASTN Promo Section - Launch Your Career */}
          <FadeInSection variant="slide-up" delay={50} as="section">
            <AstnPromo t={t.astn} />
          </FadeInSection>

          {/* Get Involved Section - MOVED UP for conversion */}
          <FadeInSection variant="slide-up" delay={50} as="section">
            <section
              className="section-container"
              id="get-involved"
            >
              <div className="space-y-4 text-center mb-10">
                <p className="eyebrow">{t.getInvolved.eyebrow || "Get Started"}</p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.getInvolved.sectionTitle || "Join Our Community"}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {t.getInvolved.sectionDescription || "Connect with researchers, stay updated, and start your journey"}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <SupascribeSignup t={dict.substack} />

                <article className="card-glass card-refined">
                  <div className="card-eyebrow">{t.getInvolved.communityEyebrow}</div>
                  <h3 className="card-title">
                    {t.getInvolved.communityTitle}
                  </h3>
                  <p className="card-body">
                    {t.getInvolved.communityDescription}
                  </p>
                  <div className="flex flex-col gap-3 mt-auto">
                    <a
                      className="button-primary flex flex-col items-center justify-center gap-1 py-4"
                      href="https://t.me/+zhSGhXrn56g1YjVh"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={TelegramIcon} size={20} />
                        <span className="font-semibold">{t.getInvolved.telegramCta}</span>
                      </div>
                      <span className="text-xs opacity-90">{t.getInvolved.telegramMembers}</span>
                    </a>
                    <a
                      className="button-primary flex flex-col items-center justify-center gap-1 py-4"
                      href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={WhatsappIcon} size={20} />
                        <span className="font-semibold">{t.getInvolved.whatsappCta}</span>
                      </div>
                      <span className="text-xs opacity-90">{t.getInvolved.whatsappMembers}</span>
                    </a>
                  </div>
                </article>
              </div>
            </section>
          </FadeInSection>

        </div>
      </main>
      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
