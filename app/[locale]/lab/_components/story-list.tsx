import Image from "next/image";
import type { SuccessStory } from "@/app/data/stories";
import { TEAM, initials } from "@/app/data/team";

/** Wraps known acronyms in <abbr> so the story paths explain themselves. */
function withGlossary(text: string, glossary: Record<string, string>) {
  return text.split(/(\b[A-Z]{3,5}\b)/).map((part, i) =>
    glossary[part] ? (
      <abbr key={i} title={glossary[part]}>
        {part}
      </abbr>
    ) : (
      part
    ),
  );
}

/**
 * Member testimonials. A card leads with the person's own words when we have
 * a verbatim quote, and with what happened otherwise; it ends with who they
 * are and where they are now. People on the team roster get their photo and
 * current role from it; for the rest, "now" is the last stop of their path.
 */
export function StoryList({
  stories,
  glossary,
  roles,
  pulse = false,
  swipe = false,
}: {
  stories: SuccessStory[];
  glossary: Record<string, string>;
  /** Team roster roles by id, for the current position */
  roles: Record<string, string>;
  /** Hovering a story pulses the threads; only where a set is in view */
  pulse?: boolean;
  /** On phones, a horizontal swipe row instead of a long stack */
  swipe?: boolean;
}) {
  return (
    <ul className={swipe ? "lab-stories lab-stories-swipe" : "lab-stories"}>
      {stories.map((story) => {
        const member = TEAM.find((m) => m.id === story.id);
        const stops = story.path.split("→").map((stop) => stop.trim());
        const now = roles[story.id] ?? stops[stops.length - 1];
        return (
          <li
            key={story.id}
            className="lab-story"
            data-thread-pulse={pulse || undefined}
          >
            {story.quote ? (
              <blockquote className="lab-story-quote">“{story.quote}”</blockquote>
            ) : (
              story.text && <p className="lab-story-lead">{story.text}</p>
            )}
            <div className="lab-story-person">
              <div className="lab-story-photo" aria-hidden="true">
                {member?.photo ? (
                  <Image src={member.photo} alt="" width={96} height={96} />
                ) : (
                  <span>{initials(story.name)}</span>
                )}
              </div>
              <div>
                <p className="lab-story-name">
                  {story.link ? (
                    <a href={story.link} target="_blank" rel="noopener noreferrer">
                      {story.name}
                    </a>
                  ) : (
                    story.name
                  )}
                </p>
                <p className="lab-story-now">{now}</p>
              </div>
            </div>
            <p className="lab-story-path">
              {stops.map((stop, i) => (
                <span key={i}>
                  {withGlossary(stop, glossary)}
                  {i < stops.length - 1 && (
                    <span className="lab-story-arrow" aria-hidden="true">
                      {" "}
                      →{" "}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
