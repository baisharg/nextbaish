# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start Turbopack dev server at http://localhost:3000 with hot reload (keep this running during development)
- `npm run build` - Compile production bundle (run before opening PRs that touch build paths)
- `npm run start` - Run optimized production server from last build

**Note:** Dev server should remain running at port 3000 during active development.

## Project Architecture

This is a Next.js 15 app using the App Router with Turbopack, React 19, TypeScript, and Tailwind CSS v4.

### Key Files
- `app/layout.tsx` - Root layout with fonts (Geist Sans/Mono), metadata, and the TimelineThreads background component
- `app/page.tsx` - Main landing page (client component) with bilingual content (English/Spanish) for BAISH AI Safety Hub
- `app/globals.css` - Tailwind v4 imports and CSS custom properties for color tokens (`--color-accent-primary`, `--color-accent-secondary`, `--color-accent-tertiary`)
- `app/components/timeline-threads.tsx` - SVG-based animated background with thread morphing animation using Float32Array for memory efficiency

### TypeScript Configuration
- Path alias: `@/*` maps to project root
- Strict mode enabled
- Target: ES2017

### Styling
- Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`)
- Design tokens in `app/globals.css` under `:root`
- Component styles colocated with components
- Light theme enforced (overrides dark mode preference)

### Component Architecture
- Functional React components in PascalCase files
- Client components marked with `"use client"`
- Static assets in `public/` served from root path
- Geist font family loaded from `next/font/google`

### Internationalization (i18n)

**System Overview:**
This project uses a dictionary-based i18n system with server-side translation loading for English and Spanish.

**Dictionary Files:**
- `app/[locale]/dictionaries/en.json` - English translations
- `app/[locale]/dictionaries/es.json` - Spanish translations
- `app/[locale]/dictionaries.ts` - Dictionary loader function

**File Structure:**
```
app/[locale]/
├── dictionaries/
│   ├── en.json          # English dictionary
│   ├── es.json          # Spanish dictionary
│   └── dictionaries.ts  # Loader
├── page.tsx             # Home page
├── about/page.tsx       # About page
├── activities/page.tsx  # Activities page
└── ...
```

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
  const isEnglish = locale === "en";

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

### Performance Optimizations
- **60fps Timeline Animation**: SVG-based rendering with RAF throttling and precomputed invariants (pivot damping, segment factors)
- **Memory efficiency**: Float32Array for point storage instead of object arrays (reduces allocations from ~2000/sec to ~30/sec)
- **Optimized parameters**: 30 threads × 15 segments, skip transition calculations when complete
- **GPU acceleration**: CSS filters, will-change hints, and containment for smooth rendering
- **Battery optimization**: IntersectionObserver pauses animation when component is off-screen

## Advanced Features

### View Transitions API

For implementing smooth, native-app-like page transitions using the View Transitions API, see the comprehensive guide:

**[View Transitions Implementation Guide](docs/view-transitions-guide.md)**

Key features:
- Smooth morphing animations between pages
- Per-word title transitions (à la nmn.sh)
- Shared element animations (logos, images, etc.)
- Progressive enhancement (graceful fallback for unsupported browsers)
- TypeScript integration

The guide includes:
- Step-by-step implementation for Next.js App Router
- `TransitionLink` component pattern
- Advanced per-word animation techniques
- Performance considerations and debugging tips

## Coding Conventions

- TypeScript strict mode must stay green - fix type errors, don't suppress
- Two-space indentation for TSX/JSON
- Prefer Tailwind utilities; extend tokens in `globals.css` only for reusable semantics
- Keep component-specific styles colocated with components
- Use functional components with hooks

## Testing

No test script exists yet. When adding coverage:
- Use Vitest + Testing Library
- Colocate specs beside features (e.g., `app/(marketing)/Hero.test.tsx`)
- Ensure tests are fast enough for CI
- Document manual verification steps in PRs until automated checks exist

## Git Workflow

- Present-tense commit subjects (e.g., "Add hero carousel animation")
- One concern per commit
- Reference issue IDs in commit body when relevant
- PRs should explain motivation, implementation, test evidence, and deployment considerations
- Execute `npm run build` before opening PRs that touch build paths

## Configuration

- Environment secrets go in `.env.local` (not checked in)
- Document rationale in PR when altering `next.config.ts` or Turbopack behavior
- Validate third-party packages before adding (bundle size impact)
