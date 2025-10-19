"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import AirtableEmbed from "@/app/components/airtable-embed";
import { useLocale, useDict } from "@/app/contexts/language-context";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";
import type { Resource, ResourceType, ResourceTopic, DifficultyLevel } from "@/app/types/resources";
import { resources, RESOURCE_TYPE_ICONS, DIFFICULTY_COLORS } from "@/app/data/resources";
import { useLocalStorage } from "@/app/hooks/use-local-storage";

export default function Resources() {
  const locale = useLocale();
  const dict = useDict();
  const t = dict.resources;
  const [selectedPathway, setSelectedPathway] = useState<DifficultyLevel | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [topicFilter, setTopicFilter] = useState<ResourceTopic | "all">("all");

  // Use localStorage hook with array (since Set is not JSON-serializable)
  const [completedArray, setCompletedArray] = useLocalStorage<string[]>(
    "baish-completed-resources",
    []
  );

  // Convert to Set for efficient lookups
  const completedResources = useMemo(() => new Set(completedArray), [completedArray]);

  const toggleResourceComplete = (id: string) => {
    const newCompleted = new Set(completedResources);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedArray(Array.from(newCompleted));
  };

  const totalsByDifficulty: Record<DifficultyLevel, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  const completedByDifficulty: Record<DifficultyLevel, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  resources.forEach((resource) => {
    totalsByDifficulty[resource.difficulty] += 1;
    if (completedResources.has(resource.id)) {
      completedByDifficulty[resource.difficulty] += 1;
    }
  });

  const progressForDifficulty = (difficulty: DifficultyLevel) => {
    const total = totalsByDifficulty[difficulty];
    if (!total) {
      return 0;
    }
    return Math.min(100, (completedByDifficulty[difficulty] / total) * 100);
  };

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    if (selectedPathway !== "all" && resource.difficulty !== selectedPathway) return false;
    if (typeFilter !== "all" && resource.type !== typeFilter) return false;
    if (topicFilter !== "all" && resource.topic !== topicFilter) return false;
    return true;
  });

  // Quick wins - resources under 30 minutes
  const quickWins = resources.filter((r) =>
    r.timeToComplete.includes("15") || r.timeToComplete.includes("20") || r.timeToComplete.includes("30 min")
  );

  // Community picks (hardcoded for now)
  const communityPicks = [
    resources.find((r) => r.id === "agi-safety-fundamentals"),
    resources.find((r) => r.id === "rob-miles"),
    resources.find((r) => r.id === "distill-circuits"),
  ].filter(Boolean) as Resource[];

  // Latest additions
  const latestResources = resources.filter((r) => r.isNew);

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <Header locale={locale} t={dict.header} />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <FadeInSection variant="fade" as="section">
        <section className="space-y-6">
          <div className="text-sm text-slate-600">
            <Link href={withLocale(locale, "/")} className="hover:text-[var(--color-accent-primary)] transition">
              {t.breadcrumb.home}
            </Link>
            {" / "}
            <span className="text-slate-900">
              {t.breadcrumb.current}
            </span>
          </div>
          <div className="space-y-4">
            <AnimatedTitle
              text={t.title}
              slug="resources"
              className="text-4xl font-semibold text-slate-900 sm:text-5xl"
              as="h1"
            />
            <p className="text-lg text-slate-700">
              {t.description}
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
              <h2 className="text-2xl font-semibold text-slate-900">
                🎥 {dict.resources.sections.featuredVideo.title}
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
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          </div>
        </section>
        </FadeInSection>

        {/* Learning Path Visualization */}
        <FadeInSection variant="slide-up" delay={200} as="section">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900">
                {t.learningPath.title}
              </h2>
              <p className="text-base text-slate-600">
                {t.learningPath.description}
              </p>
            </div>

            {/* Pathway Selector */}
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setSelectedPathway("beginner")}
                className={`relative overflow-hidden group rounded-2xl border-2 bg-white p-6 text-left transition-all ${
                  selectedPathway === "beginner"
                    ? "border-green-500 shadow-lg"
                    : "border-slate-200 hover:border-green-300 hover:shadow-md"
                }`}
              >
                <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-2xl font-bold text-slate-900">1</span>
                    </div>
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {t.learningPath.beginner.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {t.learningPath.beginner.description}
                  </p>
                  <div className="pt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-green-500 transition-all"
                        style={{ width: `${progressForDifficulty("beginner")}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPathway("intermediate")}
                className={`relative overflow-hidden group rounded-2xl border-2 bg-white p-6 text-left transition-all ${
                  selectedPathway === "intermediate"
                    ? "border-yellow-500 shadow-lg"
                    : "border-slate-200 hover:border-yellow-300 hover:shadow-md"
                }`}
              >
                <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-2xl font-bold text-slate-900">2</span>
                    </div>
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {t.learningPath.intermediate.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {t.learningPath.intermediate.description}
                  </p>
                  <div className="pt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-yellow-500 transition-all"
                        style={{ width: `${progressForDifficulty("intermediate")}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPathway("advanced")}
                className={`relative overflow-hidden group rounded-2xl border-2 bg-white p-6 text-left transition-all ${
                  selectedPathway === "advanced"
                    ? "border-red-500 shadow-lg"
                    : "border-slate-200 hover:border-red-300 hover:shadow-md"
                }`}
              >
                <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-2xl font-bold text-slate-900">3</span>
                    </div>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {t.learningPath.advanced.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {t.learningPath.advanced.description}
                  </p>
                  <div className="pt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-red-500 transition-all"
                        style={{ width: `${progressForDifficulty("advanced")}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {selectedPathway !== "all" && (
              <div className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
                <p className="text-sm font-medium text-slate-700">
                  {t.learningPath.viewing.replace("{level}", selectedPathway)}
                </p>
                <button
                  onClick={() => setSelectedPathway("all")}
                  className="text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                >
                  {t.learningPath.clearFilter}
                </button>
              </div>
            )}
          </div>
        </section>
        </FadeInSection>

        {/* Quick Wins Section */}
        {quickWins.length > 0 && (
          <FadeInSection variant="slide-up" delay={300} as="section">
          <section className="relative overflow-hidden space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  ⚡ {t.sections.quickWins.title}
                </h2>
                <p className="text-base text-slate-600">
                  {t.sections.quickWins.description}
                </p>
              </div>
            </div>
            <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickWins.map((resource) => (
                <article
                  key={resource.id}
                  className="relative overflow-hidden group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
                >
                  <div className="absolute inset-y-0 right-[-30%] w-2/3 rounded-full bg-[#9275E533] blur-3xl opacity-40" />
                  <button
                    onClick={() => toggleResourceComplete(resource.id)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 transition ${
                        completedResources.has(resource.id)
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300 bg-white group-hover:border-green-400"
                      }`}
                    >
                      {completedResources.has(resource.id) && (
                        <svg className="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start gap-2">
                      <span className="text-lg">{RESOURCE_TYPE_ICONS[resource.type]}</span>
                      <div className="flex-1">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-900 hover:text-[var(--color-accent-primary)] transition text-sm"
                        >
                          {locale === "en" ? resource.title : resource.titleEs}
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      ⏱️ {locale === "en" ? resource.timeToComplete : resource.timeToCompleteEs}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          </FadeInSection>
        )}

        {/* Community Picks */}
        {communityPicks.length > 0 && (
          <FadeInSection variant="slide-up" delay={400} as="section">
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  ⭐ {t.sections.communityPicks.title}
                </h2>
                <p className="text-base text-slate-600">
                  {t.sections.communityPicks.description}
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {communityPicks.map((resource) => (
                <article
                  key={resource.id}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-3xl">{RESOURCE_TYPE_ICONS[resource.type]}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${DIFFICULTY_COLORS[resource.difficulty]}`}>
                      {dict.resources.difficulties[resource.difficulty]}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {locale === "en" ? resource.title : resource.titleEs}
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">
                    ⏱️ {locale === "en" ? resource.timeToComplete : resource.timeToCompleteEs}
                  </p>
                  <div className="mt-auto flex items-center gap-3">
                    <button
                      onClick={() => toggleResourceComplete(resource.id)}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        completedResources.has(resource.id)
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {completedResources.has(resource.id)
                        ? t.actions.completed
                        : t.actions.markComplete}
                    </button>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-tertiary)]"
                    >
                      {t.actions.start} →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
          </FadeInSection>
        )}

        {/* Latest Additions */}
        {latestResources.length > 0 && (
          <FadeInSection variant="slide-up" delay={500} as="section">
          <section className="relative overflow-hidden space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  🆕 {t.sections.latest.title}
                </h2>
                <p className="text-base text-slate-600">
                  {t.sections.latest.description}
                </p>
              </div>
            </div>
            <div className="relative grid gap-4 sm:grid-cols-2">
              {latestResources.map((resource) => (
                <article
                  key={resource.id}
                  className="relative overflow-hidden group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
                >
                  <div className="absolute inset-y-0 right-[-30%] w-2/3 rounded-full bg-[#9275E533] blur-3xl opacity-40" />
                  <button
                    onClick={() => toggleResourceComplete(resource.id)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 transition ${
                        completedResources.has(resource.id)
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300 bg-white group-hover:border-green-400"
                      }`}
                    >
                      {completedResources.has(resource.id) && (
                        <svg className="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start gap-2">
                      <span className="text-lg">{RESOURCE_TYPE_ICONS[resource.type]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-900 hover:text-[var(--color-accent-primary)] transition text-sm"
                          >
                            {locale === "en" ? resource.title : resource.titleEs}
                          </a>
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            NEW
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          ⏱️ {locale === "en" ? resource.timeToComplete : resource.timeToCompleteEs}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          </FadeInSection>
        )}

        {/* External Training Opportunities Timeline */}
        <FadeInSection variant="slide-up" delay={600} as="section">
        <section className="relative overflow-hidden space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  🎓 {dict.resources.sections.externalOpportunities.title}
                </h2>
                <p className="text-base text-slate-600">
                  {dict.resources.sections.externalOpportunities.subtitle}
                </p>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                {dict.resources.sections.externalOpportunities.description}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-lg">
              <AirtableEmbed
                appId="appdsx5KxeooxGPFO"
                shareId="shrgXV0z193dC7uyI"
                tableId="tblD1rFhCfD8p5lfU"
                viewId="viwFUfEv4CfXQemqD"
                showViewControls={false}
                height="800px"
                title="Open Applications Timeline"
              />
            </div>
          </div>
        </section>
        </FadeInSection>

        {/* All Resources with Filters */}
        <FadeInSection variant="slide-up" delay={700} as="section">
        <section className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900">
                {t.sections.allResources.title}
              </h2>
              <p className="text-base text-slate-600">
                {t.sections.allResources.description}
              </p>
            </div>

            {/* Filter Bar */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {t.filters.type}
                  </span>
                  <button
                    onClick={() => setTypeFilter("all")}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      typeFilter === "all"
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {t.filters.all}
                  </button>
                  {(["video", "paper", "course", "article"] as ResourceType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                        typeFilter === type
                          ? "bg-[var(--color-accent-primary)] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {RESOURCE_TYPE_ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {t.filters.topic}
                  </span>
                  <button
                    onClick={() => setTopicFilter("all")}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      topicFilter === "all"
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {t.filters.all}
                  </button>
                  {(["alignment", "interpretability", "general"] as ResourceTopic[]).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setTopicFilter(topic)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                        topicFilter === topic
                          ? "bg-[var(--color-accent-primary)] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600">
              {t.sections.allResources.showing
                .replace("{count}", filteredResources.length.toString())
                .replace("{total}", resources.length.toString())}
            </div>

            {/* Resources List */}
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <article
                  key={resource.id}
                  className="relative overflow-hidden group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
                >
                  <div className="absolute inset-y-0 right-[-30%] w-2/3 rounded-full bg-[#9275E533] blur-3xl opacity-40" />
                  <button
                    onClick={() => toggleResourceComplete(resource.id)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 transition ${
                        completedResources.has(resource.id)
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300 bg-white group-hover:border-green-400"
                      }`}
                    >
                      {completedResources.has(resource.id) && (
                        <svg className="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <div className="relative min-w-0 flex-1">
                    <div className="mb-2 flex items-start gap-3">
                      <span className="text-xl">{RESOURCE_TYPE_ICONS[resource.type]}</span>
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-900 hover:text-[var(--color-accent-primary)] transition"
                          >
                            {locale === "en" ? resource.title : resource.titleEs}
                          </a>
                          {resource.isNew && (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className={`rounded-full px-2 py-0.5 font-semibold ${DIFFICULTY_COLORS[resource.difficulty]}`}>
                            {dict.resources.difficulties[resource.difficulty]}
                          </span>
                          <span>⏱️ {locale === "en" ? resource.timeToComplete : resource.timeToCompleteEs}</span>
                          <span>📚 {resource.topic}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        </FadeInSection>

        {/* Next Steps CTA */}
        <FadeInSection variant="slide-up" delay={800} as="section">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 text-center shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold text-slate-900">
              {t.cta.title}
            </h2>
            <p className="text-lg text-slate-600">
              {t.cta.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={withLocale(locale, "/activities")}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
              >
                {t.cta.studyGroups} →
              </Link>
              <Link
                href={withLocale(locale, "/contact")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                {t.cta.getInTouch}
              </Link>
            </div>
          </div>
        </section>
        </FadeInSection>
      </main>

      <Footer locale={locale} t={dict.footer} />
    </div>
  );
}
