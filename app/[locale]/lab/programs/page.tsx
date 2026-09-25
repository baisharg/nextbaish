import type { Metadata } from "next";
import Image from "next/image";
import { ThreadPage } from "@/app/components/thread-page";
import { ThreadSet } from "@/app/components/thread-set";
import { getDictionary } from "../../dictionaries";
import {
  getCourseOpportunities,
  resolveApplyUrl,
} from "@/app/data/course-opportunities";
import { fillImpact } from "@/app/data/impact";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { LabAnnouncement } from "../_components/lab-announcement";
import { LabFooter } from "../_components/lab-footer";
import { SmartLink, isExternal } from "../_components/smart-link";
import { TitleBand } from "../_components/title-band";
import "../lab.css";

const AISAR_URL = "https://scholarship.aisafety.ar/";
const LUMA_URL = "https://luma.com/BAISH";

/** Same photos and alt text as the live Programs page */
const GALLERY = [
  {
    src: "/images/events/community-group-photo.jpg",
    alt: "Large group photo from AI Safety Connect event showing community members",
    w: 842,
    h: 842,
  },
  {
    src: "/images/events/coding-workshop-golden-hour.jpg",
    alt: "Vibe coding workshop participants during golden hour",
    w: 1080,
    h: 1440,
  },
  {
    src: "/images/events/baish-team-branding.jpg",
    alt: "BAISH team photo with branding and Argentine flag at AI safety conference",
    w: 1920,
    h: 1440,
  },
  {
    src: "/images/events/retreat-study-session.jpg",
    alt: "Study group retreat session with natural lighting",
    w: 1200,
    h: 1600,
  },
  {
    src: "/images/events/ai-safety-banner.jpg",
    alt: "AI Safety Argentina banner at community event entrance",
    w: 900,
    h: 900,
  },
  {
    src: "/images/events/team-argentina-flag.jpg",
    alt: "Team photo holding Argentine flag at international AI safety event",
    w: 1920,
    h: 1440,
  },
];

type CommunityItem = {
  id: string;
  title: string;
  description: string;
  cta: string | null;
  link: string | null;
};

type PastProgram = {
  eyebrow: string;
  title: string;
  description: string;
  date: string;
  location?: string;
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
    title: `${dict.activities.title} · ${dict.lab.metaTitle}`,
    robots: { index: false, follow: false },
  };
}

