"use client";
"use no memo";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";
import type {
  WorkerThreadData,
  ThreadsGeneratedMessage,
} from "../workers/thread-generator.worker";
import {
  type Direction,
  type HSL,
  type PathProfile,
  THREAD_COUNT,
  VIEWBOX_SIZE,
  FRAME_INTERVAL,
  GOLDEN_RATIO_SEED,
  createSeededRandom,
  chooseColor,
  createPathProfile,
  directionDurationSeeded,
  randomInRangeWith,
  clamp,
  getUpFraction,
} from "../utils/thread-utils";

import type { InitMessage } from "../workers/animation-types";

// Note: SIN_OFFSETS/COS_OFFSETS computation moved to animation.worker.ts
// Animation computations run entirely in the web worker now.

const logTimelineDebug = (...message: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[Timeline]", ...message);
  }
};

type PerformanceProfile = {
  threadCount: number;
  blurStdDeviation: number;
  frameInterval: number;
};

const DEFAULT_PERFORMANCE_PROFILE: PerformanceProfile = {
  threadCount: THREAD_COUNT,
  blurStdDeviation: 5.9,
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
  const nav =
    typeof navigator !== "undefined"
      ? (navigator as NavigatorWithConnection)
      : undefined;
  const hardware = nav?.hardwareConcurrency ?? 0;
  const saveData = Boolean(nav?.connection?.saveData);
  const effectiveType = nav?.connection?.effectiveType ?? "";
  const isSlowConnection =
    effectiveType.includes("2g") || effectiveType.includes("slow-2g");

  let threadScale = 1;
  // Mobile viewport scaling (more aggressive for fill-rate)
  if (width <= 480) threadScale = 0.72;
  else if (width <= 640) threadScale = 0.82;
  else if (width <= 820) threadScale = 0.9;
  // Desktop viewport scaling (reduce threads on large screens)
  else if (width > 1920)
    threadScale = 0.8; // 4K displays
  else if (width > 1440) threadScale = 0.85; // Large desktop

  if (dpr >= 3) {
    threadScale *= 0.92;
  }

  // Lower floor for mobile fill-rate (was 28, now 12)
  const minThreads = Math.max(Math.round(THREAD_COUNT * 0.4), 12);
  const scaled = THREAD_COUNT * threadScale;
  const threadCount = Math.round(clamp(scaled, minThreads, THREAD_COUNT));

  let blurStdDeviation = 3.5;
  if (dpr >= 3.5) blurStdDeviation = 1.8;
  else if (dpr >= 3) blurStdDeviation = 2.1;
  else if (dpr >= 2) blurStdDeviation = 2.75;
  // Scale blur for both small and large screens
  if (width <= 480) blurStdDeviation *= 0.9;
  else if (width > 1920)
    blurStdDeviation *= 0.75; // 4K displays
  else if (width > 1440) blurStdDeviation *= 0.85; // Large desktop
  blurStdDeviation = Math.max(1.6, Number(blurStdDeviation.toFixed(2)));

  const lowPowerHardware = hardware > 0 && hardware <= 4;
  const lowPower =
    lowPowerHardware || saveData || isSlowConnection || width <= 480;
  const frameInterval = lowPower
    ? Math.max(FRAME_INTERVAL, LOW_POWER_FRAME_INTERVAL)
    : FRAME_INTERVAL;

  return {
    threadCount,
    blurStdDeviation,
    frameInterval,
  };
};

// --------------------------------------------------------------------------------
// TYPES
// --------------------------------------------------------------------------------

/**
 * Simplified ThreadState - only contains data needed to pass to animation worker.
 * All rendering (gradients, paths, animation) happens in the worker via WebGL.
 */
type ThreadState = {
  id: number;
  color: HSL;
  weight: number;
  opacity: number;
  profile: PathProfile;
  direction: Direction;
  duration: number;
  swayPhase: number;
  driftPhase: number;
  swayFreq: number;
  driftFreq: number;
  swayAmp: number;
  driftAmp: number;
  targetDirection: Direction;
};

