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

### Performance Optimizations
- **30fps Timeline Animation**: SVG-based rendering with RAF throttling and precomputed invariants (pivot damping, segment factors)
- **Memory efficiency**: Float32Array for point storage instead of object arrays (reduces allocations from ~2000/sec to ~30/sec)
- **Optimized parameters**: 30 threads × 15 segments, skip transition calculations when complete
- **GPU acceleration**: CSS filters, will-change hints, and containment for smooth rendering
- **Battery optimization**: IntersectionObserver pauses animation when component is off-screen

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
