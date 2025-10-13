"use client";

import { useEffect, useState, useId, useRef } from "react";
import type { CSSProperties } from "react";

// ============================================================================
// TYPES
// ============================================================================

type PathProfile = {
  neutral: Float32Array;
  up: Float32Array;
  down: Float32Array;
};

type Direction = "up" | "down";

type HSL = { h: number; s: number; l: number };

type ThreadState = {
  id: number;
  color: HSL;
  weight: number;
  opacity: number;
  profile: PathProfile;
  direction: Direction;
  path: string;
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
};

// ============================================================================
// CONSTANTS - Visual Layout
// ============================================================================

const THREAD_COUNT = 45;
const SEGMENTS = 15;
const PIVOT_X = 0.42;
const PIVOT_Y = 0.54;
const X_START = -0.18;
const X_END = 1.15;
const VIEWBOX_SIZE = 1000;

const COLOR_PALETTE: HSL[] = [
  { h: 259, s: 98, l: 68 },
  { h: 233, s: 100, l: 74 },
  { h: 304, s: 96, l: 70 },
];

// ============================================================================
// CONSTANTS - Animation Timing
// ============================================================================

const UP_FRACTION = 1 / THREAD_COUNT; // Only one thread starts pointing up
const FLIP_INTERVAL_MS = 8000;
const SETTLE_BUFFER_MS = 900;
const TRANSITION_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// Transition duration ranges (ms)
const UP_DURATION_MIN = 10400;
const UP_DURATION_MAX = 16400;
const DOWN_DURATION_MIN = 6800;
const DOWN_DURATION_MAX = 11600;

// ============================================================================
// CONSTANTS - Math Precomputation
// ============================================================================

const BEZIER_CONTROL_FACTOR = 1 / 6;
const GOLDEN_RATIO_SEED = 0x9e3779b9; // Golden ratio for seeded RNG

// Precompute pivot damping for each segment (reduces sway near present)
const PIVOT_DAMPING = new Float32Array(SEGMENTS);
for (let i = 0; i < SEGMENTS; i++) {
  const t = i / (SEGMENTS - 1);
  const x = X_START + (X_END - X_START) * t;
  PIVOT_DAMPING[i] = 1 - Math.exp(-Math.pow((x - PIVOT_X) * 3, 2));
}

