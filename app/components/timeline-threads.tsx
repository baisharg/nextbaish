"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { WorkerThreadData, ThreadsGeneratedMessage } from "../workers/thread-generator.worker";
import {
  type Direction,
  type HSL,
  type PathProfile,
  THREAD_COUNT,
  VIEWBOX_SIZE,
  FLIP_INTERVAL_MS,
  SETTLE_BUFFER_MS,
  FRAME_INTERVAL,
  BEZIER_CONTROL_FACTOR,
  PIVOT_DAMPING,
  SEGMENT_FACTORS,
  GOLDEN_RATIO_SEED,
  adjustColor,
  hslToString,
  createSeededRandom,
  chooseColor,
  createPathProfile,
  directionDuration,
  directionDurationSeeded,
  randomInRangeWith,
  clamp,
  getUpFraction,
} from "../utils/thread-utils";

/**
 * --------------------------------------------------------------------------------
 * PERF CONSTANTS / PRECOMPUTATION (module scope)
 * --------------------------------------------------------------------------------
 * We precompute the segment phase offsets once (hot-path math), and keep small,
 * reusable string buffers and typed arrays in thread state to avoid per-frame GC.
 */
const SEG_LEN = SEGMENT_FACTORS.length;
// Phase offsets used every frame in sin/cos; precompute once.
const SIN_OFFSETS = new Float32Array(SEG_LEN);
const COS_OFFSETS = new Float32Array(SEG_LEN);
for (let i = 0; i < SEG_LEN; i++) {
  const s = SEGMENT_FACTORS[i];
  SIN_OFFSETS[i] = s * Math.PI;
  COS_OFFSETS[i] = s * Math.PI * 0.5;
}

// PERF: Track which threads are currently transitioning (typically 0-3 threads)
// Allows us to skip transition checks for the majority of threads
const transitioningThreadIds = new Set<number>();

// PERF: Sin/Cos lookup table with linear interpolation (3-4x faster than Math.sin/cos)
// High resolution table (4096 entries) for smooth interpolation
const SIN_TABLE_SIZE = 4096;
const SIN_TABLE = new Float32Array(SIN_TABLE_SIZE);
const TWO_PI = Math.PI * 2;
for (let i = 0; i < SIN_TABLE_SIZE; i++) {
  SIN_TABLE[i] = Math.sin((i / SIN_TABLE_SIZE) * TWO_PI);
}

const fastSin = (angle: number): number => {
  // Normalize angle to [0, 1) range
  const normalized = ((angle / TWO_PI) % 1 + 1) % 1;
  const scaled = normalized * SIN_TABLE_SIZE;
  const index = scaled | 0;
  const nextIndex = (index + 1) % SIN_TABLE_SIZE;
  const fraction = scaled - index;
  // Linear interpolation between table values
  return SIN_TABLE[index] + (SIN_TABLE[nextIndex] - SIN_TABLE[index]) * fraction;
};

const fastCos = (angle: number): number => fastSin(angle + Math.PI * 0.5);

type PerformanceProfile = {
  threadCount: number;
  blurStdDeviation: number;
  frameInterval: number;
};

const DEFAULT_PERFORMANCE_PROFILE: PerformanceProfile = {
  threadCount: THREAD_COUNT,
  blurStdDeviation: 3.5,
  frameInterval: FRAME_INTERVAL,
};

const LOW_POWER_FRAME_INTERVAL = 1000 / 45;

type NavigatorConnection = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
  connection?: NavigatorConnection;
};

const profilesEqual = (a: PerformanceProfile, b: PerformanceProfile) =>
  a.threadCount === b.threadCount &&
  Math.abs(a.blurStdDeviation - b.blurStdDeviation) < 0.01 &&
  Math.abs(a.frameInterval - b.frameInterval) < 0.01;

