import type { Metadata } from "next";
import { TransitionLink } from "@/app/components/transition-link";
import { ThreadPage } from "@/app/components/thread-page";
import { ThreadSet } from "@/app/components/thread-set";
import { getDictionary } from "../dictionaries";
import {
  getCourseOpportunities,
  resolveApplyUrl,
} from "@/app/data/course-opportunities";
import { IMPACT, fillImpact, type ImpactKey } from "@/app/data/impact";
import { featuredStories, withStoryCopy } from "@/app/data/stories";
import { withLocale } from "@/app/utils/locale";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { LabAnnouncement } from "./_components/lab-announcement";
import { LabFooter } from "./_components/lab-footer";
import { SmartLink, isExternal } from "./_components/smart-link";
import { StoryList } from "./_components/story-list";
import "./lab.css";

const WHATSAPP_URL = "https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P";
const AISAR_URL = "https://scholarship.aisafety.ar/";

type WhatWeDoItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  link: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  return {
    title: `${dict.lab.metaTitle} · BAISH`,
    robots: { index: false, follow: false },
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.home;
  const lab = dict.lab;
  const pillars = t.whatWeDo.items as WhatWeDoItem[];
  const steps = lab.path.steps;
  const courses = await getCourseOpportunities();
  const anyOpen = courses.some((c) => c.status === "applications_open");
  const stories = withStoryCopy(featuredStories(), dict.about.impact.stories);
  const glossary: Record<string, string> = lab.stories.glossary;

  return (
    <div className="lab">
      <ThreadPage />
      <LabAnnouncement locale={currentLocale} dict={dict} />

      {/* Hero: the free animation, knotted in the right column */}
      <section className="lab-hero">
        <ThreadSet scene="free" />
        <div className="lab-wrap lab-hero-grid">
          <div className="lab-hero-copy lab-veil">
            <p className="lab-kicker">{t.hero.eyebrow}</p>
            <h1 className="lab-display">{t.mission.title}</h1>
            <p className="lab-lede">{fillImpact(lab.hero.tagline)}</p>
            <div className="lab-actions">
              <a className="lab-button" href="#programs">
                {anyOpen ? t.hero.primaryCta : lab.hero.seeCourses}
                <span aria-hidden="true">→</span>
              </a>
              <a
                className="lab-link"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lab.hero.whatsapp}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div
            className="lab-hero-knot lab-box-wide"
            data-thread-box
            aria-hidden="true"
          />
        </div>

        {/* One entry point per kind of visitor */}
        <nav className="lab-wrap" aria-label={lab.router.title}>
          <p className="lab-router-title">{lab.router.title}</p>
          <ul className="lab-router">
            {lab.router.items.map((item) => (
              <li key={item.link}>
                <SmartLink
                  href={item.link}
                  locale={currentLocale}
                  className="lab-router-link"
                  data-thread-pulse
                >
                  <span className="lab-router-who">{item.who}</span>
                  <span className="lab-router-label">
                    {item.label}
                    {"\u00a0"}
                    <span aria-hidden="true">→</span>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
        <div
          className="lab-hero-band lab-box-narrow"
          data-thread-box
          aria-hidden="true"
        />
      </section>

      {/* Why: labelled rows, with a calm band of threads as the divider */}
      <section className="lab-section">
        <ThreadSet scene="horizon" />
        <div className="lab-wrap lab-about">
          <header>
            <p className="lab-kicker">{lab.about.eyebrow}</p>
            <h2 className="lab-h2">{lab.about.title}</h2>
          </header>
          <dl className="lab-rows">
            {lab.about.rows.map((row) => (
              <div key={row.label} className="lab-row-item">
                <dt>{row.label}</dt>
                <dd>
                  <p>{row.text}</p>
                  {"link" in row && row.link && (
                    <SmartLink
                      href={row.link}
                      locale={currentLocale}
                      className="lab-link lab-link-sm"
                    >
                      {row.linkLabel}
                      <span aria-hidden="true">→</span>
                    </SmartLink>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lab-wrap">
          <div className="lab-band" data-thread-box aria-hidden="true" />
        </div>
      </section>

      {/* The path: a pinned section scrubbed through four thread shapes */}
      <section
        className="lab-path"
        data-thread-steps="scatter,braid,strands,fan"
        data-active-step="0"
        style={{ height: `${steps.length * 65 + 100}svh` }}
      >
        <div className="lab-path-sticky">
          <ThreadSet steps={["scatter", "braid", "strands", "fan"]} />
          <div className="lab-wrap lab-path-grid">
            <div className="lab-path-copy lab-panel">
              <p className="lab-kicker">{lab.path.eyebrow}</p>
              <div className="lab-rail">
                {steps.map((step, i) => (
                  <button
                    key={step.label}
                    type="button"
                    data-step-target={i}
                    aria-current={i === 0 ? "step" : undefined}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <ol className="lab-steps">
                {pillars.map((item, i) => (
                  <li key={item.id} className="lab-step" data-step={i}>
                    <p className="lab-step-line">{steps[i].line}</p>
                    <h3 className="lab-step-title">{steps[i].headline}</h3>
                    <p className="lab-step-body">
                      {fillImpact(item.description)}
                    </p>
                    <dl className="lab-step-stats">
                      {steps[i].stats.map((stat) => (
                        <div key={stat.key}>
                          <dt>{stat.label}</dt>
                          <dd>{IMPACT[stat.key as ImpactKey]}</dd>
                        </div>
                      ))}
                    </dl>
                    <TransitionLink
                      className="lab-link"
                      href={withLocale(currentLocale, item.link)}
                    >
                      {item.cta}
                      <span aria-hidden="true">→</span>
                    </TransitionLink>
                  </li>
                ))}
              </ol>
            </div>
            <div className="lab-path-box" data-thread-box aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Programs: decision facts up front, threads as a divider below */}
      <section
        className="lab-section"
        id="programs"
      >
        <ThreadSet scene="horizon" />
        <div className="lab-wrap">
          <header className="lab-section-head">
            <p className="lab-kicker">{t.activities.eyebrow}</p>
            <h2 className="lab-h2">{lab.programs.title}</h2>
            <p className="lab-section-desc">
              {dict.activities.courses.description}
            </p>
          </header>
          <div className="lab-table" role="table">
            <div className="lab-trow lab-trow-head" role="row">
              <span role="columnheader">{lab.programs.columns.program}</span>
              <span role="columnheader">{lab.programs.columns.details}</span>
              <span role="columnheader">{lab.programs.columns.status}</span>
              <span role="columnheader" />
            </div>
            {courses.map((course) => {
              const copy = t.activities.items[course.id];
              return (
                <div
                  key={course.id}
                  className="lab-trow"
                  role="row"
                >
                  <div role="cell">
                    <span className="lab-cell-eyebrow">{copy.eyebrow}</span>
                    <h3 className="lab-trow-title">{copy.title}</h3>
                    <p className="lab-trow-desc">{copy.description}</p>
                  </div>
                  <div role="cell">
                    <ul className="lab-chips">
                      <li>{copy.duration}</li>
                      {lab.programs.chips[course.id].map((chip) => (
                        <li key={chip}>{chip}</li>
                      ))}
                    </ul>
                  </div>
                  <div role="cell" className="lab-status">
                    <span
                      className="lab-status-dot"
                      data-status={course.status}
                    />
                    <span>{lab.programs.status[course.status]}</span>
                  </div>
                  <div role="cell" className="lab-cell-cta">
                    <a
                      className="lab-button lab-button-sm"
                      href={resolveApplyUrl(course)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lab.programs.cta[course.status]}
                    </a>
                    <a
                      className="lab-link lab-link-sm"
                      href={course.learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.activities.learnMore}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              );
            })}

            <div className="lab-trow" role="row">
              <div role="cell">
                <span className="lab-cell-eyebrow">{t.aisar.eyebrow}</span>
                <h3 className="lab-trow-title">{t.aisar.title}</h3>
                <p className="lab-trow-desc">{lab.programs.aisar.description}</p>
              </div>
              <div role="cell">
                <ul className="lab-chips">
                  <li>{t.aisar.duration}</li>
                  {lab.programs.aisar.chips.map((chip) => (
                    <li key={chip}>{chip}</li>
                  ))}
                </ul>
              </div>
              <div role="cell" className="lab-status">
                <span className="lab-status-dot" data-status="upcoming" />
                <span>{lab.programs.aisar.status}</span>
              </div>
              <div role="cell" className="lab-cell-cta">
                <a
                  className="lab-button lab-button-sm"
                  href={AISAR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.aisar.visitWebsite}
                </a>
              </div>
            </div>

            <div className="lab-trow lab-trow-call" role="row">
              <div role="cell" className="lab-call-copy">
                <h3 className="lab-trow-title">{lab.programs.call.title}</h3>
                <p className="lab-trow-desc">
                  {dict.about.callToAction.description}
                </p>
              </div>
              <div role="cell" className="lab-cell-cta">
                <TransitionLink
                  className="lab-link"
                  href={withLocale(currentLocale, "/lab/about#book-a-call")}
                >
                  {lab.programs.call.cta}
                  <span aria-hidden="true">→</span>
                </TransitionLink>
              </div>
            </div>
          </div>
          <div className="lab-band" data-thread-box aria-hidden="true" />
        </div>
      </section>

      {/* Stories: the threads fan out through a band above the list */}
      <section className="lab-section lab-section-tight">
        <ThreadSet scene="fan" />
        <div className="lab-wrap">
          <header className="lab-section-head">
            <p className="lab-kicker">{lab.stories.eyebrow}</p>
            <h2 className="lab-h2">{t.successStories.title}</h2>
            <p className="lab-section-desc">{t.successStories.description}</p>
          </header>
          <div className="lab-band" data-thread-box aria-hidden="true" />
          <StoryList stories={stories} glossary={glossary} pulse />
          <TransitionLink
            className="lab-link"
            href={withLocale(currentLocale, "/lab/about#impact")}
          >
            {t.successStories.cta}
            <span aria-hidden="true">→</span>
          </TransitionLink>
        </div>
      </section>

      {/* Join: from lowest to highest commitment; the knot points at it */}
      <section className="lab-section lab-join">
        <ThreadSet scene="knot" />
        <div className="lab-wrap lab-join-grid">
          <div className="lab-join-copy lab-veil">
            <p className="lab-kicker">{lab.join.eyebrow}</p>
            <h2 className="lab-display lab-display-sm">{lab.join.title}</h2>
            <p className="lab-lede">{lab.join.description}</p>
            <ol className="lab-ladder">
              {lab.join.steps.map((step, i) => (
                <li key={step.link}>
                  <span className="lab-ladder-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{fillImpact(step.text)}</p>
                  </div>
                  <SmartLink
                    href={step.link}
                    locale={currentLocale}
                    className={i === 0 ? "lab-button lab-button-sm" : "lab-link lab-link-sm"}
                    data-thread-pulse
                  >
                    {step.cta}
                    {i > 0 && (
                      <span aria-hidden="true">
                        {isExternal(step.link) ? "↗" : "→"}
                      </span>
                    )}
                  </SmartLink>
                </li>
              ))}
            </ol>
          </div>
          <div className="lab-join-knot" data-thread-box aria-hidden="true" />
        </div>
      </section>

      <LabFooter locale={currentLocale} dict={dict} />
    </div>
  );
}