export default async function LabProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.activities;
  const home = dict.home;
  const lab = dict.lab;
  const page = lab.programsPage;
  const courses = await getCourseOpportunities();
  const upcoming = t.courses.upcoming as { title: string; description: string }[];
  const community = t.community.items as CommunityItem[];
  const pastPrograms = (t.pastPrograms?.cards ?? []) as PastProgram[];
  const network = [
    { copy: t.lanais, url: "https://lanais.org/" },
    { copy: t.fair, url: "https://fair-uba.com/" },
  ];

  return (
    <div className="lab">
      <ThreadPage />
      <LabAnnouncement locale={currentLocale} dict={dict} />

      <TitleBand
        locale={currentLocale}
        homeLabel={lab.band.home}
        eyebrow={dict.header.nav.activities}
        title={t.title}
        lede={<p>{t.description}</p>}
        jumpLabel={lab.aboutPage.jump}
        jumps={[
          { href: "#courses", label: page.jumpCourses },
          { href: "#community", label: page.jumpCommunity },
          { href: "#gallery", label: page.jumpGallery },
          { href: "#network", label: page.jumpNetwork },
        ]}
      />

      {/* Courses: the same decision table as the home page, plus what's next */}
      <section className="lab-section lab-section-tight" id="courses">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <p className="lab-kicker">{t.courses.eyebrow}</p>
            <h2 className="lab-h2">{t.courses.title}</h2>
            <p className="lab-section-desc">{t.courses.description}</p>
            <p className="lab-legend">{fillImpact(t.courses.trackRecord)}</p>
          </header>
          <div className="lab-table" role="table">
            <div className="lab-trow lab-trow-head" role="row">
              <span role="columnheader">{lab.programs.columns.program}</span>
              <span role="columnheader">{lab.programs.columns.details}</span>
              <span role="columnheader">{lab.programs.columns.status}</span>
              <span role="columnheader" />
            </div>
            {courses.map((course) => {
              const copy = home.activities.items[course.id];
              return (
                <div
                  key={course.id}
                  id={course.id}
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
                      {home.activities.learnMore}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              );
            })}
            <div className="lab-trow" role="row">
              <div role="cell">
                <span className="lab-cell-eyebrow">{home.aisar.eyebrow}</span>
                <h3 className="lab-trow-title">{home.aisar.title}</h3>
                <p className="lab-trow-desc">{lab.programs.aisar.description}</p>
              </div>
              <div role="cell">
                <ul className="lab-chips">
                  <li>{home.aisar.duration}</li>
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
                  {home.aisar.visitWebsite}
                </a>
              </div>
            </div>
          </div>

          <h3 className="lab-team-heading lab-upcoming-heading">
            {t.courses.upcomingTitle}
          </h3>
          <ul className="lab-upcoming">
            {upcoming.map((course) => (
              <li key={course.title}>
                <h4 className="lab-h3">{course.title}</h4>
                <p className="lab-body">{course.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Community: threads braid in a band above the list */}
      <section className="lab-section" id="community">
        <ThreadSet scene="rope" />
        <div className="lab-wrap">
          <header className="lab-section-head">
            <p className="lab-kicker">{t.community.eyebrow}</p>
            <h2 className="lab-h2">{t.community.title}</h2>
            <p className="lab-section-desc">{t.community.description}</p>
          </header>
          <div className="lab-band" data-thread-box aria-hidden="true" />
          <ul className="lab-community">
            {community.map((item) => (
              <li key={item.id} data-thread-pulse>
                <h3 className="lab-h3">{item.title}</h3>
                <p className="lab-body">{fillImpact(item.description)}</p>
                {item.cta && item.link && (
                  <SmartLink
                    href={item.link}
                    locale={currentLocale}
                    className="lab-link lab-link-sm"
                  >
                    {item.cta}
                    <span aria-hidden="true">
                      {isExternal(item.link) ? "↗" : "→"}
                    </span>
                  </SmartLink>
                )}
              </li>
            ))}
          </ul>
          <p className="lab-events-note">
            {page.events}{" "}
            <a
              className="lab-link"
              href={LUMA_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {page.eventsCta}
              <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
      </section>

      {/* Past events: a strip of photos to scroll sideways */}
      <section className="lab-section lab-section-tight" id="gallery">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <p className="lab-kicker">{t.gallery.eyebrow}</p>
            <h2 className="lab-h2">{t.gallery.title}</h2>
            <p className="lab-section-desc">{t.gallery.description}</p>
          </header>
        </div>
        <ul className="lab-gallery" tabIndex={0} aria-label={t.gallery.title}>
          {GALLERY.map((photo) => (
            <li key={photo.src}>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.w}
                height={photo.h}
                sizes="(max-width: 820px) 80vw, 420px"
                loading="lazy"
              />
            </li>
          ))}
        </ul>
        {pastPrograms.length > 0 && (
          <div className="lab-wrap">
            <h3 className="lab-team-heading lab-upcoming-heading">
              {t.pastPrograms.title}
            </h3>
            <ul className="lab-upcoming">
              {pastPrograms.map((program) => (
                <li key={program.title}>
                  <p className="lab-cell-eyebrow">
                    {program.eyebrow} · {program.date}
                  </p>
                  <h4 className="lab-h3">{program.title}</h4>
                  <p className="lab-body">{program.description}</p>
                  {program.location && (
                    <p className="lab-journey-meta">{program.location}</p>
                  )}
                  <SmartLink
                    href={program.link}
                    locale={currentLocale}
                    className="lab-link lab-link-sm"
                  >
                    {program.cta}
                    <span aria-hidden="true">→</span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Sister projects: the threads fan out across the region */}
      <section className="lab-section lab-section-tight" id="network">
        <ThreadSet scene="fan" />
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{t.sisterProjects.title}</h2>
            <p className="lab-section-desc">{t.sisterProjects.description}</p>
          </header>
          <div className="lab-band" data-thread-box aria-hidden="true" />
          <div className="lab-table">
            {network.map(({ copy, url }) => (
              <div key={copy.title} className="lab-funder" data-thread-pulse>
                <div>
                  <p className="lab-trow-title">{copy.title}</p>
                  <p className="lab-cell-eyebrow">{copy.subtitle}</p>
                </div>
                <p className="lab-trow-desc">{copy.description}</p>
                <div className="lab-funder-links">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lab-link lab-link-sm"
                  >
                    {copy.visitWebsite}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LabFooter locale={currentLocale} dict={dict} />
    </div>
  );
}
