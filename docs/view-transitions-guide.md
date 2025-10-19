# View Transitions API Implementation Guide

This guide explains how to implement smooth, native-app-like page transitions using the View Transitions API in Next.js 15 with the App Router.

## Overview

The View Transitions API allows you to create smooth animations between page navigations by morphing shared elements from their old position to their new position. This creates polished transitions similar to native mobile apps.

**Browser Support**: Chrome/Edge 111+, Safari 18+, Firefox 144+ (October 2025). Same-document view transitions are now **Baseline Newly available** (Interop 2025). Gracefully degrades to instant navigation in unsupported browsers.

## How It Works

1. Assign `view-transition-name` CSS property to elements you want to animate
2. When navigating, call `document.startViewTransition(() => { navigate })`
3. The browser automatically morphs elements with matching names between pages
4. Elements unique to one page fade in/out

## Implementation Steps

### 1. Create a Link Component with View Transitions

Create `app/components/transition-link.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link>;

export function TransitionLink({
  href,
  children,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      router.push(href.toString());
      return;
    }

    // Start view transition (callback syntax)
    document.startViewTransition(() => {
      router.push(href.toString());
    });

    // Alternative: Use options object for more control (Chrome 125+)
    // document.startViewTransition({
    //   update: () => router.push(href.toString()),
    //   types: [] // Optional: Add transition types
    // });
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
```

### 2. Add View Transition Names to Elements

In your CSS (or Tailwind config), define view transition names:

```css
/* globals.css */
.logo {
  view-transition-name: logo;
}

.hero-title {
  view-transition-name: hero-title;
}

/* For dynamic names, use CSS custom properties */
.animated-word {
  view-transition-name: var(--view-transition-name);
}

/* Group multiple elements with shared animations */
.card {
  view-transition-class: card-transition;
}

::view-transition-group(.card-transition) {
  animation-duration: 0.4s;
  animation-timing-function: ease-out;
}
```

**Using `view-transition-class`** (Chrome 125+, Firefox 144+):

The `view-transition-class` property allows you to apply the same animation styles to multiple elements without repeating CSS rules:

```css
/* globals.css or Tailwind config */

/* Apply class to multiple card elements */
.blog-card,
.event-card,
.resource-card {
  view-transition-class: card;
}

/* Style all cards with one rule */
::view-transition-group(.card) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* You can also combine with view-transition-name */
.featured-post {
  view-transition-name: featured;
  view-transition-class: card slide-up;
}
```

With Tailwind, you can use arbitrary properties:

```tsx
<div className="[view-transition-class:card]">
  {/* Card content */}
</div>
```

### 3. Implement Per-Word Animations (Advanced)

For the sophisticated word-by-word morphing effect seen on nmn.sh:

```tsx
// app/components/animated-title.tsx
"use client";

interface AnimatedTitleProps {
  text: string;
  slug: string; // Unique identifier for the page/post
}

export function AnimatedTitle({ text, slug }: AnimatedTitleProps) {
  const words = text.split(" ");

  return (
    <h1>
      {words.map((word, index) => (
        <span
          key={`${slug}-word-${index}`}
          style={{
            // Each word gets a unique view-transition-name
            // @ts-ignore - CSS custom property
            "--view-transition-name": `${slug}___${word.toLowerCase()}___${index}`,
            viewTransitionName: `var(--view-transition-name)`
          }}
        >
          {word}
          {index < words.length - 1 && " "}
        </span>
      ))}
    </h1>
  );
}
```

Usage:
```tsx
// app/blog/[slug]/page.tsx
import { AnimatedTitle } from "@/app/components/animated-title";

export default function BlogPost({ params }) {
  return (
    <AnimatedTitle
      text="New Enum Syntax for TypeScript"
      slug={params.slug}
    />
  );
}
```

### 4. Add Transition Styles (Optional)

Customize the default transition animations:

```css
/* globals.css */

/* Customize duration */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

/* Faster transitions for specific elements */
::view-transition-old(logo),
::view-transition-new(logo) {
  animation-duration: 0.2s;
}

/* Custom animation for text elements */
::view-transition-old(*),
::view-transition-new(*) {
  animation-timing-function: ease-out;
}

/* Apply styles while transition is active */
:root:active-view-transition {
  cursor: wait;
  user-select: none;
}

/* Prevent layout shifts during transitions */
body:active-view-transition {
  overflow: hidden;
}
```

### 5. TypeScript Support

Add type definitions for the View Transitions API:

