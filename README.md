# BAISH — Buenos Aires AI Safety Hub

A bilingual AI Safety content hub built with Next.js 16, featuring curated resources, research projects, events, workshops, and educational content in English and Spanish.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)](https://tailwindcss.com/)

## Project Overview

**BAISH** (Buenos Aires AI Safety Hub) is a platform dedicated to AI safety education and research, featuring:

- Fully bilingual content (English/Spanish)
- Curated AI safety learning resources with self-study paths
- Research project showcase with category filtering
- Events calendar with lu.ma integration
- Agentic coding workshop page
- Newsletter subscription via Substack
- Contact page with FAQ accordion
- Team profiles with photos
- Animated SVG background with 60fps performance
- Structured data (JSON-LD) for SEO

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.1 (App Router, Turbopack) |
| Runtime & Package Manager | Bun |
| UI Library | React 19.2 |
| Styling | Tailwind CSS v4 (via PostCSS) |
| Language | TypeScript 5.9 (strict mode) |
| Icons | Hugeicons (core-free-icons) |
| Animations | View Transitions API (next-view-transitions) |
| Analytics | Vercel Analytics & Speed Insights |
| Code Quality | ESLint v9 (flat config) + React Compiler |
| Fonts | Source Serif 4 (Google Fonts), TT Hoves Pro |
| Deployment | Vercel (configured via vercel.json) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.0+

### Installation

```bash
git clone <repository-url>
cd nextbaish
bun install
```

### Development

```bash
# Start Turbopack dev server at http://localhost:3000
bun dev

# Restart dev server (kills existing, starts fresh)
bun run restart:dev

# Build for production
bun run build

# Start production server
bun start

# Restart production server (kills, rebuilds, starts)
bun run restart:prod
```

### Code Quality

```bash
# Lint
bun lint

# Auto-fix linting issues
bun run lint:fix

# Type check
bunx tsc --noEmit
```

### Optimization Tools

```bash
# Bundle analysis (generates .next/analyze/*.html reports)
bun run analyze

# Optimize logo variants (WebP, AVIF, PNG at multiple sizes)
bun run optimize-logo

# Batch optimize all images to WebP/AVIF with responsive sizes
bun run optimize-images

# Generate favicon variants
bun run generate-favicon
```

## Routes

All routes are available in both English (`/en`) and Spanish (`/es`):

| Route | Description |
|---|---|
| `/` | Homepage — mission statement, animated background, newsletter signup |
| `/about` | About — team profiles, mission, values |
| `/activities` | Events — activity sections, lu.ma calendar, events carousel |
| `/research` | Research — project showcase with category filtering |
| `/resources` | Resources — self-study paths, reading lists, Airtable timeline |
| `/agentic-coding-workshop` | Workshop — agentic coding workshop details |
| `/contact` | Contact — methods (Telegram, Email, LinkedIn) + FAQ accordion |
| `/privacy-policy` | Privacy policy |

## Project Structure

```
app/
├── [locale]/                    # Internationalized routes (en/es)
│   ├── page.tsx                 # Homepage
│   ├── about/page.tsx
│   ├── activities/page.tsx
│   ├── agentic-coding-workshop/page.tsx
│   ├── contact/page.tsx
│   ├── privacy-policy/page.tsx
│   ├── research/page.tsx
│   ├── resources/page.tsx
│   ├── layout.tsx               # Locale-specific layout
│   ├── loading.tsx              # Loading state
│   ├── dictionaries.ts          # Dictionary loader
│   └── dictionaries/
│       ├── en.json              # English translations
│       └── es.json              # Spanish translations
├── api/
│   └── analytics/web-vitals/route.ts  # Web vitals API endpoint
├── components/                  # React components (29 files)
│   ├── header.tsx / header.css  # Main navigation
│   ├── mobile-menu.tsx          # Mobile navigation drawer
│   ├── footer.tsx               # Site footer
│   ├── animated-title.tsx       # View transitions title (per-word)
│   ├── transition-link.tsx      # View transitions link wrapper
│   ├── fade-in-section.tsx      # Scroll-triggered fade-in
│   ├── timeline-threads.tsx / .css  # Animated SVG background (60fps)
│   ├── timeline-threads-loader.tsx  # LCP-deferred timeline loader
│   ├── timeline-threads-with-controls.tsx
│   ├── hero-timeline.tsx        # Hero section timeline
│   ├── thread-control-panel.tsx / .css
│   ├── substack-signup.tsx      # Newsletter subscription
│   ├── supascribe-signup.tsx    # Alternative signup component
│   ├── calendar-section.tsx     # lu.ma calendar embed (lazy)
│   ├── airtable-embed.tsx       # Airtable integration (lazy)
│   ├── events-carousel.tsx      # Auto-scrolling gallery
│   ├── research-filters.tsx     # Category filter buttons
│   ├── faq-accordion.tsx        # Accordion component
│   ├── interactive-course-card.tsx  # Course card component
│   ├── scroll-to-button.tsx     # Scroll-to-top button
│   ├── survey-banner.tsx        # Survey promotion banner
│   ├── json-ld.tsx              # Structured data (SEO)
│   ├── deferred-analytics.tsx   # Deferred analytics loading
│   ├── rum-monitor.tsx          # Real User Monitoring
│   ├── lcp-debugger.tsx         # LCP debugging tool
│   └── performance-monitor.tsx  # Performance monitoring
├── hooks/
│   ├── use-fade-in.ts           # IntersectionObserver hook
│   ├── use-isomorphic-layout-effect.ts  # SSR-safe useLayoutEffect
│   ├── use-lcp-complete.ts      # LCP detection hook
│   ├── use-local-storage.ts     # SSR-safe localStorage
│   └── use-prefers-reduced-motion.ts  # Motion preference hook
├── contexts/
│   └── language-context.tsx     # i18n context provider
├── renderers/
│   └── webgl-renderer.ts       # GPU-accelerated WebGL renderer
├── utils/
│   ├── locale.ts                # Locale utilities
│   ├── seo.ts                   # SEO metadata utilities
│   ├── thread-utils.ts          # Timeline animation utilities
│   ├── footnotes.tsx            # Footnote rendering system
│   └── create-renderer.ts      # Renderer factory
├── types/
│   └── renderer.ts              # Renderer type definitions
├── workers/
│   ├── thread-generator.worker.ts  # Background thread generation
│   ├── animation.worker.ts      # Animation worker
│   └── animation-types.ts       # Animation type definitions
├── head.tsx                     # Resource hints
├── globals.css                  # Tailwind + CSS custom properties
└── layout.tsx                   # Root layout

public/
├── images/
│   ├── logos/                   # Optimized logo variants
│   ├── optimized/               # Batch-optimized images
│   ├── events/                  # Event gallery images
│   └── team/                    # Team member photos
├── icons/                       # github.svg, linkedin.svg
├── fonts/                       # TT Hoves Pro
└── (favicons, site.webmanifest)

scripts/
├── optimize-logo.js             # Logo optimization
├── optimize-images.js           # Batch image optimization
├── generate-favicon.js          # Favicon generation
├── restart-dev.sh               # Dev server restart
└── restart-prod.sh              # Production server restart

docs/
├── view-transitions-guide.md
├── view-transitions-implementation-plan.md
└── ux-review-homepage.md

.github/workflows/
└── lighthouse-ci.yml            # Automated Lighthouse CI
```

## Key Features

### Bilingual Support (EN/ES)

Dictionary-based internationalization with server-side translation loading. All content is available in English and Spanish via `app/[locale]/dictionaries/`. Language switcher in the header. i18n config defined in `i18n.config.ts`.

### Animated Timeline Background

High-performance 60fps SVG animation system:

- Float32Array for memory efficiency
- Web worker offloading (`thread-generator.worker.ts`, `animation.worker.ts`)
- WebGL renderer option for GPU acceleration
- IntersectionObserver for battery optimization (pauses when off-screen)
- Deferred until after LCP via `useLcpComplete` hook

### View Transitions

Smooth page transitions using the View Transitions API (`next-view-transitions`):

- Per-word title animations (first 5 words) via `AnimatedTitle`
- `TransitionLink` wrapper for Next.js Link
- Progressive enhancement for unsupported browsers

### SEO

- Structured data via `json-ld.tsx` (Organization, BreadcrumbList, Events)
- Page metadata generation via `utils/seo.ts`
- Proper locale metadata for bilingual routes

### Performance Optimizations

- React Compiler enabled (automatic memoization, no manual memo/useCallback)
- SWC minification (default in Next.js 16)
- Dynamic imports for below-fold components
- IntersectionObserver-based lazy loading (calendar, Airtable embed)
- `content-visibility: auto` and CSS containment
- Font preload with `display: swap`
- Image optimization (AVIF, WebP) with build-time scripts
- Web workers for animation calculations
- `useIsomorphicLayoutEffect` for CLS-free DOM measurements
- `usePrefersReducedMotion` hook for accessibility
- Bundle analysis via `@next/bundle-analyzer`

## Configuration

### next.config.ts

- React Compiler enabled
- Image optimization (AVIF, WebP)
- Package import optimization (`@vercel/*`, `@tanstack/react-virtual`)
- Bundle analyzer (enabled with `ANALYZE=true`)
- Production console.log removal (keeps error/warn)
- Strict mode enabled

### vercel.json

Configures Bun as the build runtime on Vercel (`bun --bun next build`).

### ESLint

ESLint v9 flat config (`eslint.config.mjs`) with TypeScript support via `typescript-eslint`. Key rules: no unused vars (except `_` prefixed), no explicit `any`, `prefer-const`, restricted `console` usage. Console allowed in debug/monitor components and workers.

### Internationalization

Translations live in `app/[locale]/dictionaries/en.json` and `es.json`. Never use inline ternary translations — always use dictionary references. Template variables (`{variable}`) for dynamic content. FAQ accordion supports `{resourcesLink}` and `{email}` template variables.

## Performance Monitoring

### Lighthouse CI

Automated on PRs via `.github/workflows/lighthouse-ci.yml`. Tests homepage and resources page on both mobile and desktop. Configs: `lighthouserc.json` (mobile) and `lighthouserc-desktop.json` (desktop).

### Real User Monitoring

Core Web Vitals tracking via `rum-monitor.tsx` and the `web-vitals` library. API endpoint at `/api/analytics/web-vitals`. Integrated with Vercel Analytics.

## Deployment

### Vercel (Production)

The project is configured for Vercel via `vercel.json`. Push to main to deploy. Features: Brotli/Gzip compression, edge caching, automatic HTTPS, preview deployments, analytics.

### Manual

```bash
bun run build
bun start
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** — Detailed project documentation and coding conventions
- **[docs/view-transitions-guide.md](./docs/view-transitions-guide.md)** — View Transitions API implementation guide

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes (add translations to both `en.json` and `es.json`)
4. Run `bun run build` to verify
5. Submit a pull request

Use present-tense commit messages. Reference issue IDs when relevant.

## Contact

- Website: [baish.com.ar](https://baish.com.ar)
- Telegram: [Join our community](https://t.me/+zhSGhXrn56g1YjVh)
