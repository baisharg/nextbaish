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
  PIVOT_DAMPING,
  SEGMENT_FACTORS,
  VIEWBOX_SIZE,
  POINTER_RADIUS,
  POINTER_STRENGTH,
  POINTER_POS_TAU_MS,
  POINTER_STRENGTH_TAU_MS,
  PULSE_TRAVEL_MS,
  PULSE_AMPLITUDE,
  adjustColor,
  directionDuration,
} from "../utils/thread-utils";

import type { FramePacket, ThreadFrame, ColorStop, Renderer } from "../types/renderer";
import { createRenderer } from "../utils/create-renderer";
import type {
  WorkerMessage,
  RendererReadyMessage,
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

// Precompute sin/cos offsets
const SEG_LEN = SEGMENT_FACTORS.length;
const SIN_OFFSETS = new Float32Array(SEG_LEN);
const COS_OFFSETS = new Float32Array(SEG_LEN);
for (let i = 0; i < SEG_LEN; i++) {
  const s = SEGMENT_FACTORS[i];
  SIN_OFFSETS[i] = s * Math.PI;
  COS_OFFSETS[i] = s * Math.PI * 0.5;
}

// Sin/Cos lookup table
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
    { yPct: 0, hsl: hslToArray(adjustColor(color, { h: -18, s: 0, l: -5 })) },
    { yPct: 0.5, hsl: hslToArray(adjustColor(color, { h: 4, s: 0, l: -5 })) },
    { yPct: 1, hsl: hslToArray(adjustColor(color, { h: 24, s: -3, l: -15 })) },
  ];

  // DOWN gradient: soft floor shading for the light background
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

type FlipDecision = { thread: WorkerThreadState; direction: Direction } | null;

const selectThreadToFlip = (
  threads: WorkerThreadState[],
  now: number,
): FlipDecision => {
  const settleBufferMs = SETTLE_BUFFER_MS;
  const eligibleDown: WorkerThreadState[] = [];
  const eligibleUp: WorkerThreadState[] = [];

  for (const t of threads) {
    if (now - t.lastFlipAt <= settleBufferMs) continue;
    if (t.direction === "down") eligibleDown.push(t);
    else eligibleUp.push(t);
  }

  const pickFrom = (arr: WorkerThreadState[]) =>
    arr.length ? arr[(Math.random() * arr.length) | 0] : null;

  let target = Math.random() < 0.75 ? pickFrom(eligibleDown) : null;
  if (!target) target = pickFrom(eligibleUp);
  if (!target) target = pickFrom(eligibleDown);
  if (!target) return null;

  const nextDirection: Direction = target.direction === "down" ? "up" : "down";

  // Ensure at least one "up" thread remains
  if (nextDirection === "down") {
    const upCount = threads.filter(
      (t) => t.direction === "up" || t.targetDirection === "up",
    ).length;
    if (upCount <= 1) return null;
  }

  return { thread: target, direction: nextDirection };
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
let isPaused = false;
let lastFlipCheck = 0;
let renderer: Renderer | null = null;
let threadFrames: ThreadFrame[] = [];
let reusablePacket: FramePacket | null = null;

// Pointer interaction state: targets set by "pointer" messages, eased values
// advanced each frame so the response trails like air movement.
let pointerTargetX = 0.5;
let pointerTargetY = 0.5;
let pointerTargetActive = false;
let pointerX = 0.5;
let pointerY = 0.5;
let pointerStrength = 0;
let lastAnimateNow = 0;

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(now: number) {
  if (isPaused || threads.length === 0) {
    return;
  }

  // Advance pointer easing (frame-rate independent)
  const dt = lastAnimateNow > 0 ? Math.min(now - lastAnimateNow, 100) : 16;
  lastAnimateNow = now;
  const posBlend = 1 - Math.exp(-dt / POINTER_POS_TAU_MS);
  const strengthBlend = 1 - Math.exp(-dt / POINTER_STRENGTH_TAU_MS);
  pointerX += (pointerTargetX - pointerX) * posBlend;
  pointerY += (pointerTargetY - pointerY) * posBlend;
  pointerStrength +=
    ((pointerTargetActive ? 1 : 0) - pointerStrength) * strengthBlend;
  const pointerOn = pointerStrength > 0.002;
  const pointerInvR2 = 1 / (2 * POINTER_RADIUS * POINTER_RADIUS);
  const pointerScale = (POINTER_STRENGTH / POINTER_RADIUS) * pointerStrength;

  // Flip decision on interval
  if (now - lastFlipCheck >= FLIP_INTERVAL_MS) {
    lastFlipCheck = now;
    const decision = selectThreadToFlip(threads, now);
    if (decision) {
      const { thread, direction: nextDirection } = decision;
      thread.duration = directionDuration(nextDirection);
      thread.targetDirection = nextDirection;
      thread.transitionStartTime = now;
      thread.lastFlipAt = now;
      transitioningThreadIds.add(thread.id);
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

    // Bow points away from the (eased) pointer with a gaussian falloff.
    // The push magnitude is d * scale * falloff, which is zero at the pointer
    // itself and peaks one radius out — no singularity, no jitter.
    if (pointerOn) {
      const pts = thread.floatingPoints;
      for (let p = 0; p < pts.length; p += 2) {
        const dx = pts[p] - pointerX;
        const dy = pts[p + 1] - pointerY;
        const falloff = Math.exp(-(dx * dx + dy * dy) * pointerInvR2);
        pts[p] += dx * pointerScale * falloff;
        pts[p + 1] += dy * pointerScale * falloff;
      }
    }

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

    // Flip pulse: a highlight travels the thread during the first moments of
    // a direction transition (durations always exceed PULSE_TRAVEL_MS).
    const pulseElapsed = now - thread.transitionStartTime;
    if (thread.transitionStartTime > 0 && pulseElapsed < PULSE_TRAVEL_MS) {
      const p = pulseElapsed / PULSE_TRAVEL_MS;
      frame.pulsePos = p;
      frame.pulseIntensity = PULSE_AMPLITUDE * Math.sin(Math.PI * p);
    } else {
      frame.pulsePos = 0;
      frame.pulseIntensity = 0;
    }
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
      transitioningThreadIds.clear();

      // Prepare reusable frame structures
      threadFrames = threads.map((thread) => ({
        points: thread.floatingPoints,
        width: thread.weight,
        opacity: thread.opacity,
        colorStops: thread.gradientStops[thread.direction],
        gradientMinY: thread.gradientBounds.minY,
        gradientMaxY: thread.gradientBounds.maxY,
        pulsePos: 0,
        pulseIntensity: 0,
      }));

      reusablePacket = {
        time: 0,
        viewSize,
        threads: threadFrames,
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
          const ready: RendererReadyMessage = {
            type: "rendererReady",
            kind: result.kind,
          };
          self.postMessage(ready);
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

    case "pointer": {
      // On release keep the last position so the effect fades out in place
      // instead of swinging toward the parked target.
      if (data.active) {
        pointerTargetX = data.x;
        pointerTargetY = data.y;
      }
      pointerTargetActive = data.active;
      break;
    }

    case "pause": {
      isPaused = true;
      break;
    }

    case "resume": {
      isPaused = false;
      lastFlipCheck = performance.now();
      break;
    }

    case "terminate": {
      isPaused = true;
      threads = [];
      transitioningThreadIds.clear();
      renderer?.dispose();
      renderer = null;
      reusablePacket = null;
      threadFrames = [];
      break;
    }
  }
};