```typescript
// types/view-transitions.d.ts

// Options object for startViewTransition
interface ViewTransitionOptions {
  update?: () => void | Promise<void>;
  types?: string[];
}

// Document API with both overloads
interface Document {
  startViewTransition(callback?: () => void | Promise<void>): ViewTransition;
  startViewTransition(options?: ViewTransitionOptions): ViewTransition;
}

// ViewTransition object
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
  types: ReadonlyArray<string>;
}

// CSS properties
interface CSSStyleDeclaration {
  viewTransitionName?: string;
  viewTransitionClass?: string;
}
```

### 6. Using TransitionLink Throughout Your App

Replace Next.js `Link` components with `TransitionLink`:

```tsx
// Before
import Link from "next/link";
<Link href="/blog">Blog</Link>

// After
import { TransitionLink } from "@/app/components/transition-link";
<TransitionLink href="/blog">Blog</TransitionLink>
```

## Advanced Patterns

### Shared Navigation Header

Give your nav logo/brand a persistent transition name:

```tsx
// app/components/header.tsx
export function Header() {
  return (
    <header>
      <TransitionLink href="/">
        <svg style={{ viewTransitionName: "logo" }}>
          {/* Your logo */}
        </svg>
      </TransitionLink>
      {/* ... */}
    </header>
  );
}
```

### List to Detail Transitions

For blog post previews that transition to full posts:

```tsx
// app/blog/page.tsx - List view
{posts.map(post => (
  <article key={post.slug}>
    <AnimatedTitle text={post.title} slug={post.slug} />
  </article>
))}

// app/blog/[slug]/page.tsx - Detail view
<AnimatedTitle text={post.title} slug={params.slug} />
```

When clicking a post, the title words will morph from the list position to the detail page position.

### Conditional Transitions

Only apply transitions for certain navigation types:

```tsx
export function TransitionLink({
  href,
  children,
  enableTransition = true,
  ...props
}: TransitionLinkProps & { enableTransition?: boolean }) {
  // ... same router setup

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!enableTransition || !document.startViewTransition) {
      router.push(href.toString());
      return;
    }

    document.startViewTransition(() => {
      router.push(href.toString());
    });
  };

  // ... rest of component
}
```

### View Transition Types

Apply different animations based on the navigation context using transition types (Chrome 125+, Safari 18.2+):

```tsx
export function TransitionLink({
  href,
  children,
  transitionType,
  ...props
}: TransitionLinkProps & { transitionType?: string[] }) {
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!document.startViewTransition) {
      router.push(href.toString());
      return;
    }

    // Use types to categorize the transition
    document.startViewTransition({
      update: () => router.push(href.toString()),
      types: transitionType || []
    });
  };

  // ... rest of component
}
```

Usage with different transition types:

```tsx
// Slide animation for forward navigation
<TransitionLink href="/blog/post-1" transitionType={["slide", "forward"]}>
  Read More
</TransitionLink>

// Fade for settings
<TransitionLink href="/settings" transitionType={["fade"]}>
  Settings
</TransitionLink>
```

Style based on transition type:

```css
/* Default transition */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

/* Slide animation for specific types */
:root:active-view-transition-type(slide) {
  ::view-transition-old(root) {
    animation-name: slide-out;
  }
  ::view-transition-new(root) {
    animation-name: slide-in;
  }
}

/* Faster fade for settings */
:root:active-view-transition-type(fade) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.15s;
  }
}

@keyframes slide-out {
  to { transform: translateX(-100%); }
}

@keyframes slide-in {
  from { transform: translateX(100%); }
}
```

## Performance Considerations

1. **Limit transition names**: Don't give every element a transition name - only key shared elements
2. **Use unique names**: Ensure transition names are unique per element to avoid conflicts
3. **Test on slower devices**: View transitions can be janky on low-end hardware
4. **Provide escape hatch**: Always support instant navigation as fallback

## Debugging

Enable Chrome DevTools animation panel to see view transitions:
1. Open DevTools → More tools → Animations
2. Navigate between pages
3. Watch the transition timeline

Or add temporary CSS to slow down transitions:

```css
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 3s !important; /* Slow motion */
}
```

## Common Issues

**Issue**: Transitions feel "janky" or slow
**Solution**: Reduce number of animated elements, shorten duration, or disable on mobile

**Issue**: Elements don't transition smoothly
**Solution**: Ensure `view-transition-name` values match exactly between pages

**Issue**: Layout shift during transition
**Solution**: Keep consistent layouts between pages, use `content-visibility` for off-screen content

## Resources

- [View Transitions API Spec](https://drafts.csswg.org/css-view-transitions/)
- [Chrome for Developers Guide](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [Next.js App Router Docs](https://nextjs.org/docs/app)

## Example Implementation

See `nmn.sh` for a production example using per-word transitions with atomic CSS classes and dynamic transition names.
