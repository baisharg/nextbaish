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
  clamp,
  directionDuration,
} from "../utils/thread-utils";

import type { FramePacket, ThreadFrame, ColorStop } from "../types/renderer";

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
// MESSAGE TYPES
// ============================================================================

export type InitMessage = {
  type: "init";
  threads: Array<{
    id: number;
    color: HSL;
    weight: number;
    opacity: number;
    profileNeutral: Float32Array;
    profileUp: Float32Array;
    profileDown: Float32Array;
    direction: Direction;
    swayPhase: number;
    driftPhase: number;
    swayFreq: number;
    driftFreq: number;
    swayAmp: number;
    driftAmp: number;
    duration: number;
  }>;
  viewSize: number;
  frameInterval: number;
};

export type PauseMessage = {
  type: "pause";
};

export type ResumeMessage = {
  type: "resume";
};

export type TerminateMessage = {
  type: "terminate";
};

export type WorkerMessage = InitMessage | PauseMessage | ResumeMessage | TerminateMessage;

export type FrameMessage = {
  type: "frame";
  packet: FramePacket;
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
  const normalized = ((angle / TWO_PI) % 1 + 1) % 1;
  const scaled = normalized * SIN_TABLE_SIZE;
  const index = scaled | 0;
  const nextIndex = (index + 1) % SIN_TABLE_SIZE;
  const fraction = scaled - index;
  return SIN_TABLE[index] + (SIN_TABLE[nextIndex] - SIN_TABLE[index]) * fraction;
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

function createGradientStops(color: HSL): { up: ColorStop[]; down: ColorStop[] } {
  // Match the original SVG gradient stops
  const upStops: ColorStop[] = [
    { yPct: 0, hsl: hslToArray(adjustColor(color, { h: -18, s: 0, l: 10 })) },
    { yPct: 0.5, hsl: hslToArray(adjustColor(color, { h: 4, s: 0, l: 0 })) },
    { yPct: 1, hsl: hslToArray(adjustColor(color, { h: 24, s: -3, l: -12 })) },
  ];

  const downStops: ColorStop[] = [
    { yPct: 0, hsl: hslToArray(color) },
    { yPct: 0.25, hsl: hslToArray(adjustColor(color, { s: -20, l: -15 })) },
    { yPct: 0.5, hsl: hslToArray(adjustColor(color, { s: -60, l: -35 })) },
    { yPct: 0.7, hsl: [0, 0, 15] }, // Dark gray starts at 70%
    { yPct: 1, hsl: [0, 0, 0] }, // Pure black at bottom
  ];

  return { up: upStops, down: downStops };
}

function calculateGradientBounds(profile: PathProfile): { minY: number; maxY: number } {
  // Calculate static gradient bounds from "down" profile ONLY (matches SVG implementation)
  // SVG uses the same y1/y2 bounds for both up and down gradients
  let minY = Infinity;
  let maxY = -Infinity;
  const down = profile.down;
  for (let i = 0; i < down.length; i += 2) {
    const y = down[i + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minY, maxY };
}

// ============================================================================
// OVERLAY GRADIENT (constant)
// ============================================================================

const OVERLAY_GRADIENT: ColorStop[] = [
  { yPct: 0, hsl: [235, 100, 73] }, // rgba(118, 123, 255, 0.38) approximation
  { yPct: 0.42, hsl: [287, 100, 75] }, // rgba(219, 126, 255, 0.22)
  { yPct: 0.75, hsl: [277, 100, 68] }, // rgba(188, 94, 255, 0.18)
  { yPct: 1, hsl: [309, 100, 84] }, // rgba(244, 173, 255, 0.30)
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

  // Ensure at least one "up" thread remains
  const upThreads = threads.filter((t) => t.direction === "up" || t.targetDirection === "up");
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

      const swayOffset = fastSin(swayBase + SIN_OFFSETS[i]) * swayAmp * PIVOT_DAMPING[i];
      const driftOffset = fastCos(driftBase + COS_OFFSETS[i]) * driftAmp;

      into[xi] = ix + driftOffset;
      into[yi] = iy + swayOffset;
    }
  } else {
    // Not transitioning: use target directly
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

// ============================================================================
// WORKER STATE
// ============================================================================

let threads: WorkerThreadState[] = [];
let viewSize = VIEWBOX_SIZE;
let frameInterval = FRAME_INTERVAL;
let isPaused = false;
let animationFrameId = 0;
let lastFlipCheck = 0;

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(now: number) {
  if (isPaused || threads.length === 0) {
    return;
  }

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

  // Compute animated points for all threads
  const threadFrames: ThreadFrame[] = [];

  for (const thread of threads) {
    const isTransitioning =
      thread.transitionStartTime > 0 && now - thread.transitionStartTime < thread.duration;

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

    // Create thread frame
    threadFrames.push({
      points: thread.floatingPoints.slice(), // Copy for transfer
      width: thread.weight,
      opacity: thread.opacity,
      colorStops: thread.gradientStops[thread.direction],
      gradientMinY: thread.gradientBounds.minY,
      gradientMaxY: thread.gradientBounds.maxY,
    });
  }

  // Create frame packet
  const packet: FramePacket = {
    time: now,
    viewSize,
    threads: threadFrames,
    overlayMixMode: "screen",
    overlayGradient: OVERLAY_GRADIENT,
  };

  // Post frame to main thread (renderer will draw it)
  const message: FrameMessage = {
    type: "frame",
    packet,
  };
  self.postMessage(message);

  // Schedule next frame
  animationFrameId = self.setTimeout(() => {
    animate(performance.now());
  }, frameInterval);
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

      viewSize = data.viewSize;
      frameInterval = data.frameInterval;
      transitioningThreadIds.clear();

      // Start animation loop
      lastFlipCheck = performance.now();
      isPaused = false;
      animate(performance.now());
      break;
    }

    case "pause": {
      isPaused = true;
      if (animationFrameId) {
        self.clearTimeout(animationFrameId);
        animationFrameId = 0;
      }
      break;
    }

    case "resume": {
      if (!isPaused) return;
      isPaused = false;
      lastFlipCheck = performance.now();
      animate(performance.now());
      break;
    }

    case "terminate": {
      isPaused = true;
      if (animationFrameId) {
        self.clearTimeout(animationFrameId);
        animationFrameId = 0;
      }
      threads = [];
      transitioningThreadIds.clear();
      break;
    }
  }
};
