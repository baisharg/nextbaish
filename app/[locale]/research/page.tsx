import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import ResearchFilters from "@/app/components/research-filters";

type ProjectCategory = "all" | "interpretability" | "alignment" | "robustness" | "value-learning";

interface Project {
  id: number;
  title: string;
  year: string;
  researchers: string;
  abstract: string;
  category: Exclude<ProjectCategory, "all">;
  tag: string;
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);

  // Research projects data
  const projects: Project[] = [
    {
      id: 1,
      title: "Project Title Placeholder One",
      year: "2025",
      researchers: "Researcher Name, Another Name",
      abstract: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      category: "interpretability",
      tag: "Interpretability",
    },
    {
      id: 2,
      title: "Project Title Placeholder Two",
      year: "2025",
      researchers: "Researcher Name, Another Name",
      abstract: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      category: "alignment",
      tag: "Alignment",
    },
    {
      id: 3,
      title: "Project Title Placeholder Three",
      year: "2023",
      researchers: "Researcher Name, Another Name",
      abstract: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      category: "robustness",
      tag: "Robustness",
    },
    {
      id: 4,
      title: "Project Title Placeholder Four",
      year: "2023",
      researchers: "Researcher Name, Another Name",
      abstract: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est.",
      category: "interpretability",
      tag: "Interpretability",
    },
    {
      id: 5,
      title: "Project Title Placeholder Five",
      year: "2023",
      researchers: "Researcher Name, Another Name",
      abstract: "Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      category: "value-learning",
      tag: "Value Learning",
    },
    {
      id: 6,
      title: "Project Title Placeholder Six",
      year: "2022",
      researchers: "Researcher Name, Another Name",
      abstract: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
      category: "alignment",
      tag: "Alignment",
    },
  ];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <FadeInSection variant="fade" as="section">
            <section className="space-y-4">
              <div className="text-sm text-slate-600">
                <Link href={withLocale(currentLocale, "/")} className="hover:text-slate-900">{dict.research.breadcrumb.home}</Link>
                {" / "}
                <span>{dict.research.breadcrumb.current}</span>
              </div>
              <AnimatedTitle
                text={dict.research.title}
                slug="research"
                className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                as="h1"
              />
              <p className="text-lg text-slate-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
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
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {dict.research.focusAreasTitle}
                  </h2>
                  <ul className="space-y-3 text-base text-slate-700">
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent-primary)]">•</span>
                      <span>
                        {dict.research.focusAreas.mechInterp}
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent-primary)]">•</span>
                      <span>
                        {dict.research.focusAreas.alignment}
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent-primary)]">•</span>
                      <span>
                        {dict.research.focusAreas.robustness}
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent-primary)]">•</span>
                      <span>
                        {dict.research.focusAreas.valueLearning}
                      </span>
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>

              <div className="space-y-6">
                {/* Publication 1 */}
                <article className="card-glass dither-finemesh p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Publication Title Placeholder One
                      </h3>
                      <p className="text-sm text-slate-600">
                        Author One, Author Two
                      </p>
                      <p className="text-sm text-slate-500">
                        Venue Name, Conference/Journal Year
                      </p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <a
                        href="#"
                        className="rounded-lg bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[var(--color-accent-tertiary)]"
                      >
                        Link 1
                      </a>
                      <a
                        href="#"
                        className="rounded-lg bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[var(--color-accent-tertiary)]"
                      >
                        Link 2
                      </a>
                    </div>
                  </div>
                </article>

                {/* Publication 2 */}
                <article className="card-glass dither-finemesh p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Publication Title Placeholder Two
                      </h3>
                      <p className="text-sm text-slate-600">
                        Author Three, Author Four
                      </p>
                      <p className="text-sm text-slate-500">
                        Venue Name, Conference/Journal Year
                      </p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <a
                        href="#"
                        className="rounded-lg bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[var(--color-accent-tertiary)]"
                      >
                        Link 1
                      </a>
                    </div>
                  </div>
                </article>

                {/* Publication 3 */}
                <article className="card-glass dither-finemesh p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Publication Title Placeholder Three
                      </h3>
                      <p className="text-sm text-slate-600">
                        Author Five, Author Six
                      </p>
                      <p className="text-sm text-slate-500">
                        Venue Name, Conference/Journal Year
                      </p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <a
                        href="#"
                        className="rounded-lg bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[var(--color-accent-tertiary)]"
                      >
                        Link 1
                      </a>
                      <a
                        href="#"
                        className="rounded-lg bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[var(--color-accent-tertiary)]"
                      >
                        Link 2
                      </a>
                      <a
                        href="#"
                        className="rounded-lg bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[var(--color-accent-tertiary)]"
                      >
                        Link 3
                      </a>
                    </div>
                  </div>
                </article>
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
                </p>
              </div>

              <div className="space-y-8">
                {/* Ongoing Project 1 */}
                <article className="card-glass dither-finemesh space-y-6 p-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Ongoing Project Title One
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        <span className="font-medium">Researcher One, Researcher Two</span>
                      </span>
                      <span className="rounded-full bg-[var(--color-accent-primary)] px-3 py-1 text-xs font-semibold text-white">
                        XX% Complete
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-slate-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.started}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        Month Year
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.expectedCompletion}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        Month Year
                      </p>
                    </div>
                  </div>
                </article>

                {/* Ongoing Project 2 */}
                <article className="card-glass dither-finemesh space-y-6 p-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Ongoing Project Title Two
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        <span className="font-medium">Researcher Three, Researcher Four</span>
                      </span>
                      <span className="rounded-full bg-[var(--color-accent-primary)] px-3 py-1 text-xs font-semibold text-white">
                        YY% Complete
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-slate-700">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.started}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        Month Year
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.expectedCompletion}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        Month Year
                      </p>
                    </div>
                  </div>
                </article>

                {/* Ongoing Project 3 */}
                <article className="card-glass dither-finemesh space-y-6 p-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Ongoing Project Title Three
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        <span className="font-medium">Researcher Five, Researcher Six</span>
                      </span>
                      <span className="rounded-full bg-[var(--color-accent-primary)] px-3 py-1 text-xs font-semibold text-white">
                        ZZ% Complete
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-slate-700">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.started}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        Month Year
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {dict.research.expectedCompletion}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        Month Year
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </FadeInSection>
        </main>

        <Footer locale={currentLocale} t={dict.footer} />
      </div>
  );
}
