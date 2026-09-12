/**
 * Headline impact numbers, shared by the home page and the About page so they
 * can never drift apart. Labels are translated in the dictionaries; only the
 * language-independent values live here.
 *
 * Dictionary copy references these values as `{key}` placeholders, e.g.
 * "{communityMembers} members on WhatsApp". Render such strings through
 * `fillImpact` so that changing a number here updates every page.
 *
 * Last reviewed: September 2026.
 */

export const IMPACT = {
  /** Members of the BAISH WhatsApp community. */
  communityMembers: "350+",
  /** Subscribers to the BAISH Luma events calendar. */
  lumaSubscribers: "500+",
  /** Followers of @baish_arg on Instagram. */
  instagramFollowers: "970+",
  /** Members placed in full-time AI safety roles. */
  fullTimeRoles: "6",
  /** Placements into external fellowships and research programs. */
  fellowshipPlacements: "28",
  /** Publications by researchers connected to BAISH (see /research). */
  publications: "15+",
  /** In-person course cohorts run since March 2026. */
  courseCohorts: "6",
  courseApplications: "167",
  courseParticipants: "89",
  courseRecommendScore: "9.4/10",
  /** Typical in-person attendance at a monthly social event. */
  socialAttendance: "50-80",
  /** Argentine delegation to EAG London 2026 supported by BAISH. */
  eagDelegation: "16",
} as const;

export type ImpactKey = keyof typeof IMPACT;

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Replaces `{key}` placeholders in a dictionary string with the matching
 * IMPACT value. Unknown placeholders are left untouched, so strings that also
 * carry other template variables (e.g. `{name}`) pass through safely.
 */
export function fillImpact(text: string): string {
  return text.replace(PLACEHOLDER, (match, key: string) =>
    key in IMPACT ? IMPACT[key as ImpactKey] : match,
  );
}

export type FellowshipPlacement = {
  /** Program name as commonly written. */
  name: string;
  /** Number of BAISH members placed. Strings allow "8+". */
  count: string;
};

/**
 * External fellowships and research programs BAISH members have entered.
 * Ordered by count, then alphabetically.
 */
export const FELLOWSHIP_PLACEMENTS: FellowshipPlacement[] = [
  { name: "ML4Good", count: "8+" },
  { name: "MARS", count: "4" },
  { name: "SPAR", count: "4" },
  { name: "ARENA", count: "2" },
  { name: "Cambria", count: "2" },
  { name: "Apart Research SPS Fellowship", count: "2" },
  { name: "Formal methods × AI safety internship", count: "2" },
  { name: "CLR Summer Research Fellowship", count: "1" },
  { name: "Iliad", count: "1" },
  { name: "CORDA Democracy Fellowship", count: "1" },
  { name: "Algoverse", count: "1" },
];

/** Organizations where BAISH members hold full-time AI safety roles. */
export const FULL_TIME_ORGS: { name: string; url: string }[] = [
  { name: "Apart Research", url: "https://apartresearch.com/" },
  { name: "Equistamp", url: "https://equistamp.com/" },
  { name: "80,000 Hours", url: "https://80000hours.org/" },
];
