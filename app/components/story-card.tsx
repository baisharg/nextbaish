import { HugeiconsIcon } from "@hugeicons/react";
import { Linkedin01Icon } from "@hugeicons/core-free-icons";
import type { SuccessStory } from "@/app/data/stories";

export function StoryCard({
  story,
  linkedinLabel,
}: {
  story: SuccessStory;
  /** Dictionary template for the profile link's aria-label, e.g. "{name} on LinkedIn". */
  linkedinLabel: string;
}) {
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
            aria-label={linkedinLabel.replace("{name}", story.name)}
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
      {story.text && (
        <p className="card-body card-body-tight">{story.text}</p>
      )}
    </article>
  );
}
