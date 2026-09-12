import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { ImpactStats } from "@/app/components/impact-stats";
import { StoryCard } from "@/app/components/story-card";
import { FunderCard } from "@/app/components/funder-card";
import {
  TeamBioCard,
  TeamCard,
  TeamTextCard,
} from "@/app/components/team-card";
import { OrganizationJsonLd, BreadcrumbJsonLd } from "@/app/components/json-ld";
import { getDictionary } from "../dictionaries";
import { generatePageMetadata, SEO_CONTENT } from "@/app/utils/seo";
import { renderWithBioLinks } from "@/app/utils/footnotes";
import { teamByGroup, type TeamMemberId } from "@/app/data/team";
import { SUCCESS_STORIES, withStoryCopy } from "@/app/data/stories";
import { FUNDERS } from "@/app/data/funders";
import {
  FELLOWSHIP_PLACEMENTS,
  FULL_TIME_ORGS,
  fillImpact,
} from "@/app/data/impact";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const content = SEO_CONTENT.about[currentLocale];

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    path: "/about",
    locale: currentLocale,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.about;
  const callToAction = t.callToAction;
  const roles = t.team.roles;
  const bios: Partial<Record<TeamMemberId, string>> = t.team.bios;
  const stories = withStoryCopy(SUCCESS_STORIES, t.impact.stories);

  const directors = teamByGroup("directors");
  const leads = teamByGroup("leads");
  const team = teamByGroup("team");
  const advisors = teamByGroup("advisors");

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: t.breadcrumb.home, url: "" },
          { name: t.breadcrumb.current, url: "/about" },
        ]}
        locale={currentLocale}
      />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="main-sections">
          {/* Page Header + Who we are */}
          <FadeInSection variant="fade" as="section" startVisible>
            <section className="space-y-8">
              <div className="text-sm text-slate-600">
                <Link
                  href={`/${currentLocale}`}
                  className="hover:text-[var(--color-accent-primary)] transition"
                >
                  {t.breadcrumb.home}
                </Link>
                {" / "}
                <span>{t.breadcrumb.current}</span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <AnimatedTitle
                  text={t.title}
                  slug="about"
                  className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                  as="h1"
                />
                <div className="flex flex-wrap gap-3">
                  <a href="#impact" className="button-secondary whitespace-nowrap">
                    {t.impact.title}
                  </a>
                  <a href="#team" className="button-secondary whitespace-nowrap">
                    {t.team.title}
                  </a>
                </div>
              </div>

              <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
                <div className="space-y-4 max-w-3xl">
                  <p className="eyebrow">{t.whoWeAre.eyebrow}</p>
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {t.whoWeAre.title}
                  </h2>
                  <p className="text-base leading-relaxed text-slate-700">
                    {fillImpact(t.whoWeAre.paragraph1)}
                  </p>
                  <p className="text-base leading-relaxed text-slate-700">
                    {fillImpact(t.whoWeAre.paragraph2)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200 p-6">
                  <ImpactStats labels={dict.home.hero.stats} layout="grid" />
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Impact / track record */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section className="section-container space-y-10 scroll-mt-24" id="impact">
              <div className="space-y-3">
                <p className="eyebrow">{t.impact.eyebrow}</p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.impact.title}
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl">
                  {t.impact.description}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Full-time roles */}
                <article className="card-glass">
                  <h3 className="card-title">{t.impact.fullTime.title}</h3>
                  <p className="card-body">
                    {fillImpact(t.impact.fullTime.description)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {FULL_TIME_ORGS.map((org) => (
                      <a
                        key={org.name}
                        href={org.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill hover:border-[var(--color-accent-primary)] transition"
                      >
                        {org.name}
                      </a>
                    ))}
                  </div>
                </article>

                {/* Fellowships */}
                <article className="card-glass">
                  <h3 className="card-title">{t.impact.fellowships.title}</h3>
                  <p className="card-body">
                    {fillImpact(t.impact.fellowships.description)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {FELLOWSHIP_PLACEMENTS.map((program) => (
                      <span key={program.name} className="pill">
                        {program.name}
                        <span className="font-semibold text-[var(--color-accent-primary)]">
                          {program.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </article>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {[t.impact.research, t.impact.courses, t.impact.community].map(
                  (block) => (
                    <article key={block.title} className="card-glass">
                      <h3 className="card-title">{block.title}</h3>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {block.items.map((item: string) => (
                          <li key={item} className="flex gap-2">
                            <span
                              aria-hidden="true"
                              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-primary)]"
                            />
                            <span>{fillImpact(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ),
                )}
              </div>

              {/* Success stories */}
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {t.impact.storiesTitle}
                  </h3>
                  <p className="text-base text-slate-600">
                    {t.impact.storiesDescription}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      linkedinLabel={t.impact.linkedinLabel}
                    />
                  ))}
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Team Section */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section className="section-container space-y-10 scroll-mt-24" id="team">
              <h2 className="text-3xl font-semibold text-slate-900">
                {t.team.title}
              </h2>

              {/* Directors */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {t.team.directorsTitle}
                </h3>
                <div className="grid gap-8">
                  {directors.map((member) => (
                    <TeamBioCard
                      key={member.id}
                      member={member}
                      role={roles[member.id]}
                      bio={renderWithBioLinks(bios[member.id] ?? "")}
                    />
                  ))}
                </div>

                {/* Book a Call CTA */}
                <div
                  id="book-a-call"
                  className="mt-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200 p-6 text-center scroll-mt-24"
                >
                  <h4 className="text-2xl font-semibold text-slate-900 mb-2">
                    {callToAction.title}
                  </h4>
                  <p className="text-base text-slate-600 mb-6">
                    {callToAction.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://calendly.com/eitusprejer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-primary inline-flex items-center justify-center gap-2"
                    >
                      {callToAction.bookWithEitan}
                    </a>
                    <a
                      href="https://lvca.dev/meet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-primary inline-flex items-center justify-center gap-2"
                    >
                      {callToAction.bookWithLuca}
                    </a>
                  </div>
                </div>
              </div>

              {/* Leads */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {t.team.leadsTitle}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {leads.map((member) => (
                    <TeamCard
                      key={member.id}
                      member={member}
                      role={roles[member.id]}
                    />
                  ))}
                </div>
              </div>

              {/* Team */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {t.team.teamTitle}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {team.map((member) => (
                    <TeamCard
                      key={member.id}
                      member={member}
                      role={roles[member.id]}
                    />
                  ))}
                </div>
              </div>

              {/* Advisors */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {t.team.advisorsTitle}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {advisors.map((member) => (
                    <TeamTextCard
                      key={member.id}
                      member={member}
                      role={roles[member.id]}
                    />
                  ))}
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Our Approach Section */}
          <FadeInSection variant="slide-up" delay={300} as="section">
            <section className="section-container" id="our-approach">
              <div className="space-y-8">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.ourApproach.title}
                </h2>
                <div className="grid gap-12 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {t.ourApproach.focusAreas.title}
                    </h3>
                    <p className="text-base text-slate-700">
                      {t.ourApproach.focusAreas.intro}
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                      {t.ourApproach.focusAreas.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {t.ourApproach.contribution.title}
                    </h3>
                    <p className="text-base text-slate-700">
                      {t.ourApproach.contribution.intro}
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                      {t.ourApproach.contribution.items.map((item, index) => (
                        <li key={index}>{fillImpact(item)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Support Section */}
          <FadeInSection variant="slide-up" delay={400} as="section">
            <section className="section-container space-y-8" id="support">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {t.support.title}
                  </h2>
                  <p className="text-lg text-slate-700">
                    {t.support.description}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto pt-4">
                  {FUNDERS.map((funder) => (
                    <FunderCard
                      key={funder.id}
                      funder={funder}
                      copy={t.support[funder.id]}
                      ctaLabels={t.support}
                    />
                  ))}
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
