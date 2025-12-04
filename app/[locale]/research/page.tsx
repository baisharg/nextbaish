import Link from "next/link";
import Image from "next/image";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

type PathwayStep = {
  number: string;
  title: string;
  program: string;
  description: string;
  duration: string;
  link: string;
  icon: "book" | "code" | "lightbulb" | "rocket";
  external?: boolean;
};

type FocusArea = {
  title: string;
  description: string;
  icon: string;
};

type Publication = {
  title: string;
  authors: string;
  venue: string;
  description: string;
  links: { label: string; url: string }[];
  award?: string;
};

// Icon components for pathway steps
function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

const pathwayIcons = {
  book: BookIcon,
  code: CodeIcon,
  lightbulb: LightbulbIcon,
  rocket: RocketIcon,
};

// BAISH team members to highlight in purple
const BAISH_MEMBERS = [
  "Eitan Sprejer",
  "Luca De Leo",
  "Lucas Vitali",
  "Joaquín Machulsky",
];

// Function to highlight BAISH members in author lists
function highlightBaishMembers(authors: string): React.ReactNode {
  // Split by comma but keep "et al." together
  const parts = authors.split(/,\s*/);

  return parts.map((part, index) => {
    const trimmedPart = part.trim();
    const isBaishMember = BAISH_MEMBERS.some(member =>
      trimmedPart.includes(member)
    );

    return (
      <span key={index}>
        {index > 0 && ", "}
        {isBaishMember ? (
          <span className="inline-flex items-center gap-1 text-[var(--color-accent-primary)] font-medium">
            {trimmedPart}
            <Image
              src="/images/logos/logo-40.webp"
              alt="BAISH"
              width={14}
              height={14}
              className="inline-block opacity-80"
            />
          </span>
        ) : (
          trimmedPart
        )}
      </span>
    );
  });
}

// Focus area tint colors
const focusAreaTints: Record<
  string,
  { bg: string; border: string; iconBg: string }
