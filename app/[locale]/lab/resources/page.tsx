import type { Metadata } from "next";
import { ThreadPage } from "@/app/components/thread-page";
import { ThreadSet } from "@/app/components/thread-set";
import { MetrChart } from "@/app/components/metr-chart";
import type { Risk } from "@/app/components/concrete-risks";
import { getDictionary } from "../../dictionaries";
import { fillImpact } from "@/app/data/impact";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { LabAnnouncement } from "../_components/lab-announcement";
import { LabFooter } from "../_components/lab-footer";
import { SmartLink, isExternal } from "../_components/smart-link";
import { TitleBand } from "../_components/title-band";
import "../lab.css";

type StudyItem = {
  name: string;
  description: string;
  category: string;
  createdBy: string;
  url: string;
};

type Related = { title: string; description: string; url: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  return {
    title: `${dict.resources.title} · ${dict.lab.metaTitle}`,
    robots: { index: false, follow: false },
  };
}

export default async function LabResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const r = dict.resources;
  const s = r.sections;
  const lab = dict.lab;
  const page = lab.resourcesPage;
  const risks = s.concreteRisks.risks as Risk[];
  const study = s.selfStudy;
  const reading = [
    { title: study.fundamentalReading.title, items: study.fundamentalReading.items as StudyItem[] },
    { title: study.standardCourses.title, items: study.standardCourses.items as StudyItem[] },
  ];
  const related = study.relatedResources;
  const relatedItems: Related[] = [
    related.eventsTraining,
    related.aiDigest,
    related.agenticCoding,
  ];

  return (
    <div className="lab">
      <ThreadPage />
      <LabAnnouncement locale={currentLocale} dict={dict} />

      <TitleBand
        locale={currentLocale}
        homeLabel={lab.band.home}
        eyebrow={r.hero.eyebrow}
        title={r.title}
        lede={<p>{r.description}</p>}
        jumpLabel={lab.aboutPage.jump}
        jumps={[
          { href: "#evidence", label: page.jumpEvidence },
          { href: "#risks", label: page.jumpRisks },
          { href: "#study", label: page.jumpStudy },
        ]}
      />

      {/* Evidence: the METR chart carries this section, so no threads here */}
      <section className="lab-section lab-section-tight" id="evidence">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{s.evidence.heading}</h2>
            <p className="lab-section-desc">{s.evidence.intro}</p>
          </header>
          <div className="lab-chart">
            <MetrChart
              title={s.evidence.chart.title}
              xAxisLabel={s.evidence.chart.xAxisLabel}
              yAxisLabel={s.evidence.chart.yAxisLabel}
              scaleToggle={s.evidence.chart.scaleToggle}
              yAnchorLabels={s.evidence.chart.yAnchorLabels}
              taskExamples={s.evidence.chart.taskExamples}
              unreliableZoneCaption={s.evidence.chart.unreliableZoneCaption}
              sourceLabel={s.evidence.chart.sourceLabel}
              sourceUrl={s.evidence.chart.sourceUrl}
            />
          </div>
          <div className="lab-prose lab-prose-wide">
            {s.evidence.explanation.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <dl className="lab-evidence-stats">
            {s.evidence.stats.items.map((stat) => (
              <div key={stat.value}>
                <dd>{stat.value}</dd>
                <dt>{stat.label}</dt>
                <p>{stat.note}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Risks: every one visible, as labelled rows */}
      <section className="lab-section lab-section-tight" id="risks">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{s.concreteRisks.heading}</h2>
            <p className="lab-section-desc">{s.concreteRisks.intro}</p>
          </header>
          <ol className="lab-risks">
            {risks.map((risk, i) => (
              <li key={risk.id}>
                <span className="lab-ladder-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="lab-trow-title">{risk.title}</h3>
                <div>
                  <p className="lab-body">{risk.description}</p>
                  {(risk.readMoreUrl || risk.podcastUrl) && (
                    <p className="lab-pub-links">
                      {risk.readMoreUrl && (
                        <a
                          className="lab-link lab-link-sm"
                          href={risk.readMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.concreteRisks.readMoreLabel}
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                      {risk.podcastUrl && (
                        <a
                          className="lab-link lab-link-sm"
                          href={risk.podcastUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.concreteRisks.podcastLabel}
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Upside: the threads open out */}
      <section className="lab-section">
        <ThreadSet scene="fan" />
        <div className="lab-wrap lab-upside">
          <div className="lab-veil">
            <h2 className="lab-h2">{s.upside.heading}</h2>
            <p className="lab-lede">{s.upside.body}</p>
          </div>
          <div className="lab-upside-box" data-thread-box aria-hidden="true" />
        </div>
      </section>

      {/* Self-study */}
      <section className="lab-section lab-section-tight" id="study">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{study.title}</h2>
            <p className="lab-section-desc">{study.description}</p>
            <p className="lab-legend">{study.lastUpdated}</p>
          </header>
          <div className="lab-study">
            <div>
              {reading.map((group) => (
                <div key={group.title} className="lab-team-group">
                  <h3 className="lab-team-heading">{group.title}</h3>
                  <ul className="lab-pubs">
                    {group.items.map((item) => (
                      <li key={item.url} className="lab-pub">
                        <div className="lab-pub-meta">
                          <span>{item.createdBy}</span>
                          <span>{item.category}</span>
                        </div>
                        <div>
                          <h4 className="lab-pub-title">
                            <a
                              className="lab-link"
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.name}
                              <span aria-hidden="true">↗</span>
                            </a>
                          </h4>
                          <p className="lab-trow-desc">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <aside>
              <h3 className="lab-team-heading">{related.title}</h3>
              <ul className="lab-related">
                {relatedItems.map((item) => (
                  <li key={item.url}>
                    <SmartLink
                      href={item.url}
                      locale={currentLocale}
                      className="lab-link"
                    >
                      {item.title}
                      <span aria-hidden="true">
                        {isExternal(item.url) ? "↗" : "→"}
                      </span>
                    </SmartLink>
                    <p className="lab-trow-desc">{item.description}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Next steps: the same ladder as the home page */}
      <section className="lab-section lab-join">
        <ThreadSet scene="knot" />
        <div className="lab-wrap lab-join-grid">
          <div className="lab-join-copy lab-veil">
            <p className="lab-kicker">{lab.join.eyebrow}</p>
            <h2 className="lab-h2">{page.nextTitle}</h2>
            <p className="lab-section-desc">{lab.join.description}</p>
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
                    className={
                      i === 0 ? "lab-button lab-button-sm" : "lab-link lab-link-sm"
                    }
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
