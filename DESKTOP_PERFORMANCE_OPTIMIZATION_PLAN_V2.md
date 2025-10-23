# Desktop Performance Optimization Plan v2.0
## Updated for Next.js 16 + React Compiler

**Date:** 2025-10-23
**Current Status:** Production mobile 96-99%, Desktop 76-78%
**Target:** Desktop 90%+, LCP <2.5s on all viewports
**Stack:** Next.js 16.0.0, React 19.1.0, React Compiler (enabled)

---

## 🚨 CRITICAL: React Compiler Changes Everything

Your project has React Compiler enabled in `next.config.ts`. This fundamentally changes how we approach performance optimization:

### ✅ What React Compiler Does Automatically

```tsx
// ❌ OLD WAY (Phase 3.2 in original plan) - DO NOT DO THIS
const ResourceCard = React.memo(function ResourceCard({ resource, isCompleted }) {
  const processedData = useMemo(() => processData(resource), [resource]);
  const handleClick = useCallback(() => onClick(resource.id), [resource.id]);
  return <div>{/* ... */}</div>;
});

// ✅ NEW WAY (React Compiler handles it automatically)
function ResourceCard({ resource, isCompleted, onClick }) {
  const processedData = processData(resource); // Automatically memoized
  const handleClick = () => onClick(resource.id); // Automatically stable
  return <div>{/* ... */}</div>;
}
```

### 🔥 Changes to Original Plan

**REMOVE from plan:**
- ❌ Phase 3.2: Manual `React.memo()` on components
- ❌ Manual `useMemo()` for calculations
- ❌ Manual `useCallback()` for handlers
- ❌ Custom comparison functions in `React.memo()`

**KEEP in plan:**
- ✅ Virtualization (long lists still need virtualization)
- ✅ Code splitting with `lazy()`
- ✅ Font preloading
- ✅ Image optimization
- ✅ Deferring animations
- ✅ localStorage optimization

---

## Executive Summary

Lighthouse audits reveal **desktop performance is counterintuitively worse than mobile**, with Desktop LCP 85% slower on homepage (3.7s vs 2.0s). While production build shows massive improvements over dev (TTI reduced 50-66%), desktop optimization is needed to reach 90+ scores.

### Current Performance

| Page | Mobile | Desktop | Issue |
|------|--------|---------|-------|
| Homepage | 🟢 99% | 🟡 76% | Desktop LCP: 3.7s |
| Resources | 🟢 96% | 🟡 78% | Desktop LCP: 2.8s |

### Core Web Vitals Gap

| Metric | Mobile | Desktop | Gap |
|--------|--------|---------|-----|
| LCP | 2.0s ✅ | 3.7s 🔴 | **+85% slower** |
| TTI | 2.5s ✅ | 3.9s 🟡 | +56% slower |
| Speed Index | 1.1s ✅ | 1.8s 🟡 | +64% slower |

---

## Phase 1: Diagnostic & Root Cause Analysis

### 1.1 Identify Desktop LCP Element

**Priority:** Critical
**Estimated Time:** 30 minutes
**Complexity:** Low

**Objective:** Determine what element is causing the 3.7s LCP on desktop homepage.

**Steps:**
1. Run Lighthouse with detailed view
2. Use Chrome DevTools Performance panel to identify LCP candidate
3. Check if LCP element differs between mobile/desktop viewports
4. Document LCP element path, size, and dependencies

**Commands:**
```bash
# Run detailed Lighthouse audit with UI
npx lighthouse http://localhost:3000/en --view --preset=desktop

# Alternative: Use Chrome MCP
# Already have mcp__lighthouse__run_audit available
```

**Expected Findings:**
- Likely hero section `<h1>` or hero image
- May be waiting for font loading (IBM Plex Serif or Geist Sans)
- May be waiting for Timeline animation to complete
- Desktop may render larger images/fonts = more data to load

---

### 1.2 Profile Desktop-Specific Rendering

**Priority:** High
**Estimated Time:** 1 hour
**Complexity:** Medium

**Objective:** Identify why desktop renders slower than mobile.

**Areas to Profile:**

