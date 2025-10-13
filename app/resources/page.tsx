"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";

type ResourceType = "video" | "paper" | "course" | "article" | "wiki" | "book";
type ResourceTopic = "alignment" | "interpretability" | "robustness" | "governance" | "general";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";

interface Resource {
  id: string;
  title: string;
  titleEs: string;
  url: string;
  type: ResourceType;
  topic: ResourceTopic;
  difficulty: DifficultyLevel;
  timeToComplete: string;
  timeToCompleteEs: string;
  description?: string;
  descriptionEs?: string;
  isNew?: boolean;
}

const RESOURCE_TYPE_ICONS: Record<ResourceType, string> = {
  video: "🎥",
  paper: "📄",
  course: "🎓",
  article: "📝",
  wiki: "📚",
  book: "📖",
};

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

import { useLanguage } from "../contexts/language-context";

export default function Resources() {
  const { language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<DifficultyLevel | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [topicFilter, setTopicFilter] = useState<ResourceTopic | "all">("all");
  const [completedResources, setCompletedResources] = useState<Set<string>>(new Set());

  const isEnglish = language === "en";

  // Load completed resources from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("baish-completed-resources");
      if (saved) {
        setCompletedResources(new Set(JSON.parse(saved)));
      }
    }
  }, []);

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

  const toggleResourceComplete = (id: string) => {
    const newCompleted = new Set(completedResources);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedResources(newCompleted);
    if (typeof window !== "undefined") {
      localStorage.setItem("baish-completed-resources", JSON.stringify(Array.from(newCompleted)));
    }
  };

  // Resources data
  const allResources: Resource[] = [
    // Beginner resources
    {
      id: "fli-ai-risk",
      title: "Future of Life Institute: AI Risk Introduction",
      titleEs: "Future of Life Institute: Introducción a Riesgos de IA",
      url: "https://futureoflife.org/ai-risk/",
      type: "article",
      topic: "general",
      difficulty: "beginner",
      timeToComplete: "15 min",
      timeToCompleteEs: "15 min",
    },
    {
      id: "cold-takes",
      title: "Cold Takes: Transformative AI series",
      titleEs: "Cold Takes: Serie sobre IA Transformativa",
      url: "https://www.cold-takes.com/transformative-ai-timelines-part-1-of-4-what-kind-of-ai/",
      type: "article",
      topic: "general",
      difficulty: "beginner",
      timeToComplete: "1-2 hours",
      timeToCompleteEs: "1-2 horas",
    },
    {
      id: "rob-miles",
      title: "Rob Miles: AI Safety Intro",
      titleEs: "Rob Miles: Intro a Seguridad en IA",
      url: "https://www.youtube.com/watch?v=pYXy-A4siMw",
      type: "video",
      topic: "general",
      difficulty: "beginner",
      timeToComplete: "20 min",
      timeToCompleteEs: "20 min",
    },
    {
      id: "80k-hours",
      title: "80,000 Hours: AI Risk Problem Profile",
      titleEs: "80,000 Hours: Perfil del Problema de Riesgo de IA",
      url: "https://80000hours.org/problem-profiles/artificial-intelligence/",
      type: "article",
      topic: "general",
      difficulty: "beginner",
      timeToComplete: "30 min",
      timeToCompleteEs: "30 min",
    },
    {
      id: "stampy-wiki",
      title: "Stampy's AI Safety Wiki",
      titleEs: "Wiki de Seguridad en IA de Stampy",
      url: "https://www.aisafety.info/",
      type: "wiki",
      topic: "general",
      difficulty: "beginner",
      timeToComplete: "Variable",
      timeToCompleteEs: "Variable",
    },
    // Intermediate resources
    {
      id: "agi-safety-fundamentals",
      title: "AGI Safety Fundamentals Curriculum",
      titleEs: "Plan de Estudios de Fundamentos de Seguridad en AGI",
      url: "https://www.alignmentforum.org/s/mzgtmmTKKn5MuCzFJ",
      type: "course",
      topic: "alignment",
      difficulty: "intermediate",
      timeToComplete: "8 weeks",
      timeToCompleteEs: "8 semanas",
    },
    {
      id: "technical-alignment",
      title: "Technical Alignment Fundamentals",
      titleEs: "Fundamentos de Alineamiento Técnico",
      url: "https://www.lesswrong.com/posts/uMQ3cqWDPHhjtiesc/agi-safety-fundamentals-technical-alignment-curriculum",
      type: "course",
      topic: "alignment",
      difficulty: "intermediate",
      timeToComplete: "8 weeks",
      timeToCompleteEs: "8 semanas",
    },
    {
      id: "anthropic-core-views",
      title: "Anthropic: Core Views on AI Safety",
      titleEs: "Anthropic: Visiones Centrales sobre Seguridad en IA",
      url: "https://www.anthropic.com/index/core-views-on-ai-safety",
      type: "article",
      topic: "general",
      difficulty: "intermediate",
      timeToComplete: "1 hour",
      timeToCompleteEs: "1 hora",
    },
    {
      id: "instructgpt-paper",
      title: "Training Language Models to Follow Instructions",
      titleEs: "Entrenando Modelos de Lenguaje para Seguir Instrucciones",
      url: "https://arxiv.org/abs/2209.00626",
      type: "paper",
      topic: "alignment",
      difficulty: "intermediate",
      timeToComplete: "2-3 hours",
      timeToCompleteEs: "2-3 horas",
    },
    {
      id: "deeplearning-alignment",
      title: "DeepLearning.AI: Alignment Techniques for LLMs",
      titleEs: "DeepLearning.AI: Técnicas de Alineamiento para LLMs",
      url: "https://www.deeplearning.ai/short-courses/alignment-techniques-for-llms/",
      type: "course",
      topic: "alignment",
      difficulty: "intermediate",
      timeToComplete: "3-4 hours",
      timeToCompleteEs: "3-4 horas",
      isNew: true,
    },
    // Advanced resources
    {
      id: "distill-circuits",
      title: "Distill: Circuits Thread",
      titleEs: "Distill: Hilo de Circuitos",
      url: "https://distill.pub/2020/circuits/",
      type: "article",
      topic: "interpretability",
      difficulty: "advanced",
      timeToComplete: "4-6 hours",
      timeToCompleteEs: "4-6 horas",
    },
    {
      id: "transformer-circuits",
      title: "Anthropic: Transformer Circuits",
      titleEs: "Anthropic: Circuitos de Transformer",
      url: "https://transformer-circuits.pub/",
      type: "article",
      topic: "interpretability",
      difficulty: "advanced",
      timeToComplete: "Variable",
      timeToCompleteEs: "Variable",
      isNew: true,
    },
    {
      id: "discovering-latent",
      title: "Discovering Latent Knowledge in Language Models",
      titleEs: "Descubriendo Conocimiento Latente en Modelos de Lenguaje",
      url: "https://arxiv.org/abs/2212.03827",
      type: "paper",
      topic: "interpretability",
      difficulty: "advanced",
      timeToComplete: "3-4 hours",
      timeToCompleteEs: "3-4 horas",
    },
    {
      id: "language-agents",
      title: "Language Agents for Alignment Research",
      titleEs: "Agentes de Lenguaje para Investigación de Alineamiento",
      url: "https://arxiv.org/abs/2312.11805",
      type: "paper",
      topic: "alignment",
      difficulty: "advanced",
      timeToComplete: "2-3 hours",
      timeToCompleteEs: "2-3 horas",
    },
    {
      id: "alignment-forum-advanced",
      title: "Alignment Forum: Advanced Concepts",
      titleEs: "Alignment Forum: Conceptos Avanzados",
      url: "https://www.alignmentforum.org/posts/pRkFkzwKZ2zfa3R6H/without-specific-countermeasures-the-easiest-path-to",
      type: "article",
      topic: "alignment",
      difficulty: "advanced",
      timeToComplete: "1-2 hours",
      timeToCompleteEs: "1-2 horas",
    },
  ];

  // Filter resources
  const filteredResources = allResources.filter((resource) => {
    if (selectedPathway !== "all" && resource.difficulty !== selectedPathway) return false;
    if (typeFilter !== "all" && resource.type !== typeFilter) return false;
    if (topicFilter !== "all" && resource.topic !== topicFilter) return false;
    return true;
  });

  // Quick wins - resources under 30 minutes
  const quickWins = allResources.filter((r) =>
    r.timeToComplete.includes("15") || r.timeToComplete.includes("20") || r.timeToComplete.includes("30 min")
  );

  // Community picks (hardcoded for now)
  const communityPicks = [
    allResources.find((r) => r.id === "agi-safety-fundamentals"),
    allResources.find((r) => r.id === "rob-miles"),
    allResources.find((r) => r.id === "distill-circuits"),
  ].filter(Boolean) as Resource[];

  // Latest additions
  const latestResources = allResources.filter((r) => r.isNew);

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <Header language={language} setLanguage={setLanguage} scrolled={scrolled} />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <section className="space-y-6">
          <div className="text-sm text-slate-600">
            <Link href="/" className="hover:text-[var(--color-accent-primary)] transition">
              {isEnglish ? "Home" : "Inicio"}
            </Link>
            {" / "}
            <span className="text-slate-900">
              {isEnglish ? "Resources" : "Recursos"}
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {isEnglish ? "Learning Resources" : "Recursos de Aprendizaje"}
            </h1>
            <p className="text-lg text-slate-700">
              {isEnglish
                ? "Curated materials for exploring AI safety concepts with progress tracking"
                : "Materiales curados para explorar conceptos de seguridad en IA con seguimiento de progreso"}
            </p>
          </div>
        </section>

        {/* Featured Video */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-8 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                🎥 {isEnglish ? "Introduction to AI Safety" : "Introducción a la Seguridad en IA"}
              </h2>
              <p className="text-base text-slate-600">
                {isEnglish
                  ? "Start here: Why experts fear superintelligent AI – and what we can do about it"
                  : "Empieza aquí: Por qué los expertos temen la IA superinteligente – y qué podemos hacer al respecto"}
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

        {/* Learning Path Visualization */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900">
                {isEnglish ? "Your Learning Path" : "Tu Camino de Aprendizaje"}
              </h2>
              <p className="text-base text-slate-600">
                {isEnglish
                  ? "Choose your level to see personalized recommendations"
                  : "Elige tu nivel para ver recomendaciones personalizadas"}
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
                    {isEnglish ? "Beginner" : "Principiante"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "No technical background needed" : "No se requiere formación técnica"}
                  </p>
                  <div className="pt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-green-500 transition-all"
                        style={{
                          width: `${(completedResources.size / allResources.filter(r => r.difficulty === "beginner").length) * 100}%`
                        }}
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
                    {isEnglish ? "Intermediate" : "Intermedio"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "Some ML/AI knowledge" : "Algo de conocimiento en ML/IA"}
                  </p>
                  <div className="pt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-yellow-500 transition-all"
                        style={{
                          width: `${(completedResources.size / allResources.filter(r => r.difficulty === "intermediate").length) * 100}%`
                        }}
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
                    {isEnglish ? "Advanced" : "Avanzado"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "Strong technical background" : "Sólida formación técnica"}
                  </p>
                  <div className="pt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-red-500 transition-all"
                        style={{
                          width: `${(completedResources.size / allResources.filter(r => r.difficulty === "advanced").length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {selectedPathway !== "all" && (
              <div className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
                <p className="text-sm font-medium text-slate-700">
                  {isEnglish
                    ? `Viewing ${selectedPathway} resources`
                    : `Viendo recursos de nivel ${selectedPathway}`}
                </p>
                <button
                  onClick={() => setSelectedPathway("all")}
                  className="text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                >
                  {isEnglish ? "Clear filter" : "Limpiar filtro"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Wins Section */}
        {quickWins.length > 0 && (
          <section className="relative overflow-hidden space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  ⚡ {isEnglish ? "Quick Wins" : "Victorias Rápidas"}
                </h2>
                <p className="text-base text-slate-600">
                  {isEnglish
                    ? "15-30 minute resources for busy learners"
                    : "Recursos de 15-30 minutos para estudiantes ocupados"}
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
                          {isEnglish ? resource.title : resource.titleEs}
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      ⏱️ {isEnglish ? resource.timeToComplete : resource.timeToCompleteEs}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Community Picks */}
        {communityPicks.length > 0 && (
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  ⭐ {isEnglish ? "Community Picks" : "Favoritos de la Comunidad"}
                </h2>
                <p className="text-base text-slate-600">
                  {isEnglish
                    ? "Most recommended by BAISH members"
                    : "Más recomendados por miembros de BAISH"}
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
                      {isEnglish ? resource.difficulty : resource.difficulty === "beginner" ? "principiante" : resource.difficulty === "intermediate" ? "intermedio" : "avanzado"}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {isEnglish ? resource.title : resource.titleEs}
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">
                    ⏱️ {isEnglish ? resource.timeToComplete : resource.timeToCompleteEs}
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
                        ? (isEnglish ? "✓ Completed" : "✓ Completado")
                        : (isEnglish ? "Mark Complete" : "Marcar Completo")}
                    </button>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-tertiary)]"
                    >
                      {isEnglish ? "Start" : "Empezar"} →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Latest Additions */}
        {latestResources.length > 0 && (
          <section className="relative overflow-hidden space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  🆕 {isEnglish ? "Latest Additions" : "Últimas Adiciones"}
                </h2>
                <p className="text-base text-slate-600">
                  {isEnglish
                    ? "Recently added to our collection"
                    : "Recientemente agregados a nuestra colección"}
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
                            {isEnglish ? resource.title : resource.titleEs}
                          </a>
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            NEW
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          ⏱️ {isEnglish ? resource.timeToComplete : resource.timeToCompleteEs}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Resources with Filters */}
        <section className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900">
                {isEnglish ? "All Resources" : "Todos los Recursos"}
              </h2>
              <p className="text-base text-slate-600">
                {isEnglish
                  ? "Filter by type, topic, or difficulty level"
                  : "Filtrar por tipo, tema o nivel de dificultad"}
              </p>
            </div>

            {/* Filter Bar */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {isEnglish ? "Type:" : "Tipo:"}
                  </span>
                  <button
                    onClick={() => setTypeFilter("all")}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      typeFilter === "all"
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isEnglish ? "All" : "Todos"}
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
                    {isEnglish ? "Topic:" : "Tema:"}
                  </span>
                  <button
                    onClick={() => setTopicFilter("all")}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      topicFilter === "all"
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isEnglish ? "All" : "Todos"}
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
              {isEnglish
                ? `Showing ${filteredResources.length} of ${allResources.length} resources`
                : `Mostrando ${filteredResources.length} de ${allResources.length} recursos`}
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
                            {isEnglish ? resource.title : resource.titleEs}
                          </a>
                          {resource.isNew && (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className={`rounded-full px-2 py-0.5 font-semibold ${DIFFICULTY_COLORS[resource.difficulty]}`}>
                            {isEnglish ? resource.difficulty : resource.difficulty === "beginner" ? "principiante" : resource.difficulty === "intermediate" ? "intermedio" : "avanzado"}
                          </span>
                          <span>⏱️ {isEnglish ? resource.timeToComplete : resource.timeToCompleteEs}</span>
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

        {/* Next Steps CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 text-center shadow-sm sm:px-12">
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold text-slate-900">
              {isEnglish ? "Ready to Get Started?" : "¿Listo para Empezar?"}
            </h2>
            <p className="text-lg text-slate-600">
              {isEnglish
                ? "Join our community to discuss these resources and learn together"
                : "Únete a nuestra comunidad para discutir estos recursos y aprender juntos"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/activities"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
              >
                {isEnglish ? "Join Study Groups" : "Únete a Grupos de Estudio"} →
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                {isEnglish ? "Get in Touch" : "Contactar"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}
