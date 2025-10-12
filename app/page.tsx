"use client";

import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

export default function Home() {
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]["code"]>(
    "en",
  );

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
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm">
              B
            </div>
            <div>
              <p className="text-lg font-semibold">
                BAISH - Buenos Aires AI Safety Hub
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Ensuring AI Benefits Humanity
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
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
          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-slate-200 bg-white/70 p-1">
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
              className="rounded-full bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-secondary)] hover:text-slate-900"
              href="#get-involved"
            >
              {isEnglish ? "Join Us" : "Únete"}
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        <section
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#f6f0ff] via-[#f5f5f5] to-[#9ba6fd1f] px-6 py-16 sm:px-16"
          id="about"
        >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9ba6fd33] blur-3xl lg:block" />
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
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-secondary)] hover:text-slate-900"
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
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                date: isEnglish ? "Oct 14 · Tuesday · 2:30 PM" : "14 Oct · Martes · 14:30",
                title: isEnglish
                  ? "AIS Research Workshop — Session 4: The Transformer"
                  : "Taller de Investigación AIS — Sesión 4: El Transformer",
                host: "baish",
                attendees: isEnglish ? "0 + infinity" : "0 + infinito",
              },
              {
                date: isEnglish ? "Oct 18 · Saturday · 11:00 AM" : "18 Oct · Sábado · 11:00",
                title: isEnglish
                  ? "Policy Roundtable: Scaling Responsible AI"
                  : "Mesa Redonda: Escalar la IA Responsable",
                host: "baish",
                attendees: isEnglish ? "12 confirmed" : "12 confirmados",
              },
              {
                date: isEnglish ? "Oct 25 · Saturday · 4:00 PM" : "25 Oct · Sábado · 16:00",
                title: isEnglish
                  ? "Student Lightning Talks — Interpretability"
                  : "Lightning Talks Estudiantiles — Interpretabilidad",
                host: "baish",
                attendees: isEnglish ? "18 registered" : "18 inscriptos",
              },
            ].map((event) => (
              <article
                key={event.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
                    {event.date}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {event.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "By" : "Por"} {event.host} · {event.attendees}
                  </p>
                </div>
                <a
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)]"
                  href="#contact"
                >
                  {isEnglish ? "Subscribe to calendar" : "Suscribirse al calendario"}
                  <span aria-hidden>→</span>
                </a>
              </article>
            ))}
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
                  <span className="inline-flex rounded-full bg-[#9ba6fd1f] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
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
          <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">
                {isEnglish ? "Join our Mailing List" : "Únete a nuestra lista de correo"}
              </h3>
              <p className="text-sm text-slate-600">
                {isEnglish
                  ? "Stay updated with our activities, events, and opportunities."
                  : "Mantente al tanto de nuestras actividades, eventos y oportunidades."}
              </p>
            </div>
            <form className="mt-6 space-y-3">
              <input
                aria-label={isEnglish ? "Email address" : "Correo electrónico"}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 focus:border-[var(--color-accent-primary)] focus:outline-none"
                placeholder="example@gmail.com"
                type="email"
              />
              <button
                className="w-full rounded-xl bg-[var(--color-accent-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-secondary)] hover:text-slate-900"
                type="submit"
              >
                {isEnglish ? "Subscribe" : "Suscribirse"}
              </button>
              <p className="text-xs text-slate-500">
                {isEnglish
                  ? "This embed is no longer supported. Please migrate to Substack."
                  : "Este embed ya no es compatible. Migra a Substack."}
              </p>
            </form>
          </article>

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
              href="https://t.me/baish"
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
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">
              Buenos Aires AI Safety Hub
            </p>
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
          <a className="hover:text-slate-900" href="#privacy">
            {isEnglish ? "Privacy Policy" : "Política de privacidad"}
          </a>
        </div>
      </footer>
    </div>
  );
}