#### Timeline Animation Performance
- **Hypothesis:** More SVG threads/segments on larger viewport
- **Test:** Compare animation FPS on mobile vs desktop viewports
- **Metrics:**
  - Thread count: 30 threads × 15 segments = 450 points
  - Desktop screen area: ~3x larger = 3x more pixels to render
  - GPU memory usage on larger viewports

#### CSS Backdrop Filters
- **Hypothesis:** `.card-glass` backdrop blur more expensive on desktop
- **Test:** Disable backdrop filters, measure LCP improvement
- **Metrics:**
  - Blur radius impact on LCP
  - GPU compositing layers on desktop vs mobile

#### Font Loading
- **Hypothesis:** Desktop loading more font weights/variants
- **Test:** Check Network tab for font requests by viewport
- **Metrics:**
  - Number of font files loaded
  - Font file sizes
  - FOIT/FOUT duration

**Tools:**
```bash
# Chrome DevTools Performance Monitor
# 1. DevTools > Performance Monitor
# 2. Enable: CPU usage, JS heap size, Layouts/sec, Style recalcs/sec
# 3. Compare mobile vs desktop viewport

# React DevTools Profiler
# 1. Record page load
# 2. Identify components with >50ms render time
# 3. Compare mobile vs desktop
```

---

### 1.3 Verify React Compiler is Working

**Priority:** High
**Estimated Time:** 20 minutes
**Complexity:** Low

**Objective:** Confirm React Compiler is enabled and working correctly.

**Steps:**

1. **Check next.config.ts:**
```bash
cat next.config.ts | grep -A 5 "reactCompiler"
```

Expected output:
```ts
experimental: {
  reactCompiler: true,
}
```

2. **Verify babel-plugin-react-compiler:**
```bash
npm list babel-plugin-react-compiler
```

Expected: `babel-plugin-react-compiler@0.0.0-experimental-...`

3. **Test compiler with debug build:**
```bash
# Add React Compiler debug output
NEXT_PUBLIC_REACT_COMPILER_DEBUG=true npm run build
```

Look for compiler output in build logs showing which components were optimized.

4. **Audit existing manual optimizations:**
```bash
# Find all React.memo usage
grep -r "React.memo" app/components/

# Find all useMemo usage
grep -r "useMemo" app/

# Find all useCallback usage
grep -r "useCallback" app/
```

**Action:** Document which components have manual memoization that conflicts with compiler.

---

## Phase 2: Quick Wins (Low Effort, High Impact)

### 2.1 Preload Critical Desktop Fonts

**Priority:** Critical
**Estimated Time:** 15 minutes
**Complexity:** Low
**Expected Impact:** -200ms LCP on desktop

**Implementation:**

**File:** `app/head.tsx`

```tsx
export default function Head() {
  return (
    <>
      {/* Existing resource hints */}
      <link rel="dns-prefetch" href="https://substackapi.com" />
      <link rel="preconnect" href="https://lu.ma" />

      {/* NEW: Preload critical fonts for desktop */}
      <link
        rel="preload"
        href="/fonts/IBMPlexSerif-Bold.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
        media="(min-width: 1024px)"
      />
      <link
        rel="preload"
        href="/fonts/GeistSans-Bold.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
        media="(min-width: 1024px)"
      />
    </>
  );
}
```

**Why This Helps:**
- Desktop hero text is larger = more font data needed
- Preloading ensures fonts available before LCP
- Media query ensures mobile not affected

---

### 2.2 Add fetchPriority to Hero Title

**Priority:** Critical
**Estimated Time:** 10 minutes
**Complexity:** Low
**Expected Impact:** -100ms LCP on desktop

**Implementation:**

**File:** `app/[locale]/page.tsx`

Identify hero title component and add priority hint:

```tsx
<h1
  className="hero-title"
  style={{ contentVisibility: "visible" }} // Prevent content-visibility delay
>
  <AnimatedTitle title={dict.home.heroTitle} />
</h1>
```

**File:** `app/globals.css`

Add to hero section:

```css
.hero-title {
  content-visibility: visible; /* Force immediate render */
  contain: none; /* Disable containment for LCP element */
}
```