// Precompute segment factors (0 to 1 along path)
const SEGMENT_FACTORS = new Float32Array(SEGMENTS);
for (let i = 0; i < SEGMENTS; i++) {
  SEGMENT_FACTORS[i] = i / (SEGMENTS - 1);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInRangeWith = (rng: () => number, min: number, max: number) => rng() * (max - min) + min;

// ============================================================================
// COLOR UTILITIES
// ============================================================================

const wrapHue = (h: number) => {
  const mod = h % 360;
  return mod < 0 ? mod + 360 : mod;
};

const chooseColor = (rng: () => number) => {
  const base = COLOR_PALETTE[Math.floor(rng() * COLOR_PALETTE.length)];
  return {
    h: wrapHue(base.h + randomInRangeWith(rng, -8, 8)),
    s: clamp(base.s + randomInRangeWith(rng, -2, 2), 92, 100),
    l: clamp(base.l + randomInRangeWith(rng, -6, 6), 58, 80),
  };
};

const adjustColor = (color: HSL, delta: Partial<HSL>) => ({
  h: wrapHue(color.h + (delta.h ?? 0)),
  s: clamp(color.s + (delta.s ?? 0), 0, 100),
  l: clamp(color.l + (delta.l ?? 0), 0, 100),
});

const hslToString = (hsl: HSL) =>
  `hsl(${wrapHue(hsl.h).toFixed(2)}, ${hsl.s.toFixed(2)}%, ${hsl.l.toFixed(2)}%)`;

const gradientStopsFor = (color: HSL, direction: Direction) => {
  if (direction === "down") {
    // Dying threads: fade from original color to black
    return [
      { offset: "0%", color: adjustColor(color, { h: -18, s: 0, l: 10 }) },
      { offset: "40%", color: adjustColor(color, { h: 4, s: -20, l: -10 }) },
      { offset: "70%", color: { h: 0, s: 0, l: 15 } }, // Dark gray
      { offset: "100%", color: { h: 0, s: 0, l: 8 } }, // Almost black
    ];
  }

  // Thriving threads: keep vibrant colors
  return [
    { offset: "0%", color: adjustColor(color, { h: -18, s: 0, l: 10 }) },
    { offset: "50%", color: adjustColor(color, { h: 4, s: 0, l: 0 }) },
    { offset: "100%", color: adjustColor(color, { h: 24, s: -3, l: -12 }) },
  ];
};

// ============================================================================
// PATH GENERATION - Core Logic
// ============================================================================

const createPathProfile = (index: number, rng: () => number): PathProfile => {
  const baseY = clamp(
    0.22 + (index / (THREAD_COUNT - 1)) * 0.56 + randomInRangeWith(rng, -0.05, 0.05),
    0.08,
    0.92,
  );

  const downDepth = randomInRangeWith(rng, 0.28, 0.40);
  const upRise = randomInRangeWith(rng, 0.45, 0.85);

  // upCurve: low values = exponential (steep), high values = logarithmic (leveling)
  const upCurve = randomInRangeWith(rng, 0.4, 2.2);
  const upStartY = randomInRangeWith(rng, 0.48, 0.58);
  const flattenStrength = randomInRangeWith(rng, 25.0, 35.0);
  // flattenThreshold: when thread reaches flat (0.2 = early/fast doom, 0.8 = late/slow doom)
  const flattenThreshold = randomInRangeWith(rng, 0.20, 0.85);
  const extinctionY = randomInRangeWith(rng, 0.84, 0.89);

  const tangleFreq = randomInRangeWith(rng, 5.5, 9.2);
  const tanglePhase = randomInRangeWith(rng, 0, Math.PI * 2);
  const tangleAmplitude = randomInRangeWith(rng, 0.028, 0.062);

  const lateralFreq = randomInRangeWith(rng, 2.0, 3.4);
  const lateralPhase = randomInRangeWith(rng, 0, Math.PI * 2);
  const lateralAmp = randomInRangeWith(rng, 0.025, 0.055);

  const neutralDrift = randomInRangeWith(rng, -0.03, 0.03);

  // Allocate Float32Arrays: 15 points = 30 floats (x0,y0, x1,y1, ...)
  const neutral = new Float32Array(SEGMENTS * 2);
  const up = new Float32Array(SEGMENTS * 2);
  const down = new Float32Array(SEGMENTS * 2);

  const pivotIndex = Math.round(PIVOT_X * (SEGMENTS - 1));

  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / (SEGMENTS - 1);
    const xBase = X_START + (X_END - X_START) * t;

    const tightness = 1 - Math.pow(Math.abs(t - PIVOT_X) / 0.5, 1.2);
    const noise =
      (Math.sin(t * tangleFreq + tanglePhase) * tangleAmplitude +
        Math.sin(t * tangleFreq * 0.5 + tanglePhase * 1.7) * (tangleAmplitude * 0.55)) *
      clamp(0.55 + tightness * 0.85, 0.55, 1.4);
    const lateralShift =
      Math.sin(t * lateralFreq + lateralPhase) * lateralAmp * (0.8 + t * 0.9);

    const xIndex = i * 2;
    const yIndex = i * 2 + 1;

    // BEFORE PIVOT: All paths converge from baseY to PIVOT_Y
    if (t <= PIVOT_X) {
      const preP = t / PIVOT_X; // 0 at start, 1 at pivot
      const convergeCurve = Math.pow(preP, 1.35);

      // Compress vertical spread in the past - threads cluster tighter
      // At pivot (preP=1), spreadFactor should be very small for tight ring
      const spreadFactor = 0.25 + preP * 0.25; // Half as wide - reduced from 0.50 to 0.25
      const compressedBaseY = PIVOT_Y + (baseY - PIVOT_Y) * spreadFactor;

      // Add stronger convergence to PIVOT_Y at the end
      const ringTightness = Math.pow(preP, 3.5); // Even stronger convergence
      const sharedY = clamp(
        compressedBaseY + (PIVOT_Y - compressedBaseY) * ringTightness + noise * 0.85 * (1 - preP * 0.95),
        0.04,
        0.96
      );

      // All three paths share the same coordinates before pivot (history is fixed)
      const sharedX = xBase + lateralShift * 0.8;
      neutral[xIndex] = sharedX;
      neutral[yIndex] = sharedY;
      up[xIndex] = sharedX;
      up[yIndex] = sharedY;
      down[xIndex] = sharedX;
      down[yIndex] = sharedY;
      continue;
    }

    // AFTER PIVOT: Paths diverge
    const postP = (t - PIVOT_X) / (1 - PIVOT_X); // 0 at pivot, 1 at end

    // Neutral: slight drift
    const neutralY = clamp(PIVOT_Y + neutralDrift * Math.pow(postP, 1.1) + noise * 0.72, 0.04, 0.96);
    neutral[xIndex] = xBase + lateralShift * 0.75;
    neutral[yIndex] = neutralY;

    // Up: exponential/logarithmic rise from PIVOT_Y
    const upY = clamp(PIVOT_Y - upRise * Math.pow(postP, upCurve) - noise * 0.85, -0.30, 0.96);
    up[xIndex] = xBase + lateralShift * 1.2;
    up[yIndex] = upY;

    // Down: descent to extinction, then flat
    let downY: number;
    if (postP < flattenThreshold) {
      const downProgress = postP / flattenThreshold;
      const downShape = Math.pow(downProgress, 2.2);
      downY = clamp(PIVOT_Y + (extinctionY - PIVOT_Y) * downShape + noise * 0.85, 0.06, 0.96);
    } else {
      downY = extinctionY;
    }
    down[xIndex] = xBase + lateralShift * 0.95;
    down[yIndex] = downY;
  }

  return { neutral, up, down };
};

