# BAISH Site Audit Findings (Visual, Performance, Best Practices)

Date: 2026-02-05
Audited project: `/Users/luca/dev/nextbaish`
Validation run: `bun run lint`, `bun run build`, `bun run analyze`

## Summary
- Lint/build are currently passing.
- No immediate compile-time blockers were found.
- There are 13 concrete issues worth addressing, including 4 high-priority items.

## Severity Legend
- P1: High impact or correctness issue.
- P2: Important UX/performance/maintainability issue.
- P3: Medium-priority quality issue.

## Findings

### 1) [P1] Broken default OG/Twitter image path
- Issue: Default social image is configured but the target asset does not exist.
- Impact: Broken social previews for any page using default metadata image.
- Location:
  - `app/utils/seo.ts:6`
  - Missing file: `public/images/og-default.png`

### 2) [P1] Broken Organization JSON-LD logo URL
- Issue: Organization schema logo points to a file that does not exist.
- Impact: Structured data quality degradation and possible rich-result parsing issues.
- Location:
  - `app/components/json-ld.tsx:143`
  - Missing file referenced: `public/images/logos/baish-logo-192.png`
  - Existing asset in repo: `public/images/logos/logo-192.png`

### 3) [P1] Duplicate web-vitals/RUM instrumentation mounted globally
- Issue: Two separate monitoring components are mounted at the layout level.
- Impact: Duplicate observation overhead and potentially duplicate metric streams.
- Location:
  - `app/[locale]/layout.tsx:138`
  - `app/[locale]/layout.tsx:139`
  - `app/components/performance-monitor.tsx:13`
  - `app/components/rum-monitor.tsx:14`

### 4) [P1] `CLS` and `INP` can be emitted multiple times in `RUMMonitor`
- Issue: Final metrics are reported on both `visibilitychange` and `beforeunload` without a one-shot guard.
- Impact: Double-counted or noisy metrics in analytics.
- Location:
  - `app/components/rum-monitor.tsx:183`
  - `app/components/rum-monitor.tsx:198`
  - `app/components/rum-monitor.tsx:201`

### 5) [P2] Fade-in timing classes are dynamically generated and likely not emitted
- Issue: Classes like `duration-${duration}` and `delay-${delay}` are generated from variables.
- Impact: Intended stagger and timing behavior may silently not apply.
- Location:
  - `app/components/fade-in-section.tsx:79`
  - `app/components/fade-in-section.tsx:80`
  - `app/components/fade-in-section.tsx:86`

### 6) [P2] Cross-page scroll uses fixed timeout after navigation
- Issue: Scroll target lookup runs 100ms after `router.push`.
- Impact: Race condition where scroll may fail on slower renders/navigation.
- Location:
  - `app/components/scroll-to-button.tsx:31`
  - `app/components/scroll-to-button.tsx:35`

### 7) [P2] Mouse-move driven React state updates in course cards
- Issue: `onMouseMove` sets state continuously to drive glow position.
- Impact: Extra rerenders and potential jank on lower-end devices.
- Location:
  - `app/components/interactive-course-card.tsx:30`
  - `app/components/interactive-course-card.tsx:37`
  - `app/components/interactive-course-card.tsx:67`
  - `app/components/interactive-course-card.tsx:72`

### 8) [P2] Featured YouTube embed is eagerly loaded
- Issue: iframe does not use lazy loading or optimized embed strategy.
- Impact: Increased initial page cost and third-party work.
- Location:
  - `app/[locale]/resources/page.tsx:126`
  - `app/[locale]/resources/page.tsx:128`
  - `app/[locale]/resources/page.tsx:133`

### 9) [P2] Mobile menu lacks dialog semantics/focus management
- Issue: Full-screen menu panel is visually modal but lacks explicit `role="dialog"`/`aria-modal`, focus trap, and focus return handling.
- Impact: Keyboard and assistive-tech UX issues.
- Location:
  - `app/components/mobile-menu.tsx:64`
  - `app/components/mobile-menu.tsx:77`
  - `app/components/mobile-menu.tsx:111`
  - `app/components/mobile-menu.tsx:243`

### 10) [P2] Next workspace root/lockfile warning in Bun build
- Issue: Build warns Turbopack inferred workspace root from a parent lockfile.
- Impact: Potentially brittle build/output tracing behavior across environments.
- Location:
  - `next.config.ts:8` (no explicit `turbopack.root` configured)
  - Related build warning mentions parent lockfile and local `bun.lock`

### 11) [P3] Sitemap `lastModified` changes on every build
- Issue: `lastModified` is generated with `new Date()` at build time for all URLs.
- Impact: Search engines may see unnecessary churn.
- Location:
  - `app/sitemap.ts:39`

### 12) [P3] LinkedIn URL inconsistency across UI and JSON-LD
- Issue: UI points to one LinkedIn company slug, schema points to another.
- Impact: Inconsistent entity linkage and possible broken/incorrect profile targeting.
- Location:
  - `app/components/footer.tsx:97`
  - `app/[locale]/contact/page.tsx:201`
  - `app/components/json-ld.tsx:148`

### 13) [P3] Lighthouse mobile quality gates are too permissive
- Issue: Mobile performance minimum is set to `0.5`, with LCP warning threshold at `8000ms`.
- Impact: Large regressions can pass CI with only warnings.
- Location:
  - `lighthouserc.json:10`
  - `lighthouserc.json:13`

## Notes from Validation
- `bun run lint`: pass
- `bun run build`: pass
- `bun run analyze`: pass
- Build still reports:
  - baseline-browser-mapping data is stale
  - workspace root inference warning due lockfile layout

## Recommended Order of Fixes
1. Fix metadata/SEO correctness: findings 1 and 2.
2. Consolidate instrumentation and dedupe reporting: findings 3 and 4.
3. Fix animation timing and navigation reliability: findings 5 and 6.
4. Optimize heavy interaction/embeds and modal accessibility: findings 7, 8, 9.
5. Improve CI/search hygiene: findings 10, 11, 12, 13.