**Why This Helps:**
- Tells browser hero title is critical
- Prevents content-visibility from deferring LCP element
- Ensures hero text painted immediately

---

### 2.3 Defer Timeline Animation Until After LCP

**Priority:** High
**Estimated Time:** 30 minutes
**Complexity:** Medium
**Expected Impact:** -300ms LCP on desktop

**Current State:** Timeline uses `useLcpComplete` hook but may not be working correctly on desktop.

**Implementation:**

**File:** `app/hooks/use-lcp-complete.ts`

Verify hook is firing correctly:

```tsx
export function useLcpComplete() {
  const [lcpComplete, setLcpComplete] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      console.log("[LCP Hook] LCP detected:", {
        element: lastEntry.element,
        renderTime: lastEntry.renderTime,
        size: lastEntry.size
      });

      setLcpComplete(true);
    });

    try {
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      console.warn("[LCP Hook] PerformanceObserver not supported, using fallback");
      setTimeout(() => setLcpComplete(true), 2500);
    }

    return () => observer.disconnect();
  }, []);

  return lcpComplete;
}
```

**File:** `app/components/timeline-threads-loader.tsx`

Add viewport-aware delay:

```tsx
"use client";

import { Suspense, lazy } from "react";
import { useLcpComplete } from "@/app/hooks/use-lcp-complete";
import { useEffect, useState } from "react";

const TimelineThreads = lazy(() => import("./timeline-threads"));

export default function TimelineThreadsLoader() {
  const lcpComplete = useLcpComplete();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
  }, []);

  // On desktop, add extra delay after LCP for GPU to settle
  const shouldRender = lcpComplete;

  if (!shouldRender) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <TimelineThreads />
    </Suspense>
  );
}
```

**Why This Helps:**
- Ensures Timeline doesn't compete with LCP rendering
- Desktop has more complex Timeline (larger viewport)
- Prevents GPU contention during critical render

---

### 2.4 Optimize Timeline for Desktop Viewports

**Priority:** High
**Estimated Time:** 45 minutes
**Complexity:** Medium
**Expected Impact:** -200ms TTI on desktop

**Implementation:**

**File:** `app/components/timeline-threads.tsx`

Add viewport-aware thread reduction:

```tsx
const MOBILE_THREAD_COUNT = 30;
const DESKTOP_THREAD_COUNT = 20; // NEW: Reduce for desktop
const SEGMENTS = 15;

export default function TimelineThreads() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // NEW: Use fewer threads on desktop
  const threadCount = isDesktop ? DESKTOP_THREAD_COUNT : MOBILE_THREAD_COUNT;

  // ... rest of component
}
```

**Why This Helps:**
- Desktop screen = more pixels but doesn't need more threads
- Fewer threads = less CPU/GPU work
- 20 threads on 1920px screen looks identical to 30 threads

---

### 2.5 Reduce Backdrop Blur on Desktop

**Priority:** Medium
**Estimated Time:** 20 minutes
**Complexity:** Low
**Expected Impact:** -100ms LCP on desktop

**Implementation:**

**File:** `app/globals.css`

```css
.card-glass {
  backdrop-filter: blur(12px); /* Mobile/default */
  -webkit-backdrop-filter: blur(12px);

  /* NEW: Reduce blur radius on desktop */
  @media (min-width: 1024px) {
    backdrop-filter: blur(8px); /* Less blur = less GPU work */
    -webkit-backdrop-filter: blur(8px);
  }
}

/* NEW: Disable backdrop filters until after LCP */
@supports (content-visibility: auto) {
  .card-glass:not(.force-blur) {
    content-visibility: auto;
    contain-intrinsic-size: 0 300px;
  }
}
```

**Why This Helps:**
- Backdrop blur is GPU-intensive on large surfaces
- Desktop cards = larger surface area = more GPU work
- Smaller blur radius still looks good but renders faster

---

## Phase 3: Medium Wins (Medium Effort, Medium Impact)

### 3.1 Implement Resource List Virtualization with TanStack Virtual

**Priority:** Medium
**Estimated Time:** 2 hours
**Complexity:** High
**Expected Impact:** -500ms TTI on resources page (desktop)