// Factory (main-thread fallback) — creates minimal thread state for worker handoff.
const createThread = (id: number, totalThreads: number): ThreadState => {
  const rng = createSeededRandom(GOLDEN_RATIO_SEED ^ (id + 1));
  const profile = createPathProfile(id, rng, totalThreads);
  const upFraction = getUpFraction(totalThreads);
  const direction: Direction = rng() < upFraction ? "up" : "down";
  const color = chooseColor(rng);

  return {
    id,
    color,
    weight: randomInRangeWith(rng, 1.6, 2.4),
    opacity: clamp(0.7 + id / (totalThreads * 2.5), 0.8, 1.0),
    profile,
    direction,
    duration: directionDurationSeeded(direction, rng),
    swayPhase: randomInRangeWith(rng, 0, Math.PI * 2),
    driftPhase: randomInRangeWith(rng, 0, Math.PI * 2),
    swayFreq: randomInRangeWith(rng, 0.0008, 0.0015),
    driftFreq: randomInRangeWith(rng, 0.0006, 0.0012),
    swayAmp: randomInRangeWith(rng, 0.00375, 0.00875),
    driftAmp: randomInRangeWith(rng, 0.003, 0.007),
    targetDirection: direction,
  };
};

// Worker → ThreadState (minimal conversion for worker handoff)
const workerDataToThreadState = (data: WorkerThreadData): ThreadState => {
  const profile: PathProfile = {
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
    duration: data.duration,
    swayPhase: data.swayPhase,
    driftPhase: data.driftPhase,
    swayFreq: data.swayFreq,
    driftFreq: data.driftFreq,
    swayAmp: data.swayAmp,
    driftAmp: data.driftAmp,
    targetDirection: data.direction,
  };
};

// --------------------------------------------------------------------------------
// REACT COMPONENT
// --------------------------------------------------------------------------------

type ThreadOverrideParams = {
  threadCount?: number;
  pivotX?: number;
  pivotY?: number;
  xStart?: number;
  xEnd?: number;
  offsetXMultiplier?: number;
  offsetYMultiplier?: number;
  flipInterval?: number;
  upDurationMin?: number;
  upDurationMax?: number;
  downDurationMin?: number;
  downDurationMax?: number;
  blurStdDeviation?: number;
  enableBlur?: boolean;
};

type TimelineThreadsProps = {
  className?: string;
  style?: CSSProperties;
  overrideParams?: ThreadOverrideParams;
};

