/**
 * Animation Worker - Runs the full animation loop off the main thread
 *
 * Responsibilities:
 * - Run animation tick loop
 * - Handle flip scheduling and decisions
 * - Compute thread interpolation, drift, and sway
 * - Generate FramePackets
 * - Either draw to OffscreenCanvas or post frames to main thread
 */

import {
  type Direction,
  type HSL,
  type PathProfile,
  FLIP_INTERVAL_MS,
  SETTLE_BUFFER_MS,
  FRAME_INTERVAL,
  PIVOT_DAMPING,
  SEGMENT_FACTORS,
  VIEWBOX_SIZE,
  adjustColor,
  directionDuration,
} from "../utils/thread-utils";

import type { FramePacket, ThreadFrame, ColorStop, Renderer } from "../types/renderer";
import { createRenderer } from "../utils/create-renderer";
import type {
  WorkerMessage,
} from "./animation-types";

// ============================================================================
// TYPES
// ============================================================================

type WorkerThreadState = {
  id: number;
  color: HSL;
  weight: number;
  opacity: number;
  profile: PathProfile;
  direction: Direction;
  targetDirection: Direction;
  duration: number;
  lastFlipAt: number;
  swayPhase: number;
  driftPhase: number;
  swayFreq: number;
  driftFreq: number;
  swayAmp: number;
  driftAmp: number;
  transitionStartTime: number;

  // Scratch buffers
  floatingPoints: Float32Array;

  // Gradient stops (precomputed)
  gradientStops: {
    up: ColorStop[];
    down: ColorStop[];
  };

  // Static gradient bounds (from "down" profile only, used for both directions)
  // Matches SVG implementation which uses same y1/y2 for up and down
  gradientBounds: { minY: number; maxY: number };
};

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

// Precompute sin/cos offsets (same as main thread implementation)
const SEG_LEN = SEGMENT_FACTORS.length;
const SIN_OFFSETS = new Float32Array(SEG_LEN);
const COS_OFFSETS = new Float32Array(SEG_LEN);
for (let i = 0; i < SEG_LEN; i++) {
  const s = SEGMENT_FACTORS[i];
  SIN_OFFSETS[i] = s * Math.PI;
  COS_OFFSETS[i] = s * Math.PI * 0.5;
}

// Sin/Cos lookup table (same as main thread)
const SIN_TABLE_SIZE = 4096;
const SIN_TABLE = new Float32Array(SIN_TABLE_SIZE);
const TWO_PI = Math.PI * 2;
for (let i = 0; i < SIN_TABLE_SIZE; i++) {
  SIN_TABLE[i] = Math.sin((i / SIN_TABLE_SIZE) * TWO_PI);
}

const fastSin = (angle: number): number => {
  const normalized = (((angle / TWO_PI) % 1) + 1) % 1;
  const scaled = normalized * SIN_TABLE_SIZE;
  const index = scaled | 0;
  const nextIndex = (index + 1) % SIN_TABLE_SIZE;
  const fraction = scaled - index;
  return (
    SIN_TABLE[index] + (SIN_TABLE[nextIndex] - SIN_TABLE[index]) * fraction
  );
};

const fastCos = (angle: number): number => fastSin(angle + Math.PI * 0.5);

// Track transitioning threads
const transitioningThreadIds = new Set<number>();

// ============================================================================
// EASING
// ============================================================================

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ============================================================================
// COLOR UTILITIES
// ============================================================================

function hslToArray(hsl: HSL): [number, number, number] {
  return [hsl.h, hsl.s, hsl.l];
}

function createGradientStops(color: HSL): {
  up: ColorStop[];
  down: ColorStop[];
} {
  // UP gradient: Darker, richer colors for better contrast
  const upStops: ColorStop[] = [
    { yPct: 0, hsl: hslToArray(adjustColor(color, { h: -18, s: 0, l: -5 })) }, // Darker top (was l: 10)
    { yPct: 0.5, hsl: hslToArray(adjustColor(color, { h: 4, s: 0, l: -5 })) }, // Darker mid (was l: 0)
    { yPct: 1, hsl: hslToArray(adjustColor(color, { h: 24, s: -3, l: -15 })) }, // Darker bottom (was l: -12)
  ];

  const downStops: ColorStop[] = [
    { yPct: 0, hsl: hslToArray(color) }, // Base color
    { yPct: 0.3, hsl: hslToArray(adjustColor(color, { s: -8, l: -3 })) }, // Slight darken at 30%
    { yPct: 0.6, hsl: hslToArray(adjustColor(color, { s: -36, l: -24 })) }, // Moderate darken at 60%
    { yPct: 0.85, hsl: [0, 0, 18] }, // Gentle shadow near floor
    { yPct: 1, hsl: [0, 0, 12] }, // Soft dark base
  ];

  return { up: upStops, down: downStops };
}

