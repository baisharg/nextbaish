// ============================================================================
// TYPES
// ============================================================================

export type PathProfile = {
  neutral: Float32Array;
  up: Float32Array;
  down: Float32Array;
};

export type Direction = "up" | "down";

export type HSL = { h: number; s: number; l: number };

// ============================================================================
// CONSTANTS - Visual Layout
// ============================================================================

export const THREAD_COUNT = 80;
export const SEGMENTS = 10;
export const PIVOT_X = 0.42;
export const PIVOT_Y = 0.54;
export const X_START = -0.18;
export const X_END = 1.15;
export const VIEWBOX_SIZE = 1000;

export const COLOR_PALETTE: HSL[] = [
  { h: 259, s: 100, l: 55 }, // Darker, more saturated purple
  { h: 233, s: 100, l: 58 }, // Darker, more saturated blue
  { h: 304, s: 100, l: 56 }, // Darker, more saturated pink
];

// ============================================================================
// CONSTANTS - Animation Timing
// ============================================================================

export const FLIP_INTERVAL_MS = 8000;
export const SETTLE_BUFFER_MS = 900;
// Cap, not a target: the rAF-driven tick loop follows the display's refresh
// rate and throttles to this. High-refresh monitors get up to 144Hz; the
// low-power profile still clamps to 45fps in TimelineThreads.
export const TARGET_FPS = 144;
export const FRAME_INTERVAL = 1000 / TARGET_FPS;

export const UP_DURATION_MIN = 10400;
export const UP_DURATION_MAX = 16400;
export const DOWN_DURATION_MIN = 6800;
export const DOWN_DURATION_MAX = 11600;

// ============================================================================
// CONSTANTS - Math Precomputation
// ============================================================================

export const BEZIER_CONTROL_FACTOR = 1 / 6;
export const GOLDEN_RATIO_SEED = 0x9e3779b9;

export const PIVOT_DAMPING = new Float32Array(SEGMENTS);
for (let i = 0; i < SEGMENTS; i++) {
  const t = i / (SEGMENTS - 1);
  const x = X_START + (X_END - X_START) * t;
  PIVOT_DAMPING[i] = 1 - Math.exp(-Math.pow((x - PIVOT_X) * 3, 2));
}

export const SEGMENT_FACTORS = new Float32Array(SEGMENTS);
for (let i = 0; i < SEGMENTS; i++) {
  SEGMENT_FACTORS[i] = i / (SEGMENTS - 1);
}

// ============================================================================
// CONSTANTS & HELPERS - Rendering (shared by the WebGL and WebGPU renderers;
// both paths must stay visually identical, so change these here, never fork
// a copy inside one renderer)
// ============================================================================

/** Bezier subdivisions per polyline segment when tessellating threads */
export const SEGMENTS_PER_CURVE = 8;

/** Stroke width multiplier applied to each thread's weight */
export const THREAD_WIDTH_SCALE = 2.4;

/** Opacity of the overlay gradient pass */
export const OVERLAY_OPACITY = 0.25;
/** Overlay opacity for section canvases (ThreadSet). Each covers only its
 * section, so any wash would show as a tinted band; the page draws its own
 * background instead. The overlay colours still screen-blend the threads. */
export const SCENE_OVERLAY_OPACITY = 0;

/** Color stops per gradient; the shaders are sized/unrolled for this count */
export const MAX_GRADIENT_STOPS = 5;

/** Default placement of the square viewbox inside a non-square canvas */
export const DEFAULT_OFFSET_X_MULTIPLIER = 0.5;
export const DEFAULT_OFFSET_Y_MULTIPLIER = -0.35;

// --- Pointer interaction (applied to control points in the worker, so both
// renderers inherit it identically) ---

/** Gaussian falloff radius around the pointer, in normalized viewbox space */
export const POINTER_RADIUS = 0.16;
/** Displacement scale; peak push is ~0.6x this at one radius from the pointer */
export const POINTER_STRENGTH = 0.014;
/** Easing time constant for the trailing pointer position */
export const POINTER_POS_TAU_MS = 250;
/** Easing time constant for engage/release of the effect */
export const POINTER_STRENGTH_TAU_MS = 400;

// --- Flip pulse (a brief highlight traveling along a thread when it starts
// changing direction; rendered by both fragment shaders) ---