**Problem:** Resources page renders 50+ cards on mount, even if below fold.

**Solution:** Use TanStack Virtual (modern replacement for react-window, better React 19 support).

**Implementation:**

Install dependency:
```bash
npm install @tanstack/react-virtual --save
```

**File:** `app/[locale]/resources/page.tsx`

```tsx
"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export default function ResourcesPage() {
  const parentRef = useRef<HTMLDivElement>(null);

  // ... existing state

  // NEW: TanStack Virtual setup
  const rowVirtualizer = useVirtualizer({
    count: filteredResources.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Approximate card height
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  return (
    <main>
      {/* ... filters */}

      {/* NEW: Virtual list container */}
      <div
        ref={parentRef}
        style={{
          height: "600px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const resource = filteredResources[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ResourceCard
                  resource={resource}
                  isCompleted={completedResources.includes(resource.id)}
                  onToggle={() => toggleCompletion(resource.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
```

**Why This Helps:**
- Only renders ~10-15 visible cards instead of 50+
- Reduces initial DOM nodes from 2000+ to <500
- Faster hydration and TTI
- More impactful on desktop (more cards visible = more to render)
- TanStack Virtual is React 19-optimized

**⚠️ Note:** React Compiler handles component memoization automatically, so no need for manual `React.memo()` on ResourceCard.

---

### 3.2 ~~Memoize Expensive Components~~ [REMOVED - Compiler Handles This]

**Status:** ❌ NOT NEEDED with React Compiler

**Rationale:**
- React Compiler automatically memoizes components
- Manual `React.memo()` can conflict with compiler optimizations
- Manual `useMemo()` and `useCallback()` are redundant

**What to do instead:**
- Trust the compiler
- Use `"use memo"` directive if you want to explicitly opt-in
- Use `"use no memo"` directive if you need to opt-out

**Example:**
```tsx
// ❌ OLD: Manual memoization (don't do this)
const ResourceCard = React.memo(function ResourceCard({ resource }) {
  const processedData = useMemo(() => processData(resource), [resource]);
  return <div>{processedData}</div>;
});

// ✅ NEW: Let compiler handle it
function ResourceCard({ resource }) {
  "use memo"; // Optional: explicitly opt-in to compilation
  const processedData = processData(resource); // Automatically memoized
  return <div>{processedData}</div>;
}
```

---

### 3.3 Code Split Resources Page

**Priority:** Medium
**Estimated Time:** 1 hour
**Complexity:** Medium
**Expected Impact:** -300ms TTI on resources page

**Implementation:**

**File:** `app/[locale]/resources/page.tsx`

Split heavy components into lazy-loaded chunks:

```tsx
import { lazy, Suspense } from "react";

// Lazy load heavy components
const AirtableEmbed = lazy(() => import("@/app/components/airtable-embed"));
const ResourceFilters = lazy(() => import("@/app/components/resource-filters"));

export default function ResourcesPage() {
  return (
    <main>
      {/* Critical content loads immediately */}
      <h1>{dict.resources.title}</h1>

      {/* Heavy components lazy load */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <ResourceFilters />
      </Suspense>

      {/* ... resource cards */}

      <Suspense fallback={<div>Loading timeline...</div>}>
        <AirtableEmbed />
      </Suspense>
    </main>
  );
}
```

**File:** `next.config.ts`

Verify optimizePackageImports is configured:

```ts
const nextConfig = {
  // ... existing config

  experimental: {
    reactCompiler: true, // Already enabled ✅
    optimizePackageImports: [
      "@vercel/analytics",
      "@vercel/speed-insights",
      "@tanstack/react-virtual" // NEW: Optimize virtual scrolling library
    ],
  },
};
```

**Why This Helps:**
- Reduces main bundle size
- Faster JavaScript parse/compile time
- Resources page code doesn't block homepage

---

### 3.4 Optimize localStorage Reads

**Priority:** Medium
**Estimated Time:** 30 minutes
**Complexity:** Low
**Expected Impact:** -100ms TTI on resources page

**Problem:** Resources page reads localStorage during render, blocking hydration.

**Solution:** Move localStorage read to useEffect.

