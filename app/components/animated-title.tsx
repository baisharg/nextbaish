"use client";

interface AnimatedTitleProps {
  text: string;
  slug: string; // Unique identifier for the page/post
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

/**
 * AnimatedTitle - Per-word animated title component
 *
 * Splits title text into individual words and assigns unique view-transition-name
 * to each word. This creates sophisticated word-by-word morphing animations
 * during page transitions (nmn.sh style).
 *
 * @example
 * <AnimatedTitle
 *   text="Buenos Aires AI Safety Hub"
 *   slug="home"
 *   className="text-4xl font-bold"
 *   as="h1"
 * />
 */
export function AnimatedTitle({
  text,
  slug,
  className = "",
  as: Component = "h1",
}: AnimatedTitleProps) {
  const words = text.split(" ");
  const MAX_ANIMATED_WORDS = 5;

  return (
    <Component className={className}>
      {words.map((word, index) => {
        // Only animate first 5 words individually for performance
        const shouldAnimate = index < MAX_ANIMATED_WORDS;

        return (
          <span
            key={`${slug}-word-${index}`}
            style={shouldAnimate ? {
              // Each word gets a unique view-transition-name
              // Pattern: slug___word___index
              // @ts-ignore - CSS custom property
              "--view-transition-name": `${slug}___${word.toLowerCase()}___${index}`,
              viewTransitionName: `var(--view-transition-name)`,
            } : undefined}
          >
            {word}
            {index < words.length - 1 && " "}
          </span>
        );
      })}
    </Component>
  );
}
