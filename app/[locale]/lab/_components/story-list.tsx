import type { SuccessStory } from "@/app/data/stories";

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

/** Alumni stories: name, the path they took, and what happened. */
export function StoryList({
  stories,
  glossary,
}: {
  stories: SuccessStory[];
  glossary: Record<string, string>;
}) {
  return (
    <ul className="lab-stories">
      {stories.map((story) => (
        <li key={story.id} className="lab-story" data-thread-pulse>
          <h3 className="lab-story-name">
            {story.link ? (
              <a href={story.link} target="_blank" rel="noopener noreferrer">
                {story.name}
              </a>
            ) : (
              story.name
            )}
          </h3>
          <p className="lab-story-path">
            {story.path.split("→").map((stop, i, all) => (
              <span key={i}>
                {withGlossary(stop.trim(), glossary)}
                {i < all.length - 1 && (
                  <span className="lab-story-arrow" aria-hidden="true">
                    {" "}
                    →{" "}
                  </span>
                )}
              </span>
            ))}
          </p>
          {story.quote && (
            <blockquote className="lab-story-quote">“{story.quote}”</blockquote>
          )}
          {story.text && <p className="lab-story-text">{story.text}</p>}
        </li>
      ))}
    </ul>
  );
}