const computePerformanceProfile = (): PerformanceProfile => {
  if (typeof window === "undefined") {
    return DEFAULT_PERFORMANCE_PROFILE;
  }

  const width = window.innerWidth || 0;
  const dpr = window.devicePixelRatio || 1;
  const nav = (typeof navigator !== "undefined" ? (navigator as NavigatorWithConnection) : undefined);
  const hardware = nav?.hardwareConcurrency ?? 0;
  const saveData = Boolean(nav?.connection?.saveData);
  const effectiveType = nav?.connection?.effectiveType ?? "";
  const isSlowConnection = effectiveType.includes("2g") || effectiveType.includes("slow-2g");

  let threadScale = 1;
  if (width <= 480) threadScale = 0.72;
  else if (width <= 640) threadScale = 0.82;
  else if (width <= 820) threadScale = 0.9;

  if (dpr >= 3) {
    threadScale *= 0.92;
  }

  const minThreads = Math.max(Math.round(THREAD_COUNT * 0.6), 28);
  const scaled = THREAD_COUNT * threadScale;
  const threadCount = Math.round(clamp(scaled, minThreads, THREAD_COUNT));

  let blurStdDeviation = 3.5;
  if (dpr >= 3.5) blurStdDeviation = 1.8;
  else if (dpr >= 3) blurStdDeviation = 2.1;
  else if (dpr >= 2) blurStdDeviation = 2.75;
  if (width <= 480) blurStdDeviation *= 0.9;
  blurStdDeviation = Math.max(1.6, Number(blurStdDeviation.toFixed(2)));

  const lowPowerHardware = hardware > 0 && hardware <= 4;
  const lowPower = lowPowerHardware || saveData || isSlowConnection || width <= 480;
  const frameInterval = lowPower ? Math.max(FRAME_INTERVAL, LOW_POWER_FRAME_INTERVAL) : FRAME_INTERVAL;

  return {
    threadCount,
    blurStdDeviation,
    frameInterval,
  };
};

// --------------------------------------------------------------------------------
// TYPES
// --------------------------------------------------------------------------------

type ThreadState = {
  id: number;
  color: HSL;
  weight: number;
  opacity: number;
  profile: PathProfile;
  direction: Direction;
  path: string;
  pathBuffer: string[];

  // Timing / motion
  duration: number;
  lastFlipAt: number;
  swayPhase: number;
  driftPhase: number;
  swayFreq: number;
  driftFreq: number;
  swayAmp: number;
  driftAmp: number;
  targetDirection: Direction;
  transitionStartTime: number;

  // Scratch/derived for perf:
  // - floatingPoints: final per-frame coordinates (drift + sway applied)
  // - bounds for gradient (y1/y2 in absolute SVG coords)
  // All arrays are sized to the path's point count and reused each frame.
  floatingPoints: Float32Array;
  y1: number;
  y2: number;

  // Precomputed gradient stop strings to avoid recomputing hsl every render
  gradUp0: string;
  gradUp50: string;
  gradUp100: string;
  gradDown0: string;
  gradDown30: string;
  gradDown60: string;
};

// --------------------------------------------------------------------------------
// GEOMETRY → STRING (reuses numbers, avoids temporary arrays)
// --------------------------------------------------------------------------------

const formatCoord = (value: number): string => {
  // PERF: Reduced to 1 decimal place (0.1 SVG unit ≈ 0.1px, imperceptible)
  const scaled = Math.round(value * 10);

  // PERF: Early return for zero (common case)
  if (scaled === 0) return "0";

  const sign = scaled < 0 ? "-" : "";
  const absScaled = Math.abs(scaled);
  // PERF: Use bitwise OR for integer division (faster than Math.floor for positive numbers)
  const integer = (absScaled / 10) | 0;
  const fraction = absScaled % 10;

  if (fraction === 0) {
    return `${sign}${integer}`;
  }

  // No padding needed for single digit
  return `${sign}${integer}.${fraction}`;
};

/**
 * Builds a cubic Bezier path string from normalized points in [0..1] space,
 * scaled to the SVG viewBox. Reuses an optional buffer to avoid per-frame allocations.
 * Optimized: reuses coordinates from previous iteration (50% fewer array reads).
 */
