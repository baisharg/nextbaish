import type { ReactNode } from "react";

export const FOOTNOTES = [
  { id: 1, href: "https://epochai.org/trends", label: "1" },
  { id: 2, href: "https://ourworldindata.org/brief-history-of-AI", label: "2" },
  { id: 3, href: "https://arxiv.org/abs/2109.13916", label: "3" },
  { id: 4, href: "https://www.safe.ai/statement-on-ai-risk", label: "4" },
  { id: 5, href: "https://distill.pub/2020/circuits/zoom-in/", label: "5" },
  { id: 6, href: "https://aisafety.training/", label: "6" },
];

function Footnote({ id }: { id: number }) {
  const note = FOOTNOTES.find((fn) => fn.id === id);
  if (!note) return null;

  return (
    <sup className="align-super text-xs">
      <a
        className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
        href={note.href}
        rel="noopener noreferrer"
        target="_blank"
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
