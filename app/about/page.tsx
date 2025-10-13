"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../components/header";
import Footer from "../components/footer";
import { useLanguage } from "../contexts/language-context";

export default function AboutPage() {
  const { language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

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

  const isEnglish = language === "en";

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
        <Header language={language} setLanguage={setLanguage} scrolled={scrolled} />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <section className="space-y-4">
            <div className="text-sm text-slate-600">
              <a href="/" className="hover:text-[var(--color-accent-primary)] transition">
                {isEnglish ? "Home" : "Inicio"}
              </a>
              {" / "}
              <span>{isEnglish ? "About AI Safety" : "Seguridad en IA"}</span>
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {isEnglish ? "Understanding AI Safety" : "Entendiendo la Seguridad en IA"}
            </h1>
          </section>

          {/* Core Concepts Section */}
          <section
            className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12"
            id="core-concepts"
          >
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {isEnglish ? "What is AI Safety?" : "¿Qué es la Seguridad en IA?"}
                  </h2>
                  <p className="text-lg text-slate-700">
                    {isEnglish
                      ? "AI Safety is a research field focused on ensuring that advanced artificial intelligence systems remain beneficial, aligned with human values, and under human control as they become more capable. It encompasses technical research areas like alignment, interpretability, and robustness, as well as governance considerations about how AI systems should be developed and deployed."
                      : "La Seguridad en IA es un campo de investigación enfocado en asegurar que los sistemas avanzados de inteligencia artificial sigan siendo beneficiosos, alineados con los valores humanos y bajo control humano a medida que se vuelven más capaces. Abarca áreas técnicas de investigación como alineamiento, interpretabilidad y robustez, así como consideraciones de gobernanza sobre cómo deberían desarrollarse e implementarse los sistemas de IA."}
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    {isEnglish ? "Why It Matters" : "¿Por qué es Importante?"}
                  </h2>
                  <p className="text-lg text-slate-700">
                    {isEnglish
                      ? "As AI systems become more powerful and autonomous, they may develop capabilities that could lead to unintended consequences if not properly designed and controlled. The stakes are high: advanced AI could help solve humanity's greatest challenges, but also poses significant risks if developed without adequate safety measures. The field aims to maximize the benefits while minimizing potential harms."
                      : "A medida que los sistemas de IA se vuelven más poderosos y autónomos, pueden desarrollar capacidades que podrían llevar a consecuencias no deseadas si no están diseñados y controlados adecuadamente. Lo que está en juego es importante: la IA avanzada podría ayudar a resolver los mayores desafíos de la humanidad, pero también presenta riesgos significativos si se desarrolla sin medidas de seguridad adecuadas. El campo busca maximizar los beneficios mientras minimiza los daños potenciales."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {isEnglish ? "Key Risks & Challenges" : "Riesgos y Desafíos Principales"}
                </h2>
                <ul className="space-y-6">
                  <li className="space-y-2">
                    <strong className="text-lg text-slate-900">
                      {isEnglish ? "Alignment Problem" : "Problema de Alineamiento"}
                    </strong>
                    <p className="text-base text-slate-700">
                      {isEnglish
                        ? "Ensuring AI systems pursue goals aligned with human values and intentions, even as they become more capable."
                        : "Asegurar que los sistemas de IA persigan objetivos alineados con los valores e intenciones humanas, incluso cuando se vuelven más capaces."}
                    </p>
                  </li>
                  <li className="space-y-2">
                    <strong className="text-lg text-slate-900">
                      {isEnglish ? "Interpretability" : "Interpretabilidad"}
                    </strong>
                    <p className="text-base text-slate-700">
                      {isEnglish
                        ? "Developing techniques to understand how AI systems make decisions and represent knowledge."
                        : "Desarrollar técnicas para entender cómo los sistemas de IA toman decisiones y representan conocimiento."}
                    </p>
                  </li>
                  <li className="space-y-2">
                    <strong className="text-lg text-slate-900">
                      {isEnglish ? "Robustness" : "Robustez"}
                    </strong>
                    <p className="text-base text-slate-700">
                      {isEnglish
                        ? "Creating systems that behave safely even when deployed in new environments or facing unexpected situations."
                        : "Crear sistemas que se comporten de manera segura incluso cuando se implementan en nuevos entornos o enfrentan situaciones inesperadas."}
                    </p>
                  </li>
                  <li className="space-y-2">
                    <strong className="text-lg text-slate-900">
                      {isEnglish ? "Power-seeking Behavior" : "Comportamiento de Búsqueda de Poder"}
                    </strong>
                    <p className="text-base text-slate-700">
                      {isEnglish
                        ? "Preventing AI systems from developing instrumental goals that conflict with human welfare."
                        : "Prevenir que los sistemas de IA desarrollen objetivos instrumentales que entren en conflicto con el bienestar humano."}
                    </p>
                  </li>
                  <li className="space-y-2">
                    <strong className="text-lg text-slate-900">
                      {isEnglish ? "Coordination Challenges" : "Desafíos de Coordinación"}
                    </strong>
                    <p className="text-base text-slate-700">
                      {isEnglish
                        ? "Ensuring that safety standards are maintained across all major AI development efforts globally."
                        : "Garantizar que se mantengan estándares de seguridad en todos los principales esfuerzos de desarrollo de IA a nivel mundial."}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* External Resources Section */}
          <section
            className="space-y-8 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12"
            id="external-resources"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">
                {isEnglish ? "Learn More About AI Safety" : "Aprendé Más Sobre Seguridad en IA"}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Alignment Forum */}
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-4xl">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Alignment Forum" : "Alignment Forum"}
                  </h3>
                  <p className="text-base text-slate-600">
                    {isEnglish
                      ? "A forum dedicated to technical research in AI alignment, with papers and discussions from leading researchers."
                      : "Un foro dedicado a la investigación técnica en alineamiento de IA, con papers y discusiones de investigadores destacados."}
                  </p>
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
                    {isEnglish ? "Technical" : "Técnico"}
                  </span>
                </div>
                <a
                  href="https://alignmentforum.org/"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isEnglish ? "Visit" : "Visitar"}
                </a>
              </article>

              {/* LessWrong */}
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-4xl">💡</div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "LessWrong" : "LessWrong"}
                  </h3>
                  <p className="text-base text-slate-600">
                    {isEnglish
                      ? "A community blog focused on human rationality and the implications of artificial intelligence."
                      : "Un blog comunitario enfocado en la racionalidad humana y las implicaciones de la inteligencia artificial."}
                  </p>
                  <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-700">
                    {isEnglish ? "Intermediate" : "Intermedio"}
                  </span>
                </div>
                <a
                  href="https://www.lesswrong.com/"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isEnglish ? "Visit" : "Visitar"}
                </a>
              </article>

              {/* 80,000 Hours */}
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-4xl">🧠</div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "80,000 Hours" : "80,000 Hours"}
                  </h3>
                  <p className="text-base text-slate-600">
                    {isEnglish
                      ? "Career guidance for working on the world's most pressing problems, including AI safety."
                      : "Orientación profesional para trabajar en los problemas más urgentes del mundo, incluida la seguridad de la IA."}
                  </p>
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
                    {isEnglish ? "Introductory" : "Introductorio"}
                  </span>
                </div>
                <a
                  href="https://80000hours.org/problem-profiles/artificial-intelligence/"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isEnglish ? "Visit" : "Visitar"}
                </a>
              </article>

              {/* Stampy's Wiki */}
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-4xl">📚</div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Stampy's Wiki" : "Wiki de Stampy"}
                  </h3>
                  <p className="text-base text-slate-600">
                    {isEnglish
                      ? "A collaborative wiki providing accessible explanations of AI alignment concepts."
                      : "Una wiki colaborativa que proporciona explicaciones accesibles de conceptos de alineamiento de IA."}
                  </p>
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
                    {isEnglish ? "Introductory" : "Introductorio"}
                  </span>
                </div>
                <a
                  href="https://aisafety.info/"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[var(--color-accent-tertiary)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isEnglish ? "Visit" : "Visitar"}
                </a>
              </article>
            </div>
          </section>

          {/* Our Approach Section */}
          <section
            className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12"
            id="our-approach"
          >
            <div className="space-y-8">
              <h2 className="text-3xl font-semibold text-slate-900">
                {isEnglish ? "Our Approach" : "Nuestro Enfoque"}
              </h2>
              <div className="grid gap-12 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Focus Areas" : "Áreas de Enfoque"}
                  </h3>
                  <p className="text-base text-slate-700">
                    {isEnglish
                      ? "At BAISH - Buenos Aires AI Safety Hub, we focus on several key areas within AI safety research:"
                      : "En BAISH - Buenos Aires AI Safety Hub, nos enfocamos en varias áreas clave dentro de la investigación de seguridad en IA:"}
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                    <li>
                      {isEnglish
                        ? "Mechanistic interpretability of neural networks"
                        : "Interpretabilidad mecánica de redes neuronales"}
                    </li>
                    <li>
                      {isEnglish
                        ? "Alignment techniques for large language models"
                        : "Técnicas de alineamiento para modelos grandes de lenguaje"}
                    </li>
                    <li>
                      {isEnglish
                        ? "Robust training methodologies"
                        : "Metodologías de entrenamiento robustas"}
                    </li>
                    <li>
                      {isEnglish
                        ? "Value learning and preference inference"
                        : "Aprendizaje de valores e inferencia de preferencias"}
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Our Contribution" : "Nuestra Contribución"}
                  </h3>
                  <p className="text-base text-slate-700">
                    {isEnglish ? "We contribute to the field through:" : "Contribuimos al campo a través de:"}
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                    <li>
                      {isEnglish
                        ? "Supporting student research projects"
                        : "Apoyando proyectos de investigación estudiantil"}
                    </li>
                    <li>
                      {isEnglish
                        ? "Developing educational resources in Spanish"
                        : "Desarrollando recursos educativos en español"}
                    </li>
                    <li>
                      {isEnglish
                        ? "Building a regional community of AI safety researchers"
                        : "Construyendo una comunidad regional de investigadores en seguridad de IA"}
                    </li>
                    <li>
                      {isEnglish
                        ? "Organizing workshops and training programs"
                        : "Organizando talleres y programas de formación"}
                    </li>
                    <li>
                      {isEnglish
                        ? "Mentoring students interested in AI safety careers"
                        : "Mentoreando a estudiantes interesados en carreras de seguridad en IA"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section
            className="space-y-8 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12"
            id="team"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">
                {isEnglish ? "Our Core Team" : "Equipo Principal"}
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Eitan Sprejer */}
              <article className="flex flex-col items-center space-y-4 text-center">
                <div className="relative h-[180px] w-[180px] overflow-hidden rounded-full">
                  <Image
                    src="/Eitan.jpeg"
                    alt="Eitan Sprejer"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center 30%" }}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Eitan Sprejer" : "Eitan Sprejer"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "Co-founding Director" : "Co-director Fundador"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/Eitan-Sprejer"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <Image
                      src="/icons/github.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/eitan-sprejer-574380204/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Image
                      src="/icons/linkedin.svg"
                      alt="LinkedIn"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                </div>
              </article>

              {/* Luca De Leo */}
              <article className="flex flex-col items-center space-y-4 text-center">
                <div className="relative h-[180px] w-[180px] overflow-hidden rounded-full">
                  <Image
                    src="/Luca.png"
                    alt="Luca De Leo"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center 40%" }}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Luca De Leo" : "Luca De Leo"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "Co-founding Director" : "Co-director Fundador"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/lucadeleo"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <Image
                      src="/icons/github.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/luca-de-leo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Image
                      src="/icons/linkedin.svg"
                      alt="LinkedIn"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                </div>
              </article>

              {/* Lucas Vitali */}
              <article className="flex flex-col items-center space-y-4 text-center">
                <div className="relative h-[180px] w-[180px] overflow-hidden rounded-full">
                  <Image
                    src="/Lucas.jpeg"
                    alt="Lucas Vitali"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center" }}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Lucas Vitali" : "Lucas Vitali"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "Communications Director" : "Director de Comunicación"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/lucasvitali"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <Image
                      src="/icons/github.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                  <a
                    href="https://linkedin.com/in/lucasvitali"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Image
                      src="/icons/linkedin.svg"
                      alt="LinkedIn"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                </div>
              </article>

              {/* Sergio Abriola */}
              <article className="flex flex-col items-center space-y-4 text-center">
                <div className="relative h-[180px] w-[180px] overflow-hidden rounded-full">
                  <Image
                    src="/Sergio.jpg"
                    alt="Sergio Abriola, PhD"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center" }}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Sergio Abriola, PhD" : "Sergio Abriola, PhD"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish ? "Advisor" : "Advisor"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/sergioabriola"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <Image
                      src="/icons/github.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                  <a
                    href="https://linkedin.com/in/sergioabriola"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Image
                      src="/icons/linkedin.svg"
                      alt="LinkedIn"
                      width={20}
                      height={20}
                      className="transition hover:opacity-70"
                    />
                  </a>
                </div>
              </article>
            </div>
          </section>
        </main>

        <Footer language={language} />
      </div>
  );
}
