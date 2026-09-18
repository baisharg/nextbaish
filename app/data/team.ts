import type en from "@/app/[locale]/dictionaries/en.json";

/**
 * BAISH team roster.
 *
 * Names, photos and links are language-independent and live here. Role labels
 * and bios are translated and live in the dictionaries under
 * `about.team.roles[id]` and `about.team.bios[id]`.
 *
 * Photos: files in `public/images/team/`. When `photo` is omitted the UI renders
 * an initials placeholder, so adding a photo later is a one-line change here.
 */

export type TeamGroup = "directors" | "leads" | "team" | "advisors";

/**
 * Every member id must have a role label under `about.team.roles` in the
 * dictionaries; typing the id this way turns a missing label into a type
 * error instead of an empty card.
 */
export type TeamMemberId = keyof typeof en.about.team.roles;

export type LabsRole = "head" | "lead" | "fellow";

export type TeamLinks = {
  linkedin?: string;
  github?: string;
  website?: string;
  scholar?: string;
  instagram?: string;
};

export type TeamMember = {
  id: TeamMemberId;
  name: string;
  group: TeamGroup;
  /** Path under /public, e.g. "/images/team/eitan-new.png". */
  photo?: string;
  links?: TeamLinks;
  /** Set when the person is part of BAISH Labs, the research arm. */
  labs?: LabsRole;
};

