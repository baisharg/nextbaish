"use client";

import { useEffect, useState, useId, useRef } from "react";
import type { CSSProperties } from "react";
import type { WorkerThreadData, ThreadsGeneratedMessage } from "../workers/thread-generator.worker";
import {
  type Direction,
  type HSL,
  type PathProfile,
  THREAD_COUNT,
  SEGMENTS,
  PIVOT_X,
  PIVOT_Y,
  VIEWBOX_SIZE,
  FLIP_INTERVAL_MS,
  SETTLE_BUFFER_MS,
  FRAME_INTERVAL,
  BEZIER_CONTROL_FACTOR,
  PIVOT_DAMPING,
  SEGMENT_FACTORS,
  GOLDEN_RATIO_SEED,
  UP_FRACTION,
  adjustColor,
  hslToString,
  randomInRange,
  createSeededRandom,
  chooseColor,
  createPathProfile,
  directionDuration,
  directionDurationSeeded,
  randomInRangeWith,
  clamp,
} from "../utils/thread-utils";

// ============================================================================
// TYPES
// ============================================================================

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
// PATH STRING GENERATION
// ============================================================================

const buildCubicBezierPath = (points: Float32Array): string => {
  const numPoints = points.length / 2;
  if (numPoints === 0) return "";

  const path: string[] = new Array(numPoints);

  const x0 = (points[0] * VIEWBOX_SIZE).toFixed(2);
  const y0 = (points[1] * VIEWBOX_SIZE).toFixed(2);
  path[0] = `M ${x0} ${y0}`;

  for (let i = 1; i < numPoints; i++) {
    const prevIdx = (i - 1) * 2;
    const currIdx = i * 2;
    const prevPrevIdx = i >= 2 ? (i - 2) * 2 : prevIdx;
    const nextIdx = i < numPoints - 1 ? (i + 1) * 2 : currIdx;

    const prevX = points[prevIdx] * VIEWBOX_SIZE;
    const prevY = points[prevIdx + 1] * VIEWBOX_SIZE;
    const currX = points[currIdx] * VIEWBOX_SIZE;
    const currY = points[currIdx + 1] * VIEWBOX_SIZE;
    const prevPrevX = points[prevPrevIdx] * VIEWBOX_SIZE;
    const prevPrevY = points[prevPrevIdx + 1] * VIEWBOX_SIZE;
    const nextX = points[nextIdx] * VIEWBOX_SIZE;
    const nextY = points[nextIdx + 1] * VIEWBOX_SIZE;

    const cp1x = (prevX + (currX - prevPrevX) * BEZIER_CONTROL_FACTOR).toFixed(2);
    const cp1y = (prevY + (currY - prevPrevY) * BEZIER_CONTROL_FACTOR).toFixed(2);
    const cp2x = (currX - (nextX - prevX) * BEZIER_CONTROL_FACTOR).toFixed(2);
    const cp2y = (currY - (nextY - prevY) * BEZIER_CONTROL_FACTOR).toFixed(2);

    path[i] = `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${currX.toFixed(2)} ${currY.toFixed(2)}`;
  }

  return path.join(" ");
};

const pointsToStaticPath = (points: Float32Array): string => {
  return buildCubicBezierPath(points);
};