/** How long the pulse takes to travel the full thread */
export const PULSE_TRAVEL_MS = 2600;
/** Gaussian width of the pulse along the thread (0..1 length space) */
export const PULSE_WIDTH = 0.09;
/** Peak brightness boost at the pulse center */
export const PULSE_AMPLITUDE = 0.3;
/**
 * Pulses a page asks for (hovering a marked element) deepen the thread and
 * make it opaque instead of brightening it: on the light page, brighter pink
 * reads as less visible, not more. Both renderers treat a negative pulse
 * intensity as this deepening pulse.
 */
export const DEEPEN_PULSE_AMPLITUDE = 0.9;
/** Colour multiplier at the centre of a full-strength deepening pulse */
export const PULSE_DEEPEN = 0.5;

// --- Composite grain ---

/** Dither amplitude for the final composite: debands the glow gradients and
 * reads as the faintest paper texture. ~2 steps of 8-bit. */
export const GRAIN_AMPLITUDE = 2.0 / 255;

/**
 * Convert HSL to RGB on CPU (removes expensive per-fragment conversion)
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns RGB tuple (0-1 range)
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360.0;
  s = s / 100.0;
  l = l / 100.0;

  const c = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
  const x = c * (1.0 - Math.abs(((h * 6.0) % 2.0) - 1.0));
  const m = l - c / 2.0;

  let rgb: [number, number, number];
  if (h < 1.0 / 6.0) rgb = [c, x, 0.0];
  else if (h < 2.0 / 6.0) rgb = [x, c, 0.0];
  else if (h < 3.0 / 6.0) rgb = [0.0, c, x];
  else if (h < 4.0 / 6.0) rgb = [0.0, x, c];
  else if (h < 5.0 / 6.0) rgb = [x, 0.0, c];
  else rgb = [c, 0.0, x];

  return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
}

/**
 * Compute 5-tap linear Gaussian weights and offsets
 * Uses bilinear filtering optimization: 5 taps instead of 9
 */
