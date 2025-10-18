# Performance Testing Guide

This guide documents how to use Chrome DevTools MCP integration to test the performance of this Next.js application.

## Prerequisites

```bash
# Ensure dev server is running
npm run dev
# Server should be running at http://localhost:3000
```

## Quick Start

The simplest performance test:

```typescript
// Navigate and capture page load performance
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/en" })
mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: false })
// Wait 5 seconds
mcp__chrome-devtools__performance_stop_trace()
// Review Core Web Vitals in results
```

## Comprehensive Test Suite

### Test 1: Basic Page Load Performance

**Purpose**: Measure Core Web Vitals (LCP, CLS, INP) for initial page load

**Steps**:
1. Navigate to English homepage: `http://localhost:3000/en`
2. Start performance trace with reload enabled
3. Wait for page to fully load (~5 seconds)
4. Stop trace and review metrics
5. Analyze LCP breakdown for optimization opportunities

**Expected Results**:
- LCP: < 2.5s (Good), < 4s (Needs Improvement)
- CLS: < 0.1 (timeline animation shouldn't shift layout)
- INP: < 200ms (interaction responsiveness)

**Chrome MCP Commands**:
```typescript
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/en" })
mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: false })
// Wait 5 seconds
mcp__chrome-devtools__performance_stop_trace()
mcp__chrome-devtools__performance_analyze_insight({ insightName: "LCPBreakdown" })
```

### Test 2: Timeline Animation Frame Rate

**Purpose**: Verify SVG timeline animation maintains 60fps (16.67ms per frame)

**What to Look For**:
- No dropped frames during animation
- Consistent frame timing
- Main thread tasks < 50ms
- RAF callbacks complete within budget

**Steps**:
1. Navigate to page
2. Start trace WITHOUT reload (captures running animation)
3. Let animation run for 10 seconds (multiple cycles)
4. Stop trace
5. Analyze for long tasks and render blocking

**Expected Results**:
- Frame rate: Consistent 60fps
- No tasks > 50ms
- Memory allocations minimal (Float32Array optimization)

**Chrome MCP Commands**:
```typescript
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/en" })
// Wait for initial load
mcp__chrome-devtools__performance_start_trace({ reload: false, autoStop: false })
// Wait 10 seconds to capture animation
mcp__chrome-devtools__performance_stop_trace()
mcp__chrome-devtools__performance_analyze_insight({ insightName: "LongTasks" })
mcp__chrome-devtools__performance_analyze_insight({ insightName: "RenderBlocking" })
```

### Test 3: Real-World Performance (Throttled Conditions)

**Purpose**: Test on low-end mobile devices with slow network

**Conditions**:
- CPU: 4x slowdown (simulates budget Android)
- Network: Slow 3G
- Viewport: 375x667 (iPhone SE)

**Steps**:
1. Enable CPU throttling (4x)
2. Enable network throttling (Slow 3G)
3. Resize to mobile viewport
4. Start trace with reload
5. Wait for complete load
6. Analyze document latency
7. Reset throttling

**Expected Results**:
- LCP: < 4s (acceptable on Slow 3G)
- Page remains usable despite throttling
- Critical resources prioritized

**Chrome MCP Commands**:
```typescript
mcp__chrome-devtools__emulate_cpu({ throttlingRate: 4 })
mcp__chrome-devtools__emulate_network({ throttlingOption: "Slow 3G" })
mcp__chrome-devtools__resize_page({ width: 375, height: 667 })
mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: false })
// Wait for complete load (~10 seconds)
mcp__chrome-devtools__performance_stop_trace()
mcp__chrome-devtools__performance_analyze_insight({ insightName: "DocumentLatency" })
mcp__chrome-devtools__performance_analyze_insight({ insightName: "SlowCSSSelector" })

// Reset to normal
mcp__chrome-devtools__emulate_cpu({ throttlingRate: 1 })
mcp__chrome-devtools__emulate_network({ throttlingOption: "No emulation" })
```

### Test 4: Network Waterfall Analysis

**Purpose**: Identify resource loading bottlenecks

**What to Examine**:
- Font loading strategy (Geist Sans/Mono with font-display)
- Image optimization (Next.js Image component)
- JavaScript bundle size and splitting (Turbopack)
- CSS bundle size (Tailwind v4)
- Resource caching headers

**Steps**:
1. Navigate to page
2. List all network requests
3. Filter by resource type
4. Examine critical resources (fonts, main bundle)
5. Check for optimization opportunities

**Chrome MCP Commands**:
```typescript
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/en" })
mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["script", "font", "image", "stylesheet"]
})

// Deep dive into specific resources
mcp__chrome-devtools__get_network_request({
  url: "http://localhost:3000/_next/static/..."  // Copy from list results
})
```

### Test 5: Multi-Route Performance Comparison

**Purpose**: Compare performance across different routes and languages

**Routes to Test**:
- `/en` (English home)
- `/es` (Spanish home)
- `/en/about`
- `/en/activities`
- `/en/research`
- `/en/resources`
- `/en/contact`

**Steps**:
1. Test each route individually with performance trace
2. Compare Core Web Vitals across routes
3. Identify route-specific performance issues
4. Compare i18n overhead (EN vs ES)

**Chrome MCP Commands**:
```typescript
// Test English home
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/en" })
mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: true })

// Test Spanish home
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/es" })
mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: true })

// Test other pages
const routes = ["/en/about", "/en/activities", "/en/research", "/en/resources", "/en/contact"];
// Repeat trace for each route
```

### Test 6: IntersectionObserver Battery Optimization

**Purpose**: Verify timeline animation pauses when off-screen

**Architecture Note**: Timeline component uses IntersectionObserver to pause animation when not visible, reducing CPU usage and battery consumption.

**Steps**:
1. Navigate to page and verify timeline is visible
2. Start performance trace
3. Scroll timeline off-screen
4. Wait 5 seconds (animation should pause)
5. Scroll back to top (animation should resume)
6. Stop trace
7. Compare CPU usage when visible vs hidden

**Expected Results**:
- Reduced CPU usage when off-screen
- Animation resumes smoothly when visible
- No memory leaks from start/stop cycles

**Chrome MCP Commands**:
```typescript
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/en" })
mcp__chrome-devtools__take_snapshot()  // Verify timeline visible

mcp__chrome-devtools__performance_start_trace({ reload: false, autoStop: false })

// Scroll timeline off-screen
mcp__chrome-devtools__evaluate_script({
  function: "() => { window.scrollTo(0, 2000); return 'scrolled down'; }"
})

// Wait 5 seconds

// Scroll back up
mcp__chrome-devtools__evaluate_script({
  function: "() => { window.scrollTo(0, 0); return 'scrolled up'; }"
})

mcp__chrome-devtools__performance_stop_trace()
```

### Test 7: Memory Leak Detection

**Purpose**: Verify Float32Array optimization prevents memory allocation spikes

**Architecture Note**: Timeline uses Float32Array for point storage instead of object arrays, reducing allocations from ~2000/sec to ~30/sec.

**Steps**:
1. Start performance trace
2. Navigate through multiple routes
3. Return to original route
4. Stop trace
5. Analyze memory patterns

**Expected Results**:
- Stable memory usage
- No continuous memory growth
- Memory released when components unmount

**Chrome MCP Commands**:
```typescript
const routes = [
  "http://localhost:3000/en",
  "http://localhost:3000/es",
  "http://localhost:3000/en/about",
  "http://localhost:3000/en/activities",
  "http://localhost:3000/en"
];

mcp__chrome-devtools__performance_start_trace({ reload: false, autoStop: false })

for (const route of routes) {
  mcp__chrome-devtools__navigate_page({ url: route })
  // Wait 2 seconds between navigations
}

mcp__chrome-devtools__performance_stop_trace()
```

### Test 8: Console Error Detection

**Purpose**: Identify runtime errors and warnings

**Steps**:
1. Navigate to each route
2. List console messages
3. Filter for errors and warnings
4. Document and fix issues

**Chrome MCP Commands**:
```typescript
mcp__chrome-devtools__navigate_page({ url: "http://localhost:3000/en" })
mcp__chrome-devtools__list_console_messages()
// Review for errors, warnings, or performance issues
```

## Performance Insights Reference

### Available Insights (via `performance_analyze_insight`)

| Insight Name | What It Reveals | This App's Concerns |
|--------------|-----------------|---------------------|
| `LCPBreakdown` | What delayed largest contentful paint | Geist font loading, Timeline SVG render time, hero images |
| `RenderBlocking` | Resources blocking initial render | Tailwind CSS v4 bundle, font loading FOIT/FOUT |
| `SlowCSSSelector` | Expensive CSS selectors | Tailwind utilities (should be fast), custom variables |
| `DocumentLatency` | Network timing and server response | Turbopack bundle splitting, Next.js 15 overhead |
| `LongTasks` | Main thread blocking (>50ms) | Timeline animation calculations, RAF callback duration |
| `LayoutShift` | Visual instability (CLS) | Timeline animation (should not cause shifts), font loading |

## Performance Targets

Based on this app's architecture and optimizations:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **INP** | < 200ms | 200ms - 500ms | > 500ms |
| **Frame Rate** | 60fps (16.67ms/frame) | 30fps | < 30fps |
| **Memory** | Stable, < 50MB | Growing slowly | Continuous growth |

### App-Specific Targets

- **Timeline Animation**: Consistent 60fps, no dropped frames
- **Memory Allocations**: < 50/sec (Float32Array optimization)
- **IntersectionObserver**: CPU usage drops when off-screen
- **Font Loading**: No FOIT (flash of invisible text)
- **Route Transitions**: < 100ms (App Router optimization)

## Common Issues and Solutions

### High LCP (> 2.5s)

**Possible Causes**:
- Font loading blocking render
- Large Tailwind CSS bundle
- Unoptimized images
- Slow server response (Turbopack)

**Solutions**:
- Verify `font-display: swap` on Geist fonts
- Check Tailwind bundle size
- Use Next.js Image component with priority
- Check dev server performance (production build)

### Dropped Frames (< 60fps)

**Possible Causes**:
- Timeline animation calculations too expensive
- Too many DOM updates
- React re-renders

**Solutions**:
- Profile with React DevTools Profiler
- Check RAF callback duration
- Verify precomputed invariants
- Review will-change and containment CSS

### High Memory Usage

**Possible Causes**:
- Event listeners not cleaned up
- Animation frames not cancelled
- Component state leaks

**Solutions**:
- Check IntersectionObserver cleanup
- Verify useEffect cleanup functions
- Profile with Chrome DevTools Memory tab

### High CLS

**Possible Causes**:
- Font loading causing layout shift
- Images without dimensions
- Timeline animation triggering reflow

**Solutions**:
- Specify font fallbacks
- Add width/height to images
- Use transform/opacity for animations (not layout properties)

## Regression Testing Workflow

**Before Each PR**:
1. Run Test 1 (Basic Page Load Performance)
2. Check for console errors (Test 8)
3. Verify no performance regressions

**Weekly**:
1. Run full test suite
2. Compare results over time
3. Document performance improvements

**After Major Changes**:
- **i18n changes**: Run Test 5 (Multi-Route Comparison)
- **Animation updates**: Run Test 2 (Frame Rate) + Test 6 (IntersectionObserver)
- **Bundle changes**: Run Test 4 (Network Waterfall)
- **New features**: Run Test 3 (Throttled Conditions)

## Automation Potential

These tests can be run systematically through Claude Code's Chrome MCP integration:

1. Ask Claude: "Run performance test suite"
2. Claude executes all tests sequentially
3. Results compiled into performance report
4. Regressions automatically flagged

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)

## Changelog

- 2025-10-17: Initial performance testing documentation created
