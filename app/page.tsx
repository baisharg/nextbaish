"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SubstackSignup from "./components/substack-signup";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

export default function Home() {
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]["code"]>(
    "en",
  );
  const [scrolled, setScrolled] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Lightweight performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastReport = performance.now();
    let lastFrameTime = performance.now();
    let slowFrames = 0;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      const frameDuration = now - lastFrameTime;

      if (frameDuration > 16.67) { // Slower than 60fps
        slowFrames++;
      }

      if (now - lastReport > 3000) {
        const fps = frameCount / ((now - lastReport) / 1000);
        const slowPercent = (slowFrames / frameCount * 100).toFixed(1);
        console.log(`[Main Thread] ${fps.toFixed(1)} fps | ${slowPercent}% frames >16ms`);
        frameCount = 0;
        slowFrames = 0;
        lastReport = now;
      }

      lastFrameTime = now;
      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const node = calendarContainerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setCalendarVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    let lastScrollTime = performance.now();
    let scrollCount = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const start = performance.now();
          setScrolled(window.scrollY > 100);
          const end = performance.now();

          scrollCount++;
          if (scrollCount % 10 === 0) {
            console.log(`[Scroll Performance] State update: ${(end - start).toFixed(2)}ms | Scroll events/sec: ${(1000 / (end - lastScrollTime) * 10).toFixed(0)}`);
          }
          lastScrollTime = end;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const footnotes = [
    {
      id: 1,
      href: "https://epochai.org/trends",
      label: "1",
    },
    {
      id: 2,
      href: "https://ourworldindata.org/brief-history-of-AI",
      label: "2",
    },
    {
      id: 3,
      href: "https://arxiv.org/abs/2109.13916",
      label: "3",
    },
    {
      id: 4,
      href: "https://www.safe.ai/statement-on-ai-risk",
      label: "4",
    },
    {
      id: 5,
      href: "https://distill.pub/2020/circuits/zoom-in/",
      label: "5",
    },
    {
      id: 6,
      href: "https://aisafety.training/",
      label: "6",
    },
  ];

  const renderFootnote = (id: number) => {
    const note = footnotes.find((fn) => fn.id === id);
    if (!note) {
      return null;
    }
    return (
      <sup className="align-super text-xs">
        <a
          className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
          href={note.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {note.label}
        </a>
      </sup>
    );
  };

  const isEnglish = language === "en";

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <header
        className="sticky top-0 z-20 will-change-transform px-6 sm:px-10"
        style={{
          transform: 'translateZ(0)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div
          className="mx-auto transition-all border-slate-200"
          style={{
            maxWidth: scrolled ? '1100px' : '1280px',
            marginTop: scrolled ? '1rem' : '0',
            borderRadius: scrolled ? '9999px' : '0',
            borderWidth: scrolled ? '1px' : '0 0 1px 0',
            backgroundColor: scrolled ? 'rgb(255, 255, 255)' : 'transparent',
            boxShadow: scrolled ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none',
            paddingLeft: scrolled ? '2rem' : '0',
            paddingRight: scrolled ? '2rem' : '0',
            paddingTop: scrolled ? '0.75rem' : '1rem',
            paddingBottom: scrolled ? '0.75rem' : '1rem',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 min-w-0">
              <div
                style={{
                  transform: scrolled ? 'scale(0.85)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Image
                  src="/jacarandashield.png"
                  alt="BAISH Logo"
                  width={40}
                  height={40}
                  className="object-contain flex-shrink-0"
                  priority
                />
              </div>
              <div className="overflow-hidden min-w-0 flex items-center">
                <p
                  className="font-semibold whitespace-nowrap"
                  style={{
                    fontSize: scrolled ? '1rem' : '1.125rem',
                    transition: 'font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  BAISH
                </p>
                <span
                  className="font-semibold whitespace-nowrap"
                  style={{
                    fontSize: scrolled ? '1rem' : '1.125rem',
                    marginLeft: '0.25rem',
                    opacity: scrolled ? 0 : 1,
                    maxWidth: scrolled ? '0px' : '500px',
                    overflow: 'hidden',
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1), font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  - Buenos Aires AI Safety Hub
                </span>
              </div>
            </div>
            <nav
              className="hidden md:flex items-center text-sm font-medium text-slate-600"
              style={{
                gap: scrolled ? '0.75rem' : '1.5rem',
                transition: 'gap 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <a className="hover:text-slate-900" href="#about">
                {isEnglish ? "About" : "Sobre nosotros"}
              </a>
              <a className="hover:text-slate-900" href="#activities">
                {isEnglish ? "Activities" : "Actividades"}
              </a>
              <a className="hover:text-slate-900" href="#resources">
                {isEnglish ? "Resources" : "Recursos"}
              </a>
              <a className="hover:text-slate-900" href="#contact">
                {isEnglish ? "Contact" : "Contacto"}
              </a>
            </nav>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`rounded-full border border-slate-200 bg-white/70 p-1 transition-all duration-500 ${
                scrolled ? "hidden sm:flex" : "flex"
              }`}>
                {LANGUAGES.map((lang) => {
                  const active = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        active
                          ? "bg-[var(--color-accent-primary)] text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => setLanguage(lang.code)}
                      type="button"
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
              <a
                className={`rounded-full bg-[var(--color-accent-primary)] font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)] whitespace-nowrap ${
                  scrolled ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
                }`}
                href="#get-involved"
              >
                {isEnglish ? "Join Us" : "Únete"}
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        <section
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-16 sm:px-16"
          id="about"
        >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-6 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-accent-tertiary)]">
              {isEnglish ? "Mission" : "Misión"}
            </p>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {isEnglish
                ? "Ensuring AI Benefits Humanity"
                : "Asegurando que la IA Beneficie a la Humanidad"}
            </h1>

            <article className="space-y-6 text-lg text-slate-700">
              <p>
                {isEnglish ? (
                  <>
                    As artificial intelligence models advance in capabilities
                    {renderFootnote(1)}, we expect them to have an increasingly
                    profound impact on our society
                    {renderFootnote(2)}. It is essential that this impact is
                    positive, and that the decisions made by these systems are
                    transparent, reliable, and accountable
                    {renderFootnote(3)} to the people affected by them.
                  </>
                ) : (
                  <>
                    A medida que los modelos de inteligencia artificial avanzan en
                    capacidades
                    {renderFootnote(1)}, esperamos que tengan un impacto cada vez
                    más profundo en nuestra sociedad
                    {renderFootnote(2)}. Es esencial que este impacto sea
                    positivo, y que las decisiones tomadas por estos sistemas sean
                    transparentes, confiables y responsables
                    {renderFootnote(3)} ante las personas afectadas por ellos.
                  </>
                )}
              </p>
              <p>
                {isEnglish ? (
                  <>
                    We believe that reducing the risks associated with advanced AI
                    models
                    {renderFootnote(4)} is one of the most important challenges of
                    our time. We also believe it is an open and exciting problem
                    {renderFootnote(5)}, with ample opportunities for more
                    researchers to advance in this field
                    {renderFootnote(6)}.
                  </>
                ) : (
                  <>
                    Creemos que reducir los riesgos asociados a modelos avanzados
                    de IA
                    {renderFootnote(4)} es uno de los desafíos más importantes de
                    nuestro tiempo. También creemos que es un problema abierto y
                    apasionante
                    {renderFootnote(5)}, con amplias oportunidades para que más
                    investigadores avancen en este campo
                    {renderFootnote(6)}.
                  </>
                )}
              </p>
              <p>
                {isEnglish
                  ? "BAISH's mission is to support students in entering this field and conducting research on this topic."
                  : "La misión de BAISH es apoyar a estudiantes a entrar a este campo y a realizar investigaciones sobre este tema."}
              </p>
            </article>

            <div>
              <a
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                href="https://baish.com.ar/#get-involved"
                rel="noopener noreferrer"
                target="_blank"
              >
                {isEnglish ? "Get Involved" : "Participa"}
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>

        <section
          className="space-y-12 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12"
          id="events"
        >
          <div className="space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-accent-tertiary)]">
              {isEnglish ? "Upcoming Events" : "Próximos Eventos"}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              {isEnglish
                ? "Join our community workshops and meetups"
                : "Únete a nuestros talleres y encuentros comunitarios"}
            </h2>
            <p className="text-base text-slate-600">
              {isEnglish
                ? "Stay current on AI safety discussions, research sprints, and collaboration spaces."
                : "Mantente al día con discusiones sobre seguridad en IA, sprints de investigación y espacios colaborativos."}
            </p>
          </div>
          <div className="flex justify-center" ref={calendarContainerRef}>
            {calendarVisible ? (
              <iframe
                title="BAISH Event Calendar"
                src="https://lu.ma/embed/calendar/cal-0oFAsTn5vpwcAwb/events?lt=light"
                width="100%"
                height="450"
                frameBorder="0"
                allowFullScreen
                aria-hidden="false"
                tabIndex={0}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="rounded-xl border-0"
                style={{ maxWidth: "800px" }}
              />
            ) : (
              <div className="flex h-[450px] w-full max-w-[800px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                {isEnglish
                  ? "Calendar loads once it's almost in view to keep the initial load quick."
                  : "El calendario se carga al acercarse a la vista para mantener la carga inicial rápida."}
              </div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <a
              href="https://www.google.com/calendar/render?cid=http%3A%2F%2Fapi.lu.ma%2Fics%2Fget%3Fentity%3Dcalendar%26id%3Dcal-0oFAsTn5vpwcAwb"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {isEnglish ? "Subscribe to Calendar" : "Suscribirse al calendario"}
            </a>
          </div>
        </section>

        <section className="space-y-8" id="activities">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900">
              {isEnglish ? "Our Activities" : "Nuestras Actividades"}
            </h2>
            <p className="text-base text-slate-600">
              {isEnglish
                ? "Explore recurring programs designed to grow the AI safety community."
                : "Explora los programas recurrentes diseñados para crecer la comunidad de seguridad en IA."}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: isEnglish ? "Mech Interp Course" : "Curso de Interp Mecánica",
                description: isEnglish
                  ? "Intensive 1-month course on mechanistic interpretability methods."
                  : "Curso intensivo de 1 mes sobre métodos de interpretabilidad mecánica.",
                status: isEnglish ? "Starts end of April 2025" : "Comienza fin de abril 2025",
              },
              {
                title: isEnglish
                  ? "Weekly Discussion Group"
                  : "Grupo de Discusión Semanal",
                description: isEnglish
                  ? "Weekly meetings to discuss recent papers, concepts, and developments in AI safety."
                  : "Reuniones semanales para discutir papers, conceptos y novedades de seguridad en IA.",
                status: isEnglish ? "Every Tuesday @ 2pm" : "Todos los martes @ 14h",
              },
              {
                title: isEnglish ? "Paper Reading Club" : "Club de Lectura",
                description: isEnglish
                  ? "Student-led presentations of AI safety papers."
                  : "Presentaciones lideradas por estudiantes sobre papers de seguridad en IA.",
                status: isEnglish ? "Every Thursday @ 2pm" : "Todos los jueves @ 14h",
              },
              {
                title: isEnglish
                  ? "AGI Safety Fundamentals Cohort"
                  : "Cohorte Fundamentos de Seguridad AGI",
                description: isEnglish
                  ? "An 8-week guided course covering the essential concepts in AI alignment and safety."
                  : "Curso guiado de 8 semanas que cubre los conceptos esenciales de alineamiento y seguridad en IA.",
                status: isEnglish ? "Starting in the second semester" : "Inicia en el segundo semestre",
              },
            ].map((activity) => (
              <article
                key={activity.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-slate-600">{activity.description}</p>
                </div>
                <div className="mt-6 space-y-3">
                  <span className="inline-flex rounded-full bg-[#9275E51a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
                    {activity.status}
                  </span>
                  <a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)]"
                    href="#contact"
                  >
                    {isEnglish ? "Learn More" : "Más información"} →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
          id="resources"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900">
              {isEnglish ? "Resources" : "Recursos"}
            </h2>
            <p className="text-base text-slate-600">
              {isEnglish
                ? "Dive deeper into AI safety with curated readings and tools."
                : "Profundiza en la seguridad de IA con lecturas y herramientas seleccionadas."}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: isEnglish ? "Starter Reading List" : "Lecturas Iniciales",
                description: isEnglish
                  ? "Foundational essays and papers to get oriented in alignment."
                  : "Ensayos y papers fundamentales para orientarte en alineamiento.",
              },
              {
                title: isEnglish ? "Research Toolkit" : "Kit de Herramientas",
                description: isEnglish
                  ? "Code repositories, benchmarks, and experiment templates."
                  : "Repositorios de código, benchmarks y plantillas de experimentos.",
              },
              {
                title: isEnglish ? "Community Handbook" : "Manual Comunitario",
                description: isEnglish
                  ? "Guidelines for hosting meetups and facilitating discussions."
                  : "Guía para organizar encuentros y facilitar discusiones.",
              },
            ].map((resource) => (
              <article
                key={resource.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-slate-600">{resource.description}</p>
                </div>
                <a
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)]"
                  href="#contact"
                >
                  {isEnglish ? "View Resource" : "Ver recurso"} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section
          className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2"
          id="get-involved"
        >
          <SubstackSignup language={language} />

          <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">
                {isEnglish
                  ? "Join our Telegram Community"
                  : "Únete a nuestra comunidad en Telegram"}
              </h3>
              <p className="text-sm text-slate-600">
                {isEnglish
                  ? "Connect with fellow students interested in AI safety."
                  : "Conéctate con estudiantes interesados en la seguridad de IA."}
              </p>
            </div>
            <a
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-accent-primary)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-accent-primary)] transition hover:bg-[#f5f0ff]"
              href="https://t.me/+zhSGhXrn56g1YjVh"
              rel="noopener noreferrer"
              target="_blank"
            >
              {isEnglish ? "Join Telegram Group" : "Unirse al grupo de Telegram"}
            </a>
          </article>
        </section>
      </main>

      <footer
        className="border-t border-slate-200 bg-white px-6 py-10 text-sm text-slate-600 sm:px-10"
        id="contact"
      >
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/jacarandashield.png"
                  alt="BAISH Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <p className="text-base font-semibold text-slate-900">
                  Buenos Aires AI Safety Hub
                </p>
              </div>
              <p>© {new Date().getFullYear()} BAISH. {isEnglish ? "All rights reserved." : "Todos los derechos reservados."}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a className="hover:text-slate-900" href="#about">
                {isEnglish ? "About" : "Sobre nosotros"}
              </a>
              <a className="hover:text-slate-900" href="#activities">
                {isEnglish ? "Activities" : "Actividades"}
              </a>
              <a className="hover:text-slate-900" href="#resources">
                {isEnglish ? "Resources" : "Recursos"}
              </a>
              <a className="hover:text-slate-900" href="#get-involved">
                {isEnglish ? "Get Involved" : "Participa"}
              </a>
              <a className="hover:text-slate-900" href="#contact">
                {isEnglish ? "Contact" : "Contacto"}
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-6">
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/baish_arg"
                aria-label="Instagram"
                className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/baish-arg"
                aria-label="LinkedIn"
                className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a
                href="https://t.me/+zhSGhXrn56g1YjVh"
                aria-label="Telegram"
                className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </a>
              <a
                href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                aria-label="WhatsApp"
                className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>
            <a className="hover:text-slate-900" href="#privacy">
              {isEnglish ? "Privacy Policy" : "Política de privacidad"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
