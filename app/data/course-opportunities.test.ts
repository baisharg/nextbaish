import { readFileSync } from "node:fs";
import { describe, expect, test } from "bun:test";
import { ActivitiesEventsJsonLd } from "../components/json-ld";
import en from "../[locale]/dictionaries/en.json";
import es from "../[locale]/dictionaries/es.json";
import sitemap from "../sitemap";
import { SEO_CONTENT } from "../utils/seo";
import {
  COURSE_OPPORTUNITY_CTA_LABELS,
  COURSE_OPPORTUNITY_IDS,
  COURSE_OPPORTUNITY_STATUS_LABELS,
  getCourseOpportunities,
  resolveApplyUrl,
} from "./course-opportunities";

type JsonLdEventElement = { props: { name: string } };

function activityEventNames(locale: "en" | "es"): string[] {
  const element = ActivitiesEventsJsonLd({ locale });
  const children = element.props.children as
    | JsonLdEventElement
    | JsonLdEventElement[];

  return (Array.isArray(children) ? children : [children]).map(
    (child) => child.props.name,
  );
}

describe("BAISH course opportunities", () => {
  test("exposes the three current public BAISH courses in display order", async () => {
    const opportunities = await getCourseOpportunities();

    expect(opportunities.map((opportunity) => opportunity.id)).toEqual([
      "technical-ai-safety-course",
      "technical-ai-safety-project",
      "frontier-ai-governance",
    ] satisfies typeof COURSE_OPPORTUNITY_IDS);
    expect(opportunities).toHaveLength(3);
  });

  test("uses ASTN apply URLs as primary links and BlueDot URLs as learn-more links", async () => {
    const opportunities = await getCourseOpportunities();

    expect(opportunities).toEqual([
      expect.objectContaining({
        id: "technical-ai-safety-course",
        status: "applications_open",
        eoiUrl:
          "https://safetytalent.org/org/baish/apply/ps71k4skpvx68ssb7c4shzxc2n82b6gj",
        applicationUrl:
          "https://safetytalent.org/org/baish/apply/ps7080jc0cvgfq5es0cv925eps88cy0d",
        learnMoreUrl: "https://bluedot.org/courses/technical-ai-safety",
      }),
      expect.objectContaining({
        id: "technical-ai-safety-project",
        status: "applications_open",
        eoiUrl:
          "https://safetytalent.org/org/baish/apply/ps716an39tgr4jtz1zd7c11vq982vn0m",
        applicationUrl:
          "https://safetytalent.org/org/baish/apply/ps76qq0pjhsa4wqcv7x4qw580s88fyhx",
        learnMoreUrl: "https://bluedot.org/courses/technical-ai-safety-project",
      }),
      expect.objectContaining({
        id: "frontier-ai-governance",
        status: "eoi_open",
        eoiUrl:
          "https://safetytalent.org/org/baish/apply/ps76h8dydt3nby3vhnwaxn72gs85w9f1",
        learnMoreUrl: "https://bluedot.org/courses/ai-governance",
      }),
    ]);
  });

  test("routes to the application when open and back to the EOI otherwise", async () => {
    const opportunities = await getCourseOpportunities();
    const byId = Object.fromEntries(
      opportunities.map((opportunity) => [opportunity.id, opportunity]),
    );

    // Applications open → application form.
    expect(resolveApplyUrl(byId["technical-ai-safety-course"])).toBe(
      "https://safetytalent.org/org/baish/apply/ps7080jc0cvgfq5es0cv925eps88cy0d",
    );
    expect(resolveApplyUrl(byId["technical-ai-safety-project"])).toBe(
      "https://safetytalent.org/org/baish/apply/ps76qq0pjhsa4wqcv7x4qw580s88fyhx",
    );

    // EOI open → expression-of-interest form.
    expect(resolveApplyUrl(byId["frontier-ai-governance"])).toBe(
      "https://safetytalent.org/org/baish/apply/ps76h8dydt3nby3vhnwaxn72gs85w9f1",
    );

    // Falls back to the EOI when an application URL is not yet known.
    expect(
      resolveApplyUrl({
        id: "frontier-ai-governance",
        status: "applications_open",
        eoiUrl: "https://example.org/eoi",
        learnMoreUrl: "https://example.org/learn",
      }),
    ).toBe("https://example.org/eoi");
  });

  test("supports separate status and CTA labels for EOI vs applications", () => {
    expect(COURSE_OPPORTUNITY_STATUS_LABELS.en.eoi_open).toBe(
      "Expression of interest open",
    );
    expect(COURSE_OPPORTUNITY_STATUS_LABELS.es.eoi_open).toBe("EOI abierta");
    expect(COURSE_OPPORTUNITY_STATUS_LABELS.en.applications_open).toBe(
      "Applications open",
    );
    expect(COURSE_OPPORTUNITY_STATUS_LABELS.es.applications_open).toBe(
      "Inscripciones abiertas",
    );
    expect(COURSE_OPPORTUNITY_CTA_LABELS.en.eoi_open).toBe("Express interest");
    expect(COURSE_OPPORTUNITY_CTA_LABELS.es.eoi_open).toBe("Expresá interés");
    expect(COURSE_OPPORTUNITY_CTA_LABELS.en.applications_open).toBe("Apply");
    expect(COURSE_OPPORTUNITY_CTA_LABELS.es.applications_open).toBe("Inscribite");
  });

  test("keeps dictionaries, SEO, structured data, and sitemap aligned to current courses", () => {
    expect(Object.keys(en.home.activities.items)).toEqual([
      "technical-ai-safety-course",
      "technical-ai-safety-project",
      "frontier-ai-governance",
    ] satisfies typeof COURSE_OPPORTUNITY_IDS);
    expect(Object.keys(es.home.activities.items)).toEqual([
      "technical-ai-safety-course",
      "technical-ai-safety-project",
      "frontier-ai-governance",
    ] satisfies typeof COURSE_OPPORTUNITY_IDS);

    expect(en.home.timeline.foundationsTitle).toBe("Technical AI Safety Course");
    expect(en.home.timeline.replicateTitle).toBe("Technical AI Safety Project");
    expect(en.home.timeline.publishTitle).toBe("Frontier AI Governance");
    expect(es.home.timeline.foundationsTitle).toBe("Technical AI Safety Course");
    expect(es.home.timeline.replicateTitle).toBe("Technical AI Safety Project");
    expect(es.home.timeline.publishTitle).toBe("Frontier AI Governance");
    expect(en.home.gettingStarted.steps[1].description).toContain(
      "Technical AI Safety Course",
    );
    expect(en.home.gettingStarted.steps[2].description).toContain(
      "Technical AI Safety Project",
    );
    expect(en.home.gettingStarted.steps[3].description).toContain(
      "Frontier AI Governance",
    );
    expect(es.home.gettingStarted.steps[1].description).toContain(
      "Technical AI Safety Course",
    );
    expect(es.home.gettingStarted.steps[2].description).toContain(
      "Technical AI Safety Project",
    );
    expect(es.home.gettingStarted.steps[3].description).toContain(
      "Frontier AI Governance",
    );

    expect(en.home.courseSpotlight.title).toBe("Technical AI Safety Course");
    expect(en.home.courseSpotlight.applyUrl).toBe(
      "https://safetytalent.org/org/baish/apply/ps7080jc0cvgfq5es0cv925eps88cy0d",
    );
    expect(es.home.courseSpotlight.title).toBe("Technical AI Safety Course");
    expect(es.home.courseSpotlight.applyUrl).toBe(
      "https://safetytalent.org/org/baish/apply/ps7080jc0cvgfq5es0cv925eps88cy0d",
    );

    expect(SEO_CONTENT.activities.en.description).toContain(
      "Technical AI Safety Course",
    );
    expect(SEO_CONTENT.activities.en.description).toContain(
      "Technical AI Safety Project",
    );
    expect(SEO_CONTENT.activities.en.description).toContain(
      "Frontier AI Governance",
    );
    expect(SEO_CONTENT["activities/workshop"].en.title).toBe(
      "Technical AI Safety Project",
    );

    expect(activityEventNames("en")).toEqual([
      "Technical AI Safety Course",
      "Technical AI Safety Project",
      "Frontier AI Governance",
    ]);
    expect(activityEventNames("es")).toEqual([
      "Technical AI Safety Course",
      "Technical AI Safety Project",
      "Frontier AI Governance",
    ]);

    const programPages = sitemap().filter(
      (entry) =>
        entry.url.endsWith("/activities") ||
        entry.url.endsWith("/activities/fundamentals") ||
        entry.url.endsWith("/activities/workshop"),
    );
    expect(programPages).toHaveLength(6);
    for (const entry of programPages) {
      const lastModified = (entry.lastModified as Date).toISOString();

      expect(lastModified.startsWith("2026-06-03")).toBe(true);
    }
  });

  test("removes only Guido's scheduling link from the about page", () => {
    const aboutPage = readFileSync(
      new URL("../[locale]/about/page.tsx", import.meta.url),
      "utf8",
    );

    expect(aboutPage).not.toContain("https://calendly.com/gbergman-fi/30min");
    expect(aboutPage).toContain("https://calendly.com/eitusprejer");
    expect(aboutPage).toContain("https://lvca.dev/meet");
  });
});
