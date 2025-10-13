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
};

const THREAD_COUNT = 15;
const SEGMENTS = 20;
const PIVOT_X = 0.42;
const PIVOT_Y = 0.54;
const X_START = -0.18;
const X_END = 1.15;
const UP_FRACTION = 0.22;
const FLIP_INTERVAL_MS = 6000;
const SETTLE_BUFFER_MS = 900;
const VIEWBOX_SIZE = 1000;

const COLOR_PALETTE: HSL[] = [
  { h: 259, s: 90, l: 68 },
  { h: 233, s: 92, l: 74 },
  { h: 304, s: 88, l: 70 },
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
    h: wrapHue(base.h + randomInRangeWith(rng, -6, 6)),
    s: clamp(base.s + randomInRangeWith(rng, -4, 6), 78, 100),
    l: clamp(base.l + randomInRangeWith(rng, -4, 4), 60, 82),
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
  { offset: "0%", color: adjustColor(color, { h: -16, s: 6, l: 6 }) },
  { offset: "38%", color: adjustColor(color, { h: -4, s: 4, l: 4 }) },
  { offset: "68%", color: adjustColor(color, { h: 8, s: -2, l: -4 }) },
  { offset: "100%", color: adjustColor(color, { h: 18, s: -6, l: -10 }) },
];

const createPathProfile = (index: number, rng: () => number): PathProfile => {
  const baseY = clamp(
    0.22 + (index / (THREAD_COUNT - 1)) * 0.56 + randomInRangeWith(rng, -0.05, 0.05),
    0.08,
    0.92,
  );

  const downDepth = randomInRangeWith(rng, 0.28, 0.40);
  const upRise = randomInRangeWith(rng, 0.38, 0.68);

  const upCurve = randomInRangeWith(rng, 0.35, 0.55);
  const flattenStrength = randomInRangeWith(rng, 1.9, 2.7);
  const flattenThreshold = randomInRangeWith(rng, 0.38, 0.55);

  const tangleFreq = randomInRangeWith(rng, 3.8, 6.2);
  const tanglePhase = randomInRangeWith(rng, 0, Math.PI * 2);
  const tangleAmplitude = randomInRangeWith(rng, 0.018, 0.042);

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

    if (i <= pivotIndex) {
      const preP = clamp(t / PIVOT_X, 0, 1);
      const converge = Math.pow(preP, 1.35);
      const sharedY = clamp(baseY + (PIVOT_Y - baseY) * converge + noise * 0.85, 0.04, 0.96);
      const sharedPoint: Point = { x: xBase + lateralShift * 0.8, y: sharedY };
      neutral.push(sharedPoint);
      up.push(sharedPoint);
      down.push(sharedPoint);
      continue;
    }

    const postP = clamp((t - PIVOT_X) / (1 - PIVOT_X), 0, 1);

    const neutralY = clamp(PIVOT_Y + neutralDrift * Math.pow(postP, 1.1) + noise * 0.72, 0.04, 0.96);
    const upY = clamp(PIVOT_Y - upRise * Math.pow(postP, upCurve) - noise * 0.85, 0.02, 0.50);

    const downProgress = clamp(postP / flattenThreshold, 0, 1);
    const downShape = Math.pow(downProgress, flattenStrength);
    const downY = clamp(PIVOT_Y + downDepth * downShape + noise * 0.90, 0.06, 0.96);

    neutral.push({ x: xBase + lateralShift * 0.75, y: neutralY });
    up.push({ x: xBase + lateralShift * 1.2, y: upY });
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

const directionDuration = (direction: Direction) =>
  direction === "up" ? randomInRange(5200, 8200) : randomInRange(3400, 5800);

const directionDurationSeeded = (direction: Direction, rng: () => number) =>
  direction === "up"
    ? randomInRangeWith(rng, 5200, 8200)
    : randomInRangeWith(rng, 3400, 5800);

const directionEasing = (direction: Direction) =>
  direction === "up" ? "cubic-bezier(0.19, 1, 0.22, 1)" : "cubic-bezier(0.4, 0, 0.2, 1)";

const createThread = (id: number): ThreadState => {
  const rng = createSeededRandom(0x9e3779b9 ^ (id + 1));
  const profile = createPathProfile(id, rng);
  const direction: Direction = rng() < UP_FRACTION ? "up" : "down";
  return {
    id,
    color: chooseColor(rng),
    weight: randomInRangeWith(rng, 2.6, 4.0),
    opacity: clamp(0.44 + id / (THREAD_COUNT * 4.2), 0.48, 0.72),
    profile,
    direction,
    path: pointsToPath(profile[direction]),
    duration: directionDurationSeeded(direction, rng),
    easing: directionEasing(direction),
    lastFlipAt: 0,
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
  const [threads, setThreads] = useState<ThreadState[]>(() =>
    Array.from({ length: THREAD_COUNT }, (_, id) => createThread(id)),
  );
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

        return prev.map((thread) => {
          if (thread.id !== target!.id) return thread;
          const duration = directionDuration(nextDirection);
          return {
            ...thread,
            direction: nextDirection,
            path: pointsToPath(thread.profile[nextDirection]),
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
          <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.48 0"
              result="softGlow"
            />
            <feMerge>
              <feMergeNode in="softGlow" />
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

        {threads.map((thread) => (
          <path
            key={thread.id}
            d={thread.path}
            fill="none"
            stroke={`url(#${gradientBaseId}-${thread.id})`}
            strokeOpacity={thread.opacity}
            strokeWidth={thread.weight}
            strokeLinecap="round"
            filter={`url(#${filterId})`}
            style={
              prefersReducedMotion
                ? undefined
                : {
                    transitionProperty: "d, stroke-opacity",
                    transitionDuration: `${Math.max(0, Math.round(thread.duration))}ms`,
                    transitionTimingFunction: thread.easing,
                  }
            }
          />
        ))}
      </svg>
    </div>
  );
}