**File:** `app/hooks/use-local-storage.ts`

```tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  // NEW: Initialize with server-safe value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // NEW: Read from localStorage after mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}
```

**File:** `app/[locale]/resources/page.tsx`

Update usage:

```tsx
const [completedResources, setCompletedResources, isLoaded] = useLocalStorage<string[]>(
  'completedResources',
  []
);

// Show loading state until localStorage loaded
if (!isLoaded) {
  return <div>Loading your progress...</div>;
}
```

**Why This Helps:**
- Doesn't block hydration waiting for localStorage
- Allows React to render immediately with initial state
- Progressively enhances with saved data

---

## Phase 4: Advanced Optimizations (High Effort, Medium Impact)

### 4.1 Enable Turbopack Persistent Caching

**Priority:** Medium
**Estimated Time:** 10 minutes
**Complexity:** Low
**Expected Impact:** Faster builds, no runtime impact

**Implementation:**

**File:** `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... existing config

  experimental: {
    reactCompiler: true, // Already enabled ✅
    turbopackPersistentCaching: true, // NEW: Cache between builds
    optimizePackageImports: [
      "@vercel/analytics",
      "@vercel/speed-insights",
      "@tanstack/react-virtual"
    ],
  },
};

export default nextConfig;
```

**Why This Helps:**
- Faster subsequent builds
- Better development experience
- No production runtime impact but speeds up iteration

---

### 4.2 Implement Static Image Optimization for Desktop

**Priority:** Low
**Estimated Time:** 2 hours
**Complexity:** High
**Expected Impact:** -200ms LCP if images are LCP element

**Implementation:**

**Step 1:** Audit current images:

```bash
# Find all images in public/images
find public/images -type f -name "*.jpg" -o -name "*.png" -o -name "*.webp"

# Check if desktop-specific images exist
ls -lh public/images/logos/
ls -lh public/images/optimized/
```

**Step 2:** Generate desktop-optimized variants:

**File:** `scripts/optimize-images-desktop.js`

```js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DESKTOP_SIZES = [1920, 1440, 1280, 1024];
const MOBILE_SIZES = [768, 640, 320];

async function optimizeForDesktop(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));

  for (const size of DESKTOP_SIZES) {
    // WebP
    await sharp(inputPath)
      .resize(size, null, { fit: "inside" })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, `${filename}-${size}w.webp`));

    // AVIF (better compression)
    await sharp(inputPath)
      .resize(size, null, { fit: "inside" })
      .avif({ quality: 80 })
      .toFile(path.join(outputDir, `${filename}-${size}w.avif`));
  }
}
```

**Step 3:** Use responsive images with desktop sizes:

```tsx
<Image
  src="/images/optimized/hero-1920w.webp"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1920px"
  priority
  fetchPriority="high"
/>
```

---

### 4.3 Add Service Worker for Repeat Visits

**Priority:** Low
**Estimated Time:** 4 hours
**Complexity:** High
**Expected Impact:** 2-3x faster on repeat visits

**Note:** Next.js 16 has built-in improvements for caching. Service Workers may not be necessary with proper Next.js caching strategies.

**Alternative:** Use Next.js built-in features:
- Static generation where possible
- Incremental Static Regeneration (ISR)
- Edge caching via Vercel

---

## Phase 5: Measurement & Validation

### 5.1 Set Up Continuous Performance Monitoring

**Priority:** High
**Estimated Time:** 1 hour
**Complexity:** Low

**Implementation:**

