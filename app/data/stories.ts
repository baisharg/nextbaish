import type en from "@/app/[locale]/dictionaries/en.json";

/**
 * Success stories shown on the home page (featured only) and on About.
 *
 * Language-independent fields live here. The translated copy (path, quote,
 * text) lives in the dictionaries under `about.impact.stories[id]`, so an id
 * listed here without copy in both languages fails type-checking.
 */
export type SuccessStoryId = keyof typeof en.about.impact.stories;

export type SuccessStoryMeta = {
  id: SuccessStoryId;
  /** Also shown on the home page. */
  featured?: boolean;
  name: string;
  /** LinkedIn profile, when we have one and the person is fine being linked. */
  link?: string;
};

export type SuccessStoryCopy = {
  /** The path taken, e.g. "TAIS → ARENA → BAISH Labs". */
  path: string;
  /** Verbatim quote from the person, if we have one. */
  quote?: string;
  /** Short description of what happened. */
  text?: string;
};

export type SuccessStory = SuccessStoryMeta & SuccessStoryCopy;

export const SUCCESS_STORIES: SuccessStoryMeta[] = [
  {
    id: "tobias-bersia",
    featured: true,
    name: "Tobías Bersia",
    link: "https://www.linkedin.com/in/tobias-bersia-70a448132/",
  },
  { id: "julian-szere", featured: true, name: "Julián Szereszewski" },
  {
    id: "guido-bergman",
    featured: true,
    name: "Guido Bergman",
    link: "https://www.linkedin.com/in/guido-ernesto-bergman-2251bb203",
  },
  { id: "guillermo-bondonno", name: "Guillermo Bondonno" },
  { id: "alejandro-wainstock", name: "Alejandro Wainstock" },
  { id: "juan-cadile", name: "Juan P. Cadile" },
  {
    id: "tobias-martin",
    name: "Tobías Martin",
    link: "https://www.linkedin.com/in/tobias-martin/",
  },
  { id: "ana-vicky", name: "Ana & Vicky" },
];

export function featuredStories(): SuccessStoryMeta[] {
  return SUCCESS_STORIES.filter((story) => story.featured);
}

/** Merges the roster metadata with the translated copy for the current locale. */
export function withStoryCopy(
  stories: SuccessStoryMeta[],
  copy: Record<SuccessStoryId, SuccessStoryCopy>,
): SuccessStory[] {
  return stories.map((story) => ({ ...story, ...copy[story.id] }));
}
