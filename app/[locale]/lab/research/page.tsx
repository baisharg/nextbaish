import type { Metadata } from "next";
import { ThreadPage } from "@/app/components/thread-page";
import { ThreadSet } from "@/app/components/thread-set";
import { getDictionary } from "../../dictionaries";
import {
  isBaishAffiliatedAuthor,
  labsTeam,
  type TeamMemberId,
} from "@/app/data/team";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { LabAnnouncement } from "../_components/lab-announcement";
import { LabFooter } from "../_components/lab-footer";
import { MemberCard } from "../_components/member-card";
import { SmartLink, isExternal } from "../_components/smart-link";
import { TitleBand } from "../_components/title-band";
import "../lab.css";

const BOOKING_LINKS = {
  eitan: "https://calendly.com/eitusprejer",
  luca: "https://lvca.dev/meet",
};

type PathwayStep = {
  number: string;
  title: string;
  program: string;
  description: string;
  duration: string;
  link: string;
  external?: boolean;
};

type FocusArea = { title: string; description: string };

type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: number;
  description: string;
  links: { label: string; url: string }[];
  award?: string;
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
    title: `${dict.research.title} · ${dict.lab.metaTitle}`,
    robots: { index: false, follow: false },
  };
}

/** Newest year first; within a year the dictionary order is kept. */
function groupByYear(items: Publication[]): [number, Publication[]][] {
  const groups = new Map<number, Publication[]>();
  for (const pub of [...items].sort((a, b) => b.year - a.year)) {
    groups.set(pub.year, [...(groups.get(pub.year) ?? []), pub]);
  }
  return [...groups.entries()];
}

/** "arXiv · Jul 2026" → ["arXiv", "Jul 2026"] */
const splitVenue = (venue: string) => {
  const [name, when] = venue.split("·").map((part) => part.trim());
  return { name, when };
};

function Authors({ authors }: { authors: string }) {
  return (
    <>
      {authors.split(/,\s*/).map((name, i) => (
        <span key={i}>
          {i > 0 && ", "}
          {isBaishAffiliatedAuthor(name) ? (
            <strong className="lab-author-baish">{name}</strong>
          ) : (
            name
          )}
        </span>
      ))}
    </>
  );
}