function calculateGradientBounds(profile: PathProfile): {
  minY: number;
  maxY: number;
} {
  // Calculate static gradient bounds from BOTH up and down profiles
  // This ensures the gradient covers the full range of thread positions in both directions
  let minY = Infinity;
  let maxY = -Infinity;

  // Check both up and down profiles to get full Y range
  for (const path of [profile.up, profile.down]) {
    for (let i = 0; i < path.length; i += 2) {
      const y = path[i + 1];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  return { minY, maxY };
}

// ============================================================================
// OVERLAY GRADIENT (constant)
// ============================================================================

const OVERLAY_GRADIENT: ColorStop[] = [
  { yPct: 0, hsl: [235, 100, 73] }, // retain vivid glow above threads
  { yPct: 0.42, hsl: [287, 100, 75] },
  { yPct: 0.75, hsl: [0, 0, 26] }, // soften the darkening near the floor
  { yPct: 1, hsl: [0, 0, 18] }, // leave a hint of light in the base glow
];

// ============================================================================
// THREAD FLIP LOGIC
// ============================================================================

type FlipDecision = { threadId: number; direction: Direction } | null;

const selectThreadToFlip = (
  threads: WorkerThreadState[],
  now: number,
  settleBufferMs: number = SETTLE_BUFFER_MS,
  preferDownWeight: number = 0.75,
): FlipDecision => {
  const eligible = (dir: Direction) =>
    threads.filter(
      (thread) =>
        thread.direction === dir && now - thread.lastFlipAt > settleBufferMs,
    );

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

  // Ensure at least one "up" thread remains
  const upThreads = threads.filter(
    (t) => t.direction === "up" || t.targetDirection === "up",
  );
  if (nextDirection === "down" && upThreads.length <= 1) return null;

  return { threadId: target.id, direction: nextDirection };
};

// ============================================================================
// ANIMATION COMPUTATION
// ============================================================================

/**
 * Compute animated points with drift/sway and interpolation
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

  // Hoist frequency calculations outside loop
  const swayBase = now * swayFreq + swayPhase;
  const driftBase = now * driftFreq + driftPhase;

  // Split paths: transitioning vs static
  if (transitionStartTime > 0) {
    // Transitioning: interpolate between base and target
    const progress = Math.min((now - transitionStartTime) / duration, 1);
    const t = progress >= 1 ? 1 : easeInOutCubic(progress);

    for (let i = 0; i < n; i++) {
      const xi = i << 1;
      const yi = xi + 1;

      const ix = base[xi] + (target[xi] - base[xi]) * t;
      const iy = base[yi] + (target[yi] - base[yi]) * t;

      const swayOffset =
        fastSin(swayBase + SIN_OFFSETS[i]) * swayAmp * PIVOT_DAMPING[i];
      const driftOffset = fastCos(driftBase + COS_OFFSETS[i]) * driftAmp;

      into[xi] = ix + driftOffset;
      into[yi] = iy + swayOffset;
    }
  } else {
    // Not transitioning: use target directly
    for (let i = 0; i < n; i++) {
      const xi = i << 1;
      const yi = xi + 1;

      const swayOffset =
        fastSin(swayBase + SIN_OFFSETS[i]) * swayAmp * PIVOT_DAMPING[i];
      const driftOffset = fastCos(driftBase + COS_OFFSETS[i]) * driftAmp;

      into[xi] = target[xi] + driftOffset;
      into[yi] = target[yi] + swayOffset;
    }
  }
};

// ============================================================================
// WORKER STATE
// ============================================================================

let threads: WorkerThreadState[] = [];
let viewSize = VIEWBOX_SIZE;
let frameInterval = FRAME_INTERVAL;
let isPaused = false;
let lastFlipCheck = 0;
let lastFrameTime = 0;
let renderer: Renderer | null = null;
let threadFrames: ThreadFrame[] = [];
let reusablePacket: FramePacket | null = null;

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(now: number) {
  if (isPaused || threads.length === 0) {
    return;
  }

  if (now - lastFrameTime < frameInterval - 1) {
    return;
  }
  lastFrameTime = now;

  // Flip decision on interval
  if (now - lastFlipCheck >= FLIP_INTERVAL_MS) {
    lastFlipCheck = now;
    const decision = selectThreadToFlip(threads, now);
    if (decision) {
      const { threadId, direction: nextDirection } = decision;
      const thread = threads.find((t) => t.id === threadId);
      if (thread) {
        thread.duration = directionDuration(nextDirection);
        thread.targetDirection = nextDirection;
        thread.transitionStartTime = now;
        thread.lastFlipAt = now;
        transitioningThreadIds.add(threadId);
      }
    }
  }

  // Compute animated points for all threads (reuse buffers)
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const isTransitioning =
      thread.transitionStartTime > 0 &&
      now - thread.transitionStartTime < thread.duration;

    // Compute animated points
    writeAnimatedPoints(
      thread.profile[thread.targetDirection],
      thread.profile[thread.direction],
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

    // Check if transition completed
    if (!isTransitioning && thread.direction !== thread.targetDirection) {
      thread.direction = thread.targetDirection;
      thread.transitionStartTime = 0;
      transitioningThreadIds.delete(thread.id);
    }

    // Update reusable frame entry (no allocations)
    const frame = threadFrames[i];
    frame.points = thread.floatingPoints;
    frame.width = thread.weight;
    frame.opacity = thread.opacity;
    frame.colorStops = thread.gradientStops[thread.direction];
    frame.gradientMinY = thread.gradientBounds.minY;
    frame.gradientMaxY = thread.gradientBounds.maxY;
  }

  if (!reusablePacket || !renderer) return;

  reusablePacket.time = now;
  reusablePacket.viewSize = viewSize;

  renderer.draw(reusablePacket);
}
// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { data } = event;

  switch (data.type) {
    case "init": {
      // Initialize threads from main thread data
      threads = data.threads.map((t) => {
        const profile: PathProfile = {
          neutral: t.profileNeutral,
          up: t.profileUp,
          down: t.profileDown,
        };

        const gradientStops = createGradientStops(t.color);
        const gradientBounds = calculateGradientBounds(profile);

        return {
          id: t.id,
          color: t.color,
          weight: t.weight,
          opacity: t.opacity,
          profile,
          direction: t.direction,
          targetDirection: t.direction,
          duration: t.duration,
          lastFlipAt: 0,
          swayPhase: t.swayPhase,
          driftPhase: t.driftPhase,
          swayFreq: t.swayFreq,
          driftFreq: t.driftFreq,
          swayAmp: t.swayAmp,
          driftAmp: t.driftAmp,
          transitionStartTime: 0,
          floatingPoints: new Float32Array(profile.down.length),
          gradientStops,
          gradientBounds,
        };
      });

      viewSize = data.config.viewSize;
      frameInterval = data.frameInterval;
      lastFrameTime = 0;
      transitioningThreadIds.clear();

      // Prepare reusable frame structures
      threadFrames = threads.map((thread) => ({
        points: thread.floatingPoints,
        width: thread.weight,
        opacity: thread.opacity,
        colorStops: thread.gradientStops[thread.direction],
        gradientMinY: thread.gradientBounds.minY,
        gradientMaxY: thread.gradientBounds.maxY,
      }));

      reusablePacket = {
        time: 0,
        viewSize,
        threads: threadFrames,
        overlayMixMode: "screen",
        overlayGradient: OVERLAY_GRADIENT,
      };

      // Initialize renderer in-worker using OffscreenCanvas
      createRenderer({
        canvas: data.canvas,
        config: data.config,
      })
        .then((result) => {
          renderer?.dispose();
          renderer = result.renderer;
        })
        .catch((error) => {
          console.error("[Timeline] Worker renderer init failed", error);
          renderer = null;
        });

      // Initialize state (main thread will drive frames via "tick" messages)
      lastFlipCheck = performance.now();
      isPaused = false;
      break;
    }

    case "tick": {
      // Main thread drives animation timing via rAF
      // Worker computes and posts one frame on demand
      if (!isPaused) {
        animate(data.now);
      }
      break;
    }

    case "pause": {
      isPaused = true;
      break;
    }

    case "resume": {
      isPaused = false;
      lastFlipCheck = performance.now();
      lastFrameTime = 0;
      break;
    }

    case "terminate": {
      isPaused = true;
      threads = [];
      transitioningThreadIds.clear();
      lastFrameTime = 0;
      renderer?.dispose();
      renderer = null;
      reusablePacket = null;
      threadFrames = [];
      break;
    }
  }
};
