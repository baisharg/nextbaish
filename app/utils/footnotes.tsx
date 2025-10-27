import type { ReactNode } from "react";

export const FOOTNOTES = [
  { id: 1, href: "https://epochai.org/trends", label: "1" },
  { id: 2, href: "https://ourworldindata.org/brief-history-of-AI", label: "2" },
  { id: 3, href: "https://arxiv.org/abs/2109.13916", label: "3" },
  { id: 4, href: "https://www.safe.ai/statement-on-ai-risk", label: "4" },
  { id: 5, href: "https://distill.pub/2020/circuits/zoom-in/", label: "5" },
  { id: 6, href: "https://aisafety.training/", label: "6" },
  { id: 7, href: "https://scholarship.aisafety.ar/", label: "7" },
  { id: 8, href: "https://apartresearch.com/lab", label: "8" },
  { id: 9, href: "https://www.ml4good.org/", label: "9" },
  { id: 10, href: "https://www.astralcodexten.com/p/acx-grants-1-3-year-updates", label: "10" },
  { id: 11, href: "https://funds.effectivealtruism.org/funds/far-future", label: "11" },
  { id: 12, href: "https://www.nonlinear.org/", label: "12" },
  { id: 13, href: "https://apartresearch.com/", label: "13" },
  { id: 14, href: "https://www.youtube.com/@AISpecies", label: "14" },
];

// Bio link mappings
export const BIO_LINKS: Record<string, { href: string; text: string }> = {
  aisarLink: { href: "https://scholarship.aisafety.ar/", text: "AISAR Scholarships" },
  apartLabLink: { href: "https://apartresearch.com/lab", text: "Apart Lab Fellowship" },
  ml4gLink: { href: "https://www.ml4good.org/", text: "ML4G" },
  acxLink: { href: "https://www.astralcodexten.com/p/acx-grants-1-3-year-updates", text: "ACX+" },
  ltffLink: { href: "https://funds.effectivealtruism.org/funds/far-future", text: "Long Term Future Fund" },
  nonlinearLink: { href: "https://www.nonlinear.org/", text: "Nonlinear" },
  apartResearchLink: { href: "https://apartresearch.com/", text: "Apart Research" },
  aiSpeciesLink: { href: "https://www.youtube.com/@AISpecies", text: "AI Species" },
  blueDotAgiLink: { href: "https://bluedot.org/courses/agi-strategy", text: "Blue Dot Research's AGI Strategy course" },
  aisesLink: { href: "https://www.aisafetybook.com/virtual-course", text: "AISES course" },
  eitanPaperLink: {
    href: "https://openreview.net/forum?id=F8cIIwrgCZ#discussion",
    text: "papers",
  },
  eitanArxivPaperLink: {
    href: "https://arxiv.org/abs/2510.13912",
    text: 'the paper "Strategic Deception in AI Systems"',
  },
};

function Footnote({ id }: { id: number }) {
  const note = FOOTNOTES.find((fn) => fn.id === id);
  if (!note) return null;

  return (
    <sup className="align-super text-xs">
      <a
        className="inline-flex items-center justify-center min-w-[1rem] h-4 px-1 ml-0.5 rounded bg-[var(--color-accent-primary)]/70 text-white font-medium hover:bg-[var(--color-accent-primary)] transition-all duration-200 hover:scale-105 shadow-sm text-[0.65rem]"
        href={note.href}
        rel="noopener noreferrer"
        target="_blank"
        title="Click to view source"
      >
        {note.label}
      </a>
    </sup>
  );
}

/**
 * Renders text with inline footnote references replaced by interactive footnote links.
 *
 * @param text - The text containing {footnoteN} placeholders
 * @returns An array of React nodes with footnotes rendered as superscript links
 *
 * @example
 * renderWithFootnotes("AI is advancing rapidly{footnote1}")
 * // Returns: ["AI is advancing rapidly", <Footnote id={1} />]
 */
export function renderWithFootnotes(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  // Create a new regex instance to avoid state issues between server/client renders
  const pattern = /\{footnote(\d+)\}/g;

  for (const match of text.matchAll(pattern)) {
    const [placeholder, footnoteId] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    nodes.push(<Footnote key={`footnote-${footnoteId}-${index}`} id={Number(footnoteId)} />);
    lastIndex = index + placeholder.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/**
 * Renders text with bio link template variables replaced by actual hyperlinks.
 *
 * @param text - The text containing {linkName} placeholders
 * @returns An array of React nodes with links rendered as anchor tags
 *
 * @example
 * renderWithBioLinks("Works at {nonlinearLink} and {apartResearchLink}")
 */
export function renderWithBioLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  // Match any template variable in the format {variableName}
  const pattern = /\{(\w+)\}/g;

  for (const match of text.matchAll(pattern)) {
    const [placeholder, linkKey] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const linkInfo = BIO_LINKS[linkKey];
    if (linkInfo) {
      nodes.push(
        <a
          key={`link-${linkKey}-${index}`}
          href={linkInfo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition underline decoration-1 underline-offset-2"
        >
          {linkInfo.text}
        </a>
      );
    } else {
      // If link not found, keep the placeholder
      nodes.push(placeholder);
    }

    lastIndex = index + placeholder.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