const buildCubicBezierPath = (points: Float32Array, buffer?: string[]): string => {
  const n = points.length >>> 1; // number of (x,y) points
  if (n === 0) return "";

  const out = buffer ?? [];
  out.length = 0;

  const x0 = points[0] * VIEWBOX_SIZE;
  const y0 = points[1] * VIEWBOX_SIZE;
  out.push(`M ${formatCoord(x0)} ${formatCoord(y0)}`);

  // PERF: Reuse prev coordinates from previous iteration instead of re-reading
  let prevPrevX = x0;
  let prevPrevY = y0;
  let prevX = x0;
  let prevY = y0;

  for (let i = 1; i < n; i++) {
    const currIdx = i << 1;
    const currX = points[currIdx] * VIEWBOX_SIZE;
    const currY = points[currIdx + 1] * VIEWBOX_SIZE;

    const nextIdx = i < n - 1 ? ((i + 1) << 1) : currIdx;
    const nextX = points[nextIdx] * VIEWBOX_SIZE;
    const nextY = points[nextIdx + 1] * VIEWBOX_SIZE;

    const cp1x = prevX + (currX - prevPrevX) * BEZIER_CONTROL_FACTOR;
    const cp1y = prevY + (currY - prevPrevY) * BEZIER_CONTROL_FACTOR;
    const cp2x = currX - (nextX - prevX) * BEZIER_CONTROL_FACTOR;
    const cp2y = currY - (nextY - prevY) * BEZIER_CONTROL_FACTOR;

    out.push(
      `C ${formatCoord(cp1x)} ${formatCoord(cp1y)} ${formatCoord(cp2x)} ${formatCoord(cp2y)} ${formatCoord(currX)} ${formatCoord(currY)}`,
    );

    // Shift coordinates for next iteration
    prevPrevX = prevX;
    prevPrevY = prevY;
    prevX = currX;
    prevY = currY;
  }

  return out.join(" ");
};

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Writes final animated (drift+sway) coordinates into thread.floatingPoints.
 * This fuses interpolation + drift/sway. No new arrays per frame.
 * Optimized: skips interpolation math when not transitioning.
 */
const writeAnimatedPoints = (
  target: Float32Array,
  base: Float32Array,
  into: Float32Array,
  now: number,
  transitionStartTime: number,
  duration: number,
  swayPhase: number,
  driftPhase: number,
  swayFreq: number,
  driftFreq: number,
  swayAmp: number,
  driftAmp: number,
): void => {
  const n = into.length >>> 1;

  // PERF: Hoist frequency calculations outside loop (saves 2 muls + 2 adds per point)
  const swayBase = now * swayFreq + swayPhase;
  const driftBase = now * driftFreq + driftPhase;

  // PERF: Split into two paths to avoid interpolation math when not transitioning
  if (transitionStartTime > 0) {
    // Transitioning: interpolate between base and target
    const progress = Math.min((now - transitionStartTime) / duration, 1);
    const t = progress >= 1 ? 1 : easeInOutCubic(progress);

    for (let i = 0; i < n; i++) {
      const xi = i << 1;
      const yi = xi + 1;

      const ix = base[xi] + (target[xi] - base[xi]) * t;
      const iy = base[yi] + (target[yi] - base[yi]) * t;

      const swayOffset = fastSin(swayBase + SIN_OFFSETS[i]) * swayAmp * PIVOT_DAMPING[i];
      const driftOffset = fastCos(driftBase + COS_OFFSETS[i]) * driftAmp;

      into[xi] = ix + driftOffset;
      into[yi] = iy + swayOffset;
    }
  } else {
    // Not transitioning: use target directly (saves 4 reads + 2 subs + 2 muls + 2 adds per point)
    for (let i = 0; i < n; i++) {
      const xi = i << 1;
      const yi = xi + 1;

      const swayOffset = fastSin(swayBase + SIN_OFFSETS[i]) * swayAmp * PIVOT_DAMPING[i];
      const driftOffset = fastCos(driftBase + COS_OFFSETS[i]) * driftAmp;

      into[xi] = target[xi] + driftOffset;
      into[yi] = target[yi] + swayOffset;
    }
  }
};

// --------------------------------------------------------------------------------
// THREAD MANAGEMENT
// --------------------------------------------------------------------------------

type FlipDecision = { threadId: number; direction: Direction } | null;