// ============================================================================
// PATH STRING GENERATION - Shared Bezier Builder
// ============================================================================

/**
 * Builds SVG path string with cubic Bezier curves from Float32Array coordinates.
 * Coordinates are stored as [x0,y0, x1,y1, ...] and scaled to VIEWBOX_SIZE.
 */
const buildCubicBezierPath = (points: Float32Array): string => {
  const numPoints = points.length / 2;
  if (numPoints === 0) return "";

  const path: string[] = new Array(numPoints);

  // First point: M (move) command
  const x0 = (points[0] * VIEWBOX_SIZE).toFixed(2);
  const y0 = (points[1] * VIEWBOX_SIZE).toFixed(2);
  path[0] = `M ${x0} ${y0}`;

  // Remaining points: C (cubic Bezier) commands
  for (let i = 1; i < numPoints; i++) {
    const prevIdx = (i - 1) * 2;
    const currIdx = i * 2;
    const prevPrevIdx = i >= 2 ? (i - 2) * 2 : prevIdx;
    const nextIdx = i < numPoints - 1 ? (i + 1) * 2 : currIdx;

    // Scale coordinates to viewbox
    const prevX = points[prevIdx] * VIEWBOX_SIZE;
    const prevY = points[prevIdx + 1] * VIEWBOX_SIZE;
    const currX = points[currIdx] * VIEWBOX_SIZE;
    const currY = points[currIdx + 1] * VIEWBOX_SIZE;
    const prevPrevX = points[prevPrevIdx] * VIEWBOX_SIZE;
    const prevPrevY = points[prevPrevIdx + 1] * VIEWBOX_SIZE;
    const nextX = points[nextIdx] * VIEWBOX_SIZE;
    const nextY = points[nextIdx + 1] * VIEWBOX_SIZE;

    // Compute control points using precomputed factor
    const cp1x = (prevX + (currX - prevPrevX) * BEZIER_CONTROL_FACTOR).toFixed(2);
    const cp1y = (prevY + (currY - prevPrevY) * BEZIER_CONTROL_FACTOR).toFixed(2);
    const cp2x = (currX - (nextX - prevX) * BEZIER_CONTROL_FACTOR).toFixed(2);
    const cp2y = (currY - (nextY - prevY) * BEZIER_CONTROL_FACTOR).toFixed(2);

    path[i] = `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${currX.toFixed(2)} ${currY.toFixed(2)}`;
  }

  return path.join(" ");
};

/** Static path generation (no animation) */
const pointsToStaticPath = (points: Float32Array): string => {
  return buildCubicBezierPath(points);
};

/** Linear interpolation between two Float32Arrays */
const lerpPoints = (from: Float32Array, to: Float32Array, t: number): Float32Array => {
  const result = new Float32Array(from.length);
  for (let i = 0; i < from.length; i++) {
    result[i] = from[i] + (to[i] - from[i]) * t;
  }
  return result;
};

/** Easing function for smooth transitions */
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Animated path generation with transitions and floating motion.
 * Optimized to skip calculations when transition is complete.
 */
