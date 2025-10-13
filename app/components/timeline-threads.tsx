"use client";

import { useEffect, useState, useId } from "react";
import type { CSSProperties } from "react";

type Point = { x: number; y: number };

type PathProfile = {
  neutral: Point[];
  up: Point[];
  down: Point[];
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
  easing: string;
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

const THREAD_COUNT = 30;
const SEGMENTS = 15;
const PIVOT_X = 0.42;
const PIVOT_Y = 0.54;
const X_START = -0.18;
const X_END = 1.15;
const UP_FRACTION = 1 / THREAD_COUNT; // Only one thread starts pointing up
const FLIP_INTERVAL_MS = 8000; // Increased by 33% (was 6000)
const SETTLE_BUFFER_MS = 900;
const VIEWBOX_SIZE = 1000;

const COLOR_PALETTE: HSL[] = [
  { h: 259, s: 98, l: 68 },
  { h: 233, s: 100, l: 74 },
  { h: 304, s: 96, l: 70 },
];

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

const hslString = (hsl: HSL, alpha = 1) =>
  `hsla(${wrapHue(hsl.h).toFixed(2)}, ${hsl.s.toFixed(2)}%, ${hsl.l.toFixed(2)}%, ${alpha})`;

const hslSolid = (hsl: HSL) =>
  `hsl(${wrapHue(hsl.h).toFixed(2)}, ${hsl.s.toFixed(2)}%, ${hsl.l.toFixed(2)}%)`;

const gradientStopsFor = (color: HSL) => [
  { offset: "0%", color: adjustColor(color, { h: -18, s: 0, l: 10 }) },
  { offset: "50%", color: adjustColor(color, { h: 4, s: 0, l: 0 }) },
  { offset: "100%", color: adjustColor(color, { h: 24, s: -3, l: -12 }) },
];

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

  const neutral: Point[] = [];
  const up: Point[] = [];
  const down: Point[] = [];

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

      // All three paths share the same Y before pivot (history is fixed)
      const sharedPoint: Point = { x: xBase + lateralShift * 0.8, y: sharedY };
      neutral.push(sharedPoint);
      up.push(sharedPoint);
      down.push(sharedPoint);
      continue;
    }

    // AFTER PIVOT: Paths diverge
    const postP = (t - PIVOT_X) / (1 - PIVOT_X); // 0 at pivot, 1 at end

    // Neutral: slight drift
    const neutralY = clamp(PIVOT_Y + neutralDrift * Math.pow(postP, 1.1) + noise * 0.72, 0.04, 0.96);
    neutral.push({ x: xBase + lateralShift * 0.75, y: neutralY });

    // Up: exponential/logarithmic rise from PIVOT_Y
    const upY = clamp(PIVOT_Y - upRise * Math.pow(postP, upCurve) - noise * 0.85, -0.30, 0.96);
    up.push({ x: xBase + lateralShift * 1.2, y: upY });

    // Down: descent to extinction, then flat
    let downY: number;
    if (postP < flattenThreshold) {
      const downProgress = postP / flattenThreshold;
      const downShape = Math.pow(downProgress, 2.2);
      downY = clamp(PIVOT_Y + (extinctionY - PIVOT_Y) * downShape + noise * 0.85, 0.06, 0.96);
    } else {
      downY = extinctionY;
    }
    down.push({ x: xBase + lateralShift * 0.95, y: downY });
  }

  return { neutral, up, down };
};

const pointsToPath = (points: Point[]) => {
  if (points.length === 0) return "";

  const scaled = points.map((p) => ({
    x: Number((p.x * VIEWBOX_SIZE).toFixed(2)),
    y: Number((p.y * VIEWBOX_SIZE).toFixed(2)),
  }));

  const path: string[] = [];
  path.push(`M ${scaled[0].x} ${scaled[0].y}`);

  for (let i = 1; i < scaled.length; i++) {
    const prev = scaled[i - 1];
    const current = scaled[i];
    const prevPrev = scaled[i - 2] ?? prev;
    const next = scaled[i + 1] ?? current;

    const cp1x = prev.x + (current.x - prevPrev.x) / 6;
    const cp1y = prev.y + (current.y - prevPrev.y) / 6;
    const cp2x = current.x - (next.x - prev.x) / 6;
    const cp2y = current.y - (next.y - prev.y) / 6;

    path.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${current.x.toFixed(2)} ${current.y.toFixed(2)}`);
  }

  return path.join(" ");
};

const lerpPoints = (from: Point[], to: Point[], t: number): Point[] => {
  return from.map((p, i) => ({
    x: p.x + (to[i].x - p.x) * t,
    y: p.y + (to[i].y - p.y) * t,
  }));
};

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const pointsToPathWithSway = (
  basePoints: Point[],
  targetPoints: Point[],
  time: number,
  transitionStartTime: number,
  duration: number,
  swayPhase: number,
  driftPhase: number,
  swayFreq: number,
  driftFreq: number,
  swayAmp: number,
  driftAmp: number,
) => {
  if (basePoints.length === 0) return "";

  // Calculate transition progress
  const transitionProgress = transitionStartTime > 0
    ? Math.min((time - transitionStartTime) / duration, 1)
    : 1;
  const easedProgress = easeInOutCubic(transitionProgress);

  // Interpolate between base and target if transitioning
  const interpolatedPoints = transitionProgress < 1
    ? lerpPoints(basePoints, targetPoints, easedProgress)
    : targetPoints;

  // Apply floating motion to points
  const floatingPoints = interpolatedPoints.map((p, i) => {
    const segmentFactor = i / (interpolatedPoints.length - 1); // 0 to 1 along the path
    // Reduce sway near the pivot point (present) to keep the ring tight
    const pivotDamping = 1 - Math.exp(-Math.pow((p.x - PIVOT_X) * 3, 2));

    const swayOffset = Math.sin(time * swayFreq + swayPhase + segmentFactor * Math.PI) * swayAmp * pivotDamping;
    const driftOffset = Math.cos(time * driftFreq + driftPhase + segmentFactor * Math.PI * 0.5) * driftAmp;

    return {
      x: p.x + driftOffset,
      y: p.y + swayOffset,
    };
  });

  const scaled = floatingPoints.map((p) => ({
    x: Number((p.x * VIEWBOX_SIZE).toFixed(2)),
    y: Number((p.y * VIEWBOX_SIZE).toFixed(2)),
  }));

  const path: string[] = [];
  path.push(`M ${scaled[0].x} ${scaled[0].y}`);

  for (let i = 1; i < scaled.length; i++) {
    const prev = scaled[i - 1];
    const current = scaled[i];
    const prevPrev = scaled[i - 2] ?? prev;
    const next = scaled[i + 1] ?? current;

    const cp1x = prev.x + (current.x - prevPrev.x) / 6;
    const cp1y = prev.y + (current.y - prevPrev.y) / 6;
    const cp2x = current.x - (next.x - prev.x) / 6;
    const cp2y = current.y - (next.y - prev.y) / 6;

    path.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${current.x.toFixed(2)} ${current.y.toFixed(2)}`);
  }

  return path.join(" ");
};