> = {
  microscope: {
    bg: "from-blue-50/50 to-transparent",
    border: "hover:border-blue-300/50",
    iconBg: "bg-blue-100 text-blue-600",
  },
  chart: {
    bg: "from-emerald-50/50 to-transparent",
    border: "hover:border-emerald-300/50",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  compass: {
    bg: "from-purple-50/50 to-transparent",
    border: "hover:border-purple-300/50",
    iconBg: "bg-purple-100 text-purple-600",
  },
};

// Extract venue name from venue string (e.g., "arXiv · 2025" → "arXiv")
function extractVenue(venue: string): string {
  return venue.split("·")[0].trim();
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.research;

  const pathwaySteps = t.pathway.steps as PathwayStep[];
  const focusAreas = t.focusAreas.areas as FocusArea[];
  const publications = t.publications.items as Publication[];

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl px-6 py-16 sm:px-10">
        <div className="main-sections w-full">
          {/* Page Header */}
          <FadeInSection variant="fade" as="section" startVisible>
            <section className="space-y-6">
              <div className="text-sm text-slate-600">
                <Link
                  href={withLocale(currentLocale, "/")}
                  className="hover:text-slate-900 transition"
                >
                  {t.breadcrumb.home}
                </Link>
                {" / "}
                <span>{t.breadcrumb.current}</span>
              </div>
              <div className="space-y-4 max-w-3xl">
                <AnimatedTitle
                  text={t.title}
                  slug="research"
                  className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                  as="h1"
                />
                <p className="text-xl text-slate-600 leading-relaxed">
                  {t.intro}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={withLocale(currentLocale, "/activities")}
                  className="button-primary"
                >
                  {t.ctaPrograms}
                </Link>
                <a
                  href="#publications"
                  className="button-secondary"
                >
                  {t.ctaPublications}
                </a>
              </div>
            </section>
          </FadeInSection>

          {/* Research Pathway - Horizontal Stepper */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section
              id="pathway"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8"
            >
              <div className="space-y-4">
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {t.pathway.title}
                  </h2>
                  <p className="text-sm text-slate-500">{t.pathway.subtitle}</p>
                </div>

                {/* Horizontal Stepper - Desktop */}
                <div className="hidden md:block relative py-2">
                  {/* Connecting line */}
                  <div className="absolute top-[28px] left-[12.5%] right-[12.5%] h-0.5 bg-slate-200" />
                  <div className="absolute top-[28px] left-[12.5%] w-[50%] h-0.5 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]" />

                  <div className="flex items-start justify-between">
                    {pathwaySteps.map((step, index) => {
                      const IconComponent = pathwayIcons[step.icon];
                      const isExternal = step.external;
                      const isHighlighted = step.number === "03";
                      const isPast = index < 2;
                      const href = isExternal
                        ? step.link
                        : withLocale(currentLocale, step.link);

                      const StepContent = (
                        <div className="relative flex flex-col items-center group cursor-pointer">
                          {/* "You're here" badge */}
                          {isHighlighted && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent-primary)] text-white rounded-full whitespace-nowrap shadow-sm">
                              You&apos;re here
                            </div>
                          )}

                          {/* Step circle */}
                          <div
                            className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                              isHighlighted
                                ? "bg-[var(--color-accent-primary)] text-white ring-4 ring-[var(--color-accent-primary)]/20 scale-110 group-hover:scale-[1.15] group-hover:shadow-lg group-hover:shadow-[var(--color-accent-primary)]/30"
                                : isPast
                                ? "bg-[var(--color-accent-primary)]/80 text-white group-hover:bg-[var(--color-accent-primary)] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--color-accent-primary)]/25"
                                : "bg-white border-2 border-slate-300 text-slate-400 group-hover:border-[var(--color-accent-primary)] group-hover:text-[var(--color-accent-primary)] group-hover:scale-110 group-hover:shadow-md group-hover:bg-[var(--color-accent-primary)]/5"
                            }`}
                          >
                            <IconComponent className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                          </div>

                          {/* Labels */}
                          <div className="mt-2 text-center transition-transform duration-300 group-hover:-translate-y-0.5">
                            <div className={`text-xs font-bold transition-colors duration-300 ${
                              isHighlighted ? "text-[var(--color-accent-primary)]" : isPast ? "text-slate-700 group-hover:text-[var(--color-accent-primary)]" : "text-slate-500 group-hover:text-[var(--color-accent-primary)]"
                            }`}>
                              {step.number}
                            </div>
                            <div className={`text-sm font-semibold transition-colors duration-300 ${
                              isHighlighted ? "text-[var(--color-accent-primary)]" : "text-slate-700 group-hover:text-[var(--color-accent-primary)]"
                            }`}>
                              {step.title}
                            </div>
                            <div className="text-[10px] text-slate-400 transition-colors duration-300 group-hover:text-[var(--color-accent-primary)]/60">
                              {step.program}
                              {isExternal && " ↗"}
                            </div>
                          </div>
                        </div>
                      );

                      return isExternal ? (
                        <a key={step.number} href={href} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center">
                          {StepContent}
                        </a>
                      ) : (
                        <Link key={step.number} href={href} className="flex-1 flex justify-center">
                          {StepContent}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Grid */}
                <div className="md:hidden grid grid-cols-2 gap-3">
                  {pathwaySteps.map((step, index) => {
                    const IconComponent = pathwayIcons[step.icon];
                    const isExternal = step.external;
                    const isHighlighted = step.number === "03";
                    const isPast = index < 2;
                    const href = isExternal
                      ? step.link
                      : withLocale(currentLocale, step.link);

                    const MobileCard = (
                      <div
                        className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ease-out group cursor-pointer active:scale-[0.98] ${
                          isHighlighted
                            ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 ring-1 ring-[var(--color-accent-primary)]/20 hover:shadow-md hover:shadow-[var(--color-accent-primary)]/15 hover:-translate-y-0.5"
                            : "border-slate-200 bg-white hover:border-[var(--color-accent-primary)]/40 hover:shadow-md hover:-translate-y-0.5 hover:bg-[var(--color-accent-primary)]/[0.02]"
                        }`}
                      >
                        {/* Step circle */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                            isHighlighted
                              ? "bg-[var(--color-accent-primary)] text-white group-hover:scale-110 group-hover:shadow-md group-hover:shadow-[var(--color-accent-primary)]/30"
                              : isPast
                              ? "bg-[var(--color-accent-primary)]/80 text-white group-hover:bg-[var(--color-accent-primary)] group-hover:scale-110"
                              : "bg-slate-100 text-slate-400 group-hover:bg-[var(--color-accent-primary)] group-hover:text-white group-hover:scale-110"
                          }`}
                        >
                          <IconComponent className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        </div>

                        {/* Labels */}
                        <div className="min-w-0 flex-1">
                          <div className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                            isHighlighted ? "text-[var(--color-accent-primary)]" : isPast ? "text-slate-600 group-hover:text-[var(--color-accent-primary)]" : "text-slate-400 group-hover:text-[var(--color-accent-primary)]"
                          }`}>
                            {isHighlighted ? "You're here" : `Step ${step.number}`}
                          </div>
                          <div className={`text-sm font-semibold truncate transition-colors duration-300 ${
                            isHighlighted ? "text-[var(--color-accent-primary)]" : "text-slate-800 group-hover:text-[var(--color-accent-primary)]"
                          }`}>
                            {step.title}
                          </div>
                        </div>

                        {isExternal && (
                          <ExternalLinkIcon className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-all duration-300 group-hover:text-[var(--color-accent-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        )}
                      </div>
                    );

                    return isExternal ? (
                      <a key={step.number} href={href} target="_blank" rel="noopener noreferrer">
                        {MobileCard}
                      </a>
                    ) : (
                      <Link key={step.number} href={href}>
                        {MobileCard}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* Community Publications - Enhanced with Venue Badges */}
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section id="publications" className="section-container space-y-8 scroll-mt-24">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.publications.title}
                </h2>
                <p className="text-lg text-slate-600">
                  {t.publications.subtitle}
                </p>
              </div>

              <div className="space-y-4">
                {publications.map((pub) => {
                  const venueName = extractVenue(pub.venue);

                  return (
                    <article key={pub.title} className="card-glass group">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3 flex-1">
                          {/* Venue badge */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="pill">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                />
                              </svg>
                              {venueName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {pub.venue.includes("·")
                                ? pub.venue.split("·")[1].trim()
                                : ""}
                            </span>
                            {pub.award && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {pub.award}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[var(--color-accent-primary)] transition-colors">
                            {pub.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {highlightBaishMembers(pub.authors)}
                          </p>
                          <p className="text-sm text-slate-600 mt-2">
                            {pub.description}
                          </p>
                        </div>
                        {pub.links.length > 0 && (
                          <div className="flex gap-3 flex-shrink-0">
                            {pub.links.map((link) => (
                              <a
                                key={`${pub.title}-${link.label}`}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button-secondary inline-flex items-center gap-2 group/btn"
                              >
                                {link.label}
                                <ExternalLinkIcon className="h-4 w-4 opacity-60 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Note about growing publications */}
              <p className="text-sm text-slate-500 italic text-center">
                {t.publications.note}
              </p>
            </section>
          </FadeInSection>

          {/* Focus Areas - Enhanced with Distinct Tints */}
          <FadeInSection variant="slide-up" delay={300} as="section">
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {t.focusAreas.title}
                </h2>
                <p className="text-lg text-slate-600">
                  {t.focusAreas.subtitle}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {focusAreas.map((area) => {
                  const tint =
                    focusAreaTints[area.icon] || focusAreaTints.compass;

                  return (
                    <article
                      key={area.title}
                      className={`relative card-glass group overflow-hidden ${tint.border}`}
                    >
                      {/* Subtle gradient background tint */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${tint.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />

                      <div className="relative space-y-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint.iconBg} transition-transform duration-300 group-hover:scale-110`}
                        >
                          {area.icon === "microscope" && (
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                              />
                            </svg>
                          )}
                          {area.icon === "chart" && (
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                              />
                            </svg>
                          )}
                          {area.icon === "compass" && (
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                              />
                            </svg>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {area.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {area.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </FadeInSection>

          {/* Express Interest Section */}
          <FadeInSection variant="slide-up" delay={400} as="section">
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-primary)]">
                    {t.expressInterest.eyebrow}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t.expressInterest.title}
                  </h2>
                  <p className="text-base text-slate-600">
                    {t.expressInterest.description}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    {t.expressInterest.formLabel}
                  </p>
                  <Link
                    href={withLocale(currentLocale, t.expressInterest.link)}
                    className="button-primary w-full text-center block"
                  >
                    {t.expressInterest.cta}
                  </Link>
                  <p className="text-xs text-slate-500 text-center">
                    {t.expressInterest.note}
                  </p>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* CTA Section - Enhanced with Headshots */}
          <FadeInSection variant="slide-up" delay={500} as="section">
            <section className="rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)]/5 to-[var(--color-accent-secondary)]/5 border border-slate-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  {t.cta.title}
                </h2>
                <p className="text-base text-slate-600 max-w-xl mx-auto">
                  {t.cta.description}
                </p>
              </div>

              {/* Co-founder Cards with Headshots */}
              <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                {/* Eitan Card */}
                <div className="flex flex-col items-center p-6 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-20 w-20 mb-4 rounded-full overflow-hidden border-2 border-[var(--color-accent-primary)]/20">
                    <Image
                      src="/images/team/eitan-new.png"
                      alt="Eitan Sprejer"
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Eitan Sprejer
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {t.cta.eitanSpecialty}
                  </p>
                  <a
                    href="https://calendly.com/eitusprejer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary inline-flex items-center justify-center gap-2 w-full"
                  >
                    {t.cta.bookWithEitan}
                    <ExternalLinkIcon className="h-4 w-4 opacity-70" />
                  </a>
                </div>

                {/* Luca Card */}
                <div className="flex flex-col items-center p-6 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-20 w-20 mb-4 rounded-full overflow-hidden border-2 border-[var(--color-accent-primary)]/20">
                    <Image
                      src="/images/team/luca-new.png"
                      alt="Luca De Leo"
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Luca De Leo
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {t.cta.lucaSpecialty}
                  </p>
                  <a
                    href="https://calendar.notion.so/meet/ldeleo/gcge74os2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary inline-flex items-center justify-center gap-2 w-full"
                  >
                    {t.cta.bookWithLuca}
                    <ExternalLinkIcon className="h-4 w-4 opacity-70" />
                  </a>
                </div>
              </div>
            </section>
          </FadeInSection>
        </div>
      </main>

      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
