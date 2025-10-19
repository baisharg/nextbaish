# View Transitions Implementation Plan for BAISH Website

**Project:** Buenos Aires AI Safety Hub (BAISH) Website
**Date:** October 2025
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Research Findings & Best Practices](#research-findings--best-practices)
3. [Architecture Decisions](#architecture-decisions)
4. [Browser Support & Progressive Enhancement](#browser-support--progressive-enhancement)
5. [Phase 1: Foundation](#phase-1-foundation)
6. [Phase 2: Navigation Components](#phase-2-navigation-components)
7. [Phase 3: Page Titles with Per-Word Animation](#phase-3-page-titles-with-per-word-animation)
8. [Phase 4: Header Animation Replacement](#phase-4-header-animation-replacement)
9. [Fastmod Bulk Replacement Commands](#fastmod-bulk-replacement-commands)
10. [Testing Strategy](#testing-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Accessibility Considerations](#accessibility-considerations)
13. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

### Project Goals

Implement smooth, native-app-like page transitions across the BAISH website using the View Transitions API. This will:

- Enhance user experience with polished page-to-page animations
- Create sophisticated per-word title morphing effects (à la nmn.sh)
- Maintain excellent performance (60fps target)
- Ensure accessibility compliance
- Provide graceful degradation for unsupported browsers
- Replace complex JavaScript scroll animations with simpler, more maintainable solutions

### Expected Benefits

1. **UX Polish**: Professional, native-app feel during navigation
2. **Visual Continuity**: Logo and shared elements morph smoothly between pages
3. **Sophisticated Animations**: Per-word title transitions create unique visual interest
4. **Performance**: Reduced JavaScript complexity, leveraging browser-native animations
5. **Bilingual Support**: Seamless transitions work with both English and Spanish content
6. **Maintainability**: Simpler header code, easier to debug and extend

---

## Research Findings & Best Practices

### Key Insights from Exa Research

**From Chrome for Developers (2025 Update):**
- Same-document view transitions reached **Baseline Newly Available** status (Interop 2025)
- `view-transition-class` enables grouped animations without repeating CSS rules
- View transition types allow conditional animations based on navigation context
- Performance optimization: Limit transition names to essential elements only

**Performance Best Practices:**
- Keep transition duration ≤ 0.3s for perceived responsiveness
- Use `view-transition-class` for grouped animations (reduces CSS bloat)
- Limit the number of unique `view-transition-name` values (avoid janky performance)
- Test on mobile/low-end devices - transitions can be heavy
- Use RAF (requestAnimationFrame) for smooth animations
- Consider `prefers-reduced-motion` media query

**Accessibility Considerations:**
- View transitions are automatically skipped for users with `prefers-reduced-motion: reduce`
- Ensure keyboard navigation works during transitions
- Maintain focus management (focus shouldn't be lost during transition)
- Screen readers should announce page changes correctly
- Test with assistive technologies

**Next.js 15 App Router Patterns:**
- Create custom `TransitionLink` component wrapping Next.js `Link`
- Use `useRouter()` from `next/navigation` for programmatic transitions
- Client component required for transition handling (but usable in server components)
- Compatible with locale routing via dynamic segments

**React Approach (Future):**
- React 19 will include `unstable_ViewTransition` component
- For now, use native browser API with Next.js router
- Consider migrating to React API when stable

---

## Architecture Decisions

### 1. TransitionLink Pattern

**Decision:** Create a custom `TransitionLink` component that wraps Next.js `Link`

**Rationale:**
- Centralized transition logic
- Drop-in replacement for existing `Link` components
- Handles feature detection and graceful degradation
- Compatible with locale routing (`withLocale` helper)

**Implementation:**
```tsx
// app/components/transition-link.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link>;

export function TransitionLink({ href, children, ...props }: TransitionLinkProps) {
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Feature detection - graceful fallback
    if (!document.startViewTransition) {
      router.push(href.toString());
      return;
    }

    // Start view transition
    document.startViewTransition(() => {
      router.push(href.toString());
    });
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
```

### 2. AnimatedTitle Component

**Decision:** Create `AnimatedTitle` component for per-word title animations

**Rationale:**
- Sophisticated visual effect (nmn.sh style)
- Unique identifier per word prevents conflicts
- Works with bilingual content (crossfade when words don't match)
- Reusable across all page titles

**Implementation:**
```tsx
// app/components/animated-title.tsx
"use client";

interface AnimatedTitleProps {
  text: string;
  slug: string; // Unique page identifier
  className?: string;
  as?: "h1" | "h2" | "h3"; // Heading level
}

export function AnimatedTitle({
  text,
  slug,
  className = "",
  as: Component = "h1"
}: AnimatedTitleProps) {
  const words = text.split(" ");

  return (
    <Component className={className}>
      {words.map((word, index) => (
        <span
          key={`${slug}-word-${index}`}
          style={{
            // Unique view-transition-name per word
            // @ts-ignore - CSS custom property
            "--view-transition-name": `${slug}___${word.toLowerCase()}___${index}`,
            viewTransitionName: `var(--view-transition-name)`
          }}
        >
          {word}
          {index < words.length - 1 && " "}
        </span>
      ))}
    </Component>
  );
}
```

### 3. Server vs Client Component Strategy

**Decision:** Keep pages as server components, use client components for transitions

**Setup:**
- Pages remain async server components (for `getDictionary`)
- `TransitionLink` is a client component (needs `useRouter`, `onClick`)
- `AnimatedTitle` is a client component (needs dynamic HTML)
- Server components can import and use client components ✓

### 4. Locale Routing Compatibility

**Decision:** Maintain existing `withLocale()` and `buildLangSwitchHref()` patterns

**Implementation:**
- All links already use `withLocale(locale, path)`
- Language switcher uses `buildLangSwitchHref(pathname, langCode)`
- TransitionLink accepts these href patterns seamlessly
- No changes required to locale logic

---

## Browser Support & Progressive Enhancement

### Browser Support Matrix

| Feature | Chrome/Edge | Safari | Firefox |
|---------|-------------|--------|---------|
| Same-Document View Transitions | 111+ | 18+ | 144+ (Oct 2025) |
| Cross-Document View Transitions | 126+ | 18.2+ | Not yet |
| View Transition Types | 125+ | 18.2+ | Not yet |
| View Transition Classes | 125+ | 18.2+ | 144+ |

### Progressive Enhancement Strategy

```tsx
// Feature detection built into TransitionLink
if (!document.startViewTransition) {
  // Fallback: instant navigation (current behavior)
  router.push(href.toString());
  return;
}

// Enhanced: smooth transition
document.startViewTransition(() => {
  router.push(href.toString());
});
```

**Result:**
- ✅ All users get functional navigation
- ✅ Modern browser users get enhanced transitions
- ✅ No JavaScript errors in older browsers
- ✅ Graceful degradation

---

## Phase 1: Foundation

### 1.1 Create TypeScript Type Definitions

**File:** `types/view-transitions.d.ts`

```typescript
// View Transition API type definitions

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

**Action:** Create this file to enable TypeScript support

---

### 1.2 Create TransitionLink Component

**File:** `app/components/transition-link.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link>;

/**
 * TransitionLink - Drop-in replacement for Next.js Link with View Transitions
 *
 * Uses the View Transitions API to create smooth page transitions.
 * Gracefully falls back to instant navigation in unsupported browsers.
 *
 * @example
 * <TransitionLink href="/about">About</TransitionLink>
 */
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

    // Start view transition
    document.startViewTransition(() => {
      router.push(href.toString());
    });
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
```

**Action:** Create this file

---

### 1.3 Create AnimatedTitle Component

**File:** `app/components/animated-title.tsx`

```tsx
"use client";

interface AnimatedTitleProps {
  text: string;
  slug: string; // Unique identifier for the page/post
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
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

  return (
    <Component className={className}>
      {words.map((word, index) => (
        <span
          key={`${slug}-word-${index}`}
          style={{
            // Each word gets a unique view-transition-name
            // Pattern: slug___word___index
            // @ts-ignore - CSS custom property
            "--view-transition-name": `${slug}___${word.toLowerCase()}___${index}`,
            viewTransitionName: `var(--view-transition-name)`,
          }}
        >
          {word}
          {index < words.length - 1 && " "}
        </span>
      ))}
    </Component>
  );
}
```

**Action:** Create this file

---

### 1.4 Add View Transition Styles to globals.css

**File:** `app/globals.css`

**Action:** Add the following CSS to the end of the file:

```css
/* ==========================================================================
   View Transitions API Styles
   ========================================================================== */

/* Base transition timing for all elements */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  animation-timing-function: ease-out;
}

/* Faster transition for logo (snappier feel) */
::view-transition-old(site-logo),
::view-transition-new(site-logo) {
  animation-duration: 0.2s;
}

/* Smooth transitions for text elements */
::view-transition-old(*),
::view-transition-new(*) {
  animation-timing-function: ease-out;
}

/* Active transition states - prevent interaction during transition */
:root:active-view-transition {
  cursor: wait;
  user-select: none;
}

/* Prevent layout shifts during transitions */
body:active-view-transition {
  overflow: hidden;
}

/* Logo transition name (applied to header logo) */
.site-logo {
  view-transition-name: site-logo;
}

/* Respect user preferences - disable transitions for reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms !important;
  }
}

/* Optional: Custom fade animation for specific elements */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

**Action:** Append this CSS to `app/globals.css`

---

## Phase 2: Navigation Components

### 2.1 Update Header Component

**File:** `app/components/header.tsx`

**Changes Required:**

1. **Import TransitionLink:**
```tsx
// Change line 4 from:
import Link from "next/link";

// To:
import { TransitionLink } from "./transition-link";
```

2. **Replace all `<Link>` with `<TransitionLink>`:**
- Line 157: Home link (logo + title)
- Lines 235-241: Nav links
- Lines 251-262: Language switcher links

3. **Add logo transition name:**
```tsx
// Line 162-170 (logo Image), add className:
<Image
  src="/jacarandashield.png"
  alt="BAISH Logo"
  width={40}
  height={40}
  className="w-full h-full object-contain site-logo"  // Add site-logo class
  priority
  fetchPriority="high"
/>
```

**Action:** See Fastmod commands below for automated replacement

---

### 2.2 Update Mobile Menu Component

**File:** `app/components/mobile-menu.tsx`

**Changes Required:**

1. **Import TransitionLink:**
```tsx
import { TransitionLink } from "./transition-link";
```

2. **Replace all `<Link>` with `<TransitionLink>`:**
- Logo link
- Nav links (5 instances)
- Language switcher links
- CTA button link

**Action:** See Fastmod commands below for automated replacement

---

### 2.3 Update Footer Component

**File:** `app/components/footer.tsx`

**Changes Required:**

1. **Import TransitionLink:**
```tsx
import { TransitionLink } from "@/app/components/transition-link";
```

2. **Replace all navigation `<Link>` with `<TransitionLink>`**

**Action:** See Fastmod commands below for automated replacement

---

## Phase 3: Page Titles with Per-Word Animation

### 3.1 Update Home Page

**File:** `app/[locale]/page.tsx`

**Pattern:**
```tsx
// Before:
<h1 className="text-4xl font-bold">{dict.home.title}</h1>

// After:
import { AnimatedTitle } from "@/app/components/animated-title";

<AnimatedTitle
  text={dict.home.title}
  slug="home"
  className="text-4xl font-bold"
  as="h1"
/>
```

**Action:** Replace main h1 element with AnimatedTitle

---

### 3.2 Update About Page

**File:** `app/[locale]/about/page.tsx`

```tsx
<AnimatedTitle
  text={dict.about.title}
  slug="about"
  className="text-4xl font-bold"
  as="h1"
/>
```

**Action:** Replace page title h1

---

### 3.3 Update Activities Page

**File:** `app/[locale]/activities/page.tsx`

```tsx
<AnimatedTitle
  text={dict.activities.title}
  slug="activities"
  className="text-4xl font-bold"
  as="h1"
/>
```

**Action:** Replace page title h1

---

### 3.4 Update Research Page

**File:** `app/[locale]/research/page.tsx`

```tsx
<AnimatedTitle
  text={dict.research.title}
  slug="research"
  className="text-4xl font-bold"
  as="h1"
/>
```

**Action:** Replace page title h1

---

### 3.5 Update Resources Page

**File:** `app/[locale]/resources/page.tsx`

```tsx
<AnimatedTitle
  text={dict.resources.title}
  slug="resources"
  className="text-4xl font-bold"
  as="h1"
/>
```

**Action:** Replace page title h1

---

### 3.6 Update Contact Page

**File:** `app/[locale]/contact/page.tsx`

```tsx
<AnimatedTitle
  text={dict.contact.title}
  slug="contact"
  className="text-4xl font-bold"
  as="h1"
/>
```

**Action:** Replace page title h1

---

### 3.7 Update Privacy Policy Page

**File:** `app/[locale]/privacy-policy/page.tsx`

```tsx
<AnimatedTitle
  text={dict.privacyPolicy.title}
  slug="privacy-policy"
  className="text-4xl font-bold"
  as="h1"
/>
```

**Action:** Replace page title h1

---

## Phase 4: Header Animation Replacement

### Current Header Animation Analysis

**Current Behavior:**
- Complex per-word measurement and collapse animation
- Collapses title to "BAISH" (first letters) based on:
  - Scroll position (> 100px)
  - Narrow viewports (< 480px)
  - Container overflow
- Uses:
  - `useState` for scroll/narrow/cramped states
  - `useRef` to measure word widths
  - `ResizeObserver` for overflow detection
  - RAF throttling for performance
  - CSS max-width transitions

**Issues:**
- ~150+ lines of complex JavaScript
- Multiple useEffect hooks
- Width measurements and recalculations
- Difficult to debug and maintain
- Performance overhead (even with RAF throttling)

### Proposed Simplification

**Option A: Keep Scroll Collapse, Add View Transitions**
- Maintain the scroll collapse behavior (it's good UX)
- Replace the title text with `AnimatedTitle` component
- View transitions handle page-to-page morphing
- Scroll animation remains as-is

**Option B: Simplify to CSS-Only Collapse** (Recommended)
- Remove JavaScript width measurements
- Use CSS media queries for responsive behavior
- Use CSS transform/scale for scroll collapse
- Add `AnimatedTitle` for view transitions
- Result: ~50 lines of code instead of 150+

**Option C: Full Transition Replacement**
- Remove scroll collapse entirely
- Full title always visible
- Rely on view transitions for visual interest
- Simplest code (~30 lines)

### Recommended Implementation (Option B)

**Simplified Header Code:**

```tsx
// Simplified header.tsx (key changes)
"use client";

import Image from "next/image";
import { TransitionLink } from "./transition-link";
import { AnimatedTitle } from "./animated-title";
import { useState, useEffect, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { withLocale, buildLangSwitchHref } from "@/app/utils/locale";
import "./header.css";

const MobileMenu = dynamic(() => import("./mobile-menu"), { ssr: false });

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

interface HeaderProps {
  locale: AppLocale;
  t: Dictionary["header"];
}

const HeaderComponent = ({ locale, t }: HeaderProps) => {
  const pathname = usePathname() ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasMenuBeenOpened, setHasMenuBeenOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Simple scroll handler
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => {
      const newValue = !prev;
      if (newValue) setHasMenuBeenOpened(true);
      return newValue;
    });
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinks = [
    { href: withLocale(locale, "/about"), label: t.nav.about },
    { href: withLocale(locale, "/activities"), label: t.nav.activities },
    { href: withLocale(locale, "/research"), label: t.nav.research },
    { href: withLocale(locale, "/resources"), label: t.nav.resources },
    { href: withLocale(locale, "/contact"), label: t.nav.contact },
  ];

  return (
    <header
      className="header-container sticky top-0 z-20 px-6 sm:px-10"
      data-scrolled={scrolled}
    >
      <div className="header-inner mx-auto border-slate-200" data-scrolled={scrolled}>
        <div className="flex items-center justify-between gap-6">
          {/* Logo + Title */}
          <TransitionLink
            href={withLocale(locale, "/")}
            className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity"
          >
            {/* Logo with transition name */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
              <Image
                src="/jacarandashield.png"
                alt="BAISH Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain site-logo"
                priority
                fetchPriority="high"
              />
            </div>

            {/* Animated Title - view transitions handle page-to-page morphing */}
            <AnimatedTitle
              text="Buenos Aires AI Safety Hub"
              slug="site-title"
              className={`
                font-semibold text-slate-900 transition-all duration-300
                ${scrolled ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}
              `}
              as="div"
            />
          </TransitionLink>

          {/* Desktop Navigation */}
          <nav className="header-nav hidden md:flex items-center text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <TransitionLink
                key={link.href}
                className="relative hover:text-slate-900 transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--color-accent-primary)] after:transition-all after:duration-300 hover:after:w-full"
                href={link.href}
              >
                {link.label}
              </TransitionLink>
            ))}
          </nav>

          {/* Language Switcher + CTA */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className={`rounded-full border border-slate-200 bg-white/70 p-1 transition-all duration-500 ${
                scrolled ? "hidden sm:flex" : "hidden md:flex"
              }`}
            >
              {LANGUAGES.map((lang) => {
                const active = lang.code === locale;
                return (
                  <TransitionLink
                    key={lang.code}
                    href={buildLangSwitchHref(pathname, lang.code)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[var(--color-accent-primary)] text-white shadow-sm pointer-events-none"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t.languages[lang.code]}
                  </TransitionLink>
                );
              })}
            </div>

            <a
              className="header-cta hidden sm:inline-flex rounded-full bg-[var(--color-accent-primary)] font-semibold text-white shadow-md hover:bg-[var(--color-accent-primary-hover)] whitespace-nowrap"
              data-scrolled={scrolled}
              href="#get-involved"
            >
              {t.cta}
            </a>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className="w-full h-0.5 bg-slate-900 transition-all duration-300"
                  style={{
                    transform: mobileMenuOpen ? "rotate(45deg) translateY(7px)" : "none",
                  }}
                />
                <span
                  className="w-full h-0.5 bg-slate-900 transition-all duration-300"
                  style={{ opacity: mobileMenuOpen ? 0 : 1 }}
                />
                <span
                  className="w-full h-0.5 bg-slate-900 transition-all duration-300"
                  style={{
                    transform: mobileMenuOpen ? "rotate(-45deg) translateY(-7px)" : "none",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {hasMenuBeenOpened && (
        <MobileMenu
          locale={locale}
          t={t}
          pathname={pathname}
          isOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
        />
      )}
    </header>
  );
};

export default memo(HeaderComponent);
```

**Benefits:**
- **-100 lines of code** (150 → 50)
- No width measurements
- No ResizeObserver
- No complex useRefs
- Simple scroll state only
- CSS handles responsive scaling
- AnimatedTitle handles view transitions
- Much easier to maintain

**CSS Updates:**

```css
/* header.css updates */
.header-container {
  transition: all 0.3s ease-out;
}

.header-container[data-scrolled="true"] {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive title scaling via media queries */
@media (max-width: 480px) {
  .header-container AnimatedTitle {
    font-size: 0.875rem;
  }
}
```

---

## Fastmod Bulk Replacement Commands

Fastmod is an interactive find-and-replace tool that shows each replacement for review.

### Install Fastmod

```bash
# macOS
brew install fastmod

# Or via cargo
cargo install fastmod
```

### Command 1: Replace Link Import Statements

```bash
# Navigate to project root
cd /Users/luca/dev/nextbaish

# Replace Link imports in component files
fastmod \
  --extensions tsx \
  --dir app/components \
  'import Link from "next/link"' \
  'import { TransitionLink } from "./transition-link"' \
  --accept-all
```

**Expected replacements:** header.tsx, mobile-menu.tsx, footer.tsx

### Command 2: Replace `<Link` with `<TransitionLink` in Components

```bash
# Replace opening Link tags
fastmod \
  --extensions tsx \
  --dir app/components \
  '<Link' \
  '<TransitionLink' \
  --accept-all
```

**Expected replacements:** ~15-20 instances across header, mobile-menu, footer

### Command 3: Replace `</Link>` with `</TransitionLink>` in Components

```bash
# Replace closing Link tags
fastmod \
  --extensions tsx \
  --dir app/components \
  '</Link>' \
  '</TransitionLink>' \
  --accept-all
```

**Expected replacements:** ~15-20 instances

### Command 4: Update Page Files (if they have Link breadcrumbs)

```bash
# Replace Link imports in page files
fastmod \
  --extensions tsx \
  --dir app/\[locale\] \
  'import Link from "next/link"' \
  'import { TransitionLink } from "@/app/components/transition-link"' \
  --accept-all

# Replace Link components in pages
fastmod \
  --extensions tsx \
  --dir app/\[locale\] \
  '<Link' \
  '<TransitionLink' \
  --accept-all

fastmod \
  --extensions tsx \
  --dir app/\[locale\] \
  '</Link>' \
  '</TransitionLink>' \
  --accept-all
```

### Manual Verification Steps

After running fastmod:

1. **Check imports:** Verify all `TransitionLink` imports are correct
2. **Check paths:** Components use `"./transition-link"`, pages use `"@/app/components/transition-link"`
3. **Test navigation:** Click through all nav links to ensure they work
4. **Check console:** No errors related to Link/TransitionLink
5. **Review git diff:** `git diff` to see all changes before committing

---

## Testing Strategy

### Functional Testing

**Browser Matrix:**
- ✅ Chrome 111+ (view transitions work)
- ✅ Safari 18+ (view transitions work)
- ✅ Firefox 144+ (view transitions work)
- ✅ Chrome 110 (graceful fallback - instant navigation)
- ✅ Safari 17 (graceful fallback)

**Test Checklist:**

1. **Navigation Works:**
   - [ ] All header nav links work
   - [ ] Footer nav links work
   - [ ] Mobile menu nav links work
   - [ ] Language switcher works (EN ↔ ES)
   - [ ] Breadcrumb links work (if any)
   - [ ] Logo link to home works

2. **Transitions Appear (Chrome 111+):**
   - [ ] Logo morphs smoothly between pages
   - [ ] Page titles animate word-by-word
   - [ ] No layout shifts during transition
   - [ ] No flickering or jarring effects
   - [ ] TimelineThreads background stays smooth

3. **Fallback Works (Chrome 110):**
   - [ ] Navigation still works (instant, no transition)
   - [ ] No JavaScript errors in console
   - [ ] No broken links

4. **Locale Routing:**
   - [ ] `/en/*` routes work
   - [ ] `/es/*` routes work
   - [ ] Language switcher maintains current page
   - [ ] Transitions work across both locales

5. **Mobile:**
   - [ ] Transitions work on mobile Safari
   - [ ] Performance is acceptable (no janky feel)
   - [ ] Mobile menu transitions work
   - [ ] Touch interactions work during transitions

6. **Accessibility:**
   - [ ] Keyboard navigation works
   - [ ] Focus is maintained during transitions
   - [ ] Screen reader announces page changes
   - [ ] `prefers-reduced-motion: reduce` skips transitions

### Performance Testing

**Metrics to Monitor:**

1. **Frame Rate:**
   - Target: 60fps during transitions
   - Tool: Chrome DevTools Performance panel
   - Action: Record transition, check for dropped frames

2. **Animation Duration:**
   - Logo: 0.2s
   - Page titles: 0.3s
   - Overall transition: ≤ 0.3s

3. **JavaScript Execution:**
   - Transition should not block main thread
   - No long tasks during transition

4. **Memory:**
   - Check for memory leaks (navigate 20+ times)
   - Tool: Chrome DevTools Memory panel

**Performance Test Commands:**

```bash
# Run production build
npm run build

# Start production server
npm run start

# Navigate to http://localhost:3000
# Open Chrome DevTools → Performance
# Record while navigating between pages
# Check for smooth 60fps line (green)
```

### Visual Testing

**Chrome DevTools Animations Panel:**

1. Open DevTools → More tools → Animations
2. Navigate between pages
3. Watch transition timeline
4. Verify smooth animation curve

**Slow Motion Testing:**

Add temporary CSS to slow down transitions:

```css
/* globals.css - temporary for debugging */
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 3s !important;
}
```

This makes it easy to see exactly what's animating.

---

## Performance Considerations

### Key Optimizations

1. **Limit Transition Names:**
   - Only logo and page titles get transition names
   - Avoid giving every element a transition name
   - Use `view-transition-class` for grouped animations

2. **Short Durations:**
   - Logo: 0.2s (snappy)
   - Titles: 0.3s (smooth but not sluggish)
   - Never exceed 0.5s

3. **RAF Throttling:**
   - Simplified header removes most JavaScript
   - Remaining scroll handler uses RAF

4. **Mobile Optimization:**
   - Consider disabling per-word animations on mobile
   - Detect via `window.matchMedia('(max-width: 768px)')`
   - Fallback to simpler crossfade

5. **Reduced Motion:**
   - CSS media query: `@media (prefers-reduced-motion: reduce)`
   - Set animation-duration to 0.01ms
   - Browsers automatically handle this for view transitions

### Monitoring

```javascript
// Optional: Log transition performance
document.startViewTransition(() => {
  const start = performance.now();
  router.push(href.toString());

  // Log duration after transition completes
  requestAnimationFrame(() => {
    const end = performance.now();
    console.log(`Transition took ${end - start}ms`);
  });
});
```

---

## Accessibility Considerations

### View Transitions and A11y

**Good News:**
- View Transitions API respects `prefers-reduced-motion` automatically
- Browser handles most accessibility concerns
- No custom JavaScript animation timing to manage

**Best Practices:**

1. **Focus Management:**
   - Focus should move to new page content
   - Test with keyboard-only navigation
   - Ensure focus isn't lost during transition

2. **Screen Readers:**
   - Test with VoiceOver (macOS) or NVDA (Windows)
   - Ensure page title change is announced
   - No duplicate announcements

3. **Keyboard Navigation:**
   - All links accessible via Tab
   - Enter key triggers transition
   - No keyboard traps during transition

4. **Color Contrast:**
   - Ensure transition doesn't reduce contrast
   - Logo remains visible during morph

5. **Motion Preferences:**
   - Already handled via CSS media query
   - Test by enabling "Reduce motion" in OS settings

**Testing Commands:**

```bash
# macOS - Enable Reduce Motion
# System Settings → Accessibility → Display → Reduce motion

# Then test navigation - transitions should be instant
```

---

## Troubleshooting Guide

### Issue: Transitions Don't Appear

**Symptoms:** Clicking links navigates instantly, no animation

**Possible Causes:**
1. Browser doesn't support View Transitions API
2. `document.startViewTransition` is undefined
3. JavaScript error preventing transition

**Solutions:**
```javascript
// Add console logging to TransitionLink
const handleTransition = (e) => {
  e.preventDefault();

  console.log('Transition triggered');
  console.log('startViewTransition support:', !!document.startViewTransition);

  if (!document.startViewTransition) {
    console.log('Fallback: instant navigation');
    router.push(href.toString());
    return;
  }

  document.startViewTransition(() => {
    console.log('View transition started');
    router.push(href.toString());
  });
};
```

Check console for logs.

---

### Issue: Elements Don't Morph Smoothly

**Symptoms:** Logo or title jumps instead of morphing

**Possible Causes:**
1. `view-transition-name` not matching between pages
2. Element doesn't exist on both pages
3. Conflicting transition names

**Solutions:**
1. Verify logo has `.site-logo` class on all pages
2. Check console for view transition warnings
3. Ensure AnimatedTitle slug is consistent

**Debug CSS:**
```css
/* Highlight elements with transition names */
[style*="view-transition-name"] {
  outline: 2px solid red !important;
}
```

---

### Issue: Layout Shift During Transition

**Symptoms:** Page jumps or content shifts during animation

**Possible Causes:**
1. Inconsistent padding/margins between pages
2. Fonts loading during transition
3. Images loading during transition

**Solutions:**
1. Ensure consistent layout structure
2. Preload fonts (already done via Geist)
3. Use `priority` prop on critical images
4. Add this CSS:

```css
body:active-view-transition {
  overflow: hidden; /* Prevent scroll during transition */
}
```

---

### Issue: Janky Performance on Mobile

**Symptoms:** Choppy animations, dropped frames

**Possible Causes:**
1. Too many animated elements
2. Transition duration too long
3. Low-end device

**Solutions:**
1. Reduce number of AnimatedTitle words on mobile:

```tsx
// Conditional per-word animation
const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

{isMobile ? (
  <h1>{text}</h1> // Simple text, no per-word animation
) : (
  <AnimatedTitle text={text} slug={slug} />
)}
```

2. Shorten duration for mobile:

```css
@media (max-width: 768px) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.15s !important;
  }
}
```

---

### Issue: TypeScript Errors

**Symptoms:** `Property 'startViewTransition' does not exist on type 'Document'`

**Solution:** Ensure `types/view-transitions.d.ts` exists and is in `tsconfig.json`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  },
  "include": ["types/**/*.d.ts", "app/**/*.ts", "app/**/*.tsx"]
}
```

---

### Issue: Navigation Doesn't Work

**Symptoms:** Clicking links does nothing

**Possible Causes:**
1. `e.preventDefault()` without router.push fallback
2. TransitionLink import error
3. JavaScript error in handleTransition

**Solution:**
Check console for errors. Verify TransitionLink is exported and imported correctly:

```tsx
// transition-link.tsx
export function TransitionLink({ ... }) { ... }  // Named export

// header.tsx
import { TransitionLink } from "./transition-link";  // Named import
```

---

## Next Steps

### Implementation Order

1. ✅ Phase 1: Foundation
   - Create TypeScript types
   - Create TransitionLink component
   - Create AnimatedTitle component
   - Update globals.css

2. ✅ Phase 2: Navigation Components
   - Run fastmod commands
   - Manual verification
   - Test navigation works

3. ✅ Phase 3: Page Titles
   - Update each page with AnimatedTitle
   - Test per-word transitions

4. ✅ Phase 4: Header Simplification
   - Simplify header.tsx
   - Remove complex scroll animation
   - Test responsive behavior

5. ✅ Testing & Validation
   - Functional testing
   - Performance testing
   - Accessibility testing
   - Cross-browser testing

6. ✅ Production Build
   - Run `npm run build`
   - Fix any build errors
   - Test production server
   - Deploy

### Post-Implementation

**Monitor:**
- User feedback on transitions
- Performance metrics (Core Web Vitals)
- Browser console errors (error tracking)

**Future Enhancements:**
- Card → Detail transitions (if implementing detail pages)
- View transition types for different navigation contexts
- Custom animations for specific routes

---

## Resources

- [View Transitions API Guide](./view-transitions-guide.md) - Comprehensive guide
- [Chrome for Developers - View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [MDN - View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [View Transitions Demos](https://view-transitions.chrome.dev/) - Live examples
- [Interop 2025](https://web.dev/blog/interop-2025) - Browser support status

---

## Appendix: Code Examples

### Full TransitionLink with Types Support

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link> & {
  transitionType?: string[]; // Optional: for view transition types
  disableTransition?: boolean; // Optional: disable transition for specific links
};

export function TransitionLink({
  href,
  children,
  transitionType,
  disableTransition = false,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Skip transition if disabled
    if (disableTransition || !document.startViewTransition) {
      router.push(href.toString());
      return;
    }

    // Use types if provided (Chrome 125+)
    if (transitionType && transitionType.length > 0) {
      document.startViewTransition({
        update: () => router.push(href.toString()),
        types: transitionType,
      });
    } else {
      // Standard transition
      document.startViewTransition(() => {
        router.push(href.toString());
      });
    }
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
```

### AnimatedTitle with Mobile Optimization

```tsx
"use client";

import { useEffect, useState } from "react";

interface AnimatedTitleProps {
  text: string;
  slug: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  disableOnMobile?: boolean;
}

export function AnimatedTitle({
  text,
  slug,
  className = "",
  as: Component = "h1",
  disableOnMobile = true,
}: AnimatedTitleProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (disableOnMobile) {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [disableOnMobile]);

  // On mobile, render simple text (no per-word animation)
  if (isMobile && disableOnMobile) {
    return <Component className={className}>{text}</Component>;
  }

  // Desktop: per-word animation
  const words = text.split(" ");

  return (
    <Component className={className}>
      {words.map((word, index) => (
        <span
          key={`${slug}-word-${index}`}
          style={{
            // @ts-ignore
            "--view-transition-name": `${slug}___${word.toLowerCase()}___${index}`,
            viewTransitionName: `var(--view-transition-name)`,
          }}
        >
          {word}
          {index < words.length - 1 && " "}
        </span>
      ))}
    </Component>
  );
}
```

---

**End of Implementation Plan**

*Ready to implement? Start with Phase 1 and work through each phase sequentially.*
