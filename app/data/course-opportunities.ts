import type { AppLocale } from "@/i18n.config";

export const COURSE_OPPORTUNITY_IDS = [
  "technical-ai-safety-course",
  "technical-ai-safety-project",
  "frontier-ai-governance",
  "agi-strategy",
] as const;

export type CourseOpportunityId = (typeof COURSE_OPPORTUNITY_IDS)[number];
export type CourseOpportunityStatus = "eoi_open" | "applications_open";

export type CourseOpportunity = {
  id: CourseOpportunityId;
  /** Only picks the status chip and CTA label; the link is always `eoiUrl`. */
  status: CourseOpportunityStatus;
  /**
   * The course's expression-of-interest form on ASTN. Its "Redirect to"
   * setting serves the open application behind this same link while that
   * application is active, and the EOI again once it closes.
   */
  eoiUrl: string;
  learnMoreUrl: string;
};

/**
 * The link a course CTA points at: always the EOI. ASTN decides whether that
 * link shows the EOI or the open application, so opening or closing a cohort
 * never needs a site change and the CTA can't point at a closed form.
 */
export function resolveApplyUrl(opportunity: CourseOpportunity): string {
  return opportunity.eoiUrl;
}

export const COURSE_OPPORTUNITY_CTA_LABELS = {
  en: {
    eoi_open: "Express interest",
    applications_open: "Apply",
  },
  es: {
    eoi_open: "Expresá interés",
    applications_open: "Inscribite",
  },
} satisfies Record<AppLocale, Record<CourseOpportunityStatus, string>>;

export const COURSE_OPPORTUNITY_STATUS_LABELS = {
  en: {
    eoi_open: "Expression of interest open",
    applications_open: "Applications open",
  },
  es: {
    eoi_open: "EOI abierta",
    applications_open: "Inscripciones abiertas",
  },
} satisfies Record<AppLocale, Record<CourseOpportunityStatus, string>>;

export const COURSE_OPPORTUNITIES_REVALIDATE_SECONDS = 60 * 60;

const PUBLIC_SOURCE_URL =
  process.env.BAISH_COURSE_OPPORTUNITIES_URL ??
  process.env.NEXT_PUBLIC_BAISH_COURSE_OPPORTUNITIES_URL;

const FALLBACK_COURSE_OPPORTUNITIES = [
  {
    id: "technical-ai-safety-course",
    status: "eoi_open",
    eoiUrl:
      "https://safetytalent.org/org/baish/apply/ps71k4skpvx68ssb7c4shzxc2n82b6gj",
    learnMoreUrl: "https://bluedot.org/courses/technical-ai-safety",
  },
  {
    id: "technical-ai-safety-project",
    status: "eoi_open",
    eoiUrl:
      "https://safetytalent.org/org/baish/apply/ps716an39tgr4jtz1zd7c11vq982vn0m",
    learnMoreUrl: "https://bluedot.org/courses/technical-ai-safety-project",
  },
  {
    id: "frontier-ai-governance",
    status: "eoi_open",
    eoiUrl:
      "https://safetytalent.org/org/baish/apply/ps76n04hgsqav7j6xb9d25c7qh8cm0s6",
    learnMoreUrl: "https://bluedot.org/courses/ai-governance",
  },
  {
    id: "agi-strategy",
    status: "eoi_open",
    eoiUrl:
      "https://safetytalent.org/org/baish/apply/ps74jgrt3kawb0z4xzwev64j4d8ec7q1",
    learnMoreUrl: "https://bluedot.org/courses/agi-strategy",
  },
] as const satisfies readonly CourseOpportunity[];

export async function getCourseOpportunities(): Promise<
  readonly CourseOpportunity[]
> {
  if (!PUBLIC_SOURCE_URL) return FALLBACK_COURSE_OPPORTUNITIES;

  try {
    const response = await fetch(PUBLIC_SOURCE_URL, {
      next: { revalidate: COURSE_OPPORTUNITIES_REVALIDATE_SECONDS },
    });

    if (!response.ok) return FALLBACK_COURSE_OPPORTUNITIES;

    return mergeCourseOpportunities(await response.json());
  } catch {
    return FALLBACK_COURSE_OPPORTUNITIES;
  }
}

function mergeCourseOpportunities(payload: unknown): readonly CourseOpportunity[] {
  const candidates = getPayloadArray(payload);
  if (!candidates) return FALLBACK_COURSE_OPPORTUNITIES;

  const byId: Partial<Record<CourseOpportunityId, Partial<CourseOpportunity>>> =
    {};
  for (const candidate of candidates) {
    if (!isRecord(candidate) || !isCourseOpportunityId(candidate.id)) continue;

    byId[candidate.id] = {
      id: candidate.id,
      ...(isCourseOpportunityStatus(candidate.status) && {
        status: candidate.status,
      }),
      ...(isHttpUrl(candidate.eoiUrl) && { eoiUrl: candidate.eoiUrl }),
      ...(isHttpUrl(candidate.learnMoreUrl) && {
        learnMoreUrl: candidate.learnMoreUrl,
      }),
    };
  }

  return FALLBACK_COURSE_OPPORTUNITIES.map((fallback) => ({
    ...fallback,
    ...byId[fallback.id],
  }));
}

function getPayloadArray(payload: unknown): unknown[] | undefined {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload) && Array.isArray(payload.opportunities)) {
    return payload.opportunities;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCourseOpportunityId(value: unknown): value is CourseOpportunityId {
  return COURSE_OPPORTUNITY_IDS.includes(value as CourseOpportunityId);
}

function isCourseOpportunityStatus(
  value: unknown,
): value is CourseOpportunityStatus {
  return value === "eoi_open" || value === "applications_open";
}

function isHttpUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//.test(value);
}