function TimelineThreadsComponent({
  className,
  style,
  overrideParams,
}: TimelineThreadsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const isVisibleRef = useRef(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [threads, setThreads] = useState<ThreadState[]>([]);
  const [performanceProfile, setPerformanceProfile] =
    useState<PerformanceProfile>(DEFAULT_PERFORMANCE_PROFILE);
  const parallaxRef = useRef(0);
  const [webglSupported, setWebglSupported] = useState(true);

  // Apply override parameters if provided
  const threadCount =
    overrideParams?.threadCount ?? performanceProfile.threadCount;
  const blurStdDeviation =
    overrideParams?.blurStdDeviation ?? performanceProfile.blurStdDeviation;
  const effectiveEnableBlur = overrideParams?.enableBlur ?? true;
  const frameInterval = performanceProfile.frameInterval;
  const threadsRef = useRef<ThreadState[]>([]);

  // Renderer / worker refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationWorkerRef = useRef<Worker | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const tickFnRef = useRef<((now: number) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    const updateProfile = () => {
      const next = computePerformanceProfile();
      setPerformanceProfile((prev) =>
        profilesEqual(prev, next) ? prev : next,
      );
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

    const nav =
      typeof navigator !== "undefined"
        ? (navigator as NavigatorWithConnection)
        : undefined;
    const connection = nav?.connection;
    const detachConnection =
      connection && typeof connection.addEventListener === "function"
        ? (() => {
            connection.addEventListener("change", scheduleUpdate);
            return () =>
              connection.removeEventListener?.("change", scheduleUpdate);
          })()
        : undefined;

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      detachConnection?.();
    };
  }, []);

  const syncThreads = (incoming: ThreadState[]) => {
    const normalized = incoming.map((thread) => ({
      ...thread,
      targetDirection: thread.targetDirection ?? thread.direction,
    }));
    threadsRef.current = normalized.map((t) => ({ ...t }));
    setThreads(normalized);
  };

  // Initialize threads via Worker (with main-thread fallback)
  useEffect(() => {
    const totalThreads = Math.max(threadCount, 1);

    threadsRef.current = [];
    setThreads([]);
    let mounted = true;
    let worker: Worker | null = null;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

    const initThreadsFromMain = () => {
      if (!mounted) return;
      const mainThreads = Array.from({ length: totalThreads }, (_, id) =>
        createThread(id, totalThreads),
      );
      const hasUpThread = mainThreads.some((t) => t.direction === "up");
      if (!hasUpThread) {
        mainThreads[0] = {
          ...mainThreads[0],
          direction: "up",
          targetDirection: "up",
        };
      }
      syncThreads(mainThreads);
    };

    try {
      worker = new Worker(
        new URL("../workers/thread-generator.worker.ts", import.meta.url),
      );
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
          ? (
              window as typeof window & {
                requestIdleCallback?: (
                  cb: () => void,
                  opts?: { timeout?: number },
                ) => number;
              }
            ).requestIdleCallback
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
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  // Restart or pause main-thread rAF loop when visibility changes
  useEffect(() => {
    if (!shouldAnimate) return;
    if (isVisible && tickFnRef.current && !rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(tickFnRef.current);
    }
    if (!isVisible && rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, [isVisible, shouldAnimate]);

  // Parallax scroll effect (imperative to avoid React re-renders)
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;

    const PARALLAX_FACTOR = 0.02; // Subtle parallax effect (reduced to prevent bottom gap)
    let rafId = 0;
    let currentScroll = window.scrollY;

    const updateParallax = () => {
      parallaxRef.current = -currentScroll * PARALLAX_FACTOR;
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translateY(${parallaxRef.current}px)`;
      }
      rafId = 0;
    };

    const handleScroll = () => {
      currentScroll = window.scrollY;
      if (!rafId) rafId = requestAnimationFrame(updateParallax);
    };

    // Initial position
    updateParallax();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  /**
   * WebGL Renderer Initialization
   * - Creates WebGL renderer using factory
   * - Spawns animation worker
   * - Handles worker messages and draws frames
   * - Completely offloads animation from main thread
   */
  useEffect(() => {
    if (
      !canvasRef.current ||
      !shouldAnimate ||
      threadsRef.current.length === 0
    ) {
      return;
    }

    let mounted = true;

    const initializeCanvasRenderer = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        // Cap DPR to 2 on mobile (huge fill-rate win)
        const baseDpr = window.devicePixelRatio || 1;
        const dpr = Math.min(baseDpr, 2);

        // Disable blur on narrow viewports or high-DPR devices (fill-rate optimization)
        const isNarrow = (window.innerWidth || 0) <= 480;
        const highDpr = baseDpr >= 3;
        const enableBlur = effectiveEnableBlur && !isNarrow && !highDpr;

        if (typeof canvas.transferControlToOffscreen !== "function") {
          setWebglSupported(false);
          return;
        }

        const offscreen = canvas.transferControlToOffscreen();

        const rect = canvas.getBoundingClientRect();
        const displayWidth = rect.width || window.innerWidth || 1;
        const displayHeight = rect.height || window.innerHeight || 1;
        offscreen.width = Math.max(1, Math.floor(displayWidth * dpr));
        offscreen.height = Math.max(1, Math.floor(displayHeight * dpr));

        // Create animation worker
        let worker: Worker;
        try {
          worker = new Worker(
            new URL("../workers/animation.worker.ts", import.meta.url),
            { type: "module" },
          );
          logTimelineDebug("Animation worker created successfully");
        } catch (err) {
          console.error("[Timeline] Failed to create animation worker:", err);
          throw err; // Rethrow to be caught by outer try-catch
        }

        animationWorkerRef.current = worker;

        worker.onerror = (error: ErrorEvent) => {
          console.error("[Timeline] Animation worker error:", {
            message: error.message,
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno,
            error: error.error,
            fullError: error,
          });
        };

        // Prepare thread data for worker
        const workerThreads = threadsRef.current.map((thread) => ({
          id: thread.id,
          color: thread.color,
          weight: thread.weight,
          opacity: thread.opacity,
          profileNeutral: thread.profile.neutral,
          profileUp: thread.profile.up,
          profileDown: thread.profile.down,
          direction: thread.direction,
          swayPhase: thread.swayPhase,
          driftPhase: thread.driftPhase,
          swayFreq: thread.swayFreq,
          driftFreq: thread.driftFreq,
          swayAmp: thread.swayAmp,
          driftAmp: thread.driftAmp,
          duration: thread.duration,
        }));

        // Initialize worker with thread data and renderer config
        const initMessage: InitMessage = {
          type: "init",
          canvas: offscreen,
          config: {
            viewSize: VIEWBOX_SIZE,
            blurStdDeviation,
            dpr,
            enableBlur,
            offsetXMultiplier: overrideParams?.offsetXMultiplier,
            offsetYMultiplier: overrideParams?.offsetYMultiplier,
          },
          threads: workerThreads,
          frameInterval,
        };

        worker.postMessage(initMessage, [offscreen]);

        logTimelineDebug("Canvas renderer initialized successfully");

        // Main-thread rAF loop to drive animation timing (avoid worker timer throttling)
        let lastTick = 0;
        const tick = (now: number) => {
          if (!mounted) return;

          if (!isVisibleRef.current) {
            rafIdRef.current = null;
            return;
          }

          if (now - lastTick >= frameInterval - 1) {
            animationWorkerRef.current?.postMessage({ type: "tick", now });
            lastTick = now;
          }

          rafIdRef.current = requestAnimationFrame(tick);
        };

        tickFnRef.current = tick;
        rafIdRef.current = requestAnimationFrame(tick);
      } catch (error) {
        console.error(
          "[Timeline] Failed to initialize canvas renderer:",
          error,
        );
        // WebGL not supported - hide animation
        setWebglSupported(false);
      }
    };

    initializeCanvasRenderer();

    return () => {
      mounted = false;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      tickFnRef.current = null;

      // Terminate worker
      if (animationWorkerRef.current) {
        animationWorkerRef.current.postMessage({ type: "terminate" });
        animationWorkerRef.current.terminate();
        animationWorkerRef.current = null;
      }

      logTimelineDebug("Canvas renderer cleaned up");
    };
  }, [shouldAnimate, blurStdDeviation, frameInterval]);

  // Return nothing if WebGL is not supported
  if (!webglSupported) {
    logTimelineDebug("WebGL not supported - animation hidden");
    return null;
  }

  if (threads.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`pointer-events-none ${className ?? "absolute inset-0"}`}
        style={style}
      />
    );
  }

  // Extra height buffer to prevent blank gap at bottom during parallax scroll.
  // Parallax moves canvas UP by (scrollY * 0.02), so we need extra height at bottom.
  // 10vh covers typical scroll depths (10vh / 0.02 = 500vh of page scroll).
  const parallaxBuffer = "10vh";

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className ?? "absolute inset-x-0 top-0"}`}
      style={{
        ...style,
        height: `calc(100% + ${parallaxBuffer})`,
        contain: "layout style paint",
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          contain: "paint",
          willChange: "transform",
        }}
      />
    </div>
  );
}

export default TimelineThreadsComponent;
