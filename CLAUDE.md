# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🗺️ Quick Navigation

**New to this repo?** Start here:
1. 📖 **[Project Overview](#project-overview)** - What this project is
2. 🏗️ **[Directory Structure](#directory-structure)** - Where everything lives
3. 🎨 **[Key Features](#key-features)** - Major functionality
4. 📊 **[Performance](#performance-optimizations)** - Recent optimizations (84/100 desktop, 94/100 mobile)
5. 🌍 **[Internationalization](#internationalization-i18n)** - Bilingual system (EN/ES)
6. 🎯 **[Common Tasks](#common-development-tasks)** - Quick recipes

**Looking for specific info?**
- 🔧 **Development Commands:** `npm run dev`, `npm run build`, `npm run analyze`
- 📁 **Components:** `app/components/` - All React components
- 🌐 **Pages:** `app/[locale]/*/page.tsx` - All routes
- 🎨 **Styles:** `app/globals.css` - Tailwind + custom properties
- 🧪 **Testing:** Lighthouse CI in `.github/workflows/lighthouse-ci.yml`

**Performance Highlights:**
- ✅ **Desktop:** 84/100 (Lighthouse) - TBT: 10ms, CLS: 0.000
- ✅ **Mobile:** 94/100 (Lighthouse) - Speed Index: 1.2s
- ✅ **React Compiler:** Enabled (zero manual memoization)
- ✅ **Virtualization:** Resources page (50+ cards → 12 rendered)
- ✅ **Code Splitting:** 6 components dynamically imported

---

## Development Commands

### Core Commands
- `bun install` - Install dependencies
- `bun run dev` (or `bun dev`) - Start Turbopack dev server at http://localhost:3000 with hot reload (keep this running during development)
- `bun run build` - Compile production bundle (run before opening PRs that touch build paths)
- `bun run start` - Run optimized production server from last build

### Server Management
- `bun run restart:dev` - Kill any running server on port 3000 and restart dev server (useful after config changes)
- `bun run restart:prod` - Kill any running server, rebuild, and start production server

### Performance & Optimization
- `bun run analyze` - Generate bundle analysis reports (requires webpack build, creates `.next/analyze/*.html`)
- `bun run optimize-logo` - Generate optimized logo variants (WebP, AVIF, PNG in multiple sizes)
- `bun run optimize-images` - Batch optimize all images to WebP/AVIF with responsive sizes

### Code Quality
- `bun run lint` - Run ESLint on all files (0 errors, 0 warnings)
- `bun run lint:fix` - Auto-fix fixable linting issues
- `bunx tsc --noEmit` - Run TypeScript type checking

**Notes:**
- Dev server should remain running at port 3000 during active development
- Bundle analyzer requires `ANALYZE=true` environment variable (set automatically by script)
- View bundle reports at `.next/analyze/client.html`, `nodejs.html`, and `edge.html`
- ESLint config: `eslint.config.mjs` (ESLint v9 flat config format)

## Project Overview

This is a **bilingual AI Safety content hub** (BAISH - Buenos Aires AI Safety Hub) built with Next.js 16, featuring 7 pages with AI safety resources, research, events, and educational content in English and Spanish.

**Project Scale:**
- 7 full pages with bilingual content
- 50+ curated AI safety learning resources with progress tracking
- Research project showcase with category filtering
- Events calendar with lu.ma integration
- Newsletter subscription via Substack
- Contact page with FAQ accordion

**Current Performance:**
- Desktop: **84/100** (Lighthouse) - LCP: 2.6s, TBT: 10ms, CLS: 0.000
- Mobile: **94/100** (Lighthouse) - LCP: 3.1s, TBT: 20ms, CLS: 0.002
- Resources page: **79/100** (desktop) with virtualization (50+ cards → 12 rendered)

## Project Architecture

Next.js 16 app using App Router with Turbopack, React 19, TypeScript, and Tailwind CSS v4.

**Key Technologies:**
- **React Compiler:** Enabled for automatic memoization (zero manual memoization needed)
- **SWC Minification:** Default in Next.js 16 (17x faster than Terser)
- **Virtual Scrolling:** @tanstack/react-virtual for resources page
- **View Transitions:** next-view-transitions for smooth page transitions
- **Bundle Analyzer:** @next/bundle-analyzer for optimization monitoring

### Directory Structure

```
app/
├── [locale]/                    # Internationalized routes (en/es)
│   ├── page.tsx                 # Home page
│   ├── about/page.tsx           # About page
│   ├── activities/page.tsx      # Events & activities
│   ├── research/page.tsx        # Research projects showcase
│   ├── resources/page.tsx       # Learning resources library
│   ├── contact/page.tsx         # Contact + FAQ
│   ├── privacy-policy/page.tsx  # Privacy policy
│   ├── layout.tsx               # Locale-specific layout
│   └── dictionaries/            # Translation files
│       ├── en.json              # English translations
│       ├── es.json              # Spanish translations
│       └── dictionaries.ts      # Dictionary loader
├── components/                  # React components
│   ├── timeline-threads.tsx     # Animated SVG background (60fps, web worker)
│   ├── timeline-threads-loader.tsx # LCP-deferred timeline loader
│   ├── animated-title.tsx       # View transitions title (per-word animations)
│   ├── transition-link.tsx      # View transitions link wrapper
│   ├── fade-in-section.tsx      # Scroll-triggered fade-in (IntersectionObserver)
│   ├── header.tsx               # Main navigation
│   ├── header.css               # Header-specific styles
│   ├── mobile-menu.tsx          # Mobile navigation (portal-based)
│   ├── footer.tsx               # Site footer
│   ├── substack-signup.tsx      # Newsletter subscription (dynamic import)
│   ├── calendar-section.tsx     # lu.ma calendar embed (lazy loaded)
│   ├── airtable-embed.tsx       # Airtable integration (IntersectionObserver lazy load)
│   ├── research-filters.tsx     # Category filter buttons
│   ├── faq-accordion.tsx        # Reusable accordion (dynamic import on contact page)
│   ├── events-carousel.tsx      # Auto-scrolling gallery (dynamic import on activities)
│   └── rum-monitor.tsx          # Real User Monitoring (Core Web Vitals)
├── hooks/
│   ├── use-fade-in.ts           # Intersection observer hook
│   ├── use-isomorphic-layout-effect.ts  # SSR-safe useLayoutEffect
│   ├── use-lcp-complete.ts      # LCP detection hook
│   └── use-local-storage.ts     # SSR-safe localStorage hook
├── contexts/
│   └── language-context.tsx     # i18n context provider
├── utils/
│   ├── locale.ts                # Locale utilities
│   ├── thread-utils.ts          # Timeline animation utilities
│   └── footnotes.tsx            # Footnote rendering system
├── types/
│   └── resources.ts             # Resource type definitions
├── data/
│   └── resources.ts             # 50+ AI safety learning resources
├── workers/
│   └── thread-generator.worker.ts  # Background thread generation
├── head.tsx                     # Resource hints component
├── globals.css                  # Tailwind + CSS custom properties
└── layout.tsx                   # Root layout (redirects to locale)

public/
├── images/
│   ├── logos/                   # Optimized logo variants (40-192px)
│   ├── optimized/               # Batch-optimized images
│   └── events/                  # Event gallery images
└── icons/                       # Favicon variants

scripts/
├── optimize-logo.js             # Logo optimization script
└── optimize-images.js           # Batch image optimization

docs/
├── view-transitions-guide.md
└── view-transitions-implementation-plan.md

.github/
└── workflows/
    └── lighthouse-ci.yml        # Automated Lighthouse CI (mobile + desktop)

Root Documentation:
├── README.md                    # Project README (comprehensive)
├── CLAUDE.md                    # This file (AI assistant guidance)
├── lighthouserc.json            # Lighthouse CI config (mobile)
└── lighthouserc-desktop.json   # Lighthouse CI config (desktop)
```

### Pages Overview

1. **`/[locale]/page.tsx`** - Homepage
   - Hero section with animated title
   - Mission statement and value proposition
   - Timeline threads animated background
   - Newsletter signup (Substack)

2. **`/[locale]/about/page.tsx`** - About page
   - Team information
   - Organization mission and values
   - Background and context

3. **`/[locale]/activities/page.tsx`** - Events & activities
   - Three activity sections: AGI Safety, AIS Workshop, Paper Reading Group
   - lu.ma calendar embed for upcoming events
   - Events carousel (6 gallery images with auto-scroll)
   - Google Calendar subscription link

4. **`/[locale]/research/page.tsx`** - Research projects
   - Category filtering: interpretability, alignment, robustness, value-learning
   - Research project cards with title, year, researchers, abstract
   - Structured data for future expansion

5. **`/[locale]/resources/page.tsx`** (CLIENT COMPONENT)
   - 50+ AI safety learning resources from `app/data/resources.ts`
   - Multi-dimensional filtering:
     - Difficulty: beginner, intermediate, advanced
     - Type: video, paper, course, article, wiki, book
     - Topic: alignment, interpretability, robustness, governance, general
   - Progress tracking via localStorage (completed resources)
   - Special sections:
     - "Quick wins" (<30min resources)
     - "Community picks" (featured resources)
     - "Latest additions" (new resources)
   - Airtable embed for timeline view
   - Fully bilingual with Spanish translations

6. **`/[locale]/contact/page.tsx`** - Contact information
   - Contact methods: Telegram, Email, LinkedIn
   - FAQ accordion with template variables
   - Structured contact cards with CTAs

7. **`/[locale]/privacy-policy/page.tsx`** - Privacy policy
   - Simple informational page

### Component Architecture

**Core UI Components:**

- **`TimelineThreads.tsx`** - Animated SVG background
  - 60fps morphing thread animation
  - Float32Array for memory efficiency
  - Web worker offloading via `thread-generator.worker.ts`
  - IntersectionObserver for battery optimization
  - Deferred until after LCP

- **`AnimatedTitle.tsx`** - View transitions title animation
  - Per-word transition effects (first 5 words only)
  - Uses `next-view-transitions` library
  - Memoized for performance

- **`TransitionLink.tsx`** - View transitions wrapper for Next.js Link
  - Enables smooth page transitions
  - Progressive enhancement (fallback for unsupported browsers)

- **`FadeInSection.tsx`** - Scroll-triggered fade-in animations
  - IntersectionObserver-based
  - Optional `startVisible` prop for above-fold content (LCP optimization)

- **`Header.tsx`** - Main navigation with logo and language switcher
  - Responsive design with mobile menu
  - Scroll-based logo size animation
  - Uses `useIsomorphicLayoutEffect` to prevent CLS
  - View transitions integration

- **`MobileMenu.tsx`** - Mobile navigation drawer
  - Hamburger menu with slide-in animation
  - Locale-aware navigation links

- **`Footer.tsx`** - Site footer with links and branding

**Feature Components:**

- **`SubstackSignup.tsx`** - Newsletter subscription form
  - Submits to Substack API
  - Form validation and error handling
  - States: idle, loading, success, error
  - 10-second timeout with AbortController

- **`CalendarSection.tsx`** - lu.ma calendar embed
  - Lazy loading with IntersectionObserver (200px rootMargin)
  - Calendar ID: `cal-0oFAsTn5vpwcAwb`
  - Only loads when visible (performance optimization)

- **`AirtableEmbed.tsx`** - Airtable embed wrapper
  - Configurable: shareId, appId, tableId, viewId
  - Loading state indicator
  - Responsive dimensions

- **`ResearchFilters.tsx`** - Category filter buttons
  - Filter categories: all, interpretability, alignment, robustness, value-learning
  - Active state styling with primary brand color
  - Responsive button grid

- **`FAQAccordion.tsx`** - Reusable accordion component
  - Template variable replacement: `{resourcesLink}`, `{email}`
  - Single open state (only one item expanded at a time)
  - Locale-aware with `withLocale` utility

- **`EventsCarousel.tsx`** - Infinite auto-scrolling carousel
  - Image gallery with smooth scroll
  - Triple-image pattern for seamless infinite loop
  - Manual scroll controls (left/right buttons)
  - Respects `prefers-reduced-motion`
  - Auto-pause on hover

### Hooks

- **`use-fade-in.ts`** - IntersectionObserver hook for fade-in animations
  - Optional `startVisible` prop for above-fold content
  - Returns `isVisible` and `ref` for attaching to elements

- **`use-isomorphic-layout-effect.ts`** - SSR-safe useLayoutEffect
  - Uses `useLayoutEffect` on client, `useEffect` on server
  - Critical for preventing CLS when measuring DOM elements
  - Used in Header component for logo sizing

- **`use-lcp-complete.ts`** - Detects when LCP is complete
  - Uses PerformanceObserver API
  - Returns boolean indicating LCP completion
  - Used to defer Timeline animation until after LCP

- **`use-local-storage.ts`** - SSR-safe localStorage hook
  - JSON serialization/deserialization
  - Type-safe with TypeScript generics
  - Used for resource completion tracking

### Utilities

- **`utils/locale.ts`** - Locale utilities
  - `withLocale(locale, path)` - Prefix path with locale
  - `buildLangSwitchHref(pathname, newLocale)` - Language switcher helper
  - `isAppLocale(locale)` - Type guard for AppLocale

- **`utils/thread-utils.ts`** - Timeline animation utilities
  - Mathematical functions for thread morphing
  - Shared between main thread and web worker

- **`utils/footnotes.tsx`** - Footnote rendering system
  - Pattern: `{footnote1}`, `{footnote2}`, etc. in strings
  - 6 built-in footnotes linking to AI safety resources
  - Renders as superscript links
  - Supports custom footnotes via optional parameter

### Data Management

**`app/data/resources.ts`** - AI Safety Resources Database

Structure:
- 50+ learning resources with bilingual metadata
- Each resource has:
  - `id`: unique identifier
  - `title`: English/Spanish titles
  - `description`: English/Spanish descriptions
  - `type`: video | paper | course | article | wiki | book
  - `topic`: alignment | interpretability | robustness | governance | general
  - `difficulty`: beginner | intermediate | advanced
  - `timeToComplete`: estimated time (e.g., "30 min", "2 hours")
  - `link`: external URL
  - `isNew`: boolean flag for "Latest additions"

Icon mappings:
- Video: 🎥, Paper: 📄, Course: 🎓, Article: 📰, Wiki: 📚, Book: 📖

Difficulty colors:
- Beginner: green, Intermediate: orange, Advanced: red

**Type Definitions** (`app/types/resources.ts`):
```typescript
export type ResourceType = "video" | "paper" | "course" | "article" | "wiki" | "book";
export type ResourceTopic = "alignment" | "interpretability" | "robustness" | "governance" | "general";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Resource {
  id: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  type: ResourceType;
  topic: ResourceTopic;
  difficulty: DifficultyLevel;
  timeToComplete: string;
  link: string;
  isNew?: boolean;
}
```

### Web Workers

**`workers/thread-generator.worker.ts`** - Timeline Animation Worker

- Generates thread data in background thread
- Prevents blocking main thread during animation calculations
- Contains `WorkerThreadData` type with animation parameters
- Uses seeded random number generation for deterministic results

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Strict mode enabled
- Target: ES2017
- Incremental compilation enabled
- Module resolution: bundler

### Styling

**Tailwind CSS v4 via PostCSS**
- No separate `tailwind.config.ts` file
- Theming via CSS custom properties in `app/globals.css`
- Plugin: `@tailwindcss/postcss`

**Color Palette** (defined in `globals.css`):
- Primary: `#9275E5` (purple) - `--color-accent-primary`
- Secondary: `#A8C5FF` (purple-blue) - `--color-accent-secondary`
- Tertiary: `#C77DDA` (purple-pink) - `--color-accent-tertiary`
- Brand scale: `--brand-50` through `--brand-600`
- Semantic colors: success, error, warning

**Component Classes:**
- `.card-glass` - Frosted glass effect with backdrop blur
- `.card-eyebrow` - Small uppercase label text
- `.card-title` - Card heading text
- `.card-body` - Card body text
- `.button-primary` - Primary CTA button
- `.button-secondary` - Secondary button
- `.button-outline` - Outline button
- `.pill` - Badge/tag styling

**Global Animations:**
- `@keyframes fade-in` - 480ms cubic-bezier easing
- Used throughout for entrance animations

**Performance CSS:**
- `content-visibility: auto` on `.card-glass`, `.resource-card`
- `contain: layout style` on sections and main
- `will-change: transform` for animated elements
- GPU acceleration via `transform: translateZ(0)`
- Backdrop filter blur for frosted glass

**Component Styles:**
- Colocated with components (e.g., `header.css`)
- Light theme enforced (overrides dark mode preference)

### Internationalization (i18n)

**System Overview:**
Dictionary-based i18n with server-side translation loading for English and Spanish.

**Routes:**
- `/en/*` - English
- `/es/*` - Spanish

**Language Context:**
- Provider: `LanguageProvider` in `app/contexts/language-context.tsx`
- Hooks: `useLocale()` returns current locale, `useDict()` returns dictionary
- Server-side: `getDictionary(locale)` loads translations
- Client-side: Context provides dict to `"use client"` components

**Dictionary Structure:**
Both `en.json` and `es.json` contain:
- `home` - Homepage content
- `about` - About page
- `activities` - Activities/events page
  - `agiSafety`, `aisWorkshop`, `paperReading` sections
  - `gallery`, `common` (Duration, Date, Location), `breadcrumb`
- `research` - Research page
  - `filterLabels`, `projectsTitle`, `linkPlaceholder`
- `resources` - Resources page
  - `filterLabels`, `filterByLabel`, `pathwayLabels`, `quickWins`, `communityPicks`
- `contact` - Contact page
  - `breadcrumb`, `title`, `description`, `contactMethods`, `faqs`
- `privacyPolicy` - Privacy policy
- `substack` - Newsletter signup translations
- `header` - Navigation menu
- `footer` - Footer links and text

**How to Add New Translations:**

1. **Add to both dictionary files** (en.json and es.json):
```json
// en.json
{
  "pageName": {
    "sectionName": {
      "key": "English text here"
    }
  }
}

// es.json
{
  "pageName": {
    "sectionName": {
      "key": "Texto en español aquí"
    }
  }
}
```

2. **Use in Server Components** (pages):
```tsx
import { getDictionary } from "./dictionaries";
import type { AppLocale } from "@/i18n.config";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.pageName; // Access your page's translations

  return (
    <div>
      <h1>{t.sectionName.key}</h1>
    </div>
  );
}
```

3. **Use in Client Components** (with context):
```tsx
"use client";
import { useLocale, useDict } from "@/app/contexts/language-context";

export default function Component() {
  const locale = useLocale();
  const dict = useDict();

  return <h1>{dict.pageName.sectionName.key}</h1>;
}
```

**CRITICAL RULES:**

❌ **NEVER use inline ternary translations:**
```tsx
// WRONG - Do not do this!
{isEnglish ? "Click here" : "Haz clic aquí"}
{locale === "en" ? "Welcome" : "Bienvenido"}
```

✅ **ALWAYS use dictionary references:**
```tsx
// CORRECT - Always do this!
{dict.pageName.clickHere}
{t.welcome}
```

**Template Variables:**

For dynamic content, use placeholders in dictionaries:
```json
// en.json
{
  "showing": "Showing {count} of {total} resources"
}

// es.json
{
  "showing": "Mostrando {count} de {total} recursos"
}
```

Then replace in code:
```tsx
const text = dict.showing
  .replace("{count}", filteredResources.length.toString())
  .replace("{total}", allResources.length.toString());
```

**FAQ Template Variables:**
The FAQ accordion supports special template variables that are automatically converted to clickable links:
- `{resourcesLink}` - Replaced with link to resources page
- `{email}` - Replaced with mailto link

Example in dictionary:
```json
{
  "faqs": [
    {
      "question": "How do I get started?",
      "answer": "Check out our {resourcesLink} or email us at {email}."
    }
  ]
}
```

**Shared Labels:**

For repeated labels (Duration:, Date:, Location:, etc.), use a `common` section:
```json
{
  "pageName": {
    "common": {
      "duration": "Duration:",
      "location": "Location:",
      "date": "Date:"
    }
  }
}
```

**Array Translations:**

For lists of items:
```json
{
  "items": [
    "First item",
    "Second item",
    "Third item"
  ]
}
```

Use with `.map()`:
```tsx
{dict.items.map((item, idx) => (
  <li key={idx}>{item}</li>
))}
```

**Before Committing:**

1. Verify all pages still build: `npm run build`
2. Check both dictionary files have matching structure
3. Test both English (`/en/page`) and Spanish (`/es/page`) routes
4. No inline ternary translations should exist in any page component

### Third-Party Integrations

**Substack API** - Newsletter subscription
- Endpoint: `https://substackapi.com/api/subscribe`
- Integration: `SubstackSignup.tsx` component
- Form validation and error handling
- 10-second timeout with AbortController

**lu.ma Calendar** - Event calendar embed
- Calendar ID: `cal-0oFAsTn5vpwcAwb`
- Integration: `CalendarSection.tsx` component
- Lazy loading with IntersectionObserver
- Only loads when component is visible

**Airtable** - Database/timeline embeds
- Integration: `AirtableEmbed.tsx` component
- Used in resources page for timeline view
- Configurable: shareId, appId, tableId, viewId

**Vercel Analytics & Speed Insights**
- Built-in monitoring for production
- Dependencies: `@vercel/analytics`, `@vercel/speed-insights`
- Automatically enabled in production

### Performance Optimizations

#### Timeline Animation (60fps)
- **SVG-based rendering**: RAF throttling and precomputed invariants (pivot damping, segment factors)
- **Memory efficiency**: Float32Array for point storage instead of object arrays (reduces allocations from ~2000/sec to ~30/sec)
- **Web worker offloading**: Thread generation in `thread-generator.worker.ts`
- **Optimized parameters**: 30 threads × 15 segments, skip transition calculations when complete
- **GPU acceleration**: CSS filters, will-change hints, and containment for smooth rendering
- **Battery optimization**: IntersectionObserver pauses animation when component is off-screen
- **LCP deferral**: Timeline deferred until after LCP using `useLcpComplete` hook with PerformanceObserver API

#### Core Web Vitals Optimizations (Desktop: 59→81, Mobile: 96→97)

**Cumulative Layout Shift (CLS): 0.963 → 0.000** 🎯
- **useLayoutEffect for measurements**: Use `useIsomorphicLayoutEffect` hook instead of `useEffect` when measuring DOM elements
  - Measurements happen synchronously BEFORE browser paint, preventing visible layout shifts
  - Hook: `app/hooks/use-isomorphic-layout-effect.ts`
  - Applied in: `app/components/header.tsx:76`
- **CSS containment**: Add `contain: layout` to isolate layout calculations
  - Prevents layout thrashing and improves rendering performance
  - Applied to: `.header-inner`, `.title-words`, sections, main
- **Reserved dimensions**: Set `minWidth` dynamically to prevent container collapse
  - Example: `minWidth: scrolled ? '60px' : '220px'` with smooth transitions
- **Key Learning**: Never use `useEffect` for DOM measurements that affect layout - always use `useLayoutEffect`

**Largest Contentful Paint (LCP): 2.6s → ~2.1s** 🎯
- **Hero visibility optimization**: Set critical above-fold content to `startVisible={true}` to eliminate fade-in delay
  - Hook: `app/hooks/use-fade-in.ts` with `startVisible` option
  - Component: `app/components/fade-in-section.tsx`
- **Resource hints**: Move DNS prefetch/preconnect to server-side rendering in `app/head.tsx`
  - Eliminates client-side delay in establishing third-party connections
- **Font optimizations**:
  - `adjustFontFallback: true` reduces layout shift during font swap
  - `display: "swap"` for all fonts with proper fallbacks
  - `preload: true` only for critical fonts (IBM Plex Serif, Geist Sans)
- **Critical CSS**:
  - `text-rendering: optimizeSpeed` for body and headings
  - `min-height` and `contain: layout` on hero section
  - Content visibility hints for h1 elements
- **Component memoization**: Wrap expensive components with `React.memo()` to prevent re-renders
  - Applied to: `AnimatedTitle` component
- **Key Learning**: For text-based LCP, focus on font loading, visibility delays, and critical CSS

**Image Optimization Scripts**
- **Logo optimization**: `npm run optimize-logo`
  - Reduces 1.9MB PNG to 2KB WebP (99.9% reduction)
  - Generates 4 sizes (40px, 80px, 120px, 192px) in WebP, AVIF, and PNG
  - Output: `public/images/logos/`
  - Script: `scripts/optimize-logo.js`
- **Batch image optimization**: `npm run optimize-images`
  - Optimizes all photos and assets to WebP/AVIF
  - 80.6% average bandwidth reduction (1,343KB → 260KB)
  - Generates responsive sizes for different viewports
  - Output: `public/images/optimized/`
  - Script: `scripts/optimize-images.js`
- **Image component best practices**:
  - Use explicit `width` and `height` instead of `fill` for better CLS
  - Add `sizes` attribute for responsive loading: `sizes="(max-width: 768px) 100vw, 800px"`
  - Use `priority` and `fetchPriority="high"` for LCP images
  - Use `loading="lazy"` for below-fold images
- **Key Learning**: Always optimize images at build time, never rely on runtime optimization alone

**Content Visibility** (`app/globals.css`)
- **content-visibility: auto**: Applied to cards and off-screen sections
  - Defers rendering of off-screen content
  - Reduces initial render time and memory usage
  - Applied to: `.card-glass`, `article.card-glass`, `.resource-card`
- **contain-intrinsic-size**: Prevents layout shifts when content enters/exits viewport
  - Example: `contain-intrinsic-size: 0 300px`
- **CSS containment**: `contain: layout style` on sections and main
  - Isolates style and layout calculations
  - Prevents parent contamination
- **Key Learning**: content-visibility is free performance - use it on any component that might be off-screen

**View Transitions Performance**
- **Limit animated elements**: Only animate first 5 words in `AnimatedTitle` component
  - Reduces DOM complexity and CSS overhead
  - Constant: `MAX_ANIMATED_WORDS = 5` in `app/components/animated-title.tsx`
- **Browser support**: Chrome 85+, Edge 85+, Safari 17.4+
  - Progressive enhancement with graceful fallback
- **Package**: `next-view-transitions` (^0.3.4)
- **Key Learning**: View transitions are expensive - limit them to essential elements only

**Lazy Loading Patterns**
- **CalendarSection**: IntersectionObserver with 200px rootMargin
  - Only loads lu.ma embed when component is near viewport
- **EventsCarousel**: Respects `prefers-reduced-motion`
  - Pauses auto-scroll on hover
- **AirtableEmbed**: Shows loading state while iframe loads

**localStorage Optimization**
- Resources page tracks completion state in localStorage
- SSR-safe implementation via `use-local-storage.ts` hook
- JSON serialization for complex data structures

#### Performance Testing

**Lighthouse CI Integration**
- Test with: `mcp__lighthouse__run_audit` for both desktop and mobile
- Target scores: Desktop 90+, Mobile 95+
- Monitor: CLS (<0.1), LCP (<2.5s), TBT (<200ms), FCP (<1.0s)

**Key Performance Metrics Achieved**:
- Desktop Performance: 59 → 81 (+22 points)
- Mobile Performance: 96 → 97 (+1 point)
- Desktop CLS: 0.963 → 0.000 (perfect)
- Mobile CLS: 0.00018 → 0.001 (excellent)
- LCP: 2.6s → ~2.1s (-500ms)
- Total Blocking Time: 10ms (excellent)

#### Critical Performance Rules

1. **Layout Measurements**: Always use `useLayoutEffect`, never `useEffect`
2. **Image Optimization**: Run optimization scripts before deploying new images
3. **Above-Fold Content**: Critical content should be visible immediately (no fade-in delays)
4. **Resource Hints**: Preconnect/DNS-prefetch should be server-rendered
5. **CSS Containment**: Use `contain: layout` on components that don't affect siblings
6. **Content Visibility**: Apply to any content that might be off-screen
7. **Font Loading**: Use `display: swap` + `adjustFontFallback` to prevent FOIT/FOUT
8. **Component Memoization**: Memoize expensive components to prevent re-renders during initial load
9. **Lazy Loading**: Use IntersectionObserver for embeds and heavy components
10. **Web Workers**: Offload heavy calculations to background threads

### Advanced Features

#### View Transitions API

For implementing smooth, native-app-like page transitions using the View Transitions API, see the comprehensive guide:

**[View Transitions Implementation Guide](docs/view-transitions-guide.md)**

**Package**: `next-view-transitions` (^0.3.4)

Key features:
- Smooth morphing animations between pages
- Per-word title transitions (à la nmn.sh)
- Shared element animations (logos, images, etc.)
- Progressive enhancement (graceful fallback for unsupported browsers)
- TypeScript integration

Components:
- `TransitionLink` - Wrapper around Next.js Link for page transitions
- `AnimatedTitle` - Per-word title animation (first 5 words only for performance)

The guide includes:
- Step-by-step implementation for Next.js App Router
- `TransitionLink` component pattern
- Advanced per-word animation techniques
- Performance considerations and debugging tips

#### localStorage Persistence

**Resources Completion Tracking:**
- Resources page (`/[locale]/resources/page.tsx`) tracks which resources users have completed
- Uses `use-local-storage.ts` hook for SSR-safe localStorage access
- Persists array of completed resource IDs
- Checkbox toggle to mark resources as complete

Pattern:
```tsx
const [completedResources, setCompletedResources] = useLocalStorage<string[]>(
  'completedResources',
  []
);

const toggleCompletion = (id: string) => {
  setCompletedResources(prev =>
    prev.includes(id)
      ? prev.filter(rid => rid !== id)
      : [...prev, id]
  );
};
```

#### Footnotes System

**`utils/footnotes.tsx`** - Inline citation rendering

Pattern in strings: `{footnote1}`, `{footnote2}`, etc.

Built-in footnotes:
1. AI Alignment Forum
2. LessWrong AI Safety tag
3. Rob Miles YouTube
4. Distill.pub Interpretability
5. Paul Christiano's blog
6. AI Safety Fundamentals course

Usage:
```tsx
import { renderWithFootnotes } from "@/app/utils/footnotes";

const text = "Learn about AI safety{footnote1} and interpretability{footnote4}.";
<p>{renderWithFootnotes(text)}</p>
```

Renders as: "Learn about AI safety^1 and interpretability^4." with superscript links.

## Coding Conventions

- TypeScript strict mode must stay green - fix type errors, don't suppress
- Two-space indentation for TSX/JSON
- Prefer Tailwind utilities; extend tokens in `globals.css` only for reusable semantics
- Keep component-specific styles colocated with components (e.g., `header.css`)
- Use functional components with hooks
- Client components must be marked with `"use client"`
- Server components are default in App Router

**ESLint:**
- Configuration: `eslint.config.mjs` (ESLint v9 flat config)
- TypeScript support via `typescript-eslint@8.46.2`
- Run `bun lint` before committing to check for issues
- Run `bun lint:fix` to auto-fix fixable issues
- Prefix unused vars with `_` to avoid warnings (e.g., `_unusedVar`)
- Avoid explicit `any` types - use proper typing or `unknown`
- Prefer `const` over `let`, never use `var`
- Use `console.warn()` or `console.error()` instead of `console.log()` (except in debug components)

**Component Patterns:**
- Memoize expensive components with `React.memo()`
- Use `useIsomorphicLayoutEffect` for DOM measurements
- Use `useLocalStorage` for client-side persistence
- Use `FadeInSection` for scroll-triggered animations
- Use `AnimatedTitle` for page title animations (max 5 words)

**i18n Patterns:**
- NEVER use inline ternary translations
- ALWAYS use dictionary references
- Template variables for dynamic content: `{variable}`
- FAQ accordion supports `{resourcesLink}` and `{email}` templates

---

## Common Development Tasks

### Quick Recipes

**🔍 Finding Things:**
```bash
# Find a component
find app/components -name "*component-name*"

# Search for text in code
grep -r "search term" app/

# Find where a function/variable is used
grep -r "functionName" app/
```

**🎨 Adding a New Page:**
1. Create `app/[locale]/your-page/page.tsx`
2. Add translations to `app/[locale]/dictionaries/en.json` and `es.json`
3. Add link in `app/components/header.tsx` and `mobile-menu.tsx`
4. Test both `/en/your-page` and `/es/your-page`
5. Run `bun run build` to verify

**🌍 Adding Translations:**
1. Add key to BOTH `en.json` and `es.json` in same nested location
2. Use in component: `const dict = useDict(); return <p>{dict.section.key}</p>`
3. NEVER use inline ternaries: `{locale === "en" ? "English" : "Español"}` ❌
4. ALWAYS use dictionaries: `{dict.section.text}` ✅

**⚡ Optimizing Performance:**
- Use `startVisible={true}` on above-fold `FadeInSection` components
- Use `dynamic(() => import("..."))` for below-fold heavy components
- Add `loading` prop to dynamic imports for skeleton states
- Use IntersectionObserver for embeds (see `airtable-embed.tsx`)
- Run `bun run analyze` to check bundle size
- Test with Lighthouse after changes

**🧹 Debugging Performance:**
```bash
# Build and analyze bundle
bun run analyze
open .next/analyze/client.html

# Run Lighthouse audit
bun run build && bun run start
# Then open Chrome DevTools > Lighthouse

# Check for console errors
# Open browser console and look for RUM logs: [RUM] LCP (desktop): X ms
```

**🔄 Working with React Compiler:**
- React Compiler is ENABLED - automatic memoization
- DO NOT add `React.memo()`, `useMemo()`, or `useCallback()`
- Only use `"use no memo"` directive for components needing manual optimization
- Currently only used in: `timeline-threads.tsx`, `mobile-menu.tsx`

**📦 Adding Dependencies:**
```bash
# Install package
bun add package-name

# If it's a large package, add to optimizePackageImports in next.config.ts
# Update package.json description if needed
# Run bun run build to verify no issues
```

**🎯 Common File Locations:**
- **Translations:** `app/[locale]/dictionaries/{en,es}.json`
- **Components:** `app/components/*.tsx`
- **Pages:** `app/[locale]/*/page.tsx`
- **Styles:** `app/globals.css` (global), `app/components/*.css` (component-specific)
- **Types:** `app/types/*.ts`
- **Data:** `app/data/*.ts` (e.g., `resources.ts`)
- **Hooks:** `app/hooks/*.ts`
- **Utils:** `app/utils/*.ts`

---

## Testing

No test infrastructure exists yet. When adding coverage:
- Use Vitest + Testing Library
- Colocate specs beside features (e.g., `app/components/Header.test.tsx`)
- Ensure tests are fast enough for CI
- Test both English and Spanish dictionaries
- Mock localStorage for SSR safety
- Document manual verification steps in PRs until automated checks exist

## Git Workflow

- Present-tense commit subjects (e.g., "Add events carousel component")
- One concern per commit
- Reference issue IDs in commit body when relevant
- PRs should explain motivation, implementation, test evidence, and deployment considerations
- Execute `bun run build` before opening PRs that touch build paths

## Configuration

- Environment secrets go in `.env.local` (not checked in)
- Document rationale in PR when altering `next.config.ts` or Turbopack behavior
- Validate third-party packages before adding (bundle size impact)

**next.config.ts optimizations:**
- Production console.log removal (keeps error/warn)
- Image formats: AVIF, WebP
- Reactive strict mode enabled
- Powered-by header disabled
- optimizePackageImports for `@vercel/*` packages

**eslint.config.mjs (ESLint v9 flat config):**
- ESLint v9 with TypeScript support via `typescript-eslint@8.46.2`
- Extends `@eslint/js` recommended and `typescript-eslint` recommended
- Key rules:
  - Warns on unused vars (except prefixed with `_`)
  - Warns on explicit `any` types
  - Enforces `prefer-const` and `no-var`
  - Restricts console (allows `console.warn` and `console.error`)
  - Allows `require()` in config files and scripts
  - Allows console in debug/monitor components
- Ignores: `node_modules/`, `.next/`, `dist/`, `build/`, `.cache/`, `public/`
- Current status: 0 errors, 0 warnings

**.npmrc:**
```
legacy-peer-deps=true
```

**Note:** Using Bun as both package manager and runtime (development + production). The `.npmrc` file has been removed as Bun handles peer dependencies automatically.

**Bun Runtime:**
- Local development: Bun runtime via `bun --bun next dev`
- Production: Bun runtime via `bun --bun next build` and `bun --bun next start`
- Configured in `vercel.json` for Vercel deployments

## Dependencies

**Production:**
- `next` (^15.5.5) - React framework
- `react` (19.1.0) - UI library
- `react-dom` (19.1.0) - React DOM renderer
- `next-view-transitions` (^0.3.4) - View Transitions API support
- `@vercel/analytics` (^1.5.0) - Analytics
- `@vercel/speed-insights` (^1.2.0) - Performance monitoring

**Development:**
- `@tailwindcss/postcss` (^4) - Tailwind CSS v4 plugin
- `tailwindcss` (^4) - Utility-first CSS framework
- `typescript` (^5) - TypeScript compiler
- `eslint` (^9.38.0) - JavaScript/TypeScript linter
- `typescript-eslint` (^8.46.2) - TypeScript support for ESLint
- `@eslint/js` (^9.38.0) - ESLint JavaScript configs
- `@eslint/eslintrc` (^3.3.1) - ESLint legacy config support
- `@types/node`, `@types/react`, `@types/react-dom` - Type definitions
- `glob` (^11.0.3) - File pattern matching (for optimization scripts)

## Documentation

Additional documentation in `docs/`:
- `view-transitions-guide.md` - Comprehensive View Transitions API guide
- `view-transitions-implementation-plan.md` - Implementation plan
