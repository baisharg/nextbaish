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

export const THREAD_COUNT = 30;
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
export const TARGET_FPS = 60;
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

export const randomInRangeWith = (rng: () => number, min: number, max: number) =>
  rng() * (max - min) + min;

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

  const downDepth = randomInRangeWith(rng, 0.28, 0.40);
  const upRise = randomInRangeWith(rng, 0.45, 0.85);

  const upCurve = randomInRangeWith(rng, 0.4, 2.2);
  const upStartY = randomInRangeWith(rng, 0.48, 0.58);
  const flattenStrength = randomInRangeWith(rng, 25.0, 35.0);
  const flattenThreshold = randomInRangeWith(rng, 0.20, 0.85);
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

    if (t <= PIVOT_X) {
      const preP = t / PIVOT_X;
      const convergeCurve = Math.pow(preP, 1.35);

      const spreadFactor = 0.25 + preP * 0.25;
      const compressedBaseY = PIVOT_Y + (baseY - PIVOT_Y) * spreadFactor;

      const ringTightness = Math.pow(preP, 3.5);
      const sharedY = clamp(
        compressedBaseY + (PIVOT_Y - compressedBaseY) * ringTightness + noise * 0.85 * (1 - preP * 0.95),
        0.04,
        0.96
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

    const neutralY = clamp(PIVOT_Y + neutralDrift * Math.pow(postP, 1.1) + noise * 0.72, 0.04, 0.96);
    neutral[xIndex] = xBase + lateralShift * 0.75;
    neutral[yIndex] = neutralY;

    const upY = clamp(PIVOT_Y - upRise * Math.pow(postP, upCurve) - noise * 0.85, -0.30, 0.96);
    up[xIndex] = xBase + lateralShift * 1.2;
    up[yIndex] = upY;

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
// DURATION UTILITIES
// ============================================================================

export const directionDuration = (direction: Direction) =>
  direction === "up"
    ? randomInRange(UP_DURATION_MIN, UP_DURATION_MAX)
    : randomInRange(DOWN_DURATION_MIN, DOWN_DURATION_MAX);

export const directionDurationSeeded = (direction: Direction, rng: () => number) =>
  direction === "up"
    ? randomInRangeWith(rng, UP_DURATION_MIN, UP_DURATION_MAX)
    : randomInRangeWith(rng, DOWN_DURATION_MIN, DOWN_DURATION_MAX);
