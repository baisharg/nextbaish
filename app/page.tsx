"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SubstackSignup from "./components/substack-signup";
import Header from "./components/header";
import Footer from "./components/footer";
import { useLanguage } from "./contexts/language-context";

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);


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
      <Header language={language} setLanguage={setLanguage} scrolled={scrolled} />

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
                className="button-primary"
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
          className="relative overflow-hidden space-y-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
          id="events"
        >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-4 text-center">
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
              className="button-secondary"
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                eyebrow: isEnglish ? "Course" : "Curso",
                title: isEnglish ? "Mech Interp Course" : "Curso de Interp Mecánica",
                description: isEnglish
                  ? "Intensive 1-month course on mechanistic interpretability methods."
                  : "Curso intensivo de 1 mes sobre métodos de interpretabilidad mecánica.",
                metaItems: [
                  { icon: "calendar", text: isEnglish ? "April 2025" : "Abril 2025" },
                  { icon: "clock", text: isEnglish ? "1 month" : "1 mes" },
                ],
              },
              {
                eyebrow: isEnglish ? "Activities" : "Actividades",
                title: isEnglish
                  ? "Weekly Discussion Group"
                  : "Grupo de Discusión Semanal",
                description: isEnglish
                  ? "Weekly meetings to discuss recent papers, concepts, and developments in AI safety."
                  : "Reuniones semanales para discutir papers, conceptos y novedades de seguridad en IA.",
                metaItems: [
                  { icon: "calendar", text: isEnglish ? "Tuesdays · 2pm" : "Martes · 14h" },
                  { icon: "clock", text: isEnglish ? "1 hr" : "1 hr" },
                ],
              },
              {
                eyebrow: isEnglish ? "Activities" : "Actividades",
                title: isEnglish ? "Paper Reading Club" : "Club de Lectura",
                description: isEnglish
                  ? "Student-led presentations of AI safety papers."
                  : "Presentaciones lideradas por estudiantes sobre papers de seguridad en IA.",
                metaItems: [
                  { icon: "calendar", text: isEnglish ? "Thursdays · 2pm" : "Jueves · 14h" },
                  { icon: "clock", text: isEnglish ? "1 hr" : "1 hr" },
                ],
              },
              {
                eyebrow: isEnglish ? "Course" : "Curso",
                title: isEnglish
                  ? "AGI Safety Fundamentals"
                  : "Fundamentos de Seguridad AGI",
                description: isEnglish
                  ? "An 8-week guided course covering essential concepts in AI alignment and safety."
                  : "Curso guiado de 8 semanas que cubre los conceptos esenciales de alineamiento y seguridad en IA.",
                metaItems: [
                  { icon: "calendar", text: isEnglish ? "Semester 2" : "Semestre 2" },
                  { icon: "clock", text: isEnglish ? "8 weeks" : "8 semanas" },
                ],
              },
            ].map((activity) => (
              <article
                key={activity.title}
                className="card-glass"
              >
                <div className="card-eyebrow">{activity.eyebrow}</div>
                <h3 className="card-title">{activity.title}</h3>
                <p className="card-body">{activity.description}</p>

                <div className="card-meta">
                  {activity.metaItems.map((item, idx) => (
                    <span key={idx} className="pill">
                      {item.icon === "calendar" ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      )}
                      {item.text}
                    </span>
                  ))}
                </div>

                <div className="card-footer">
                  <a
                    className="button-primary"
                    href="#contact"
                  >
                    {isEnglish ? "Join now" : "Inscríbete"}
                  </a>
                  <a
                    className="link-arrow"
                    href="#contact"
                  >
                    {isEnglish ? "Learn more" : "Más info"}
                    <span>→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] p-8 shadow-sm"
          id="resources"
        >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900">
              {isEnglish ? "Resources" : "Recursos"}
            </h2>
            <p className="text-base text-slate-600">
              {isEnglish
                ? "Dive deeper into AI safety with curated readings and tools."
                : "Profundiza en la seguridad de IA con lecturas y herramientas seleccionadas."}
            </p>
          </div>
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                eyebrow: isEnglish ? "Resources" : "Recursos",
                title: isEnglish ? "Starter Reading List" : "Lecturas Iniciales",
                description: isEnglish
                  ? "Foundational essays and papers to get oriented in AI alignment research."
                  : "Ensayos y papers fundamentales para orientarte en investigación de alineamiento.",
                metaItems: [
                  { icon: "book", text: isEnglish ? "15+ papers" : "15+ papers" },
                ],
              },
              {
                eyebrow: isEnglish ? "Resources" : "Recursos",
                title: isEnglish ? "Research Toolkit" : "Kit de Herramientas",
                description: isEnglish
                  ? "Code repositories, benchmarks, and experiment templates for AI safety research."
                  : "Repositorios de código, benchmarks y plantillas de experimentos para investigación.",
                metaItems: [
                  { icon: "book", text: isEnglish ? "Tools & code" : "Herramientas" },
                ],
              },
              {
                eyebrow: isEnglish ? "Resources" : "Recursos",
                title: isEnglish ? "Community Handbook" : "Manual Comunitario",
                description: isEnglish
                  ? "Guidelines for hosting meetups and facilitating productive discussions."
                  : "Guía para organizar encuentros y facilitar discusiones productivas.",
                metaItems: [
                  { icon: "book", text: isEnglish ? "Guide" : "Guía" },
                ],
              },
            ].map((resource) => (
              <article
                key={resource.title}
                className="card-glass"
              >
                <div className="card-eyebrow">{resource.eyebrow}</div>
                <h3 className="card-title">{resource.title}</h3>
                <p className="card-body">{resource.description}</p>

                <div className="card-meta">
                  {resource.metaItems.map((item, idx) => (
                    <span key={idx} className="pill">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      {item.text}
                    </span>
                  ))}
                </div>

                <div className="card-footer">
                  <a
                    className="button-primary"
                    href="#contact"
                  >
                    {isEnglish ? "View resource" : "Ver recurso"}
                  </a>
                  <a
                    className="link-arrow"
                    href="#contact"
                  >
                    {isEnglish ? "Learn more" : "Más info"}
                    <span>→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="relative overflow-hidden grid gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] p-8 shadow-sm md:grid-cols-2"
          id="get-involved"
        >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <SubstackSignup language={language} />

          <article className="card-glass">
            <div className="card-eyebrow">{isEnglish ? "Community" : "Comunidad"}</div>
            <h3 className="card-title">
              {isEnglish
                ? "Join our Telegram Community"
                : "Únete a nuestra comunidad en Telegram"}
            </h3>
            <p className="card-body">
              {isEnglish
                ? "Connect with fellow students interested in AI safety."
                : "Conéctate con estudiantes interesados en la seguridad de IA."}
            </p>
            <a
              className="button-outline mt-auto"
              href="https://t.me/+zhSGhXrn56g1YjVh"
              rel="noopener noreferrer"
              target="_blank"
            >
              {isEnglish ? "Join Telegram Group" : "Unirse al grupo de Telegram"}
            </a>
          </article>
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}