const pointsToAnimatedPath = (
  basePoints: Float32Array,
  targetPoints: Float32Array,
  time: number,
  transitionStartTime: number,
  duration: number,
  swayPhase: number,
  driftPhase: number,
  swayFreq: number,
  driftFreq: number,
  swayAmp: number,
  driftAmp: number,
): string => {
  if (basePoints.length === 0) return "";

  // OPTIMIZATION: Skip transition calculations if no transition active
  let interpolatedPoints: Float32Array;

  if (transitionStartTime === 0) {
    // No transition ever started, use target directly
    interpolatedPoints = targetPoints;
  } else {
    const transitionProgress = Math.min((time - transitionStartTime) / duration, 1);

    if (transitionProgress >= 1) {
      // Transition complete, use target directly
      interpolatedPoints = targetPoints;
    } else {
      // Active transition, interpolate
      const easedProgress = easeInOutCubic(transitionProgress);
      interpolatedPoints = lerpPoints(basePoints, targetPoints, easedProgress);
    }
  }

  // Apply floating motion to points
  const numPoints = interpolatedPoints.length / 2;
  const floatingPoints = new Float32Array(interpolatedPoints.length);

  for (let i = 0; i < numPoints; i++) {
    const xIndex = i * 2;
    const yIndex = i * 2 + 1;

    // Use precomputed values
    const segmentFactor = SEGMENT_FACTORS[i];
    const pivotDamping = PIVOT_DAMPING[i];

    const swayOffset = Math.sin(time * swayFreq + swayPhase + segmentFactor * Math.PI) * swayAmp * pivotDamping;
    const driftOffset = Math.cos(time * driftFreq + driftPhase + segmentFactor * Math.PI * 0.5) * driftAmp;

    floatingPoints[xIndex] = interpolatedPoints[xIndex] + driftOffset;
    floatingPoints[yIndex] = interpolatedPoints[yIndex] + swayOffset;
  }

  return buildCubicBezierPath(floatingPoints);
};

// ============================================================================
// THREAD MANAGEMENT
// ============================================================================

const directionDuration = (direction: Direction) =>
  direction === "up"
    ? randomInRange(UP_DURATION_MIN, UP_DURATION_MAX)
    : randomInRange(DOWN_DURATION_MIN, DOWN_DURATION_MAX);

const directionDurationSeeded = (direction: Direction, rng: () => number) =>
  direction === "up"
    ? randomInRangeWith(rng, UP_DURATION_MIN, UP_DURATION_MAX)
    : randomInRangeWith(rng, DOWN_DURATION_MIN, DOWN_DURATION_MAX);

type FlipDecision = { threadId: number; direction: Direction } | null;

/**
 * Pure function to select which thread should flip direction.
 * Returns null if no eligible threads or if flipping would violate constraints.
 */
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
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // Prefer flipping down threads (75% chance), fallback to up threads
  let target = Math.random() < preferDownWeight ? pick("down") : null;
  if (!target) target = pick("up");
  if (!target) target = pick("down");
  if (!target) return null;

  const nextDirection: Direction = target.direction === "down" ? "up" : "down";

  // Ensure at least one thread stays pointing up
  const upThreads = threads.filter((t) => t.direction === "up" || t.targetDirection === "up");
  if (nextDirection === "down" && upThreads.length <= 1) {
    return null;
  }

  return { threadId: target.id, direction: nextDirection };
};

const createThread = (id: number): ThreadState => {
  const rng = createSeededRandom(GOLDEN_RATIO_SEED ^ (id + 1));
  const profile = createPathProfile(id, rng);
  const direction: Direction = rng() < UP_FRACTION ? "up" : "down";
  return {
    id,
    color: chooseColor(rng),
    weight: randomInRangeWith(rng, 0.8, 1.4),
    opacity: clamp(0.52 + id / (THREAD_COUNT * 3.5), 0.56, 0.82),
    profile,
    direction,
    path: pointsToStaticPath(profile[direction]),
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
  };
};

// ============================================================================
// REACT COMPONENT
// ============================================================================

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