export function computeLinearGaussianWeights(sigma: number): {
  weights: [number, number, number];
  offsets: [number, number];
} {
  const gauss = (x: number, sigma: number) =>
    Math.exp(-(x * x) / (2.0 * sigma * sigma));

  const w0 = gauss(0, sigma);
  const w1 = gauss(1, sigma);
  const w2 = gauss(2, sigma);

  const total = w0 + 2 * w1 + 2 * w2;
  const weights: [number, number, number] = [w0 / total, w1 / total, w2 / total];
  const offsets: [number, number] = [1.0 * sigma, 2.0 * sigma];

  return { weights, offsets };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomInRangeWith = (
  rng: () => number,
  min: number,
  max: number,
) => rng() * (max - min) + min;

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export const wrapHue = (h: number) => {
  const mod = h % 360;
  return mod < 0 ? mod + 360 : mod;
};

export const chooseColor = (rng: () => number) => {
  const base = COLOR_PALETTE[Math.floor(rng() * COLOR_PALETTE.length)];
  return {
    h: wrapHue(base.h + randomInRangeWith(rng, -8, 8)),
    s: clamp(base.s + randomInRangeWith(rng, -2, 2), 95, 100), // Higher saturation
    l: clamp(base.l + randomInRangeWith(rng, -6, 6), 48, 65), // Darker range
  };
};

export const adjustColor = (color: HSL, delta: Partial<HSL>) => ({
  h: wrapHue(color.h + (delta.h ?? 0)),
  s: clamp(color.s + (delta.s ?? 0), 0, 100),
  l: clamp(color.l + (delta.l ?? 0), 0, 100),
});

export const hslToString = (hsl: HSL) =>
  `hsl(${wrapHue(hsl.h).toFixed(2)}, ${hsl.s.toFixed(2)}%, ${hsl.l.toFixed(2)}%)`;

// ============================================================================
// PATH GENERATION
// ============================================================================

export const getUpFraction = (threadCount: number) =>
  threadCount <= 1 ? 1 : 1 / threadCount;

export const createPathProfile = (
  index: number,
  rng: () => number,
  threadCount: number = THREAD_COUNT,
): PathProfile => {
  const total = Math.max(threadCount, 1);
  const denominator = Math.max(total - 1, 1);
  const baseY = clamp(
    0.22 + (index / denominator) * 0.56 + randomInRangeWith(rng, -0.05, 0.05),
    0.08,
    0.92,
  );

  const upRise = randomInRangeWith(rng, 0.45, 0.85);

  const upCurve = randomInRangeWith(rng, 0.4, 2.2);
  const flattenThreshold = randomInRangeWith(rng, 0.2, 0.85);
  const extinctionY = randomInRangeWith(rng, 0.84, 0.89);

  const tangleFreq = randomInRangeWith(rng, 5.5, 9.2);
  const tanglePhase = randomInRangeWith(rng, 0, Math.PI * 2);
  const tangleAmplitude = randomInRangeWith(rng, 0.028, 0.062);

  const lateralFreq = randomInRangeWith(rng, 2.0, 3.4);
  const lateralPhase = randomInRangeWith(rng, 0, Math.PI * 2);
  const lateralAmp = randomInRangeWith(rng, 0.025, 0.055);

  const neutralDrift = randomInRangeWith(rng, -0.03, 0.03);

  const neutral = new Float32Array(SEGMENTS * 2);
  const up = new Float32Array(SEGMENTS * 2);
  const down = new Float32Array(SEGMENTS * 2);

  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / (SEGMENTS - 1);
    const xBase = X_START + (X_END - X_START) * t;

    const tightness = 1 - Math.pow(Math.abs(t - PIVOT_X) / 0.5, 1.2);
    const noise =
      (Math.sin(t * tangleFreq + tanglePhase) * tangleAmplitude +
        Math.sin(t * tangleFreq * 0.5 + tanglePhase * 1.7) *
          (tangleAmplitude * 0.55)) *
      clamp(0.55 + tightness * 0.85, 0.55, 1.4);
    const lateralShift =
      Math.sin(t * lateralFreq + lateralPhase) * lateralAmp * (0.8 + t * 0.9);

    const xIndex = i * 2;
    const yIndex = i * 2 + 1;

    if (t <= PIVOT_X) {
      const preP = t / PIVOT_X;
      const spreadFactor = 0.25 + preP * 0.25;
      const compressedBaseY = PIVOT_Y + (baseY - PIVOT_Y) * spreadFactor;

      const ringTightness = Math.pow(preP, 3.5);
      const sharedY = clamp(
        compressedBaseY +
          (PIVOT_Y - compressedBaseY) * ringTightness +
          noise * 0.85 * (1 - preP * 0.95),
        0.04,
        0.96,
      );

      const sharedX = xBase + lateralShift * 0.8;
      neutral[xIndex] = sharedX;
      neutral[yIndex] = sharedY;
      up[xIndex] = sharedX;
      up[yIndex] = sharedY;
      down[xIndex] = sharedX;
      down[yIndex] = sharedY;
      continue;
    }

    const postP = (t - PIVOT_X) / (1 - PIVOT_X);

    const neutralY = clamp(
      PIVOT_Y + neutralDrift * Math.pow(postP, 1.1) + noise * 0.72,
      0.04,
      0.96,
    );
    neutral[xIndex] = xBase + lateralShift * 0.75;
    neutral[yIndex] = neutralY;

    const upY = clamp(
      PIVOT_Y - upRise * Math.pow(postP, upCurve) - noise * 0.85,
      -0.3,
      0.96,
    );
    up[xIndex] = xBase + lateralShift * 1.2;
    up[yIndex] = upY;

    let downY: number;
    if (postP < flattenThreshold) {
      const downProgress = postP / flattenThreshold;
      const downShape = Math.pow(downProgress, 2.2);
      downY = clamp(
        PIVOT_Y + (extinctionY - PIVOT_Y) * downShape + noise * 0.85,
        0.06,
        0.96,
      );
    } else {
      downY = extinctionY;
    }
    down[xIndex] = xBase + lateralShift * 0.95;
    down[yIndex] = downY;
  }

  return { neutral, up, down };
};

// ============================================================================
// DURATION UTILITIES
// ============================================================================

export const directionDuration = (direction: Direction) =>
  direction === "up"
    ? randomInRange(UP_DURATION_MIN, UP_DURATION_MAX)
    : randomInRange(DOWN_DURATION_MIN, DOWN_DURATION_MAX);

export const directionDurationSeeded = (
  direction: Direction,
  rng: () => number,
) =>
  direction === "up"
    ? randomInRangeWith(rng, UP_DURATION_MIN, UP_DURATION_MAX)
    : randomInRangeWith(rng, DOWN_DURATION_MIN, DOWN_DURATION_MAX);
