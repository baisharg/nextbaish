"use client";

import { useState } from "react";

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

interface ResearchFiltersProps {
  projects: Project[];
  filterLabels: {
    all: string;
    interpretability: string;
    alignment: string;
    robustness: string;
    valueLearning: string;
  };
  filterByLabel: string;
  linkPlaceholder: string;
  projectsTitle: string;
}

export default function ResearchFilters({
  projects,
  filterLabels,
  filterByLabel,
  linkPlaceholder,
  projectsTitle,
}: ResearchFiltersProps) {
  const [filter, setFilter] = useState<ProjectCategory>("all");

  const filteredProjects = filter === "all"
    ? projects
    : projects.filter(project => project.category === filter);

  const FilterButton = ({ category, label }: { category: ProjectCategory; label: string }) => (
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
    <section className="space-y-8 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-slate-900">
          {projectsTitle}
        </h2>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-600">
            {filterByLabel}
          </span>
          <FilterButton category="all" label={filterLabels.all} />
          <FilterButton category="interpretability" label={filterLabels.interpretability} />
          <FilterButton category="alignment" label={filterLabels.alignment} />
          <FilterButton category="robustness" label={filterLabels.robustness} />
          <FilterButton category="value-learning" label={filterLabels.valueLearning} />
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
                {linkPlaceholder}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