export default function TimelineThreads({ className, style }: TimelineThreadsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const [threads, setThreads] = useState<ThreadState[]>(() => {
    const initialThreads = Array.from({ length: THREAD_COUNT }, (_, id) => createThread(id));
    // Ensure at least one thread starts pointing up
    const hasUpThread = initialThreads.some((t) => t.direction === "up");
    if (!hasUpThread) {
      initialThreads[0] = { ...initialThreads[0], direction: "up", targetDirection: "up" };
    }
    return initialThreads;
  });
  const filterId = useId();
  const gradientBaseId = `${filterId}-grad`;

  // IntersectionObserver to pause animation when off-screen
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Floating animation loop (merged with reduced motion handling)
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) {
      // Static paths for reduced motion or when off-screen
      setThreads((prev) =>
        prev.map((thread) => ({
          ...thread,
          path: pointsToStaticPath(thread.profile[thread.direction]),
        })),
      );
      return undefined;
    }

    let animationFrameId: number;
    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;

      if (elapsed >= FRAME_INTERVAL) {
        lastFrameTime = currentTime - (elapsed % FRAME_INTERVAL);

        setThreads((prev) =>
          prev.map((thread) => {
            // Update direction if transition is complete
            const isTransitioning = thread.transitionStartTime > 0 &&
              currentTime - thread.transitionStartTime < thread.duration;
            const shouldUpdateDirection = !isTransitioning &&
              thread.direction !== thread.targetDirection;

            return {
              ...thread,
              direction: shouldUpdateDirection ? thread.targetDirection : thread.direction,
              path: pointsToAnimatedPath(
                thread.profile[thread.direction],
                thread.profile[thread.targetDirection],
                currentTime,
                thread.transitionStartTime,
                thread.duration,
                thread.swayPhase,
                thread.driftPhase,
                thread.swayFreq,
                thread.driftFreq,
                thread.swayAmp,
                thread.driftAmp,
              ),
            };
          }),
        );
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [prefersReducedMotion, isVisible]);

  // Direction flipping logic
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return undefined;

    const tick = () => {
      setThreads((prev) => {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();

        // Use extracted pure function
        const decision = selectThreadToFlip(prev, now);
        if (!decision) return prev;

        const { threadId, direction: nextDirection } = decision;

        return prev.map((thread) => {
          if (thread.id !== threadId) return thread;

          const duration = directionDuration(nextDirection);
          return {
            ...thread,
            targetDirection: nextDirection,
            transitionStartTime: now,
            duration,
            lastFlipAt: now,
          };
        });
      });
    };

    const interval = window.setInterval(tick, FLIP_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, isVisible]);

  const presentX = PIVOT_X * VIEWBOX_SIZE;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className ?? "absolute inset-0"}`}
      style={style}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
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
            // For dying threads, gradient should fade based on Y position (descent toward bottom)
            // Calculate the Y range for this thread's down path
            const downPath = thread.profile.down;
            let minY = Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < downPath.length; i += 2) {
              const y = downPath[i + 1];
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            }

            // Gradient from top (pivot area) to bottom (extinction)
            const y1 = minY * VIEWBOX_SIZE;
            const y2 = maxY * VIEWBOX_SIZE;

            return (
              <linearGradient
                key={`grad-${thread.id}`}
                id={`${gradientBaseId}-${thread.id}`}
                x1="0"
                y1={y1}
                x2="0"
                y2={y2}
                gradientUnits="userSpaceOnUse"
              >
                {thread.direction === "down" ? (
                  // Dying threads: fade to black as they approach extinction Y
                  <>
                    <stop offset="0%" stopColor={hslToString(thread.color)} />
                    <stop offset="30%" stopColor={hslToString(adjustColor(thread.color, { s: -10, l: -5 }))} />
                    <stop offset="60%" stopColor={hslToString(adjustColor(thread.color, { s: -40, l: -25 }))} />
                    <stop offset="85%" stopColor="hsl(0, 0%, 12%)" />
                    <stop offset="100%" stopColor="hsl(0, 0%, 6%)" />
                  </>
                ) : (
                  // Thriving threads: vibrant throughout
                  <>
                    <stop offset="0%" stopColor={hslToString(adjustColor(thread.color, { h: -18, s: 0, l: 10 }))} />
                    <stop offset="50%" stopColor={hslToString(adjustColor(thread.color, { h: 4, s: 0, l: 0 }))} />
                    <stop offset="100%" stopColor={hslToString(adjustColor(thread.color, { h: 24, s: -3, l: -12 }))} />
                  </>
                )}
              </linearGradient>
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

        <line
          x1={presentX}
          x2={presentX}
          y1={0}
          y2={VIEWBOX_SIZE}
          stroke="rgba(30, 30, 60, 0.08)"
          strokeWidth={1}
        />

        <g
          filter={`url(#${filterId})`}
          style={{ willChange: "filter", transform: "translateZ(0)" }}
        >
          {threads.map((thread) => (
            <path
              key={thread.id}
              d={thread.path}
              fill="none"
              stroke={`url(#${gradientBaseId}-${thread.id})`}
              strokeOpacity={thread.opacity}
              strokeWidth={thread.weight}
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