const selectThreadToFlip = (
  threads: ThreadState[],
  now: number,
  settleBufferMs: number = SETTLE_BUFFER_MS,
  preferDownWeight: number = 0.75,
): FlipDecision => {
  const eligible = (dir: Direction) =>
    threads.filter((thread) => thread.direction === dir && now - thread.lastFlipAt > settleBufferMs);

  const pick = (dir: Direction) => {
    const candidates = eligible(dir);
    if (!candidates.length) return null;
    return candidates[(Math.random() * candidates.length) | 0];
  };

  let target = Math.random() < preferDownWeight ? pick("down") : null;
  if (!target) target = pick("up");
  if (!target) target = pick("down");
  if (!target) return null;

  const nextDirection: Direction = target.direction === "down" ? "up" : "down";

  // Ensure at least one "up" thread remains.
  const upThreads = threads.filter((t) => t.direction === "up" || t.targetDirection === "up");
  if (nextDirection === "down" && upThreads.length <= 1) return null;

  return { threadId: target.id, direction: nextDirection };
};

// Factory (main-thread) — unchanged visuals; we add scratch + gradient bounds/stops.
const createThread = (id: number, totalThreads: number): ThreadState => {
  const rng = createSeededRandom(GOLDEN_RATIO_SEED ^ (id + 1));
  const profile = createPathProfile(id, rng, totalThreads);
  const upFraction = getUpFraction(totalThreads);
  const direction: Direction = rng() < upFraction ? "up" : "down";
  const pathBuffer: string[] = [];

  // Gradient y-bounds (based on "down" path as before).
  let minY = Infinity;
  let maxY = -Infinity;
  const down = profile.down;
  for (let i = 0; i < down.length; i += 2) {
    const y = down[i + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const color = chooseColor(rng);

  return {
    id,
    color,
    weight: randomInRangeWith(rng, 0.8, 1.4),
    opacity: clamp(0.52 + id / (totalThreads * 3.5), 0.56, 0.82),
    profile,
    direction,
    pathBuffer,
    path: buildCubicBezierPath(profile[direction], pathBuffer),
    duration: directionDurationSeeded(direction, rng),
    lastFlipAt: 0,
    swayPhase: randomInRangeWith(rng, 0, Math.PI * 2),
    driftPhase: randomInRangeWith(rng, 0, Math.PI * 2),
    swayFreq: randomInRangeWith(rng, 0.0008, 0.0015),
    driftFreq: randomInRangeWith(rng, 0.0006, 0.0012),
    swayAmp: randomInRangeWith(rng, 0.00375, 0.00875),
    driftAmp: randomInRangeWith(rng, 0.003, 0.007),
    targetDirection: direction,
    transitionStartTime: 0,

    // Scratch buffers + gradient bounds/stops:
    floatingPoints: new Float32Array(profile.down.length),
    y1: minY * VIEWBOX_SIZE,
    y2: maxY * VIEWBOX_SIZE,

    gradUp0: hslToString(adjustColor(color, { h: -18, s: 0, l: 10 })),
    gradUp50: hslToString(adjustColor(color, { h: 4, s: 0, l: 0 })),
    gradUp100: hslToString(adjustColor(color, { h: 24, s: -3, l: -12 })),
    gradDown0: hslToString(color),
    gradDown30: hslToString(adjustColor(color, { s: -10, l: -5 })),
    gradDown60: hslToString(adjustColor(color, { s: -40, l: -25 })),
  };
};

// Worker → ThreadState (keeps visuals; adds scratch + gradient precompute)
const workerDataToThreadState = (data: WorkerThreadData): ThreadState => {
  const profile: PathProfile = {
    neutral: data.profileNeutral,
    up: data.profileUp,
    down: data.profileDown,
  };

  // Gradient y-bounds from "down" path.
  let minY = Infinity;
  let maxY = -Infinity;
  const down = profile.down;
  for (let i = 0; i < down.length; i += 2) {
    const y = down[i + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const color = data.color;
  const pathBuffer: string[] = [];

  return {
    id: data.id,
    color,
    weight: data.weight,
    opacity: data.opacity,
    profile,
    direction: data.direction,
    pathBuffer,
    path: buildCubicBezierPath(profile[data.direction], pathBuffer),
    duration: data.duration,
    lastFlipAt: 0,
    swayPhase: data.swayPhase,
    driftPhase: data.driftPhase,
    swayFreq: data.swayFreq,
    driftFreq: data.driftFreq,
    swayAmp: data.swayAmp,
    driftAmp: data.driftAmp,
    targetDirection: data.direction,
    transitionStartTime: 0,

    floatingPoints: new Float32Array(profile.down.length),
    y1: minY * VIEWBOX_SIZE,
    y2: maxY * VIEWBOX_SIZE,

    gradUp0: hslToString(adjustColor(color, { h: -18, s: 0, l: 10 })),
    gradUp50: hslToString(adjustColor(color, { h: 4, s: 0, l: 0 })),
    gradUp100: hslToString(adjustColor(color, { h: 24, s: -3, l: -12 })),
    gradDown0: hslToString(color),
    gradDown30: hslToString(adjustColor(color, { s: -10, l: -5 })),
    gradDown60: hslToString(adjustColor(color, { s: -40, l: -25 })),
  };
};

// --------------------------------------------------------------------------------
// REACT COMPONENT
// --------------------------------------------------------------------------------

const usePrefersReducedMotion = () => {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return prefers;
};

type TimelineThreadsProps = { className?: string; style?: CSSProperties };
type PathRefMap = Map<number, SVGPathElement>;

function TimelineThreadsComponent({ className, style }: TimelineThreadsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [threads, setThreads] = useState<ThreadState[]>([]);
  const [performanceProfile, setPerformanceProfile] = useState<PerformanceProfile>(DEFAULT_PERFORMANCE_PROFILE);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const { threadCount, frameInterval, blurStdDeviation } = performanceProfile;
  const filterId = useId();
  const gradientBaseId = `${filterId}-grad`;
  const threadsRef = useRef<ThreadState[]>([]);
  const pathRefs = useRef<PathRefMap>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    const updateProfile = () => {
      const next = computePerformanceProfile();
      setPerformanceProfile((prev) => (profilesEqual(prev, next) ? prev : next));
    };

    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateProfile();
      });
    };

    updateProfile();

    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleUpdate);

    const nav = (typeof navigator !== "undefined" ? (navigator as NavigatorWithConnection) : undefined);
    const connection = nav?.connection;
    const detachConnection =
      connection && typeof connection.addEventListener === "function"
        ? (() => {
            connection.addEventListener("change", scheduleUpdate);
            return () => connection.removeEventListener?.("change", scheduleUpdate);
          })()
        : undefined;

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      detachConnection?.();
    };
  }, []);

  // Stable registrar; called with a closure per thread on first render only.
  const registerPath = (id: number) => (node: SVGPathElement | null) => {
    if (node) pathRefs.current.set(id, node);
    else pathRefs.current.delete(id);
  };

  const syncThreads = (incoming: ThreadState[]) => {
    const normalized = incoming.map((thread) => {
      const pathBuffer = thread.pathBuffer ?? [];
      const path = buildCubicBezierPath(thread.profile[thread.direction], pathBuffer);
      return {
        ...thread,
        pathBuffer,
        path,
        targetDirection: thread.targetDirection ?? thread.direction,
        transitionStartTime: 0,
      };
    });
    threadsRef.current = normalized.map((t) => ({ ...t }));
    setThreads(normalized);
  };

  // Initialize threads via Worker (with main-thread fallback)
  useEffect(() => {
    const totalThreads = Math.max(threadCount, 1);

    threadsRef.current = [];
    setThreads([]);
    // PERF: Clear transitioning threads when reinitializing
    transitioningThreadIds.clear();

    let mounted = true;
    let worker: Worker | null = null;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

    const initThreadsFromMain = () => {
      if (!mounted) return;
      const mainThreads = Array.from({ length: totalThreads }, (_, id) => createThread(id, totalThreads));
      const hasUpThread = mainThreads.some((t) => t.direction === "up");
      if (!hasUpThread) {
        mainThreads[0] = { ...mainThreads[0], direction: "up", targetDirection: "up" };
      }
      syncThreads(mainThreads);
    };

    try {
      worker = new Worker(new URL("../workers/thread-generator.worker.ts", import.meta.url));
      // If the worker is too slow, fall back to main thread to avoid blocking visuals.
      fallbackTimeout = setTimeout(() => {
        if (mounted && threadsRef.current.length === 0) initThreadsFromMain();
      }, 1000);

      worker.onmessage = (event: MessageEvent<ThreadsGeneratedMessage>) => {
        if (!mounted) return;
        if (event.data.type === "threadsGenerated") {
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
          const workerThreads = event.data.threads.map(workerDataToThreadState);
          syncThreads(workerThreads);
        }
      };

      worker.onerror = () => {
        if (mounted && threadsRef.current.length === 0) initThreadsFromMain();
      };

      worker.postMessage({ type: "generateThreads", count: totalThreads });
    } catch {
      initThreadsFromMain();
    }

    return () => {
      mounted = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (worker) worker.terminate();
    };
  }, [threadCount]);

  // Defer animation until page is fully loaded / idle
  useEffect(() => {
    if (threads.length === 0) return;

    const enable = () => {
      const requestIdle =
        typeof window !== "undefined"
          ? ((window as typeof window & {
              requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
            }).requestIdleCallback)
          : undefined;

      if (typeof requestIdle === "function") {
        requestIdle(() => setShouldAnimate(true), { timeout: 2000 });
      } else {
        setTimeout(() => setShouldAnimate(true), 100);
      }
    };

    if (document.readyState === "complete") enable();
    else {
      const onLoad = () => enable();
      window.addEventListener("load", onLoad, { once: true, passive: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, [threads.length]);

  // Pause when off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;

    const PARALLAX_FACTOR = 0.05; // Subtle parallax effect (15% of scroll speed)
    let rafId = 0;
    let currentScroll = window.scrollY;

    const updateParallax = () => {
      const offset = -currentScroll * PARALLAX_FACTOR; // Negative for upward movement
      setParallaxOffset(offset);
      rafId = 0;
    };

    const handleScroll = () => {
      currentScroll = window.scrollY;
      // Throttle updates with RAF for smooth performance
      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    // Initial position
    updateParallax();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  const setStaticPathForThread = (thread: ThreadState) => {
    const staticPath = buildCubicBezierPath(thread.profile[thread.direction], thread.pathBuffer);
    thread.path = staticPath;
    thread.targetDirection = thread.direction;
    thread.transitionStartTime = 0;
    const pathElement = pathRefs.current.get(thread.id);
    if (pathElement) {
      pathElement.setAttribute("d", staticPath);
      pathElement.setAttribute("stroke", `url(#${gradientBaseId}-${thread.id}-${thread.direction})`);
    }
  };

  /**
   * Single rAF loop:
   *  - throttled by the selected frameInterval
   *  - drives both path animation and direction flipping (no setInterval)
   *  - avoids per-frame allocations by reusing per-thread buffers
   */
  useEffect(() => {
    if (prefersReducedMotion || !isVisible || !shouldAnimate || threadsRef.current.length === 0) {
      if (threadsRef.current.length > 0) {
        threadsRef.current.forEach(setStaticPathForThread);
      }
      return;
    }

    let rafId = 0;
    let lastFrameTime = performance.now();
    let lastFlipCheck = lastFrameTime;

    const animate = (now: number) => {
      const elapsed = now - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        const runtimeThreads = threadsRef.current;

        // Flip decision on interval — integrated here for one scheduler.
        if (now - lastFlipCheck >= FLIP_INTERVAL_MS) {
          lastFlipCheck = now;
          const decision = selectThreadToFlip(runtimeThreads, now);
          if (decision) {
            const { threadId, direction: nextDirection } = decision;
            const t = runtimeThreads.find((x) => x.id === threadId);
            if (t) {
              t.duration = directionDuration(nextDirection);
              t.targetDirection = nextDirection;
              t.transitionStartTime = now;
              t.lastFlipAt = now;
              // PERF: Track that this thread is now transitioning
              transitioningThreadIds.add(threadId);
            }
          }
        }

        // Animate all paths with fused math into reusable buffers.
        for (const thread of runtimeThreads) {
          const basePoints = thread.profile[thread.direction];
          const targetPoints = thread.profile[thread.targetDirection];

          writeAnimatedPoints(
            targetPoints,
            basePoints,
            thread.floatingPoints,
            now,
            thread.transitionStartTime,
            thread.duration,
            thread.swayPhase,
            thread.driftPhase,
            thread.swayFreq,
            thread.driftFreq,
            thread.swayAmp,
            thread.driftAmp,
          );

          const newPath = buildCubicBezierPath(thread.floatingPoints, thread.pathBuffer);
          thread.path = newPath;

          const el = pathRefs.current.get(thread.id);
          if (el) {
            el.setAttribute("d", newPath);
          }
        }

        // PERF: Only check transition completion for threads that are actually transitioning
        // This is typically 0-3 threads instead of all 40
        for (const threadId of transitioningThreadIds) {
          // PERF: Direct array access (thread IDs match array indices) instead of O(n) find()
          const thread = runtimeThreads[threadId];
          if (!thread) continue;

          const isTransitioning =
            thread.transitionStartTime > 0 && now - thread.transitionStartTime < thread.duration;

          if (!isTransitioning && thread.direction !== thread.targetDirection) {
            thread.direction = thread.targetDirection;
            transitioningThreadIds.delete(threadId);

            const el = pathRefs.current.get(threadId);
            if (el) {
              el.setAttribute("stroke", `url(#${gradientBaseId}-${threadId}-${thread.direction})`);
            }
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion, isVisible, shouldAnimate, gradientBaseId, frameInterval]);

  if (threads.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`pointer-events-none ${className ?? "absolute inset-0"}`}
        style={style}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className ?? "absolute inset-0"}`}
      style={{ ...style, contain: "layout style paint" }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{
          contain: "paint",
          transform: `translateY(${parallaxOffset}px)`,
          willChange: "transform",
        }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurStdDeviation} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id={`${filterId}-overlay`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(118, 123, 255, 0.38)" />
            <stop offset="42%" stopColor="rgba(219, 126, 255, 0.22)" />
            <stop offset="75%" stopColor="rgba(188, 94, 255, 0.18)" />
            <stop offset="100%" stopColor="rgba(244, 173, 255, 0.30)" />
          </linearGradient>

          {threads.map((thread) => {
            const baseId = `${gradientBaseId}-${thread.id}`;
            return (
              <Fragment key={`grad-${thread.id}`}>
                {/* DOWN gradient */}
                <linearGradient id={`${baseId}-down`} x1="0" y1={thread.y1} x2="0" y2={thread.y2} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={thread.gradDown0} />
                  <stop offset="30%" stopColor={thread.gradDown30} />
                  <stop offset="60%" stopColor={thread.gradDown60} />
                  <stop offset="85%" stopColor="hsl(0, 0%, 12%)" />
                  <stop offset="100%" stopColor="hsl(0, 0%, 6%)" />
                </linearGradient>
                {/* UP gradient */}
                <linearGradient id={`${baseId}-up`} x1="0" y1={thread.y1} x2="0" y2={thread.y2} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={thread.gradUp0} />
                  <stop offset="50%" stopColor={thread.gradUp50} />
                  <stop offset="100%" stopColor={thread.gradUp100} />
                </linearGradient>
              </Fragment>
            );
          })}
        </defs>

        <rect
          x={0}
          y={0}
          width={VIEWBOX_SIZE}
          height={VIEWBOX_SIZE}
          fill={`url(#${filterId}-overlay)`}
          opacity={0.9}
          style={{ mixBlendMode: "screen" }}
        />

        <g filter={`url(#${filterId})`} style={{ willChange: "filter", transform: "translateZ(0)" }}>
          {threads.map((thread) => (
            <path
              key={thread.id}
              d={thread.path}
              fill="none"
              stroke={`url(#${gradientBaseId}-${thread.id}-${thread.direction})`}
              strokeOpacity={thread.opacity}
              strokeWidth={thread.weight}
              strokeLinecap="round"
              ref={registerPath(thread.id)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default TimelineThreadsComponent;
