"use client";

import { useEffect, useRef } from "react";

/**
 * Calmer version:
 * - Half as many threads.
 * - All threads appear together, then drift into their paths.
 * - Periodic re-direction nudges threads between down/up to signal stakes.
 * - Float/turbulence damp out over time but never freeze completely.
 * - All threads pass through a single “present” pivot; post-present looks exponential.
 */

type Point = { x: number; y: number };

type PathProfile = {
  neutral: Point[]; // shared pre-present + slight neutral continuation
  up: Point[];      // post-present exponential rise
  down: Point[];    // post-present gradual sink
};

type Direction = "up" | "down";

type PathKey = "neutral" | Direction;

type Thread = {
  id: number;
  path: PathProfile;
  float: {
    amplitude: number;
    speed: number;
    phase: number;
    horizontalAmp: number;
    horizontalPhase: number;
    swaySpeed: number;
  };
  settleMs: number;         // how long it takes to fully damp motion after morph
  color: {
    h: number;
    s: number;
    l: number;
  };
  weight: number;
  opacityBase: number;      // base opacity per-thread
  currentDirection: Direction;
  transition: {
    from: PathKey;
    to: Direction;
    start: number;
    duration: number;
  };
  isTransitioning: boolean;
  settleStart: number;
};

const THREAD_COUNT = 21;                 // ← half the threads
const DURATION_MS = 9000;                // slower morph
const SEGMENTS = 28;

const X_START = -0.18;
const X_END = 1.15;

const PRESENT_X = 0.42;                  // shared pivot x (normalized)
const PIVOT_Y = 0.54;                    // shared pivot y (normalized)

const UP_FRACTION = 0.22;                // small subset goes up

const COLOR_PALETTE = [
  { h: 259, s: 82, l: 72 },
  { h: 233, s: 86, l: 78 },
  { h: 304, s: 82, l: 74 },
];

// ----- math helpers -----
const easeInCubic = (t: number) => t * t * t;

const slowFastSettle = (t: number) => {
  const clamped = Math.min(Math.max(t, 0), 1);
  const accelerate = Math.pow(clamped, 2.2);
  const decelerate = 1 - Math.pow(1 - clamped, 3.2);
  return Math.min(Math.max((accelerate + decelerate) / 2, 0), 1);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

// ----- path builder -----
const createPathProfile = (index: number): PathProfile => {
  const baseY = clamp(
    0.22 + (index / (THREAD_COUNT - 1)) * 0.56 + randomInRange(-0.05, 0.05),
    0.08,
    0.92,
  );

  const downDepth = randomInRange(0.28, 0.40);
  const upRise = randomInRange(0.38, 0.68);

  const upCurve = randomInRange(0.35, 0.55);  // < 1 = fast rise that tapers
  const flattenStrength = randomInRange(1.9, 2.7);
  const flattenThreshold = randomInRange(0.38, 0.55);

  // Calmer noise
  const tangleFreq = randomInRange(3.8, 6.2);
  const tanglePhase = randomInRange(0, Math.PI * 2);
  const tangleAmplitude = randomInRange(0.006, 0.015);

  const lateralFreq = randomInRange(2.0, 3.4);
  const lateralPhase = randomInRange(0, Math.PI * 2);
  const lateralAmp = randomInRange(0.008, 0.022);

  const neutralDrift = randomInRange(-0.03, 0.03);

  const neutral: Point[] = [];
  const up: Point[] = [];
  const down: Point[] = [];

  const pivotIndex = Math.round(PRESENT_X * (SEGMENTS - 1));

  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / (SEGMENTS - 1);
    const xBase = lerp(X_START, X_END, t);

    const tightness = 1 - Math.pow(Math.abs(t - PRESENT_X) / 0.5, 1.2);
    const noise =
      (Math.sin(t * tangleFreq + tanglePhase) * tangleAmplitude +
        Math.sin(t * tangleFreq * 0.5 + tanglePhase * 1.7) * (tangleAmplitude * 0.55)) *
      clamp(0.35 + tightness * 0.75, 0.35, 1.0);
    const lateralShift =
      Math.sin(t * lateralFreq + lateralPhase) * lateralAmp * (0.6 + t * 0.7);

    if (i <= pivotIndex) {
      const preP = clamp(t / PRESENT_X, 0, 1);
      const converge = Math.pow(preP, 1.35);
      const sharedY = clamp(
        lerp(baseY, PIVOT_Y, converge) + noise * 0.45,
        0.04,
        0.96,
      );
      const pt: Point = { x: xBase + lateralShift * 0.5, y: sharedY };
      neutral.push(pt);
      up.push(pt);
      down.push(pt);
      continue;
    }

    const postP = clamp((t - PRESENT_X) / (1 - PRESENT_X), 0, 1);

    const neutralY = clamp(
      PIVOT_Y + neutralDrift * Math.pow(postP, 1.1) + noise * 0.32,
      0.04,
      0.96,
    );

    const upY = clamp(
      PIVOT_Y - upRise * Math.pow(postP, upCurve) - noise * 0.5,
      0.02,
      0.50,
    );

    const downProgress = clamp(postP / flattenThreshold, 0, 1);
    const downShape = Math.pow(downProgress, flattenStrength);
    const downY = clamp(
      PIVOT_Y + downDepth * downShape + noise * 0.50,
      0.06,
      0.96,
    );

    neutral.push({ x: xBase + lateralShift * 0.45, y: neutralY });
    up.push({ x: xBase + lateralShift, y: upY });
    down.push({ x: xBase + lateralShift * 0.65, y: downY });
  }

  return { neutral, up, down };
};

