import type { Metadata } from "next";
import Image from "next/image";
import { ThreadPage } from "@/app/components/thread-page";
import { ThreadSet } from "@/app/components/thread-set";
import { TeamLinksRow } from "@/app/components/team-card";
import { getDictionary } from "../../dictionaries";
import { renderWithBioLinks } from "@/app/utils/footnotes";
import {
  initials,
  teamByGroup,
  type TeamMember,
  type TeamMemberId,
} from "@/app/data/team";
import { SUCCESS_STORIES, withStoryCopy } from "@/app/data/stories";
import { FUNDERS } from "@/app/data/funders";
import {
  FELLOWSHIP_PLACEMENTS,
  FULL_TIME_ORGS,
  IMPACT,
  fillImpact,
  type ImpactKey,
} from "@/app/data/impact";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { BioDialog } from "../_components/bio-dialog";
import { LabAnnouncement } from "../_components/lab-announcement";
import { LabFooter } from "../_components/lab-footer";
import { StoryList } from "../_components/story-list";
import { TitleBand } from "../_components/title-band";
import "../lab.css";

const BOOKING_LINKS = {
  eitan: "https://calendly.com/eitusprejer",
  luca: "https://lvca.dev/meet",
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
    title: `${dict.about.title} · ${dict.lab.metaTitle}`,
    robots: { index: false, follow: false },
  };
}

function MemberFace({ member }: { member: TeamMember }) {
  return (
    <div className="lab-member-photo">
      {member.photo ? (
        <Image
          src={member.photo}
          alt=""
          width={400}
          height={400}
          sizes="(max-width: 820px) 45vw, 220px"
        />
      ) : (
        <span aria-hidden="true">{initials(member.name)}</span>
      )}
    </div>
  );
}

