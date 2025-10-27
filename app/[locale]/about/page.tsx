import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Linkedin01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
import { renderWithBioLinks } from "@/app/utils/footnotes";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.about;
  const callToAction = t.callToAction;

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <FadeInSection variant="fade" as="section">
          <section className="space-y-4">
            <div className="text-sm text-slate-600">
              <Link
                href={`/${currentLocale}`}
                className="hover:text-[var(--color-accent-primary)] transition"
              >
                {t.breadcrumb.home}
              </Link>
              {" / "}
              <span>{t.breadcrumb.current}</span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <AnimatedTitle
                text={t.title}
                slug="about"
                className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                as="h1"
              />
              <a
                href="#cofounders"
                className="button-primary whitespace-nowrap"
              >
                {t.team.meetTheTeam}
              </a>
            </div>
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

        {/* Our Approach Section */}
        <FadeInSection variant="slide-up" delay={200} as="section">
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

        {/* Cofounders Section */}
        <FadeInSection variant="slide-up" delay={300} as="section">
          <section
            className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            id="cofounders"
          >
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative space-y-8">
              <h2 className="text-3xl font-semibold text-slate-900">
                {t.team.cofoundersTitle}
              </h2>

              {/* Cofounders Grid */}
              <div className="grid gap-8">
                {/* Eitan Sprejer */}
                <article className="card-glass dither-macrogrid relative overflow-hidden p-6">
                  <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="h-[160px] w-[160px]">
                        <Image
                          src="/images/team/eitan-new.png"
                          alt="Eitan Sprejer"
                          width={500}
                          height={500}
                          sizes="160px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">
                          Eitan Sprejer
                        </h3>
                        <p className="text-sm text-slate-600">
                          {t.team.roles.coDirector}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {renderWithBioLinks(t.team.bios.eitan)}
                      </p>
                      <div className="flex gap-3">
                        <a
                          href="https://github.com/Eitan-Sprejer"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={GithubIcon} size={20} />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/eitan-sprejer-574380204/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Linkedin01Icon} size={20} />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Luca De Leo */}
                <article className="card-glass dither-macrogrid relative overflow-hidden p-6">
                  <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="h-[160px] w-[160px]">
                        <Image
                          src="/images/team/luca-new.png"
                          alt="Luca De Leo"
                          width={500}
                          height={500}
                          sizes="160px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">
                          Luca De Leo
                        </h3>
                        <p className="text-sm text-slate-600">
                          {t.team.roles.coDirector}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {renderWithBioLinks(t.team.bios.luca)}
                      </p>
                      <div className="flex gap-3">
                        <a
                          href="https://github.com/lucadeleo"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={GithubIcon} size={20} />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/luca-de-leo/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Linkedin01Icon} size={20} />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              {/* Book a Call CTA */}
              <div className="mt-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200 p-6 text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  {callToAction.title}
                </h3>
                <p className="text-base text-slate-600 mb-6">
                  {callToAction.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://calendly.com/eitusprejer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary inline-flex items-center justify-center gap-2"
                  >
                    {callToAction.bookWithEitan}
                  </a>
                  <a
                    href="https://calendar.notion.so/meet/ldeleo/gcge74os2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary inline-flex items-center justify-center gap-2"
                  >
                    {callToAction.bookWithLuca}
                  </a>
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
            <div className="relative space-y-8">
              <h2 className="text-3xl font-semibold text-slate-900">
                {t.team.title}
              </h2>

              {/* Leadership Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {t.team.leadershiptTitle}
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Lucas Vitali */}
                  <article className="card-glass dither-macrogrid relative overflow-hidden flex flex-col items-center p-4 text-center">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className="h-[120px] w-[120px]">
                        <Image
                          src="/images/team/lucas-new.png"
                          alt="Lucas Vitali"
                          width={500}
                          height={500}
                          sizes="120px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-900">
                          Lucas Vitali
                        </h3>
                        <p className="text-xs text-slate-600">
                          {t.team.roles.commDirector}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://github.com/lucasvitali"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={GithubIcon} size={20} />
                        </a>
                        <a
                          href="https://linkedin.com/in/lucasvitali"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Linkedin01Icon} size={20} />
                        </a>
                      </div>
                    </div>
                  </article>

                  {/* Carlos Giudice */}
                  <article className="card-glass dither-macrogrid relative overflow-hidden flex flex-col items-center p-4 text-center">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className="h-[120px] w-[120px]">
                        <Image
                          src="/images/team/carlos-new.png"
                          alt="Carlos Giudice"
                          width={500}
                          height={500}
                          sizes="120px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-900">
                          Carlos Giudice
                        </h3>
                        <p className="text-xs text-slate-600">
                          {t.team.roles.advisor}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://github.com/CatOfTheCannals"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={GithubIcon} size={20} />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/carlos-giudice-5237b4144/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Linkedin01Icon} size={20} />
                        </a>
                        <a
                          href="https://carlosgiudice.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Website"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Globe02Icon} size={20} />
                        </a>
                      </div>
                    </div>
                  </article>

                  {/* Sergio Abriola */}
                  <article className="card-glass dither-macrogrid relative overflow-hidden flex flex-col items-center p-4 text-center">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className="h-[120px] w-[120px]">
                        <Image
                          src="/images/team/sergio-new.png"
                          alt="Sergio Abriola, PhD"
                          width={500}
                          height={500}
                          sizes="120px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-900">
                          Sergio Abriola, PhD
                        </h3>
                        <p className="text-xs text-slate-600">
                          {t.team.roles.advisor}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://glyc.dc.uba.ar/abriola/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Website"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Globe02Icon} size={20} />
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              {/* Volunteers Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {t.team.volunteersTitle}
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Gaspi Labastie */}
                  <article className="card-glass dither-macrogrid relative overflow-hidden flex flex-col items-center p-4 text-center">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className="h-[120px] w-[120px]">
                        <Image
                          src="/images/team/gaspar-new.png"
                          alt="Gaspar Labastie"
                          width={500}
                          height={500}
                          sizes="120px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-slate-900">
                          Gaspar Labastie
                        </h4>
                        <p className="text-xs text-slate-600">
                          {t.team.volunteerRoles.asfFacilitator}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://www.linkedin.com/in/gaspar-labastie/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Linkedin01Icon} size={20} />
                        </a>
                      </div>
                    </div>
                  </article>

                  {/* Tobias Bersia */}
                  <article className="card-glass dither-macrogrid relative overflow-hidden flex flex-col items-center p-4 text-center">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className="h-[120px] w-[120px]">
                        <Image
                          src="/images/team/tobias-new.png"
                          alt="Tobias Bersia"
                          width={500}
                          height={500}
                          sizes="120px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-slate-900">
                          Tobias Bersia
                        </h4>
                        <p className="text-xs text-slate-600">
                          {t.team.volunteerRoles.aisWorkshopFacilitator}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://github.com/BerTobi"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={GithubIcon} size={20} />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/tobias-bersia-70a448132/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-slate-700 transition hover:opacity-70"
                        >
                          <HugeiconsIcon icon={Linkedin01Icon} size={20} />
                        </a>
                      </div>
                    </div>
                  </article>

                  {/* Gonzalo Heredia */}
                  <article className="card-glass dither-macrogrid relative overflow-hidden flex flex-col items-center p-4 text-center">
                    <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className="h-[120px] w-[120px]">
                        <Image
                          src="/images/team/gonzalo-new.png"
                          alt="Gonzalo Heredia"
                          width={500}
                          height={500}
                          sizes="120px"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          quality={90}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-slate-900">
                          Gonzalo Heredia
                        </h4>
                        <p className="text-xs text-slate-600">
                          {t.team.volunteerRoles.programAssistant}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Support Section */}
        <FadeInSection variant="slide-up" delay={500} as="section">
          <section
            className="relative overflow-hidden space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-12 shadow-sm sm:px-12"
            id="support"
          >
            <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />
            <div className="relative text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.support.title}
                </h2>
                <p className="text-lg text-slate-700">
                  {t.support.description}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto pt-4">
                {/* Open Philanthropy */}
                <article className="card-glass dither-macrogrid relative overflow-hidden p-6 text-left">
                  <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                  <div className="relative space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {t.support.openPhilanthropy.name}
                    </h3>
                    <p className="text-base text-slate-700">
                      {t.support.openPhilanthropy.description}
                    </p>
                    <a
                      href="https://www.openphilanthropy.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:underline font-medium text-sm"
                    >
                      {t.support.visitWebsiteCta}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </article>

                {/* Kairos Pathfinder */}
                <article className="card-glass dither-macrogrid relative overflow-hidden p-6 text-left">
                  <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
                  <div className="relative space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {t.support.kairos.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {t.support.kairos.program}
                      </p>
                    </div>
                    <p className="text-base text-slate-700">
                      {t.support.kairos.description}
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="https://pathfinder.kairos-project.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:underline font-medium text-sm"
                      >
                        {t.support.pathfinderCta}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      <span className="text-slate-400">·</span>
                      <a
                        href="https://kairos-project.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:underline font-medium text-sm"
                      >
                        {t.support.kairosCta}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </FadeInSection>
      </main>
      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