const chooseColor = () => {
  const base = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  return {
    h: base.h + randomInRange(-4, 4),
    s: clamp(base.s + randomInRange(-5, 5), 64, 96),
    l: clamp(base.l + randomInRange(-5, 5), 62, 90),
  };
};

const spawnThread = (id: number, now: number): Thread => {
  const direction: Direction = Math.random() < UP_FRACTION ? "up" : "down";
  const morphDuration = DURATION_MS + randomInRange(-1200, 1400);

  return {
    id,
    path: createPathProfile(id),
    float: {
      amplitude: randomInRange(0.012, 0.024),     // stronger vertical sway
      speed: randomInRange(0.28, 0.64),           // quicker wobble
      phase: randomInRange(0, Math.PI * 2),
      horizontalAmp: randomInRange(0.006, 0.016),
      horizontalPhase: randomInRange(0, Math.PI * 2),
      swaySpeed: randomInRange(0.16, 0.42),
    },
    settleMs: direction === "up"
      ? 15000 + randomInRange(-2000, 2800)
      : 11000 + randomInRange(-2000, 2600),
    color: chooseColor(),
    weight: randomInRange(1.3, 2.0),
    opacityBase: clamp(0.26 + id / (THREAD_COUNT * 6), 0.30, 0.44),
    currentDirection: direction,
    transition: {
      from: "neutral",
      to: direction,
      start: now - morphDuration,
      duration: morphDuration,
    },
    isTransitioning: false,
    settleStart: now,
  };
};

type TimelineThreadsProps = {
  className?: string;
};