const directionDuration = (direction: Direction) =>
  direction === "up" ? randomInRange(10400, 16400) : randomInRange(6800, 11600);

const directionDurationSeeded = (direction: Direction, rng: () => number) =>
  direction === "up"
    ? randomInRangeWith(rng, 10400, 16400)
    : randomInRangeWith(rng, 6800, 11600);

const directionEasing = (direction: Direction) =>
  direction === "up"
    ? "cubic-bezier(0.65, 0, 0.35, 1)"  // slow start, fast middle, slow end
    : "cubic-bezier(0.65, 0, 0.35, 1)";  // same curve for down

const createThread = (id: number): ThreadState => {
  const rng = createSeededRandom(0x9e3779b9 ^ (id + 1));
  const profile = createPathProfile(id, rng);
  const direction: Direction = rng() < UP_FRACTION ? "up" : "down";
  return {
    id,
    color: chooseColor(rng),
    weight: randomInRangeWith(rng, 1.2, 2.2),
    opacity: clamp(0.52 + id / (THREAD_COUNT * 3.5), 0.56, 0.82),
    profile,
    direction,
    path: pointsToPath(profile[direction]),
    duration: directionDurationSeeded(direction, rng),
    easing: directionEasing(direction),
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

  useEffect(() => {
    if (!prefersReducedMotion) return;
    setThreads((prev) =>
      prev.map((thread) => ({
        ...thread,
        duration: 0,
        path: pointsToPath(thread.profile[thread.direction]),
      })),
    );
  }, [prefersReducedMotion]);

  // Floating animation loop
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let animationFrameId: number;
    let lastFrameTime = performance.now();
    const targetFps = 30;
    const frameInterval = 1000 / targetFps;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = currentTime - (elapsed % frameInterval);

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
              path: pointsToPathWithSway(
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
  }, [prefersReducedMotion]);

  // Direction flipping logic
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const tick = () => {
      setThreads((prev) => {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const eligible = (dir: Direction) =>
          prev.filter((thread) => thread.direction === dir && now - thread.lastFlipAt > SETTLE_BUFFER_MS);

        const pick = (dir: Direction) => {
          const candidates = eligible(dir);
          if (!candidates.length) return null;
          return candidates[Math.floor(Math.random() * candidates.length)];
        };

        let target = Math.random() < 0.75 ? pick("down") : null;
        if (!target) target = pick("up");
        if (!target) target = pick("down");
        if (!target) return prev;

        const nextDirection: Direction = target.direction === "down" ? "up" : "down";

        // Check if this would leave us with no up threads
        const upThreads = prev.filter((t) => t.direction === "up" || t.targetDirection === "up");
        if (nextDirection === "down" && upThreads.length <= 1) {
          // Don't flip the last up thread to down
          return prev;
        }

        return prev.map((thread) => {
          if (thread.id !== target!.id) return thread;
          const duration = directionDuration(nextDirection);
          return {
            ...thread,
            targetDirection: nextDirection,
            transitionStartTime: now,
            duration,
            easing: directionEasing(nextDirection),
            lastFlipAt: now,
          };
        });
      });
    };

    const interval = window.setInterval(tick, FLIP_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  const presentX = PIVOT_X * VIEWBOX_SIZE;

  return (
    <div
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
          {threads.map((thread) => (
            <linearGradient
              key={`grad-${thread.id}`}
              id={`${gradientBaseId}-${thread.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2={`${VIEWBOX_SIZE}`}
              gradientUnits="userSpaceOnUse"
            >
              {gradientStopsFor(thread.color).map((stop) => (
                <stop key={stop.offset} offset={stop.offset} stopColor={hslSolid(stop.color)} />
              ))}
            </linearGradient>
          ))}
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
