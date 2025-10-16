"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { useLocale, useDict } from "@/app/contexts/language-context";

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

export default function ResearchPage() {
  const locale = useLocale();
  const dict = useDict();
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState<ProjectCategory>("all");
  const withLocale = useMemo(() => {
    return (path: string) => {
      if (!path.startsWith("/")) return path;
      if (path === "/") {
        return `/${locale}`;
      }
      return `/${locale}${path}`;
    };
  }, [locale]);

  // Scroll effect for header
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


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

  // Filter projects based on selected category
  const filteredProjects = filter === "all"
    ? projects
    : projects.filter(project => project.category === filter);

  // Filter button component
  const FilterButton = ({
    category,
    label
  }: {
    category: ProjectCategory;
    label: string
  }) => (
    <button
      onClick={() => setFilter(category)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        filter === category
          ? "bg-[var(--color-accent-primary)] text-white shadow-md"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
        <Header locale={locale} t={dict.header} scrolled={scrolled} />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <section className="space-y-4">
            <div className="text-sm text-slate-600">
              <Link href={withLocale("/")} className="hover:text-slate-900">{dict.research.breadcrumb.home}</Link>
              {" / "}
              <span>{dict.research.breadcrumb.current}</span>
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {dict.research.title}
            </h1>
            <p className="text-lg text-slate-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </section>

          {/* Research Overview */}
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

          {/* Research Projects */}
          <section className="space-y-8 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-slate-900">
                {dict.research.projectsTitle}
              </h2>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-600">
                  {dict.research.filterBy}
                </span>
                <FilterButton
                  category="all"
                  label={dict.research.filters.all}
                />
                <FilterButton
                  category="interpretability"
                  label={dict.research.filters.interpretability}
                />
                <FilterButton
                  category="alignment"
                  label={dict.research.filters.alignment}
                />
                <FilterButton
                  category="robustness"
                  label={dict.research.filters.robustness}
                />
                <FilterButton
                  category="value-learning"
                  label={dict.research.filters.valueLearning}
                />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {project.title}
                      </h3>
                      <span className="flex-shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {project.year}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      {project.researchers}
                    </p>
                    <p className="text-sm text-slate-600">
                      {project.abstract}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="inline-flex rounded-full bg-[#9275E51a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-accent-primary)]">
                      {project.tag}
                    </span>
                    <a
                      href="#"
                      className="text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    >
                      {dict.research.linkPlaceholder}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Publications */}
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
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

          {/* Ongoing Research */}
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
              <article className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
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
              <article className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
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
              <article className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
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
        </main>

        <Footer locale={locale} t={dict.footer} />
      </div>
  );
}