**File:** `.github/workflows/lighthouse-ci.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Start server
        run: npm run start &
        env:
          PORT: 3000

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Lighthouse CI (Mobile)
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000/en
            http://localhost:3000/en/resources
          configPath: "./lighthouserc.json"
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Run Lighthouse CI (Desktop)
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000/en
            http://localhost:3000/en/resources
          configPath: "./lighthouserc-desktop.json"
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**File:** `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "settings": {
        "preset": "mobile"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

**File:** `lighthouserc-desktop.json`

```json
{
  "ci": {
    "collect": {
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.85 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "time-to-interactive": ["warn", { "maxNumericValue": 4000 }]
      }
    }
  }
}
```

---

### 5.2 Add Real User Monitoring (RUM)

**Priority:** Medium
**Estimated Time:** 1 hour
**Complexity:** Low

**Implementation:**

**File:** `app/components/rum-monitor.tsx`

```tsx
"use client";

import { useEffect } from "react";

export default function RUMMonitor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Measure LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      // Send to analytics
      console.log("LCP:", lastEntry.renderTime);

      // Optional: Send to Vercel Analytics or custom endpoint
      if (window.va) {
        window.va("track", "LCP", {
          value: lastEntry.renderTime,
          device: window.innerWidth >= 1024 ? "desktop" : "mobile"
        });
      }
    });

    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // Measure FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log("FID:", entry.processingStart - entry.startTime);
      });
    });

    try {
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (e) {
      // Not supported in all browsers
    }

    // Measure CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log("CLS:", clsValue);
    });

    try {
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      // Not supported in all browsers
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return null;
}
```

**File:** `app/layout.tsx`

```tsx
import RUMMonitor from "@/app/components/rum-monitor";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <RUMMonitor />
      </body>
    </html>
  );
}
```

---

### 5.3 Desktop-Specific Performance Testing Checklist

**Priority:** High
**Estimated Time:** Ongoing

Before/after each optimization:

```bash
# 1. Run Lighthouse audit (desktop)
npx lighthouse http://localhost:3000/en --preset=desktop --view

# 2. Check LCP element
# DevTools > Performance > Record > Reload > Find LCP marker

# 3. Profile Timeline animation
# DevTools > Performance Monitor > CPU usage, Layouts/sec

# 4. Check bundle sizes
npm run build
# Output will show bundle sizes

# 5. Test on real desktop hardware
# Use Chrome DevTools Remote Debugging

# 6. Compare mobile vs desktop metrics using MCP
# See implementation in Phase 1
```

---

## Phase 6: Testing & Rollout Strategy

### 6.1 Testing Approach

**Unit Tests:**
- Test Timeline thread count logic for mobile/desktop
- Test font preloading media queries
- Test localStorage progressive loading

**Integration Tests:**
- Test resources page with virtualization
- Test LCP timing with Timeline deferred
- Test localStorage progressive enhancement

**E2E Tests:**
- Test full page load on mobile viewport
- Test full page load on desktop viewport
- Compare metrics between viewports

### 6.2 Rollout Strategy

**Phase 1: Quick Wins (Week 1)**
- Deploy Phase 2 optimizations (2.1-2.5)
- Target: Desktop LCP <3.0s
- Monitor RUM for regressions

**Phase 2: Medium Wins (Week 2)**
- Deploy Phase 3 optimizations (3.1, 3.3, 3.4) - Skip 3.2 (React Compiler handles it)
- Target: Desktop Performance 85%+
- A/B test virtualization on resources page

**Phase 3: Advanced (Week 3-4)**
- Deploy Phase 4 optimizations (4.1-4.2)
- Target: Desktop Performance 90%+
- Full regression testing

### 6.3 Rollback Plan

If performance degrades:
1. Revert last deployed optimization
2. Check Lighthouse CI results
3. Review RUM metrics for anomalies
4. Re-test in isolation

---

## Success Metrics

### Target Goals (4 weeks)

| Metric | Current (Desktop) | Target | Stretch |
|--------|-------------------|--------|---------|
| Performance Score | 76-78% | 85% | 90% |
| LCP | 2.8-3.7s | <2.5s | <2.0s |
| TTI | 3.9-4.0s | <3.5s | <3.0s |
| TBT | 10-15ms | <50ms | <50ms ✅ |
| CLS | 0-0.029 | <0.1 | <0.1 ✅ |

### KPIs

- Desktop LCP within 10% of mobile LCP
- Desktop performance score within 5 points of mobile
- Zero performance regressions on mobile
- Real user LCP p75 <2.5s (desktop)
- Bounce rate decrease by 5%

---

## Appendix

### A. Tools & Resources

**Performance Testing:**
- Chrome DevTools Lighthouse
- MCP Lighthouse tool: `mcp__lighthouse__run_audit`
- WebPageTest.org
- Chrome DevTools Performance Monitor
- React DevTools Profiler

**Monitoring:**
- Vercel Analytics (built-in)
- Vercel Speed Insights (built-in)
- Custom RUM with PerformanceObserver API

**Optimization:**
- sharp (image optimization)
- @tanstack/react-virtual (virtualization)
- React Compiler (automatic memoization)

### B. Reference Documents

- [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) - Previous optimization work
- [PERFORMANCE-TESTING.md](./PERFORMANCE-TESTING.md) - Testing strategies
- [LCP_OPTIMIZATION_SUMMARY.md](./LCP_OPTIMIZATION_SUMMARY.md) - LCP improvements
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [Next.js 16 Docs](https://nextjs.org/docs/app/guides/upgrading/version-16)

### C. Known Issues

1. **Desktop LCP Element Unknown**
   - Status: Needs investigation (Phase 1.1)
   - Impact: High
   - Workaround: None yet

2. **Timeline Animation Performance on Desktop**
   - Status: Suspected issue (Phase 1.2)
   - Impact: Medium
   - Workaround: Reduce thread count (Phase 2.4)

3. **Third-Party Script Timing**
   - Status: Not yet profiled
   - Impact: Unknown
   - Workaround: Lazy load embeds

### D. React Compiler Best Practices

**✅ DO:**
- Trust the compiler to optimize automatically
- Use `"use memo"` directive when you need explicit opt-in
- Use `"use no memo"` directive when you need to opt-out (e.g., animation frames)
- Keep components pure (no side effects in render)
- Use proper dependency arrays in `useEffect`

**❌ DON'T:**
- Don't add manual `React.memo()` unless necessary
- Don't add manual `useMemo()` for calculations
- Don't add manual `useCallback()` for handlers
- Don't mutate props or state
- Don't use inline object/array literals in dependency arrays

**Examples:**

```tsx
// ✅ GOOD: Let compiler handle it
function Component({ data }) {
  const processed = expensiveCalculation(data); // Auto-memoized
  const handleClick = () => doSomething(data); // Auto-stable
  return <div onClick={handleClick}>{processed}</div>;
}

// ✅ GOOD: Explicit opt-in when needed
function AnimationComponent() {
  "use no memo"; // Opt-out for animation that needs to run every frame
  const frame = useAnimationFrame();
  return <Canvas frame={frame} />;
}

// ❌ BAD: Manual optimization conflicts with compiler
function Component({ data }) {
  const processed = useMemo(() => expensiveCalculation(data), [data]); // Redundant
  const handleClick = useCallback(() => doSomething(data), [data]); // Redundant
  return <div onClick={handleClick}>{processed}</div>;
}
```

### E. Lessons Learned

1. **Dev server performance is misleading** - Always test production builds
2. **Desktop ≠ Faster** - Desktop can be slower due to more complex rendering
3. **LCP deferral is critical** - Heavy animations must wait for LCP
4. **Viewport matters** - Optimize for both mobile and desktop separately
5. **React Compiler changes everything** - Don't fight the compiler with manual optimizations
6. **TanStack Virtual > react-window** - Better React 19 integration

---

## Next Steps

1. **Immediate (Today):**
   - Run Phase 1.1: Identify desktop LCP element
   - Run Phase 1.3: Verify React Compiler is working
   - Implement Phase 2.1: Preload desktop fonts
   - Implement Phase 2.2: Add fetchPriority to hero

2. **This Week:**
   - Complete Phase 2 (Quick Wins)
   - Run Lighthouse audits after each change
   - Document results

3. **Next Week:**
   - Start Phase 3 (Medium Wins)
   - Implement resources page virtualization with TanStack Virtual
   - Set up Lighthouse CI

4. **Long Term:**
   - Phase 4 (Advanced Optimizations)
   - Continuous monitoring with RUM
   - Iterate based on real user data

---

**Document Version:** 2.0 (Updated for React Compiler)
**Last Updated:** 2025-10-23
**Owner:** Performance Team
**Status:** Ready for Implementation
**Changes from v1.0:** Removed manual memoization (Phase 3.2), updated virtualization to TanStack Virtual, added React Compiler best practices