export default async function LabAboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.about;
  const lab = dict.lab;
  const roles = t.team.roles;
  const bios: Partial<Record<TeamMemberId, string>> = t.team.bios;
  const stories = withStoryCopy(SUCCESS_STORIES, t.impact.stories);

  // Stat labels come from the path steps on the lab home page.
  const statLabels = Object.fromEntries(
    lab.path.steps.flatMap((step) =>
      step.stats.map((stat) => [stat.key, stat.label]),
    ),
  ) as Record<string, string>;
  const ledgerKeys: ImpactKey[] = [
    "communityMembers",
    "fellowshipPlacements",
    "fullTimeRoles",
    "publications",
  ];

  const groups = [
    { title: t.team.directorsTitle, members: teamByGroup("directors") },
    { title: t.team.leadsTitle, members: teamByGroup("leads") },
    { title: t.team.teamTitle, members: teamByGroup("team") },
  ];
  const advisors = teamByGroup("advisors");

  const memberCard = (member: TeamMember) => {
    const face = (
      <>
        <MemberFace member={member} />
        <span className="lab-member-name">{member.name}</span>
        {roles[member.id] && (
          <span className="lab-member-role">{roles[member.id]}</span>
        )}
      </>
    );
    const bio = bios[member.id];
    if (bio) {
      return (
        <li key={member.id}>
          <BioDialog
            card={face}
            label={member.name}
            openLabel={lab.aboutPage.readBio}
            closeLabel={lab.aboutPage.close}
          >
            <div className="lab-dialog-head">
              <MemberFace member={member} />
              <div>
                <h3 className="lab-member-name">{member.name}</h3>
                <p className="lab-member-role">{roles[member.id]}</p>
                <TeamLinksRow links={member.links} gap="md" className="mt-3" />
              </div>
            </div>
            <p className="lab-dialog-bio">{renderWithBioLinks(bio)}</p>
          </BioDialog>
        </li>
      );
    }
    return (
      <li key={member.id} className="lab-member">
        {face}
        <TeamLinksRow links={member.links} className="mt-2" />
      </li>
    );
  };

  return (
    <div className="lab">
      <ThreadPage />
      <LabAnnouncement locale={currentLocale} dict={dict} />

      <TitleBand
        locale={currentLocale}
        homeLabel={lab.band.home}
        eyebrow={t.title}
        title={t.whoWeAre.title}
        lede={<p>{fillImpact(t.whoWeAre.paragraph1)}</p>}
        jumpLabel={lab.aboutPage.jump}
        jumps={[
          { href: "#impact", label: t.impact.title },
          { href: "#team", label: t.team.title },
          { href: "#support", label: t.support.title },
        ]}
      />

      {/* Track record */}
      <section className="lab-section" id="impact">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <p className="lab-kicker">{t.impact.eyebrow}</p>
            <h2 className="lab-h2">{t.impact.title}</h2>
            <p className="lab-section-desc">{fillImpact(t.whoWeAre.paragraph2)}</p>
          </header>

          <dl className="lab-ledger">
            {ledgerKeys.map((key) => (
              <div key={key}>
                <dt>{statLabels[key]}</dt>
                <dd>{IMPACT[key]}</dd>
              </div>
            ))}
          </dl>

          <div className="lab-split">
            <div>
              <h3 className="lab-h3">{lab.aboutPage.fullTimeOrgs}</h3>
              <p className="lab-body">{fillImpact(t.impact.fullTime.description)}</p>
              <ul className="lab-chips lab-chips-lg">
                {FULL_TIME_ORGS.map((org) => (
                  <li key={org.name}>
                    <a href={org.url} target="_blank" rel="noopener noreferrer">
                      {org.name} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="lab-h3">{lab.aboutPage.fellowships}</h3>
              <p className="lab-body">{fillImpact(t.impact.fellowships.description)}</p>
              <ul className="lab-chips lab-chips-lg">
                {FELLOWSHIP_PLACEMENTS.map((program) => (
                  <li key={program.name}>
                    {program.name} <strong>{program.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lab-columns">
            {[t.impact.research, t.impact.courses, t.impact.community].map(
              (block) => (
                <div key={block.title}>
                  <h3 className="lab-h3">{block.title}</h3>
                  <ul className="lab-list">
                    {block.items.map((item: string) => (
                      <li key={item}>{fillImpact(item)}</li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>

          <h3 className="lab-h3 lab-stories-title">{t.impact.storiesTitle}</h3>
          <StoryList stories={stories} glossary={lab.stories.glossary} />
        </div>
      </section>

      {/* Team */}
      <section className="lab-section lab-section-tight" id="team">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{t.team.title}</h2>
          </header>

          {groups.map((group, i) => (
            <div key={group.title} className="lab-team-group">
              <h3 className="lab-team-heading">{group.title}</h3>
              <ul className={i === 0 ? "lab-team lab-team-lg" : "lab-team"}>
                {group.members.map(memberCard)}
              </ul>

              {i === 0 && (
                <div className="lab-trow lab-trow-call" id="book-a-call">
                  <div className="lab-call-copy">
                    <h3 className="lab-trow-title">{t.callToAction.title}</h3>
                    <p className="lab-trow-desc">{t.callToAction.description}</p>
                  </div>
                  <div className="lab-call-actions">
                    <a
                      className="lab-button lab-button-sm"
                      href={BOOKING_LINKS.eitan}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.callToAction.bookWithEitan}
                    </a>
                    <a
                      className="lab-button lab-button-sm"
                      href={BOOKING_LINKS.luca}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.callToAction.bookWithLuca}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="lab-team-group">
            <h3 className="lab-team-heading">{t.team.advisorsTitle}</h3>
            <ul className="lab-advisors">
              {advisors.map((member) => (
                <li key={member.id}>
                  <span className="lab-member-name">{member.name}</span>
                  <span className="lab-member-role">{roles[member.id]}</span>
                  <TeamLinksRow links={member.links} className="mt-2" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What we focus on: labelled rows */}
      <section className="lab-section lab-section-tight">
        <div className="lab-wrap lab-about">
          <header>
            <p className="lab-kicker">{t.ourApproach.title}</p>
            <h2 className="lab-h2">{lab.aboutPage.approachTitle}</h2>
          </header>
          <dl className="lab-rows">
            {[t.ourApproach.focusAreas, t.ourApproach.contribution].map(
              (block) => (
                <div key={block.title} className="lab-row-item">
                  <dt>{block.title}</dt>
                  <dd>
                    <ul className="lab-list">
                      {block.items.map((item: string) => (
                        <li key={item}>{fillImpact(item)}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ),
            )}
          </dl>
        </div>
      </section>

      {/* Supported by: threads settle into a band above the funders */}
      <section
        className="lab-section lab-section-tight"
        id="support"
      >
        <ThreadSet scene="horizon" />
        <div className="lab-wrap">
          <div className="lab-band" data-thread-box aria-hidden="true" />
          <header className="lab-section-head">
            <h2 className="lab-h2">{t.support.title}</h2>
            <p className="lab-section-desc">{t.support.description}</p>
          </header>
          <div className="lab-table">
            {FUNDERS.map((funder) => {
              const copy = t.support[funder.id];
              return (
                <div key={funder.id} className="lab-funder">
                  <div>
                    {funder.logo ? (
                      <Image
                        src={funder.logo.src}
                        alt={copy.name}
                        width={funder.logo.width}
                        height={funder.logo.height}
                        className="lab-funder-logo"
                      />
                    ) : (
                      <p className="lab-trow-title">{copy.name}</p>
                    )}
                    <p className="lab-cell-eyebrow">{copy.program}</p>
                  </div>
                  <p className="lab-trow-desc">{copy.description}</p>
                  <div className="lab-funder-links">
                    {funder.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lab-link lab-link-sm"
                      >
                        {"label" in link ? link.label : t.support[link.labelKey]}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LabFooter locale={currentLocale} dict={dict} />
    </div>
  );
}