export const TEAM: TeamMember[] = [
  // ─── Directors ────────────────────────────────────────────────
  {
    id: "eitan-sprejer",
    name: "Eitán Sprejer",
    group: "directors",
    photo: "/images/team/eitan-new.png",
    links: {
      github: "https://github.com/Eitan-Sprejer",
      linkedin: "https://www.linkedin.com/in/eitan-sprejer-574380204/",
    },
  },
  {
    id: "carlos-giudice",
    name: "Carlos Giudice",
    group: "directors",
    photo: "/images/team/carlos-new.png",
    links: {
      github: "https://github.com/CatOfTheCannals",
      linkedin: "https://www.linkedin.com/in/carlos-giudice-5237b4144/",
      website: "https://carlosgiudice.com/",
    },
  },
  {
    id: "luca-de-leo",
    name: "Luca De Leo",
    group: "directors",
    photo: "/images/team/luca-new.png",
    links: {
      github: "https://github.com/lucadeleo",
      linkedin: "https://www.linkedin.com/in/luca-de-leo/",
      website: "https://lvca.dev",
    },
  },

  // ─── Task-force leads ──────────────────────────────────────────────────
  {
    id: "nicolas-martorell",
    name: "Nicolás Martorell",
    group: "leads",
    photo: "/images/team/nicolas-martorell.png",
    labs: "head",
    links: {
      linkedin: "https://www.linkedin.com/in/mneuronico/",
      github: "https://github.com/mneuronico",
      website: "https://mneuronico.github.io/xplora/",
    },
  },
  {
    id: "nicolas-spinelli",
    name: "Nicolás Spinelli",
    group: "leads",
    photo: "/images/team/nicolas-spinelli.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/nicolas-spinelli/",
      github: "https://github.com/nicospinelli",
    },
  },
  {
    id: "marina-romanisio",
    name: "Marina Romanisio",
    group: "leads",
    photo: "/images/team/marina-romanisio.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/marinaromanisio/",
    },
  },
  {
    id: "rocio-monjes",
    name: "Rocío Monjes",
    group: "leads",
    photo: "/images/team/rocio-monjes.png",
    links: {
      linkedin: "https://www.linkedin.com/in/rocio-pilar-monjes-/",
      instagram: "https://www.instagram.com/originaluniverse.326/",
    },
  },
  {
    id: "augusto-esquivel-masciotta",
    name: "Augusto Esquivel Masciotta",
    group: "leads",
    photo: "/images/team/augusto-esquivel-masciotta.jpg",
    links: {
      linkedin:
        "https://www.linkedin.com/in/augusto-esquivel-masciotta-a62505397/",
    },
  },

  // ─── Team ──────────────────────────────────────────────────────────────
  {
    id: "tobias-bersia",
    name: "Tobías Bersia",
    group: "team",
    photo: "/images/team/tobias-new.png",
    labs: "lead",
    links: {
      github: "https://github.com/BerTobi",
      linkedin: "https://www.linkedin.com/in/tobias-bersia-70a448132/",
    },
  },
  {
    id: "gonzalo-heredia",
    name: "Gonzalo Heredia",
    group: "team",
    photo: "/images/team/gonzalo-new.png",
    labs: "fellow",
    links: {
      github: "https://github.com/G-9k",
      linkedin: "https://www.linkedin.com/in/gonzalo-heredia29/",
    },
  },
  {
    id: "gaspar-labastie",
    name: "Gaspar Labastie",
    group: "team",
    photo: "/images/team/gaspar-new.png",
    labs: "fellow",
    links: {
      linkedin: "https://www.linkedin.com/in/gaspar-labastie/",
    },
  },
  {
    id: "tomas-korenblit",
    name: "Tomás Korenblit",
    group: "team",
    photo: "/images/team/tomas-korenblit.jpg",
    labs: "fellow",
    links: {
      linkedin: "https://www.linkedin.com/in/tomaskorenblit/",
    },
  },
  {
    id: "juan-charovsky",
    name: "Juan Charovsky",
    group: "team",
    photo: "/images/team/juan-charovsky.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/jcharovsky/",
    },
  },
  {
    id: "santiago-nunez-rimedio",
    name: "Santiago Nuñez Rimedio",
    group: "team",
    photo: "/images/team/santiago-nunez-rimedio.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/santiago-nunez-rimedio-902ba474/",
    },
  },
  {
    id: "trinidad-borrell",
    name: "Trinidad Borrell",
    group: "team",
    photo: "/images/team/trinidad-borrell.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/trinidad-borrell/",
    },
  },
  {
    id: "maria-borrell",
    name: "María Borrell",
    group: "team",
    links: {
      linkedin: "https://www.linkedin.com/in/mar%C3%ADa-b-832431277/",
    },
  },
  {
    id: "damian-barjau-mateu",
    name: "Damián Barjau Mateu",
    group: "team",
    links: {
      linkedin:
        "https://www.linkedin.com/in/dami%C3%A1n-barjau-mateu-97409a230/",
    },
  },
  {
    id: "josefina-zappettini",
    name: "Josefina Zappettini",
    group: "team",
    photo: "/images/team/josefina-zappettini.jpg",
  },
  {
    id: "aaron-sznaider",
    name: "Aaron Sznaider",
    group: "team",
    photo: "/images/team/aaron-sznaider.jpg",
  },
  {
    id: "nahuel-segovia",
    name: "Nahuel Segovia",
    group: "team",
    photo: "/images/team/nahuel-segovia.jpg",
  },
  {
    id: "trinidad-reynoso",
    name: "Trinidad Reynoso",
    group: "team",
  },
  {
    id: "malena-cocozzella",
    name: "Malena Cocozzella",
    group: "team",
    photo: "/images/team/malena-cocozzella.jpg",
  },

  // ─── BAISH Labs research fellows (not otherwise on the org chart) ──────
  {
    id: "julian-szere",
    name: "Julián Szereszewski",
    group: "team",
    photo: "/images/team/julian-szere.jpg",
    labs: "fellow",
  },
  {
    id: "lucio-garcia",
    name: "Lucio García",
    group: "team",
    photo: "/images/team/lucio-garcia.jpg",
    labs: "fellow",
    links: {
      linkedin: "https://www.linkedin.com/in/luciolgarcia/",
    },
  },
  {
    id: "wendy-brau",
    name: "Wendy Brau",
    group: "team",
    photo: "/images/team/wendy-brau.jpg",
    labs: "fellow",
    links: {
      linkedin: "https://www.linkedin.com/in/wendy-brau/",
    },
  },
  {
    id: "tomas-gimenez",
    name: "Tomás Giménez",
    group: "team",
    photo: "/images/team/tomas-gimenez.jpg",
    labs: "fellow",
    links: {
      linkedin: "https://www.linkedin.com/in/tom%C3%A1s-gimenez-molina/",
    },
  },

  // ─── Advisors ──────────────────────────────────────────────────────────
  {
    id: "pablo-stafforini",
    name: "Pablo Stafforini",
    group: "advisors",
    links: {
      linkedin: "https://www.linkedin.com/in/stafforini/",
    },
  },
  {
    id: "sergio-abriola",
    name: "Sergio Abriola",
    group: "advisors",
    links: {
      website: "https://glyc.dc.uba.ar/abriola/",
    },
  },
  {
    id: "ivan-arcuschin",
    name: "Iván Arcuschin",
    group: "advisors",
    links: {
      linkedin: "https://www.linkedin.com/in/iarcuschin/",
    },
  },
  {
    id: "agustin-martinez-sune",
    name: "Agustín Martínez Suñé",
    group: "advisors",
    links: {
      linkedin: "https://www.linkedin.com/in/agusms/",
    },
  },
  {
    id: "tobias-martin",
    name: "Tobías Martin",
    group: "advisors",
    links: {
      linkedin: "https://www.linkedin.com/in/tobias-martin/",
    },
  },
  {
    id: "tao-burga",
    name: "Tao Burga",
    group: "advisors",
    links: {
      linkedin: "https://www.linkedin.com/in/tao-burga-montoya/",
    },
  },
  {
    id: "luis-enrique-urtubey",
    name: "Luis Enrique Urtubey",
    group: "advisors",
    links: {
      linkedin:
        "https://www.linkedin.com/in/luis-enrique-urtubey-de-c%C3%A9saris-a9324290/",
    },
  },
  {
    id: "guido-bergman",
    name: "Guido Bergman",
    group: "advisors",
    links: {
      github: "https://github.com/GuidoBergman",
      linkedin: "https://www.linkedin.com/in/guido-ernesto-bergman-2251bb203",
      scholar:
        "https://scholar.google.com/citations?hl=es&authuser=1&user=sNPb8VgAAAAJ",
    },
  },
];

