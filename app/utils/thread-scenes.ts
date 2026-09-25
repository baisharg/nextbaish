/**
 * Thread scenes: target shapes the animation worker blends the threads into
 * as the page scrolls. The free animation (the original flipping threads) is
 * one scene; the others are parametric shapes laid out inside a box that the
 * page marks in the DOM.
 *
 * Runs in the animation worker: no framework imports.
 */

import { SEGMENTS, clamp } from "./thread-utils";

export const SCENE_IDS = [
  "free",
  "scatter",
  "braid",
  "rope",
  "strands",
  "fan",
  "horizon",
  "knot",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export const isSceneId = (value: string): value is SceneId =>
  (SCENE_IDS as readonly string[]).includes(value);

/** [x0, y0, x1, y1] in the worker's normalized viewbox space */
export type SceneBox = [number, number, number, number];

/**
 * Thread opacity multiplier per scene. Scenes that sit behind body text are
 * dimmed; the ones that own a clear area of the layout run at full strength.
 */
export const SCENE_OPACITY: Record<SceneId, number> = {
  free: 1,
  scatter: 1,
  braid: 1,
  rope: 1,
  strands: 1,
  fan: 1,
  horizon: 0.55,
  knot: 1,
};

/**
 * Accent hue per scene: threads blend `amount` of the way toward `hue` while
 * the scene is on screen, so each stage of the path has its own colour. The
 * page uses the same hues for that stage's text accents (lab.css).
 */
export const SCENE_TINT: Partial<Record<SceneId, { hue: number; amount: number }>> =
  {
    scatter: { hue: 225, amount: 0.75 }, // Learn: blue
    braid: { hue: 305, amount: 0.75 }, // Belong: magenta
    strands: { hue: 262, amount: 0.75 }, // Research: violet
    fan: { hue: 12, amount: 0.75 }, // Launch: coral
  };

/** Blend hue `a` toward hue `b` along the shorter way round the wheel. */
export const mixHue = (a: number, b: number, t: number) => {
  const delta = ((((b - a) % 360) + 540) % 360) - 180;
  return (((a + delta * t) % 360) + 360) % 360;
};

/**
 * Easing time constant for scene weights. Scroll already drives the weights
 * smoothly, so this only softens jumps (a rail click, a resize); anything
 * longer reads as the threads lagging behind the page. Boxes are not eased
 * at all: they track the DOM exactly.
 */
export const SCENE_WEIGHT_TAU_MS = 110;

const TAU = Math.PI * 2;

const smooth = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Stable per-thread random in [0, 1) */
const hash = (k: number, salt: number) => {
  let h = Math.imul(k + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca77);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
};

const STRAND_CENTERS = [0.2, 0.5, 0.8];

/**
 * Vertical position (box-local, 0 = top, 1 = bottom) of thread k at
 * box-local x = a. `a` runs 0..1 across the box and beyond it on either side
 * for the control points that reach the screen edges.
 */
const sceneY = (
  id: Exclude<SceneId, "free">,
  a: number,
  k: number,
  n: number,
  t: number,
): number => {
  const s = n > 1 ? k / (n - 1) : 0.5;
  const r1 = hash(k, 1);
  const r2 = hash(k, 2);
  const phase = r1 * TAU;
  // Rope twist: every thread follows the same wave with its own phase, so
  // neighbours cross each other like fibres in a rope.
  const twist = (amp: number, cycles: number, speed: number) =>
    amp * Math.sin(TAU * cycles * a + phase + speed * t);

  // Threads that start left of the box run above or below it, so they stay
  // clear of the copy that sits beside the box, and swing in from there.
  const edgeLane = r2 < 0.5 ? -0.18 + 0.3 * r2 : 0.93 + 0.3 * (r2 - 0.5);

  switch (id) {
    // Threads arrive from above and below and drift into a loose band.
    case "scatter": {
      const end = 0.5 + (s - 0.5) * 0.55;
      const g = smooth((a + 0.05) / 1.05);
      const wave = 0.05 * Math.sin(TAU * (0.8 * a + r1) + 0.3 * t);
      return lerp(edgeLane, end, g) + wave * g * (1 - 0.5 * g);
    }
    // Threads converge into one twisted rope. "rope" is the same shape
    // without a stage accent, for page title bands.
    case "braid":
    case "rope": {
      const rope = 0.5 + twist(0.035, 1.25, 0.7);
      return lerp(edgeLane, rope, smooth((a + 0.02) / 0.5));
    }
    // A rope rises from below the copy and splits into three strands. Left
    // of the box it runs along the bottom edge, below the copy beside it.
    case "strands": {
      const center = STRAND_CENTERS[k % STRAND_CENTERS.length];
      const rope =
        lerp(1.2, 0.5, smooth((a - 0.02) / 0.3)) + twist(0.03, 1.2, 0.6);
      const strand = center + twist(0.022, 1.6, 0.8);
      return lerp(rope, strand, smooth((a - 0.15) / 0.5));
    }
    // A low rope rises and fans out towards many destinations.
    case "fan": {
      // Left of the box the rope runs below it, clear of any copy beside it.
      const rope =
        lerp(1.25, 0.88, smooth((a + 0.1) / 0.25)) + twist(0.02, 1, 0.6);
      const end = -0.1 + 0.9 * r2;
      const g = Math.pow(smooth((a - 0.05) / 0.95), 1.4);
      return lerp(rope, end, g) + 0.015 * Math.sin(TAU * (a + r1) + 0.4 * t);
    }
    // A calm band through the middle of the box, used as a divider.
    case "horizon": {
      return (
        0.5 +
        (s - 0.5) * 0.5 +
        0.03 * Math.sin(TAU * (0.6 * a + r1) + 0.2 * t)
      );
    }
    // A rope runs in below the box, rises into a knot near its left edge
    // (level with the copy it points at), then opens out across the box.
    case "knot": {
      const knotA = 0.3;
      if (a <= knotA) {
        return lerp(1.4, 0.5, smooth((a - 0.06) / (knotA - 0.06)));
      }
      const end = -0.25 + 1.5 * s;
      return lerp(0.5, end, smooth((a - knotA) / 0.9));
    }
  }
};

/** Control-point density outside the box, relative to inside it */
const OUTSIDE_DENSITY = 0.5;

/**
 * Box-local x of control point i of `count`, running from leftA to rightA.
 * Points are twice as dense inside the box as outside it, so shapes get their
 * detail where the box is; neighbouring gaps never differ by more than 2x,
 * which keeps the Catmull-Rom tangents from overshooting into kinks.
 */
const controlA = (i: number, count: number, leftA: number, rightA: number) => {
  const left = -leftA * OUTSIDE_DENSITY;
  const right = (rightA - 1) * OUTSIDE_DENSITY;
  const w = (i / (count - 1)) * (left + 1 + right);
  if (w < left) return leftA + w / OUTSIDE_DENSITY;
  if (w <= left + 1) return w - left;
  return 1 + (w - left - 1) / OUTSIDE_DENSITY;
};

/**
 * Write thread k's control points for a shape scene into `out` (viewbox
 * space). The first and last control points sit just past the screen edges
 * (`edges` = viewbox x of the screen's left and right edge).
 */
export const writeScenePoints = (
  id: Exclude<SceneId, "free">,
  k: number,
  n: number,
  timeSec: number,
  box: SceneBox,
  edges: [number, number],
  out: Float32Array,
): void => {
  const [x0, y0, x1, y1] = box;
  const bw = Math.max(x1 - x0, 1e-4);
  const bh = y1 - y0;
  const margin = 0.08 * (edges[1] - edges[0]);
  const leftA = Math.min((edges[0] - margin - x0) / bw, -0.05);
  const rightA = Math.max((edges[1] + margin - x0) / bw, 1.05);

  for (let i = 0; i < SEGMENTS; i++) {
    const a = controlA(i, SEGMENTS, leftA, rightA);
    out[i * 2] = x0 + a * bw;
    out[i * 2 + 1] = y0 + sceneY(id, a, k, n, timeSec) * bh;
  }
};
