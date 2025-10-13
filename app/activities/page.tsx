"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { useLanguage } from "../contexts/language-context";

export default function Activities() {
  const { language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

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

  // Intersection Observer for lazy loading calendar
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

  const isEnglish = language === "en";

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
        <Header language={language} setLanguage={setLanguage} scrolled={scrolled} />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <section className="space-y-6">
            <div className="text-sm text-slate-600">
              <a href="/" className="hover:text-slate-900">
                {isEnglish ? "Home" : "Inicio"}
              </a>
              {" / "}
              <span className="text-slate-900">{isEnglish ? "Activities" : "Actividades"}</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                {isEnglish ? "Our Activities" : "Nuestras Actividades"}
              </h1>
              <p className="text-lg text-slate-700 max-w-3xl">
                {isEnglish
                  ? "Join our community and participate in AI safety research and learning"
                  : "Únete a nuestra comunidad y participa en investigación y aprendizaje de seguridad en IA"}
              </p>
              <div className="pt-2">
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
                  {isEnglish ? "Subscribe to Events Calendar" : "Suscribirse al calendario de eventos"}
                </a>
              </div>
            </div>
          </section>

          {/* Events Calendar Section */}
          <section className="relative overflow-hidden space-y-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
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
          </section>

          {/* Mech Interp Course */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">🧠</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {isEnglish ? "Mech Interp Course" : "Curso de Interpretabilidad Mecánica"}
                  </h2>
                  <span className="inline-flex rounded-full bg-[#9275E51a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
                    {isEnglish ? "Starts end of April 2025" : "Comienza fin de abril 2025"}
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-4 text-base text-slate-700">
                    <p>
                      {isEnglish
                        ? "The Mechanistic Interpretability Course is an intensive 1-month program focused on techniques for understanding the internal mechanisms of neural networks. This course combines theoretical learning with hands-on projects."
                        : "El Curso de Interpretabilidad Mecánica es un programa intensivo de 1 mes enfocado en técnicas para comprender los mecanismos internos de las redes neuronales. Este curso combina aprendizaje teórico con proyectos prácticos."}
                    </p>
                    <p>
                      {isEnglish
                        ? "Mechanistic interpretability is a key area of AI safety research, aiming to make AI systems more transparent and understandable."
                        : "La interpretabilidad mecánica es un área clave de investigación en seguridad de IA, con el objetivo de hacer que los sistemas de IA sean más transparentes y comprensibles."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "Curriculum Overview" : "Resumen del Currículo"}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Foundations of neural network architectures"
                            : "Fundamentos de arquitecturas de redes neuronales"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Feature visualization techniques"
                            : "Técnicas de visualización de características"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Attribution methods for understanding network decisions"
                            : "Métodos de atribución para entender decisiones de la red"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Advanced case studies from recent literature"
                            : "Estudios de caso avanzados de literatura reciente"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "Time Commitment" : "Compromiso de Tiempo"}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "2 lectures per week (2 hours each)"
                            : "2 clases por semana (2 horas cada una)"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "1 practical session per week (3 hours)"
                            : "1 sesión práctica por semana (3 horas)"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Individual project work (5-10 hours per week)"
                            : "Trabajo de proyecto individual (5-10 horas por semana)"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Final project presentation"
                            : "Presentación del proyecto final"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "Prerequisites" : "Prerrequisitos"}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Strong programming skills (Python)"
                            : "Habilidades sólidas de programación (Python)"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Experience with deep learning frameworks (PyTorch preferred)"
                            : "Experiencia con frameworks de aprendizaje profundo (PyTorch preferido)"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Familiarity with basic neural network architectures"
                            : "Familiaridad con arquitecturas básicas de redes neuronales"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Linear algebra and calculus"
                            : "Álgebra lineal y cálculo"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <a
                      href="/mech-interp-course"
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                    >
                      {isEnglish ? "View Detailed Course Information" : "Ver información detallada del curso"}
                      <span aria-hidden>→</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {isEnglish ? "Course Details" : "Detalles del Curso"}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Duration:" : "Duración:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "4 weeks" : "4 semanas"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Start Date:" : "Fecha de inicio:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "June 2, 2025" : "2 de junio de 2025"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "End Date:" : "Fecha de finalización:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "June 27, 2025" : "27 de junio de 2025"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Application Deadline:" : "Fecha límite de inscripción:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "May 15, 2025" : "15 de mayo de 2025"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Location:" : "Ubicación:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "Hybrid (In-person & Zoom)" : "Híbrido (Presencial & Zoom)"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Instructors:" : "Instructores:"}
                        </dt>
                        <dd className="text-slate-700">Dr. Laura Fernandez, Carlos Mendez</dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <a
                        href="/contact#mech-interp"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                      >
                        {isEnglish ? "Express Interest" : "Expresar interés"}
                      </a>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          {/* AGI Safety Fundamentals */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">📚</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {isEnglish
                      ? "AGI Safety Fundamentals Cohort"
                      : "Cohorte de Fundamentos de Seguridad AGI"}
                  </h2>
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                    {isEnglish ? "Currently Active" : "Actualmente activo"}
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-4 text-base text-slate-700">
                    <p>
                      {isEnglish
                        ? "The AGI Safety Fundamentals cohort is an 8-week guided course covering the essential concepts in AI alignment and safety. Participants read selected materials and meet weekly to discuss the readings with a facilitator."
                        : "La cohorte de Fundamentos de Seguridad AGI es un curso guiado de 8 semanas que cubre los conceptos esenciales en alineamiento y seguridad de IA. Los participantes leen materiales seleccionados y se reúnen semanalmente para discutir las lecturas con un facilitador."}
                    </p>
                    <p>
                      {isEnglish
                        ? "This program is based on the AGI Safety Fundamentals curriculum by BlueDot and provides a structured introduction to the field of AI safety."
                        : "Este programa se basa en el currículo de Fundamentos de Seguridad AGI de BlueDot y proporciona una introducción estructurada al campo de la seguridad en IA."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "What to Expect" : "Qué Esperar"}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Weekly 2-hour discussion sessions"
                            : "Sesiones de discusión semanales de 2 horas"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "1-3 hours of reading per week"
                            : "1-3 horas de lectura por semana"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Small groups of 6-12 participants"
                            : "Grupos pequeños de 6-12 participantes"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Experienced facilitators to guide discussions"
                            : "Facilitadores experimentados para guiar las discusiones"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Certificate of completion"
                            : "Certificado de finalización"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {isEnglish ? "Program Details" : "Detalles del Programa"}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Duration:" : "Duración:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "10-12 weeks" : "10-12 semanas"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Fellowship Period:" : "Período de Fellowship:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "August - December 2025" : "Agosto - Diciembre 2025"}
                        </dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <a
                        href="https://course.aisafetyfundamentals.com/alignment"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {isEnglish ? "View Curriculum" : "Ver currículo"}
                      </a>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          {/* Weekly Discussion Group */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">💬</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {isEnglish ? "Weekly Discussion Group" : "Grupo de Discusión Semanal"}
                  </h2>
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    {isEnglish ? "Every Tuesday @ 18:00" : "Todos los martes @ 18:00"}
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-4 text-base text-slate-700">
                    <p>
                      {isEnglish
                        ? "Our Weekly Discussion Group provides a casual forum for discussing recent papers, concepts, and developments in AI safety. These sessions are open to anyone interested in the field, regardless of prior knowledge."
                        : "Nuestro Grupo de Discusión Semanal proporciona un foro casual para discutir papers recientes, conceptos y desarrollos en seguridad de IA. Estas sesiones están abiertas a cualquier persona interesada en el campo, independientemente del conocimiento previo."}
                    </p>
                    <p>
                      {isEnglish
                        ? "Each week features a different topic, announced in advance through our mailing list and Telegram group."
                        : "Cada semana presenta un tema diferente, anunciado con anticipación a través de nuestra lista de correo y grupo de Telegram."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "Format" : "Formato"}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "90-minute discussions led by a rotating facilitator"
                            : "Discusiones de 90 minutos dirigidas por un facilitador rotativo"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Short presentation of the week's topic (15-20 minutes)"
                            : "Presentación corta del tema de la semana (15-20 minutos)"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish ? "Open discussion and Q&A" : "Discusión abierta y preguntas"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Optional pre-reading materials shared in advance"
                            : "Materiales de lectura previos opcionales compartidos con anticipación"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "Participation" : "Participación"}
                    </h3>
                    <p className="text-base text-slate-700">
                      {isEnglish
                        ? "No registration is required. Simply show up! If you're attending for the first time, we recommend arriving 10 minutes early to meet the organizers."
                        : "No se requiere inscripción. ¡Simplemente aparece! Si asistes por primera vez, recomendamos llegar 10 minutos antes para conocer a los organizadores."}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {isEnglish ? "Next Discussion" : "Próxima Discusión"}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Date:" : "Fecha:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "March 25, 2025" : "25 de marzo de 2025"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Time:" : "Hora:"}
                        </dt>
                        <dd className="text-slate-700">18:00 - 19:30</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Location:" : "Ubicación:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish
                            ? "Pabellon 0+inf, Room 1604, Ciudad Universitaria"
                            : "Pabellón 0+inf, Sala 1604, Ciudad Universitaria"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Topic:" : "Tema:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish
                            ? "Interpretability Methods"
                            : "Métodos de Interpretabilidad"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Facilitator:" : "Facilitador:"}
                        </dt>
                        <dd className="text-slate-700">Eitan Sprejer</dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <a
                        href="https://t.me/+zhSGhXrn56g1YjVh"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {isEnglish ? "Join Telegram for Updates" : "Únete a Telegram para actualizaciones"}
                      </a>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          {/* Paper Reading Club */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 sm:px-12">
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <div className="text-5xl">📝</div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {isEnglish ? "Paper Reading Club" : "Club de Lectura de Papers"}
                  </h2>
                  <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">
                    {isEnglish ? "Every Friday @ 17:00" : "Todos los viernes @ 17:00"}
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-4 text-base text-slate-700">
                    <p>
                      {isEnglish
                        ? "The Paper Reading Club conducts deep dives into foundational and recent papers in AI safety research. Unlike the more casual discussion group, this activity involves a thorough examination of specific research papers."
                        : "El Club de Lectura de Papers realiza análisis profundos de papers fundamentales y recientes en investigación de seguridad de IA. A diferencia del grupo de discusión más casual, esta actividad implica un examen exhaustivo de papers de investigación específicos."}
                    </p>
                    <p>
                      {isEnglish
                        ? "Participants are expected to read the selected paper in advance and come prepared to discuss its methods, results, and implications."
                        : "Se espera que los participantes lean el paper seleccionado con anticipación y vengan preparados para discutir sus métodos, resultados e implicaciones."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "Paper Selection Criteria" : "Criterios de Selección de Papers"}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Importance to the field of AI safety"
                            : "Importancia para el campo de la seguridad en IA"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Technical relevance to current research directions"
                            : "Relevancia técnica para las direcciones de investigación actuales"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Mix of foundational papers and recent publications"
                            : "Mezcla de papers fundamentales y publicaciones recientes"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Accessibility to graduate and advanced undergraduate students"
                            : "Accesibilidad para estudiantes de posgrado y pregrado avanzado"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {isEnglish ? "Session Format" : "Formato de Sesión"}
                    </h3>
                    <ul className="space-y-2 text-base text-slate-700">
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Brief overview of the paper (5-10 minutes)"
                            : "Breve resumen del paper (5-10 minutos)"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Section-by-section discussion"
                            : "Discusión sección por sección"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Examination of methods and results"
                            : "Examen de métodos y resultados"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Critical evaluation of claims and limitations"
                            : "Evaluación crítica de afirmaciones y limitaciones"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[var(--color-accent-primary)]">•</span>
                        <span>
                          {isEnglish
                            ? "Discussion of potential follow-up research"
                            : "Discusión de posible investigación de seguimiento"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
                    <h3 className="relative mb-4 text-xl font-semibold text-slate-900">
                      {isEnglish ? "Next Paper Session" : "Próxima Sesión de Paper"}
                    </h3>
                    <dl className="relative space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Date:" : "Fecha:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish ? "March 21, 2025" : "21 de marzo de 2025"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Time:" : "Hora:"}
                        </dt>
                        <dd className="text-slate-700">17:00 - 18:30</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Location:" : "Ubicación:"}
                        </dt>
                        <dd className="text-slate-700">
                          {isEnglish
                            ? "Pabellon 0+inf, Room 1604, Ciudad Universitaria"
                            : "Pabellón 0+inf, Sala 1604, Ciudad Universitaria"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Paper:" : "Paper:"}
                        </dt>
                        <dd className="text-slate-700">
                          "{isEnglish
                            ? "Mechanistic Interpretability for Language Models"
                            : "Interpretabilidad Mecánica para Modelos de Lenguaje"}"
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">
                          {isEnglish ? "Discussion Lead:" : "Líder de Discusión:"}
                        </dt>
                        <dd className="text-slate-700">Eitan Sprejer</dd>
                      </div>
                    </dl>
                    <div className="relative mt-6">
                      <a
                        href="/resources#papers"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
                      >
                        {isEnglish ? "Access Reading List" : "Acceder a lista de lectura"}
                      </a>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer language={language} />
      </div>
  );
}
