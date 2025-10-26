import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import ResearchFilters from "@/app/components/research-filters";

type ProjectCategory =
  | "all"
  | "interpretability"
  | "alignment"
  | "robustness"
  | "value-learning";

interface Project {
  id: number;
  title: string;
  year: string;
  researchers: string;
  abstract: string;
  category: Exclude<ProjectCategory, "all">;
  tag: string;
}

type DictionaryProject = Omit<Project, "id">;

type Publication = {
  title: string;
  authors: string;
  venue: string;
  links: { label: string; url: string }[];
};

type OngoingProject = {
  title: string;
  researchers: string;
  completion: string;
  description: string;
  started: string;
  expectedCompletion: string;
};

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);

  const projects: Project[] = (
    (dict.research.projects ?? []) as DictionaryProject[]
  ).map((project, index) => ({
    ...project,
    id: index + 1,
  }));
  const publications = (dict.research.publications ?? []) as Publication[];
  const ongoingProjects = (dict.research.ongoingProjects ??
    []) as OngoingProject[];
  const overviewParagraphs = dict.research.overview?.paragraphs ?? [];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <FadeInSection variant="fade" as="section">
          <section className="space-y-4">
            <div className="text-sm text-slate-600">
              <Link
                href={withLocale(currentLocale, "/")}
                className="hover:text-slate-900"
              >
                {dict.research.breadcrumb.home}
              </Link>
              {" / "}
              <span>{dict.research.breadcrumb.current}</span>
            </div>
            <AnimatedTitle
              text={dict.research.title}
              slug="research"
              className="text-4xl font-semibold text-slate-900 sm:text-5xl"
              as="h1"
            />
            <p className="text-lg text-slate-600">{dict.research.intro}</p>
          </section>
        </FadeInSection>

        {/* Research Overview */}
        <FadeInSection variant="slide-up" delay={100} as="section">
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {dict.research.approachTitle}
                </h2>
                <div className="space-y-4 text-base text-slate-700">
                  {overviewParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {dict.research.focusAreasTitle}
                </h2>
                <ul className="space-y-3 text-base text-slate-700">
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)]">
                      •
                    </span>
                    <span>{dict.research.focusAreas.mechInterp}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)]">
                      •
                    </span>
                    <span>{dict.research.focusAreas.alignment}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)]">
                      •
                    </span>
                    <span>{dict.research.focusAreas.robustness}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)]">
                      •
                    </span>
                    <span>{dict.research.focusAreas.valueLearning}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Research Projects */}
        <FadeInSection variant="slide-up" delay={200} as="section">
          <ResearchFilters
            projects={projects}
            filterLabels={dict.research.filters}
            filterByLabel={dict.research.filterBy}
            linkPlaceholder={dict.research.linkPlaceholder}
            projectsTitle={dict.research.projectsTitle}
          />
        </FadeInSection>

        {/* Publications */}
        <FadeInSection variant="slide-up" delay={300} as="section">
          <section className="space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">
                {dict.research.publicationsTitle}
              </h2>
              <p className="text-base text-slate-600">
                {dict.research.publicationsIntro}
              </p>
            </div>

            <div className="space-y-6">
              {publications.map((publication, index) => (
                <article
                  key={`${publication.title}-${index}`}
                  className="card-glass dither-macrogrid p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {publication.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {publication.authors}
                      </p>
                      <p className="text-sm text-slate-500">
                        {publication.venue}
                      </p>
                    </div>
                    {publication.links.length > 0 && (
                      <div className="flex gap-3 flex-shrink-0">
                        {publication.links.map((link) => (
                          <a
                            key={`${publication.title}-${link.label}`}
                            href={link.url}
                            className="button-secondary"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* Ongoing Research */}
        <FadeInSection variant="slide-up" delay={400} as="section">
          <section className="space-y-8 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">
                {dict.research.ongoingTitle}
              </h2>
              <p className="text-base text-slate-600">
                {dict.research.ongoingDescription}
              </p>
            </div>

            <div className="space-y-8">
              {ongoingProjects.map((project, index) => (
                <article
                  key={`${project.title}-${index}`}
                  className="card-glass dither-macrogrid space-y-6 p-6"
                >
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        <span className="font-medium">
                          {project.researchers}
                        </span>
                      </span>
                      <span className="rounded-full bg-[var(--color-accent-primary)] px-3 py-1 text-xs font-semibold text-white">
                        {project.completion}
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-slate-700">
                    {project.description}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.started}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {project.started}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.expectedCompletion}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {project.expectedCompletion}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeInSection>
      </main>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
