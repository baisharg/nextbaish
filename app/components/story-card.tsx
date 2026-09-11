import { HugeiconsIcon } from "@hugeicons/react";
import { Linkedin01Icon } from "@hugeicons/core-free-icons";

export type SuccessStory = {
  id: string;
  featured?: boolean;
  name: string;
  /** The path taken, e.g. "TAIS → ARENA → BAISH Labs". */
  path: string;
  /** Verbatim quote from the person, if we have one. */
  quote?: string;
  /** Short description of what happened. */
  text?: string;
  link?: string | null;
};

export function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <article className="card-glass card-refined flex flex-col">
      <div className="card-eyebrow">{story.path}</div>
      <h3 className="card-title flex items-center gap-2">
        {story.name}
        {story.link && (
          <a
            href={story.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${story.name} on LinkedIn`}
            className="text-slate-500 transition hover:text-[var(--color-accent-primary)]"
          >
            <HugeiconsIcon icon={Linkedin01Icon} size={18} />
          </a>
        )}
      </h3>
      {story.quote && (
        <blockquote className="border-l-2 border-[var(--color-accent-primary)]/40 pl-3 text-sm italic leading-relaxed text-slate-700 mb-3">
          “{story.quote}”
        </blockquote>
      )}
      {story.text && <p className="card-body mb-0">{story.text}</p>}
    </article>
  );
}