export function teamByGroup(group: TeamGroup): TeamMember[] {
  return TEAM.filter((member) => member.group === group);
}

const LABS_ORDER: Record<LabsRole, number> = { head: 0, lead: 1, fellow: 2 };

export function labsTeam(): TeamMember[] {
  return TEAM.filter((member) => member.labs).sort(
    (a, b) => LABS_ORDER[a.labs!] - LABS_ORDER[b.labs!],
  );
}

/** Two-letter initials for the photo placeholder. */
export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * Lower-cases a name and strips accents and hyphens, so "Nicolás Martorell"
 * and "Nicolas Martorell", or "Martínez-Suñé" and "Martínez Suñé", compare
 * equal. Used for author highlighting on the research page.
 */
export function normalizeAuthorName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Names used to highlight BAISH-affiliated authors in publication lists:
 * the roster above plus community members who are not on the org chart but
 * whose work is shown on the research page. Accents, hyphens and case are
 * ignored when matching, so only genuinely different forms (e.g. a middle
 * initial) need listing here.
 */
const BAISH_AFFILIATED_AUTHORS: string[] = [
  ...TEAM.map((member) => member.name),
  // Forms with a middle initial that appear in author lists
  "Agustín E. Martínez Suñé",
  // Community members and alumni
  "Joaquín Machulsky",
  "Alejandro Wainstock",
  "Manuel Fernández Burda",
  "Guido Freire",
];

const NORMALIZED_AFFILIATED_AUTHORS =
  BAISH_AFFILIATED_AUTHORS.map(normalizeAuthorName);

/** True when one author name, as written in a publication, is a BAISH member or alumnus. */
export function isBaishAffiliatedAuthor(author: string): boolean {
  const normalized = normalizeAuthorName(author);
  return NORMALIZED_AFFILIATED_AUTHORS.some((name) => normalized.includes(name));
}
