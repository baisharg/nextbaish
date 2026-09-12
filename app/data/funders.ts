/**
 * Organizations funding BAISH, shown on the About page.
 *
 * Names, programs and descriptions are translated under `about.support[id]`;
 * logos and links are language-independent and live here.
 */
export type FunderId = "kairos" | "bluedot" | "grantmaking" | "coefficientGiving";

/** Dictionary keys under `about.support` that can label a funder link. */
export type FunderCtaKey = "visitWebsiteCta" | "pathfinderCta" | "kairosCta";

export type FunderLink = { url: string } & (
  | { labelKey: FunderCtaKey }
  /** Literal label for brand names that are not translated, e.g. "AISAR". */
  | { label: string }
);

export type Funder = {
  id: FunderId;
  /** Rendered instead of the name when the funder has a logo file. */
  logo?: { src: string; width: number; height: number };
  links: FunderLink[];
};

export const FUNDERS: Funder[] = [
  {
    id: "kairos",
    logo: { src: "/images/logos/kairos.png", width: 180, height: 49 },
    links: [
      { url: "https://pathfinder.kairos-project.org/", labelKey: "pathfinderCta" },
      { url: "https://kairos-project.org/", labelKey: "kairosCta" },
    ],
  },
  {
    id: "bluedot",
    links: [{ url: "https://bluedot.org/", labelKey: "visitWebsiteCta" }],
  },
  {
    id: "grantmaking",
    links: [
      {
        url: "https://app.grantmaking.ai/projects/fbc09447-e027-4818-af5f-bf577c076aa7",
        labelKey: "visitWebsiteCta",
      },
    ],
  },
  {
    id: "coefficientGiving",
    logo: { src: "/images/logos/coefficient-giving.svg", width: 140, height: 54 },
    links: [
      { url: "https://coefficientgiving.org/", labelKey: "visitWebsiteCta" },
      { url: "https://scholarship.aisafety.ar/", label: "AISAR" },
    ],
  },
];
