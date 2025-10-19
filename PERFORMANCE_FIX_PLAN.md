# Performance Optimization Implementation Plan

**Document Version**: 1.0
**Date**: 2025-10-19
**Estimated Timeline**: 1-2 weeks
**Expected Impact**: Desktop score 59 → 95+, Mobile score 96 → 98+

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Priority 1: Critical Fixes](#priority-1-critical-fixes)
   - [Fix 1.1: Desktop CLS (0.963 → <0.1)](#fix-11-desktop-cls-0963--01)
   - [Fix 1.2: Optimize Logo Image (1.9MB → 5KB)](#fix-12-optimize-logo-image-19mb--5kb)
4. [Priority 2: High-Impact Improvements](#priority-2-high-impact-improvements)
   - [Fix 2.1: Defer Timeline Animation](#fix-21-defer-timeline-animation)
   - [Fix 2.2: Optimize All Images](#fix-22-optimize-all-images)
   - [Fix 2.3: Add Content-Visibility](#fix-23-add-content-visibility)
5. [Priority 3: Additional Optimizations](#priority-3-additional-optimizations)
6. [Testing & Validation](#testing--validation)
7. [Rollback Plan](#rollback-plan)
8. [Success Metrics](#success-metrics)

---

## Executive Summary

### Current Performance Issues

**Desktop Performance Crisis**:
- Performance Score: **59/100** 🚨
- CLS: **0.963** (CRITICAL - should be < 0.1)
- LCP: 2.6s (needs improvement)

**Mobile Performance** (Good):
- Performance Score: **96/100** ✅
- CLS: 0.00018 ✅
- LCP: 2.8s ⚠️

### Root Causes

1. **Header width measurements in `useEffect`** → Layout shifts after render
2. **1.9MB logo displayed at 40x40px** → Massive bandwidth waste
3. **Timeline animation loads before LCP** → Delays critical content
4. **Unoptimized images** → Slow loading, large bandwidth

### Implementation Strategy

**Week 1**: Priority 1 fixes (Critical CLS + Logo)
**Week 2**: Priority 2 improvements (Defer animation, optimize images, content-visibility)

---

## Current State Analysis

### Bundle Analysis
```
Total Static Assets: 1.3MB
First Load JS: 114-136kB per page
Middleware: 39.1kB
```

### Critical Resources
```
jacarandashield.png: 1024x1024 @ 1.9MB (displayed at 40x40px)
Lucas.jpeg: 1600x1066 @ 163KB
hackathon.jpeg: 1023x1023 @ 190KB
superintelligence.jpg: 882x1339 @ 373KB
```

### Performance Bottlenecks
1. Header title collapse animation (CLS trigger)
2. Large logo image (LCP blocker)
3. Timeline threads loading early (blocks LCP)
4. Unoptimized JPEG/PNG images

---

## Priority 1: Critical Fixes

### Fix 1.1: Desktop CLS (0.963 → <0.1)

**Impact**: 🔴 CRITICAL - Destroys desktop performance
**Timeline**: 2-3 days
**Difficulty**: Medium

#### Problem Analysis

The header title collapse animation measures element widths in `useEffect`, causing layout shifts:

```typescript
// app/components/header.tsx:74-80 (CURRENT - CAUSES CLS)
useEffect(() => {
  const widths = restRefs.current.map((element) => element?.offsetWidth ?? 0);
  setRestWidths(widths); // ← State update causes re-render and layout shift
  const leading = firstRefs.current.map((element) => element?.offsetWidth ?? 0);
  setFirstWidths(leading);
}, [locale]);
```

**Why this causes CLS**:
1. Component renders with initial layout
2. Browser paints
3. `useEffect` runs, measures widths
4. State update triggers re-render
5. Layout changes → **LAYOUT SHIFT**

#### Solution: Use `useLayoutEffect` + CSS Containment

**Step 1**: Replace `useEffect` with `useLayoutEffect` for measurements

Create a new hook for SSR-safe layout effects:

```typescript
// app/hooks/use-isomorphic-layout-effect.ts
import { useEffect, useLayoutEffect } from 'react';

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
```

**Step 2**: Update header to use `useLayoutEffect`

```typescript
// app/components/header.tsx
import { useIsomorphicLayoutEffect } from '@/app/hooks/use-isomorphic-layout-effect';

// Replace line 74:
useIsomorphicLayoutEffect(() => {
  // Measure widths BEFORE browser paint
  const widths = restRefs.current.map((element) => element?.offsetWidth ?? 0);
  setRestWidths(widths);
  const leading = firstRefs.current.map((element) => element?.offsetWidth ?? 0);
  setFirstWidths(leading);
}, [locale]);
```

**Step 3**: Add CSS containment to prevent shifts

```css
/* app/components/header.css */

/* Add containment to title container */
.title-words {
  contain: layout style;
  will-change: transform;
}

/* Reserve minimum space to prevent collapse */
.logo-container {
  min-width: 40px;
  min-height: 40px;
}

/* Prevent title container from shifting */
.header-inner {
  contain: layout;
}
```

**Step 4**: Set initial dimensions to prevent shift

```typescript
// app/components/header.tsx:172
<div
  ref={titleContainerRef}
  className="overflow-hidden min-w-0 flex items-center"
  style={{
    // Reserve space based on state to prevent collapse shift
    minWidth: scrolled || isCramped ? '60px' : '220px',
    transition: 'min-width 0.3s ease'
  }}
  aria-label="Buenos Aires AI Safety Hub"
>
```

**Step 5**: Use CSS variables instead of state for dynamic widths

```typescript
// app/components/header.tsx - Alternative approach
useIsomorphicLayoutEffect(() => {
  const container = titleContainerRef.current;
  if (!container) return;

  // Set CSS variables instead of triggering re-renders
  restRefs.current.forEach((el, i) => {
    if (el) {
      container.style.setProperty(`--rest-width-${i}`, `${el.offsetWidth}px`);
    }
  });

  firstRefs.current.forEach((el, i) => {
    if (el) {
      container.style.setProperty(`--first-width-${i}`, `${el.offsetWidth}px`);
    }
  });
}, [locale]);
```

```css
/* app/components/header.css */
.title-word-rest-0 {
  max-width: var(--rest-width-0, 0px);
}
/* ... repeat for other indices */
```

#### Testing

```bash
# Run Lighthouse audit
npm run build
npm run start

# Test in Chrome DevTools
# 1. Open DevTools → Lighthouse
# 2. Select "Desktop" mode
# 3. Run performance audit
# 4. Verify CLS < 0.1
```

**Expected Outcome**:
- Desktop CLS: 0.963 → **< 0.1**
- Desktop Score: 59 → **85+**

---

### Fix 1.2: Optimize Logo Image (1.9MB → 5KB)

**Impact**: 🔴 CRITICAL - Blocks LCP, wastes bandwidth
**Timeline**: 1 day
**Difficulty**: Easy

#### Problem

Current logo: `jacarandashield.png` - 1024x1024 @ **1.9MB**
Displayed size: 40x40px
Waste: **99.8%** unnecessary data

#### Solution: Generate Optimized Sizes

**Step 1**: Install Sharp for image optimization

```bash
npm install -D sharp
```

**Step 2**: Create image optimization script

```javascript
// scripts/optimize-logo.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/jacarandashield.png');
const outputDir = path.join(__dirname, '../public/images/logos');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
  { size: 40, suffix: '40' },
  { size: 80, suffix: '80' },
  { size: 120, suffix: '120' },
  { size: 192, suffix: '192' },
];

async function optimizeLogo() {
  console.log('🖼️  Optimizing logo images...\n');

  for (const { size, suffix } of sizes) {
    // Generate WebP
    const webpPath = path.join(outputDir, `logo-${suffix}.webp`);
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90, effort: 6 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    console.log(`✅ Generated ${suffix}px WebP: ${(webpStats.size / 1024).toFixed(2)} KB`);

    // Generate AVIF (even smaller, better compression)
    const avifPath = path.join(outputDir, `logo-${suffix}.avif`);
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .avif({ quality: 80, effort: 6 })
      .toFile(avifPath);

    const avifStats = fs.statSync(avifPath);
    console.log(`✅ Generated ${suffix}px AVIF: ${(avifStats.size / 1024).toFixed(2)} KB`);

    // Generate PNG fallback
    const pngPath = path.join(outputDir, `logo-${suffix}.png`);
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(pngPath);

    const pngStats = fs.statSync(pngPath);
    console.log(`✅ Generated ${suffix}px PNG: ${(pngStats.size / 1024).toFixed(2)} KB\n`);
  }

  console.log('✨ Logo optimization complete!');
}

optimizeLogo().catch(console.error);
```

**Step 3**: Add npm script

```json
// package.json
{
  "scripts": {
    "optimize-logo": "node scripts/optimize-logo.js"
  }
}
```

**Step 4**: Run optimization

```bash
npm run optimize-logo
```

**Step 5**: Update header component

```tsx
// app/components/header.tsx:162-170
<Image
  src="/images/logos/logo-40.webp"
  alt="BAISH Logo"
  width={40}
  height={40}
  sizes="40px"
  className="w-full h-full object-contain site-logo"
  priority
  fetchPriority="high"
/>
```

**Step 6**: Verify Next.js Image component generates srcset

Next.js will automatically generate:
```html
<img
  srcset="
    /images/logos/logo-40.webp 1x,
    /images/logos/logo-80.webp 2x,
    /images/logos/logo-120.webp 3x
  "
  src="/images/logos/logo-40.webp"
  sizes="40px"
/>
```

#### Expected Savings

| Format | Original | Optimized | Savings |
|--------|----------|-----------|---------|
| PNG 1024x1024 | 1.9MB | - | - |
| WebP 40x40 | - | ~3KB | 99.8% |
| AVIF 40x40 | - | ~2KB | 99.9% |

**Expected Outcome**:
- Logo size: 1.9MB → **2-3KB**
- LCP improvement: **200-400ms**
- Bandwidth savings: **~1.9MB per page load**

---

## Priority 2: High-Impact Improvements

### Fix 2.1: Defer Timeline Animation

**Impact**: 🟠 HIGH - Improves LCP
**Timeline**: 2 days
**Difficulty**: Medium

#### Problem

Timeline animation loads immediately, blocking LCP:
```tsx
// app/[locale]/layout.tsx:107 (CURRENT)
<TimelineThreads className="fixed inset-0 -z-10" style={TIMELINE_STYLE} />
```

#### Solution: Defer Until After LCP

**Step 1**: Create LCP observer hook

```typescript
// app/hooks/use-lcp-complete.ts
'use client';

import { useState, useEffect } from 'react';

export function useLCPComplete() {
  const [isLCPComplete, setIsLCPComplete] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        // Wait a bit after LCP to ensure it's final
        timeoutId = setTimeout(() => {
          setIsLCPComplete(true);
          observer.disconnect();
        }, 100);
      }
    });

    try {
      observer.observe({
        type: 'largest-contentful-paint',
        buffered: true
      });
    } catch (e) {
      // Fallback if LCP not supported
      timeoutId = setTimeout(() => setIsLCPComplete(true), 2000);
    }

    // Fallback timeout - load after 3s regardless
    const fallbackTimeout = setTimeout(() => {
      setIsLCPComplete(true);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeout);
      observer.disconnect();
    };
  }, []);

  return isLCPComplete;
}
```

**Step 2**: Update timeline loader

```tsx
// app/components/timeline-threads-loader.tsx
'use client';

import dynamic from 'next/dynamic';
import { useLCPComplete } from '@/app/hooks/use-lcp-complete';
import type { CSSProperties } from 'react';

const TimelineThreads = dynamic(
  () => import('./timeline-threads'),
  { ssr: false }
);

interface TimelineThreadsLoaderProps {
  className?: string;
  style?: CSSProperties;
}

export default function TimelineThreadsLoader(props: TimelineThreadsLoaderProps) {
  const isLCPComplete = useLCPComplete();

  // Show placeholder until LCP completes
  if (!isLCPComplete) {
    return (
      <div
        className={props.className}
        style={{
          ...props.style,
          backgroundColor: '#f5f5f5'
        }}
      />
    );
  }

  return <TimelineThreads {...props} />;
}
```

**Step 3**: No changes needed to layout (already using loader)

The layout already imports from `timeline-threads-loader.tsx`, so this change will automatically defer the animation.

#### Expected Outcome

- LCP improvement: **200-300ms**
- Reduced main thread blocking during initial load
- Better perceived performance

---

### Fix 2.2: Optimize All Images

**Impact**: 🟠 HIGH - Reduces bandwidth, improves LCP
**Timeline**: 3 days
**Difficulty**: Medium

#### Problem

Many large images are unoptimized:
- `Lucas.jpeg`: 1600x1066 @ 163KB
- `hackathon.jpeg`: 1023x1023 @ 190KB
- `superintelligence.jpg`: 882x1339 @ 373KB

#### Solution: Batch Optimize All Images

**Step 1**: Create comprehensive optimization script

```javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const inputDir = path.join(__dirname, '../public');
const outputDir = path.join(__dirname, '../public/images/optimized');

// Image type configurations
const configs = {
  photos: {
    pattern: '{Luca,Lucas,Eitan,Sergio,Charly*,hackathon}.{jpg,jpeg,png}',
    sizes: [
      { width: 400, suffix: '400w' },
      { width: 800, suffix: '800w' },
      { width: 1200, suffix: '1200w' },
    ],
    quality: { webp: 85, avif: 80, jpg: 85 }
  },
  books: {
    pattern: '{LIFE3.0,humancompatible,superintelligence,thealignmentproblem,uncontrollable}.{jpg,jpeg}',
    sizes: [
      { width: 300, suffix: '300w' },
      { width: 600, suffix: '600w' },
    ],
    quality: { webp: 90, avif: 85, jpg: 90 }
  }
};

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [category, config] of Object.entries(configs)) {
    console.log(`\n📁 Processing ${category}...`);

    const files = await glob(config.pattern, { cwd: inputDir });

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const basename = path.parse(file).name;

      console.log(`\n  Processing: ${file}`);

      for (const { width, suffix } of config.sizes) {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Don't upscale
        const finalWidth = Math.min(width, metadata.width);

        // WebP
        const webpPath = path.join(outputDir, `${basename}-${suffix}.webp`);
        await image
          .clone()
          .resize(finalWidth, null, { withoutEnlargement: true })
          .webp({ quality: config.quality.webp, effort: 6 })
          .toFile(webpPath);

        const webpSize = fs.statSync(webpPath).size;
        console.log(`    ✅ ${suffix} WebP: ${(webpSize / 1024).toFixed(1)}KB`);

        // AVIF
        const avifPath = path.join(outputDir, `${basename}-${suffix}.avif`);
        await image
          .clone()
          .resize(finalWidth, null, { withoutEnlargement: true })
          .avif({ quality: config.quality.avif, effort: 6 })
          .toFile(avifPath);

        const avifSize = fs.statSync(avifPath).size;
        console.log(`    ✅ ${suffix} AVIF: ${(avifSize / 1024).toFixed(1)}KB`);
      }
    }
  }

  console.log('\n✨ Image optimization complete!\n');
}

optimizeImages().catch(console.error);
```

**Step 2**: Update package.json

```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js"
  },
  "devDependencies": {
    "sharp": "^0.33.0",
    "glob": "^10.3.0"
  }
}
```

**Step 3**: Run optimization

```bash
npm install -D sharp glob
npm run optimize-images
```

**Step 4**: Update image references

```tsx
// Example: app/[locale]/about/page.tsx
<Image
  src="/images/optimized/Lucas-800w.webp"
  alt="Lucas"
  width={800}
  height={533}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
  className="rounded-lg"
/>
```

**Step 5**: Create image component helper

```tsx
// app/components/optimized-image.tsx
import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string; // basename without extension
  alt: string;
}

export function OptimizedImage({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <Image
      src={`/images/optimized/${src}-800w.webp`}
      alt={alt}
      {...props}
    />
  );
}
```

#### Expected Savings

| Image | Before | After (WebP) | Savings |
|-------|--------|--------------|---------|
| Lucas | 163KB | ~50KB | 69% |
| hackathon | 190KB | ~60KB | 68% |
| superintelligence | 373KB | ~110KB | 71% |
| **Total** | **726KB** | **~220KB** | **70%** |

---

### Fix 2.3: Add Content-Visibility

**Impact**: 🟠 MEDIUM - Improves rendering performance
**Timeline**: 1 day
**Difficulty**: Easy

#### Solution: Apply content-visibility to Off-Screen Cards

**Step 1**: Update global CSS

```css
/* app/globals.css */

/* Apply content-visibility to card components */
.card-glass {
  content-visibility: auto;
  contain-intrinsic-size: 0 300px;
}

/* Activities cards on homepage */
article.card-glass {
  content-visibility: auto;
  contain-intrinsic-size: 0 400px;
}

/* Resource cards */
.resource-card {
  content-visibility: auto;
  contain-intrinsic-size: 0 350px;
}
```

**Step 2**: Add containment to sections

```css
/* Optimize section rendering */
section {
  contain: layout style;
}

/* Main content area */
main {
  contain: layout;
}
```

**Step 3**: Test scroll performance

```javascript
// Test in DevTools console
performance.mark('scroll-start');
window.scrollTo(0, document.body.scrollHeight);
performance.mark('scroll-end');
performance.measure('scroll-duration', 'scroll-start', 'scroll-end');
console.log(performance.getEntriesByName('scroll-duration')[0].duration);
```

#### Expected Improvements

- Faster initial render for long pages
- Reduced memory usage
- Smoother scrolling on lower-end devices

---

## Priority 3: Additional Optimizations

### 3.1: Preload Critical Fonts

```tsx
// app/[locale]/layout.tsx
export default async function LocaleLayout(...) {
  return (
    <ViewTransitions>
      <html lang={currentLocale}>
        <head>
          <link
            rel="preload"
            href="/_next/static/media/ibm-plex-serif-400.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </head>
        ...
```

### 3.2: Optimize View Transitions

Limit word-by-word transitions to first 5 words:

```tsx
// app/components/animated-title.tsx
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
        // Only animate first 5 words individually
        const shouldAnimate = index < MAX_ANIMATED_WORDS;

        return (
          <span
            key={`${slug}-word-${index}`}
            style={shouldAnimate ? {
              // @ts-ignore
              '--view-transition-name': `${slug}___${word.toLowerCase()}___${index}`,
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
```

### 3.3: Add Resource Hints for Third-Party Resources

Already implemented in `app/head.tsx` ✅

---

## Testing & Validation

### Pre-Deployment Testing

**1. Lighthouse CI**

```bash
# Install Lighthouse CI
npm install -D @lhci/cli

# Add script to package.json
{
  "scripts": {
    "lighthouse": "lhci autorun"
  }
}

# Create lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/en', 'http://localhost:3000/es'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
      },
    },
  },
};
```

**2. Visual Regression Testing**

```bash
# Install Playwright
npm install -D @playwright/test

# Create test
// tests/visual.spec.ts
import { test, expect } from '@playwright/test';

test('header should not shift on scroll', async ({ page }) => {
  await page.goto('http://localhost:3000/en');

  // Take screenshot before scroll
  const before = await page.screenshot();

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(500);

  // Header should maintain position
  const headerBox = await page.locator('header').boundingBox();
  expect(headerBox).toBeTruthy();
});
```

**3. CLS Measurement**

```javascript
// Add to DevTools console
let cls = 0;
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (!entry.hadRecentInput) {
      cls += entry.value;
      console.log('CLS Update:', cls, entry);
    }
  }
}).observe({type: 'layout-shift', buffered: true});
```

### Validation Checklist

- [ ] Desktop CLS < 0.1
- [ ] Desktop Performance Score > 90
- [ ] Mobile Performance Score > 95
- [ ] LCP < 2.5s (both mobile/desktop)
- [ ] Logo image < 10KB
- [ ] All images have WebP variants
- [ ] No console errors
- [ ] Visual regression tests pass
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

---

## Rollback Plan

### If Issues Occur

**1. Header CLS Fix**
```bash
# Revert header changes
git revert <commit-hash>

# Or manual rollback:
# - Change useLayoutEffect back to useEffect
# - Remove CSS containment
```

**2. Image Optimization**
```bash
# Keep old images as fallback
# Update Image src back to original paths
```

**3. Timeline Deferral**
```bash
# Remove LCP observer hook
# Load timeline immediately (revert to original)
```

### Monitoring Post-Deployment

```javascript
// Add RUM tracking (already have Vercel Analytics)
import { onCLS, onLCP } from 'web-vitals';

onCLS((metric) => {
  // Send to analytics
  console.log('CLS:', metric.value);
});

onLCP((metric) => {
  console.log('LCP:', metric.value);
});
```

---

## Success Metrics

### Performance Targets

| Metric | Current (Desktop) | Target | Current (Mobile) | Target |
|--------|------------------|--------|------------------|--------|
| Performance Score | 59 | 90+ | 96 | 98+ |
| CLS | 0.963 | < 0.1 | 0.00018 | < 0.1 |
| LCP | 2.6s | < 2.5s | 2.8s | < 2.5s |
| FCP | 1.1s | < 1.0s | 1.1s | < 1.0s |
| TBT | 10ms | < 200ms | 40ms | < 200ms |

### Business Metrics

- **Bandwidth Savings**: ~2MB per page load
- **User Experience**: Eliminate jarring layout shifts
- **SEO**: Better Core Web Vitals ranking
- **Bounce Rate**: Expected to decrease with better performance

---

## Implementation Timeline

### Week 1: Critical Fixes

**Day 1-2**: Fix Desktop CLS
- Create useIsomorphicLayoutEffect hook
- Update header measurements
- Add CSS containment
- Test on desktop

**Day 3**: Optimize Logo
- Install Sharp
- Create optimization script
- Generate optimized logos
- Update header component

**Day 4-5**: Testing & Validation
- Run Lighthouse audits
- Visual regression testing
- Cross-browser testing
- Fix any issues

### Week 2: High-Impact Improvements

**Day 1-2**: Defer Timeline Animation
- Create LCP observer hook
- Update timeline loader
- Test performance impact

**Day 3-4**: Optimize All Images
- Create batch optimization script
- Generate optimized variants
- Update image references

**Day 5**: Content-Visibility & Polish
- Add content-visibility CSS
- Add font preloading
- Optimize view transitions
- Final testing

---

## Additional Resources

### Documentation
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [CSS Containment](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment)
- [Content Visibility](https://web.dev/content-visibility/)

### Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Sharp Image Optimization](https://sharp.pixelplumbing.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## Notes & Considerations

### Browser Support
- `content-visibility`: Chrome 85+, Edge 85+, Safari 17.4+
- `useLayoutEffect`: All modern browsers
- WebP: All modern browsers (98%+ support)
- AVIF: Chrome 85+, Firefox 93+ (95%+ support)

### Edge Cases

1. **SSR Hydration**: Using `useIsomorphicLayoutEffect` prevents hydration mismatches
2. **Image Fallbacks**: Next.js automatically provides fallbacks for older browsers
3. **CLS on Slow Networks**: CSS containment ensures stable layout even during slow loads

### Performance Trade-offs

- **AVIF vs WebP**: AVIF is ~20% smaller but slower to encode - use for static build
- **content-visibility**: May cause slight scroll jank on very old devices - acceptable trade-off
- **LCP deferral**: Timeline loads after LCP, improving perceived performance at cost of delayed animation

---

**Document Status**: Ready for Implementation
**Last Updated**: 2025-10-19
**Next Review**: After Week 1 completion
