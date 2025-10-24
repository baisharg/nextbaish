import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiSearchIcon, AiIdeaIcon, BrainIcon, Book02Icon } from "@hugeicons/core-free-icons";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.about;

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <FadeInSection variant="fade" as="section">
          <section className="space-y-4">
          <div className="text-sm text-slate-600">
            <Link href={`/${currentLocale}`} className="hover:text-[var(--color-accent-primary)] transition">
              {t.breadcrumb.home}
            </Link>
            {" / "}
            <span>{t.breadcrumb.current}</span>
          </div>
          <AnimatedTitle
            text={t.title}
            slug="about"
            className="text-4xl font-semibold text-slate-900 sm:text-5xl"
            as="h1"
          />
          </section>
        </FadeInSection>

        {/* Core Concepts Section */}
        <FadeInSection variant="slide-up" delay={100} as="section">
          <section
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            id="core-concepts"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative grid gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.coreConcepts.whatIsAiSafety.title}
                </h2>
                <p className="text-lg text-slate-700">
                  {t.coreConcepts.whatIsAiSafety.content}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.coreConcepts.whyItMatters.title}
                </h2>
                <p className="text-lg text-slate-700">
                  {t.coreConcepts.whyItMatters.content}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">
                {t.coreConcepts.risks.title}
              </h2>
              <ul className="space-y-6">
                <li className="space-y-2">
                  <strong className="text-lg text-slate-900">
                    {t.coreConcepts.risks.alignment.title}
                  </strong>
                  <p className="text-base text-slate-700">
                    {t.coreConcepts.risks.alignment.description}
                  </p>
                </li>
                <li className="space-y-2">
                  <strong className="text-lg text-slate-900">
                    {t.coreConcepts.risks.interpretability.title}
                  </strong>
                  <p className="text-base text-slate-700">
                    {t.coreConcepts.risks.interpretability.description}
                  </p>
                </li>
                <li className="space-y-2">
                  <strong className="text-lg text-slate-900">
                    {t.coreConcepts.risks.robustness.title}
                  </strong>
                  <p className="text-base text-slate-700">
                    {t.coreConcepts.risks.robustness.description}
                  </p>
                </li>
                <li className="space-y-2">
                  <strong className="text-lg text-slate-900">
                    {t.coreConcepts.risks.powerSeeking.title}
                  </strong>
                  <p className="text-base text-slate-700">
                    {t.coreConcepts.risks.powerSeeking.description}
                  </p>
                </li>
                <li className="space-y-2">
                  <strong className="text-lg text-slate-900">
                    {t.coreConcepts.risks.coordination.title}
                  </strong>
                  <p className="text-base text-slate-700">
                    {t.coreConcepts.risks.coordination.description}
                  </p>
                </li>
              </ul>
            </div>
          </div>
          </section>
        </FadeInSection>

        {/* External Resources Section */}
        <FadeInSection variant="slide-up" delay={200} as="section">
          <section
            className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            id="external-resources"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-4">
            <h2 className="text-3xl font-semibold text-slate-900">
              {t.externalResources.title}
            </h2>
          </div>
          <div className="relative grid gap-6 md:grid-cols-2">
            {/* Alignment Forum */}
            <article className="card-glass dither-macrogrid relative overflow-hidden flex h-full flex-col justify-between p-6">
              <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
              <div className="relative space-y-4">
                <HugeiconsIcon icon={AiSearchIcon} size={40} className="text-slate-700" />
                <h3 className="text-xl font-semibold text-slate-900">
                  {t.externalResources.alignmentForum.title}
                </h3>
                <p className="text-base text-slate-600">
                  {t.externalResources.alignmentForum.description}
                </p>
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
                  {t.externalResources.alignmentForum.level}
                </span>
              </div>
              <a
                href="https://alignmentforum.org/"
                className="button-secondary relative mt-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.externalResources.alignmentForum.cta}
              </a>
            </article>

            {/* LessWrong */}
            <article className="card-glass dither-macrogrid relative overflow-hidden flex h-full flex-col justify-between p-6">
              <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
              <div className="relative space-y-4">
                <HugeiconsIcon icon={AiIdeaIcon} size={40} className="text-slate-700" />
                <h3 className="text-xl font-semibold text-slate-900">
                  {t.externalResources.lessWrong.title}
                </h3>
                <p className="text-base text-slate-600">
                  {t.externalResources.lessWrong.description}
                </p>
                <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-700">
                  {t.externalResources.lessWrong.level}
                </span>
              </div>
              <a
                href="https://www.lesswrong.com/"
                className="button-secondary relative mt-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.externalResources.lessWrong.cta}
              </a>
            </article>

            {/* 80,000 Hours */}
            <article className="card-glass dither-macrogrid relative overflow-hidden flex h-full flex-col justify-between p-6">
              <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
              <div className="relative space-y-4">
                <HugeiconsIcon icon={BrainIcon} size={40} className="text-slate-700" />
                <h3 className="text-xl font-semibold text-slate-900">
                  {t.externalResources.eightyK.title}
                </h3>
                <p className="text-base text-slate-600">
                  {t.externalResources.eightyK.description}
                </p>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
                  {t.externalResources.eightyK.level}
                </span>
              </div>
              <a
                href="https://80000hours.org/problem-profiles/artificial-intelligence/"
                className="button-secondary relative mt-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.externalResources.eightyK.cta}
              </a>
            </article>

            {/* Stampy's Wiki */}
            <article className="card-glass dither-macrogrid relative overflow-hidden flex h-full flex-col justify-between p-6">
              <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-50" />
              <div className="relative space-y-4">
                <HugeiconsIcon icon={Book02Icon} size={40} className="text-slate-700" />
                <h3 className="text-xl font-semibold text-slate-900">
                  {t.externalResources.stampy.title}
                </h3>
                <p className="text-base text-slate-600">
                  {t.externalResources.stampy.description}
                </p>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
                  {t.externalResources.stampy.level}
                </span>
              </div>
              <a
                href="https://aisafety.info/"
                className="button-secondary relative mt-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.externalResources.stampy.cta}
              </a>
            </article>
          </div>
          </section>
        </FadeInSection>

        {/* Our Approach Section */}
        <FadeInSection variant="slide-up" delay={300} as="section">
          <section
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            id="our-approach"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-8">
            <h2 className="text-3xl font-semibold text-slate-900">
              {t.ourApproach.title}
            </h2>
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {t.ourApproach.focusAreas.title}
                </h3>
                <p className="text-base text-slate-700">
                  {t.ourApproach.focusAreas.intro}
                </p>
                <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                  {t.ourApproach.focusAreas.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {t.ourApproach.contribution.title}
                </h3>
                <p className="text-base text-slate-700">
                  {t.ourApproach.contribution.intro}
                </p>
                <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                  {t.ourApproach.contribution.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          </section>
        </FadeInSection>

        {/* Team Section */}
        <FadeInSection variant="slide-up" delay={400} as="section">
          <section
            className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            id="team"
          >
          <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
          <div className="relative space-y-4">
            <h2 className="text-3xl font-semibold text-slate-900">
              {t.team.title}
            </h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Eitan Sprejer */}
            <article className="flex flex-col items-center space-y-4 text-center">
              <div className="relative h-[180px] w-[180px] overflow-hidden rounded-full">
                <Image
                  src="/images/optimized/Eitan-400w.webp"
                  alt="Eitan Sprejer"
                  width={400}
                  height={267}
                  sizes="180px"
                  className="object-cover"
                  style={{ objectPosition: "center 30%" }}
                  loading="lazy"
                  quality={80}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  Eitan Sprejer
                </h3>
                <p className="text-sm text-slate-600">
                  {t.team.roles.coDirector}
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
                  src="/images/optimized/Luca-400w.webp"
                  alt="Luca De Leo"
                  width={400}
                  height={400}
                  sizes="180px"
                  className="object-cover"
                  style={{ objectPosition: "center 40%" }}
                  loading="lazy"
                  quality={80}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  Luca De Leo
                </h3>
                <p className="text-sm text-slate-600">
                  {t.team.roles.coDirector}
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
                  src="/images/optimized/Lucas-400w.webp"
                  alt="Lucas Vitali"
                  width={400}
                  height={267}
                  sizes="180px"
                  className="object-cover"
                  style={{ objectPosition: "center" }}
                  loading="lazy"
                  quality={80}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  Lucas Vitali
                </h3>
                <p className="text-sm text-slate-600">
                  {t.team.roles.commDirector}
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
                  src="/images/optimized/Sergio-400w.webp"
                  alt="Sergio Abriola, PhD"
                  width={400}
                  height={400}
                  sizes="180px"
                  className="object-cover"
                  style={{ objectPosition: "center" }}
                  loading="lazy"
                  quality={80}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  Sergio Abriola, PhD
                </h3>
                <p className="text-sm text-slate-600">
                  {t.team.roles.advisor}
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
        </FadeInSection>
      </main>
      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