const lerpPoints = (from: Float32Array, to: Float32Array, t: number): Float32Array => {
  const result = new Float32Array(from.length);
  for (let i = 0; i < from.length; i++) {
    result[i] = from[i] + (to[i] - from[i]) * t;
  }
  return result;
};

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

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

  let interpolatedPoints: Float32Array;

  if (transitionStartTime === 0) {
    interpolatedPoints = targetPoints;
  } else {
    const transitionProgress = Math.min((time - transitionStartTime) / duration, 1);

    if (transitionProgress >= 1) {
      interpolatedPoints = targetPoints;
    } else {
      const easedProgress = easeInOutCubic(transitionProgress);
      interpolatedPoints = lerpPoints(basePoints, targetPoints, easedProgress);
    }
  }

  const numPoints = interpolatedPoints.length / 2;
  const floatingPoints = new Float32Array(interpolatedPoints.length);

  for (let i = 0; i < numPoints; i++) {
    const xIndex = i * 2;
    const yIndex = i * 2 + 1;

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
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  let target = Math.random() < preferDownWeight ? pick("down") : null;
  if (!target) target = pick("up");
  if (!target) target = pick("down");
  if (!target) return null;

  const nextDirection: Direction = target.direction === "down" ? "up" : "down";

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

const workerDataToThreadState = (data: WorkerThreadData): ThreadState => {
  const profile = {
    neutral: data.profileNeutral,
    up: data.profileUp,
    down: data.profileDown,
  };

  return {
    id: data.id,
    color: data.color,
    weight: data.weight,
    opacity: data.opacity,
    profile,
    direction: data.direction,
    path: pointsToStaticPath(profile[data.direction]),
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
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [threads, setThreads] = useState<ThreadState[]>([]);
  const filterId = useId();
  const gradientBaseId = `${filterId}-grad`;

  // Initialize threads using Web Worker with fallback
  useEffect(() => {
    let mounted = true;
    let worker: Worker | null = null;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

    const initThreadsFromMain = () => {
      if (!mounted) return;
      const mainThreads = Array.from({ length: THREAD_COUNT }, (_, id) => createThread(id));
      const hasUpThread = mainThreads.some((t) => t.direction === "up");
      if (!hasUpThread) {
        mainThreads[0] = { ...mainThreads[0], direction: "up", targetDirection: "up" };
      }
      setThreads(mainThreads);
    };

    try {
      worker = new Worker(new URL("../workers/thread-generator.worker.ts", import.meta.url));

      fallbackTimeout = setTimeout(() => {
        if (mounted && threads.length === 0) {
          console.warn("Worker timeout, falling back to main thread");
          initThreadsFromMain();
        }
      }, 1000);

      worker.onmessage = (event: MessageEvent<ThreadsGeneratedMessage>) => {
        if (!mounted) return;
        if (event.data.type === "threadsGenerated") {
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
          const workerThreads = event.data.threads.map(workerDataToThreadState);
          setThreads(workerThreads);
        }
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        if (mounted && threads.length === 0) {
          initThreadsFromMain();
        }
      };

      worker.postMessage({ type: "generateThreads", count: THREAD_COUNT });
    } catch (error) {
      console.warn("Failed to create worker, using main thread:", error);
      initThreadsFromMain();
    }

    return () => {
      mounted = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (worker) worker.terminate();
    };
  }, []);

  // Defer animation until page is interactive (Phase 1 optimization)
  useEffect(() => {
    if (threads.length === 0) return;

    const enableAnimation = () => {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => setShouldAnimate(true), { timeout: 2000 });
      } else {
        setTimeout(() => setShouldAnimate(true), 100);
      }
    };

    if (document.readyState === "complete") {
      enableAnimation();
    } else {
      window.addEventListener("load", enableAnimation);
      return () => window.removeEventListener("load", enableAnimation);
    }
  }, [threads.length]);

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

  // Floating animation loop
  useEffect(() => {
    if (prefersReducedMotion || !isVisible || !shouldAnimate || threads.length === 0) {
      if (threads.length > 0) {
        setThreads((prev) =>
          prev.map((thread) => ({
            ...thread,
            path: pointsToStaticPath(thread.profile[thread.direction]),
          })),
        );
      }
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
  }, [prefersReducedMotion, isVisible, shouldAnimate, threads.length]);

  // Direction flipping logic
  useEffect(() => {
    if (prefersReducedMotion || !isVisible || !shouldAnimate || threads.length === 0) return undefined;

    const tick = () => {
      setThreads((prev) => {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();

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
  }, [prefersReducedMotion, isVisible, shouldAnimate, threads.length]);

  const presentX = PIVOT_X * VIEWBOX_SIZE;

  // Don't render until threads are loaded
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
            const downPath = thread.profile.down;
            let minY = Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < downPath.length; i += 2) {
              const y = downPath[i + 1];
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            }

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
                  <>
                    <stop offset="0%" stopColor={hslToString(thread.color)} />
                    <stop offset="30%" stopColor={hslToString(adjustColor(thread.color, { s: -10, l: -5 }))} />
                    <stop offset="60%" stopColor={hslToString(adjustColor(thread.color, { s: -40, l: -25 }))} />
                    <stop offset="85%" stopColor="hsl(0, 0%, 12%)" />
                    <stop offset="100%" stopColor="hsl(0, 0%, 6%)" />
                  </>
                ) : (
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