export default async function LabResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.research;
  const labs = t.labs;
  const lab = dict.lab;
  const page = lab.researchPage;
  const bios: Partial<Record<TeamMemberId, string>> = dict.about.team.bios;

  const steps = t.pathway.steps as PathwayStep[];
  const areas = t.focusAreas.areas as FocusArea[];
  const publications = groupByYear(t.publications.items as Publication[]);

  const members = labsTeam();
  const head = members.find((member) => member.labs === "head");
  const others = members.filter((member) => member.labs !== "head");

  return (
    <div className="lab">
      <ThreadPage />
      <LabAnnouncement locale={currentLocale} dict={dict} />

      <TitleBand
        locale={currentLocale}
        homeLabel={lab.band.home}
        eyebrow={dict.header.nav.research}
        title={t.title}
        lede={<p>{t.intro}</p>}
        jumpLabel={lab.aboutPage.jump}
        jumps={[
          { href: "#labs", label: page.jumpLabs },
          { href: "#directions", label: page.jumpDirections },
          { href: "#publications", label: page.jumpPublications },
        ]}
      />

      {/* BAISH Labs */}
      <section className="lab-section lab-section-tight" id="labs">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <p className="lab-kicker">{labs.eyebrow}</p>
            <h2 className="lab-h2">{labs.title}</h2>
          </header>
          <div className="lab-split">
            <div className="lab-prose">
              <p>{labs.paragraph1}</p>
              <p>{labs.paragraph2}</p>
            </div>
            <div>
              <h3 className="lab-h3">{labs.agendaTitle}</h3>
              <p className="lab-body">{labs.agendaIntro}</p>
              <ol className="lab-agenda">
                {labs.agenda.map((item, i) => (
                  <li key={item}>
                    <span className="lab-ladder-num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lab-team-group">
            <h3 className="lab-team-heading">
              {labs.leadTitle} · {labs.teamTitle}
            </h3>
            <ul className="lab-team">
              {head && (
                <MemberCard
                  member={head}
                  role={labs.roles.head}
                  bio={bios[head.id]}
                  readBioLabel={lab.aboutPage.readBio}
                  closeLabel={lab.aboutPage.close}
                />
              )}
              {others.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  role={member.labs ? labs.roles[member.labs] : undefined}
                  bio={bios[member.id]}
                  readBioLabel={lab.aboutPage.readBio}
                  closeLabel={lab.aboutPage.close}
                />
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Research directions: the rope splits into one strand per area */}
      <section className="lab-section" id="directions">
        <ThreadSet scene="strands" />
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{t.focusAreas.title}</h2>
            <p className="lab-section-desc">{t.focusAreas.subtitle}</p>
          </header>
          <div className="lab-directions">
            <ol className="lab-direction-list lab-panel">
              {areas.map((area, i) => (
                <li key={area.title}>
                  <span className="lab-ladder-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="lab-trow-title">{area.title}</h3>
                    <p className="lab-trow-desc">{area.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="lab-direction-box" data-thread-box aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Research journey */}
      <section className="lab-section lab-section-tight" id="pathway">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{t.pathway.title}</h2>
            <p className="lab-section-desc">{t.pathway.subtitle}</p>
          </header>
          <ol className="lab-journey">
            {steps.map((step) => (
              <li key={step.number}>
                <p className="lab-kicker">
                  {step.number} · {step.title}
                </p>
                <h3 className="lab-trow-title">{step.program}</h3>
                <p className="lab-trow-desc">{step.description}</p>
                <p className="lab-journey-meta">{step.duration}</p>
                <SmartLink
                  href={step.link}
                  locale={currentLocale}
                  className="lab-link lab-link-sm"
                >
                  {t.ctaLearnMore}
                  <span aria-hidden="true">
                    {isExternal(step.link) ? "↗" : "→"}
                  </span>
                </SmartLink>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Publications */}
      <section className="lab-section lab-section-tight" id="publications">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{t.publications.title}</h2>
            <p className="lab-section-desc">{t.publications.subtitle}</p>
            <p className="lab-legend">
              <strong className="lab-author-baish">Aa</strong> {page.baishAuthor}
            </p>
          </header>
          {publications.map(([year, pubs]) => (
            <div key={year} className="lab-pub-year">
              <h3 className="lab-team-heading">{year}</h3>
              <ul className="lab-pubs">
                {pubs.map((pub) => {
                  const venue = splitVenue(pub.venue);
                  return (
                    <li key={pub.title} className="lab-pub">
                      <div className="lab-pub-meta">
                        <span>{venue.name}</span>
                        {venue.when && <span>{venue.when}</span>}
                        {pub.award && (
                          <span className="lab-pub-award">{pub.award}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="lab-pub-title">{pub.title}</h4>
                        <p className="lab-pub-authors">
                          <Authors authors={pub.authors} />
                        </p>
                        <p className="lab-trow-desc">{pub.description}</p>
                        {pub.links.length > 0 && (
                          <p className="lab-pub-links">
                            {pub.links.map((link) => (
                              <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="lab-link lab-link-sm"
                              >
                                {link.label}
                                <span aria-hidden="true">↗</span>
                              </a>
                            ))}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Work with the lab: the threads knot beside the ways in */}
      <section className="lab-section lab-join">
        <ThreadSet scene="knot" />
        <div className="lab-wrap lab-join-grid">
          <div className="lab-join-copy lab-veil">
            <p className="lab-kicker">{t.expressInterest.eyebrow}</p>
            <h2 className="lab-h2">{labs.ctaTitle}</h2>
            <p className="lab-section-desc">{labs.ctaDescription}</p>
            <ol className="lab-ladder">
              <li>
                <span className="lab-ladder-num" aria-hidden="true">01</span>
                <div>
                  <h3>{t.expressInterest.title}</h3>
                  <p>{t.expressInterest.description}</p>
                </div>
                <SmartLink
                  href={t.expressInterest.link}
                  locale={currentLocale}
                  className="lab-button lab-button-sm"
                  data-thread-pulse
                >
                  {t.expressInterest.cta}
                </SmartLink>
              </li>
              <li>
                <span className="lab-ladder-num" aria-hidden="true">02</span>
                <div>
                  <h3>{t.cta.title}</h3>
                  <p>{t.cta.description}</p>
                </div>
                <span className="lab-ladder-links">
                  <SmartLink
                    href={BOOKING_LINKS.eitan}
                    locale={currentLocale}
                    className="lab-link lab-link-sm"
                    data-thread-pulse
                  >
                    {t.cta.bookWithEitan}
                    <span aria-hidden="true">↗</span>
                  </SmartLink>
                  <span className="lab-ladder-note">{t.cta.eitanSpecialty}</span>
                  <SmartLink
                    href={BOOKING_LINKS.luca}
                    locale={currentLocale}
                    className="lab-link lab-link-sm"
                    data-thread-pulse
                  >
                    {t.cta.bookWithLuca}
                    <span aria-hidden="true">↗</span>
                  </SmartLink>
                  <span className="lab-ladder-note">{t.cta.lucaSpecialty}</span>
                </span>
              </li>
            </ol>
          </div>
          <div className="lab-join-knot" data-thread-box aria-hidden="true" />
        </div>
      </section>

      <LabFooter locale={currentLocale} dict={dict} />
    </div>
  );
}