export default function TimelineThreads({ className }: TimelineThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threadsRef = useRef<Thread[]>([]);
  const animationIdRef = useRef<number>();
  const initializedRef = useRef(false);
  const nextTransitionAtRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || typeof window === "undefined") return;

    const dpr = window.devicePixelRatio || 1;

    const sizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    sizeCanvas();

    // Initialize ONCE (no reset on resize)
    if (!initializedRef.current) {
      const now = performance.now();
      threadsRef.current = Array.from({ length: THREAD_COUNT }, (_, i) =>
        spawnThread(i, now),
      );
      nextTransitionAtRef.current = now + 6000;
      initializedRef.current = true;
    }

    // Keep sizing without resetting threads
    let observer: ResizeObserver | null = null;
    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => sizeCanvas())
      : null;
    observer = ro;
    observer?.observe(container);

    const getPathPoints = (thread: Thread, key: PathKey) => {
      switch (key) {
        case "up":
          return thread.path.up;
        case "down":
          return thread.path.down;
        default:
          return thread.path.neutral;
      }
    };

    const retargetThread = (thread: Thread, nextDirection: Direction, now: number) => {
      const from: PathKey = thread.transition.to;
      const duration = nextDirection === "up"
        ? randomInRange(5600, 8200)
        : randomInRange(4200, 6400);

      thread.transition = {
        from: from,
        to: nextDirection,
        start: now,
        duration,
      };
      thread.isTransitioning = true;
      thread.currentDirection = nextDirection;
      thread.settleStart = now + duration;
      thread.settleMs = nextDirection === "up"
        ? 15000 + randomInRange(-2400, 3200)
        : 10000 + randomInRange(-2000, 2800);
      thread.float.amplitude = randomInRange(0.016, 0.030);
      thread.float.speed = randomInRange(0.32, 0.78);
      thread.float.phase = randomInRange(0, Math.PI * 2);
      thread.float.horizontalAmp = randomInRange(0.010, 0.022);
      thread.float.horizontalPhase = randomInRange(0, Math.PI * 2);
      thread.float.swaySpeed = randomInRange(0.20, 0.48);
    };

    const triggerFlip = (now: number) => {
      if (!threadsRef.current.length) return;

      const preferRescue = Math.random() < 0.75;
      const choose = (from: Direction) => {
        const eligible = threadsRef.current.filter((thread) =>
          !thread.isTransitioning &&
          thread.currentDirection === from &&
          now - thread.settleStart > 800,
        );
        if (!eligible.length) return null;
        return eligible[Math.floor(Math.random() * eligible.length)];
      };

      let target: Thread | null = preferRescue
        ? choose("down")
        : choose("up");

      if (!target) {
        target = preferRescue ? choose("up") : choose("down");
      }
      if (!target) return;

      const newDirection = target.currentDirection === "down" ? "up" : "down";
      retargetThread(target, newDirection, now);
    };

    const render = (timestamp: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Background
      ctx.clearRect(0, 0, width, height);

      // Subtle “present” guideline
      const presentX = lerp(0, width, clamp(PRESENT_X, 0, 1));
      ctx.beginPath();
      ctx.moveTo(presentX, 0);
      ctx.lineTo(presentX, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(30, 30, 60, 0.05)";
      ctx.stroke();

      if (nextTransitionAtRef.current === null) {
        nextTransitionAtRef.current = timestamp + 6000;
      } else {
        while (nextTransitionAtRef.current !== null && timestamp >= nextTransitionAtRef.current) {
          triggerFlip(nextTransitionAtRef.current);
          nextTransitionAtRef.current += 6000;
        }
      }

      // Draw threads
      for (let i = 0; i < threadsRef.current.length; i++) {
        const thread = threadsRef.current[i];
        const transition = thread.transition;
        const from = getPathPoints(thread, transition.from);
        const to = getPathPoints(thread, transition.to);

        const duration = Math.max(transition.duration, 1);
        const rawProgress = clamp((timestamp - transition.start) / duration, 0, 1);
        const easedProgress =
          transition.to === "up"
            ? slowFastSettle(rawProgress)
            : easeInCubic(rawProgress);

        const afterMorph = Math.max(0, timestamp - thread.settleStart);
        const settleProgress = clamp(afterMorph / thread.settleMs, 0, 1);
        const damping = 0.20 + 0.80 * Math.pow(1 - settleProgress, 1.4);

        const time = timestamp / 1000;

        const floatOffset =
          Math.sin(time * thread.float.speed + thread.float.phase) *
          (thread.float.amplitude * damping) *
          height;
        const horizontalSway =
          Math.sin(time * thread.float.swaySpeed + thread.float.horizontalPhase) *
          (thread.float.horizontalAmp * damping) *
          width;

        const points: Point[] = to.map((target, idx) => {
          const base = from[idx];
          const x = lerp(base.x, target.x, easedProgress) * width;
          const y = lerp(base.y, target.y, easedProgress) * height;

          const floatInfluence = 0.22 + (idx / SEGMENTS) * 0.78;
          const turbulence =
            Math.sin(
              time * (0.38 + thread.float.speed * 0.6) +
                idx * 0.14 +
                thread.float.phase,
            ) *
            (thread.float.amplitude * damping) *
            height *
            0.34;

          return {
            x:
              x +
              floatOffset * floatInfluence * 0.12 +
              horizontalSway * (0.4 + (idx / SEGMENTS) * 0.45),
            y: y + floatOffset * floatInfluence + turbulence,
          };
        });

        const opacity = thread.opacityBase; // constant; no fade-out

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let p = 1; p < points.length - 2; p++) {
          const xc = (points[p].x + points[p + 1].x) / 2;
          const yc = (points[p].y + points[p + 1].y) / 2;
          ctx.quadraticCurveTo(points[p].x, points[p].y, xc, yc);
        }
        const penultimate = points[points.length - 2];
        const last = points[points.length - 1];
        ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);

        ctx.lineWidth = thread.weight * 1.05;
        ctx.lineCap = "round";
        ctx.strokeStyle = `hsla(${thread.color.h}, ${thread.color.s}%, ${thread.color.l}%, ${opacity.toFixed(
          3,
        )})`;
        ctx.shadowBlur = 7;
        ctx.shadowColor = `hsla(${thread.color.h}, ${thread.color.s}%, ${clamp(
          thread.color.l + 10,
          74,
          98,
        )}%, ${(opacity * 0.32).toFixed(3)})`;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (thread.isTransitioning && rawProgress >= 1) {
          thread.isTransitioning = false;
          thread.transition = {
            from: transition.to,
            to: transition.to,
            start: timestamp - 1,
            duration: 1,
          };
          thread.settleStart = timestamp;
        }
      }

      animationIdRef.current = requestAnimationFrame(render);
    };

    animationIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      observer?.disconnect();
      nextTransitionAtRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className ?? "absolute inset-0"}`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
