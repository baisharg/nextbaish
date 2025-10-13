"use client";

import { useEffect, useRef } from "react";

/**
 * Calmer/physical version:
 * - Same visual palette & path profiles.
 * - Paths become "anchors"; actual geometry is a rope simulated with Verlet integration.
 * - Fixed-timestep physics + constraints (structural + mild bending) keep motion smooth.
 * - Wind is a continuous 2D noise field; slight gravity bias by direction.
 * - Pivot ("present") node is stiffer to read as a hinge.
 */

type Point = { x: number; y: number };

type PathProfile = {
  neutral: Point[];
  up: Point[];
  down: Point[];
};

type Direction = "up" | "down";

// --- Physics point (avoid DOM's Node name) ---
type MassPoint = {
  x: number;
  y: number;
  px: number;
  py: number;
  ax: number;
  ay: number;
};

type Thread = {
  id: number;
  path: PathProfile;

  // Physics state
  nodes: MassPoint[];
  structRest: number[]; // rest length for (i,i+1)
  bendRest: number[];   // rest distance for (i,i+2)
  pivotIndex: number;
  drawBuffer: Float32Array;

  // Visuals
  color: { h: number; s: number; l: number };
  weight: number;
  opacityBase: number;

  // Logic/state
  currentDirection: Direction;
  transition: {
    fromPath: Point[];
    toPath: Point[];
    start: number;
    duration: number;
  };
  isTransitioning: boolean;
  settleStart: number;

  // Per-thread wind variation
  windSeedX: number;
  windSeedY: number;

  // Damping windows
  settleMs: number;

  // ramp-in for calm behavior
  anchorRampStartMs: number;
  anchorRampDurMs: number;
};

// 120fps optimized parameters
const THREAD_COUNT = 15;        // Reduced from 21 for better performance
const SEGMENTS = 20;             // Reduced from 28 for better performance

const TARGET_FPS = 120;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;
const DPR_MAX = 1.8;
const DPR_MIN = 1;
const DPR_STEP = 0.25;
const DPR_ADJUST_COOLDOWN_MS = 4000;
const GLOW_ADJUST_COOLDOWN_MS = 8000;
const PERF_EVENT_NAME = "timelineThreads:stats";

const DURATION_MS = 9000; // baseline morph duration (used at spawn)

const X_START = -0.18;
const X_END = 1.15;

const PRESENT_X = 0.42;
const PIVOT_Y = 0.54;
const UP_FRACTION = 0.22;

const COLOR_PALETTE = [
  { h: 259, s: 82, l: 72 },
  { h: 233, s: 86, l: 78 },
  { h: 304, s: 82, l: 74 },
];

// ---- math helpers ----
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const easeInCubic = (t: number) => t * t * t;
const slowFastSettle = (t: number) => {
  const clamped = clamp(t, 0, 1);
  const accelerate = Math.pow(clamped, 2.2);
  const decelerate = 1 - Math.pow(1 - clamped, 3.2);
  return clamp((accelerate + decelerate) / 2, 0, 1);
};
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// ---- tiny value-noise + fbm (deterministic wind) ----
const fract = (x: number) => x - Math.floor(x);
const prng2 = (x: number, y: number) => {
  // Deterministic pseudo-random in [0,1)
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return fract(s);
};
const valueNoise2D = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const tl = prng2(xi, yi);
  const tr = prng2(xi + 1, yi);
  const bl = prng2(xi, yi + 1);
  const br = prng2(xi + 1, yi + 1);

  const u = smoothstep(xf);
  const v = smoothstep(yf);

  const top = lerp(tl, tr, u);
  const bot = lerp(bl, br, u);
  return lerp(top, bot, v); // [0,1]
};
const fbm2 = (x: number, y: number, octaves = 3) => {
  let f = 1;
  let a = 0.5;
  let sum = 0;
  let ampSum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise2D(x * f, y * f) * a;
    ampSum += a;
    f *= 2.07;
    a *= 0.5;
  }
  return sum / ampSum; // [0,1]
};

// ---- path builder (kept from your version, with same aesthetics) ----
const createPathProfile = (index: number): PathProfile => {
  const baseY = clamp(
    0.22 + (index / (THREAD_COUNT - 1)) * 0.56 + randomInRange(-0.05, 0.05),
    0.08,
    0.92,
  );

  const downDepth = randomInRange(0.28, 0.40);
  const upRise = randomInRange(0.38, 0.68);

  const upCurve = randomInRange(0.35, 0.55);
  const flattenStrength = randomInRange(1.9, 2.7);
  const flattenThreshold = randomInRange(0.38, 0.55);

  const tangleFreq = randomInRange(3.8, 6.2);
  const tanglePhase = randomInRange(0, Math.PI * 2);
  const tangleAmplitude = randomInRange(0.018, 0.042);

  const lateralFreq = randomInRange(2.0, 3.4);
  const lateralPhase = randomInRange(0, Math.PI * 2);
  const lateralAmp = randomInRange(0.025, 0.055);

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
      clamp(0.55 + tightness * 0.85, 0.55, 1.4);
    const lateralShift =
      Math.sin(t * lateralFreq + lateralPhase) * lateralAmp * (0.8 + t * 0.9);

    if (i <= pivotIndex) {
      const preP = clamp(t / PRESENT_X, 0, 1);
      const converge = Math.pow(preP, 1.35);
      const sharedY = clamp(lerp(baseY, PIVOT_Y, converge) + noise * 0.85, 0.04, 0.96);
      const pt: Point = { x: xBase + lateralShift * 0.8, y: sharedY };
      neutral.push(pt);
      up.push(pt);
      down.push(pt);
      continue;
    }

    const postP = clamp((t - PRESENT_X) / (1 - PRESENT_X), 0, 1);

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

const chooseColor = () => {
  const base = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  return {
    h: base.h + randomInRange(-4, 4),
    s: clamp(base.s + randomInRange(-5, 5), 64, 96),
    l: clamp(base.l + randomInRange(-5, 5), 62, 90),
  };
};

// ---- physics tuning (normalized space) ----
const FIXED_DT = 1 / 120;          // Target 120fps physics
const MAX_SUBSTEPS = 2;            // Reduced from 4 to prevent spiral of death

const LINEAR_DAMP = 3.0;           // more damping = calmer
const WIND_STRENGTH_X = 0.07;      // milder wind
const WIND_STRENGTH_Y = 0.05;
const GRAVITY_UP = -0.04;          // gentler bias
const GRAVITY_DOWN = 0.10;

const STRUCT_STIFFNESS = 0.75;     // a touch softer
const BEND_STIFFNESS = 0.28;       // slightly smoother arcs
const CONSTRAINT_ITERS = 1;        // Reduced from 2 for 120fps performance

// Positional anchoring (percentage toward path per substep at full ramp)
const ANCHOR_POS_ALPHA = 0.065;
const ANCHOR_K_PIVOT_BOOST = 1.35; // keep pivot readable but not harsh
const ANCHOR_K_PREPIVOT = 1.4;     // stronger "shared past", softer than before

// Ramps (ms)
const ANCHOR_RAMP_BOOT = 1400;     // mount
const ANCHOR_RAMP_FLIP = 900;      // direction flip
const WIND_RAMP_MS = 1800;         // wind fades in separately

const spawnThread = (id: number, now: number): Thread => {
  const direction: Direction = Math.random() < UP_FRACTION ? "up" : "down";
  const morphDuration = DURATION_MS + randomInRange(-1200, 1400);

  const pathProfile = createPathProfile(id);
  const pivotIndex = Math.round(PRESENT_X * (SEGMENTS - 1));
  const targetPath = direction === "up" ? pathProfile.up : pathProfile.down;

  // Initialize physics nodes at the neutral path (plus tiny noise),
  // and prewarm "previous" positions for zero initial velocity.
  const nodes: MassPoint[] = new Array(SEGMENTS);
  for (let i = 0; i < SEGMENTS; i++) {
    const p = pathProfile.neutral[i];
    const jitterX = randomInRange(-0.0015, 0.0015);
    const jitterY = randomInRange(-0.0015, 0.0015);
    nodes[i] = { x: p.x + jitterX, y: p.y + jitterY, px: p.x + jitterX, py: p.y + jitterY, ax: 0, ay: 0 };
  }

  // Rest distances for constraints
  const structRest: number[] = new Array(SEGMENTS - 1);
  const bendRest: number[] = new Array(SEGMENTS - 2);
  for (let i = 0; i < SEGMENTS - 1; i++) {
    const a = pathProfile.neutral[i];
    const b = pathProfile.neutral[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    structRest[i] = Math.hypot(dx, dy);
  }
  for (let i = 0; i < SEGMENTS - 2; i++) {
    const a = pathProfile.neutral[i];
    const b = pathProfile.neutral[i + 2];
    bendRest[i] = Math.hypot(b.x - a.x, b.y - a.y);
  }

  return {
    id,
    path: pathProfile,
    nodes,
    structRest,
    bendRest,
    pivotIndex,
    drawBuffer: new Float32Array(SEGMENTS * 2),
    color: chooseColor(),
    weight: randomInRange(1.3, 2.0),
    opacityBase: clamp(0.26 + id / (THREAD_COUNT * 6), 0.30, 0.44),
    currentDirection: direction,
    transition: {
      fromPath: pathProfile.neutral,
      toPath: targetPath,
      start: now,                  // start morph now
      duration: morphDuration,     // let it actually ease
    },
    isTransitioning: false,
    settleStart: now,
    windSeedX: randomInRange(-1000, 1000),
    windSeedY: randomInRange(-1000, 1000),
    settleMs: direction === "up"
      ? 15000 + randomInRange(-2000, 2800)
      : 11000 + randomInRange(-2000, 2600),
    anchorRampStartMs: now,
    anchorRampDurMs: ANCHOR_RAMP_BOOT + randomInRange(-200, 200),
  };
};

// From current simulated nodes back to normalized Points[] (for retargeting logic)
const nodesToPoints = (nodes: MassPoint[]): Point[] => nodes.map(n => ({ x: n.x, y: n.y }));

// Generate a new physically plausible target path from a snapshot (kept from your approach)
const generateTargetPath = (currentPositions: Point[], direction: Direction): Point[] => {
  const targetPath: Point[] = [];
  const pivotIndex = Math.round(PRESENT_X * (SEGMENTS - 1));

  const upRise = randomInRange(0.38, 0.68);
  const downDepth = randomInRange(0.28, 0.40);
  const upCurve = randomInRange(0.35, 0.55);
  const flattenStrength = randomInRange(1.9, 2.7);
  const flattenThreshold = randomInRange(0.38, 0.55);

  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / (SEGMENTS - 1);

    if (i <= pivotIndex) {
      targetPath.push({ ...currentPositions[i] });
      continue;
    }

    const postP = clamp((t - PRESENT_X) / (1 - PRESENT_X), 0, 1);
    const pivotY = currentPositions[pivotIndex].y;
    const currentX = currentPositions[i].x;

    if (direction === "up") {
      const riseAmount = upRise * Math.pow(postP, upCurve);
      const targetY = clamp(pivotY - riseAmount, 0.02, 0.50);
      targetPath.push({ x: currentX, y: targetY });
    } else {
      const sinkProgress = clamp(postP / flattenThreshold, 0, 1);
      const sinkShape = Math.pow(sinkProgress, flattenStrength);
      const targetY = clamp(pivotY + downDepth * sinkShape, 0.06, 0.96);
      targetPath.push({ x: currentX, y: targetY });
    }
  }

  return targetPath;
};

type TimelineThreadsProps = { className?: string };

export default function TimelineThreads({ className }: TimelineThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threadsRef = useRef<Thread[]>([]);
  const animationIdRef = useRef<number | undefined>(undefined);
  const initializedRef = useRef(false);
  const nextTransitionAtRef = useRef<number | null>(null);

  // physics clock
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);

  // render scaling
  const maxDprRef = useRef(DPR_MAX);
  const effectiveDprRef = useRef(1);
  const lastDprAdjustRef = useRef(0);

  // visuals that can be downgraded under load
  const glowEnabledRef = useRef(true);
  const lastGlowAdjustRef = useRef(0);

  // performance monitoring
  const perfSamplesRef = useRef<{ physics: number; render: number }[]>([]);
  const lastPerfLogRef = useRef(0);

  // wind field cache (reduces expensive fbm2 calls) - optimized for 120fps
  const WIND_GRID_SIZE = 12;       // Reduced from 16 for fewer calculations
  const WIND_UPDATE_INTERVAL = 5;  // Increased from 3 for better performance
  const windFieldRef = useRef<{ x: number[][]; y: number[][]; frame: number }>({
    x: Array(WIND_GRID_SIZE).fill(0).map(() => Array(WIND_GRID_SIZE).fill(0)),
    y: Array(WIND_GRID_SIZE).fill(0).map(() => Array(WIND_GRID_SIZE).fill(0)),
    frame: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || typeof window === "undefined") return;

    maxDprRef.current = Math.min(DPR_MAX, window.devicePixelRatio || 1);

    const computeEffectiveDpr = () => {
      const rawDpr = window.devicePixelRatio || 1;
      const nextDpr = Math.min(rawDpr, maxDprRef.current);
      effectiveDprRef.current = nextDpr;
      return nextDpr;
    };

    const sizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = computeEffectiveDpr();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    sizeCanvas();

    if (!initializedRef.current) {
      const now = performance.now();
      threadsRef.current = Array.from({ length: THREAD_COUNT }, (_, i) => spawnThread(i, now));
      nextTransitionAtRef.current = now + 6000;
      initializedRef.current = true;
    }

    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => sizeCanvas())
      : null;
    ro?.observe(container);

    // --- wind field cache update ---
    const updateWindField = (tSec: number, seedX: number, seedY: number) => {
      const scale = 1.6;
      const field = windFieldRef.current;

      for (let gy = 0; gy < WIND_GRID_SIZE; gy++) {
        for (let gx = 0; gx < WIND_GRID_SIZE; gx++) {
          const x = gx / (WIND_GRID_SIZE - 1); // normalized [0, 1]
          const y = gy / (WIND_GRID_SIZE - 1);

          const nx = fbm2(x * scale + seedX + tSec * 0.12, y * scale + seedY) - 0.5;
          const ny = fbm2(x * scale + seedY, y * scale + seedX + tSec * 0.12) - 0.5;

          field.x[gy][gx] = nx * WIND_STRENGTH_X;
          field.y[gy][gx] = ny * WIND_STRENGTH_Y;
        }
      }
    };

    // --- cached wind lookup with bilinear interpolation ---
    const windVec = (x: number, y: number) => {
      const field = windFieldRef.current;

      // Clamp to [0, 1]
      const cx = clamp(x, 0, 1);
      const cy = clamp(y, 0, 1);

      // Map to grid coordinates
      const gx = cx * (WIND_GRID_SIZE - 1);
      const gy = cy * (WIND_GRID_SIZE - 1);

      const gxi = Math.floor(gx);
      const gyi = Math.floor(gy);
      const gxi1 = Math.min(gxi + 1, WIND_GRID_SIZE - 1);
      const gyi1 = Math.min(gyi + 1, WIND_GRID_SIZE - 1);

      const fx = gx - gxi;
      const fy = gy - gyi;

      // Bilinear interpolation
      const wx00 = field.x[gyi][gxi];
      const wx10 = field.x[gyi][gxi1];
      const wx01 = field.x[gyi1][gxi];
      const wx11 = field.x[gyi1][gxi1];

      const wy00 = field.y[gyi][gxi];
      const wy10 = field.y[gyi][gxi1];
      const wy01 = field.y[gyi1][gxi];
      const wy11 = field.y[gyi1][gxi1];

      const wx0 = lerp(wx00, wx10, fx);
      const wx1 = lerp(wx01, wx11, fx);
      const wx = lerp(wx0, wx1, fy);

      const wy0 = lerp(wy00, wy10, fx);
      const wy1 = lerp(wy01, wy11, fx);
      const wy = lerp(wy0, wy1, fy);

      return { x: wx, y: wy };
    };

    const simulateThread = (thread: Thread, dt: number, tSec: number) => {
      const tr = thread.transition;
      const duration = Math.max(tr.duration, 1);
      const nowMs = tSec * 1000;

      // Morph progress
      const raw = clamp((nowMs - tr.start) / duration, 0, 1);
      const eased = thread.currentDirection === "up" ? slowFastSettle(raw) : easeInCubic(raw);

      // Ramps
      const anchorRamp = clamp((nowMs - thread.anchorRampStartMs) / thread.anchorRampDurMs, 0, 1);
      const anchorGain = anchorRamp * anchorRamp; // quadratic ease-in
      const windGain = smoothstep(clamp((nowMs - thread.anchorRampStartMs) / WIND_RAMP_MS, 0, 1));

      // Compute current anchor target for a node + weights
      const anchorAt = (i: number) => {
        const A = tr.fromPath[i];
        const B = tr.toPath[i];
        const ax = lerp(A.x, B.x, eased);
        const ay = lerp(A.y, B.y, eased);

        const pivotIdx = thread.pivotIndex;
        const distToPivot = Math.abs(i - pivotIdx) / (SEGMENTS - 1); // 0 at pivot
        const wPivot = 1 + (1 - distToPivot) * (ANCHOR_K_PIVOT_BOOST - 1);
        const wPre = i <= pivotIdx ? ANCHOR_K_PREPIVOT : 1;
        return { ax, ay, w: wPivot * wPre };
      };

      // Integration with only mild, ramped forces (wind + tiny gravity bias)
      for (let i = 0; i < SEGMENTS; i++) {
        const n = thread.nodes[i];

        // Directional gravity ramps in (keeps initial frames serene)
        const g = (thread.currentDirection === "down" ? GRAVITY_DOWN : GRAVITY_UP) * (0.6 * anchorGain);

        // Wind field (from cache)
        const w = windVec(n.x, n.y);

        n.ax = w.x * windGain;
        n.ay = w.y * windGain + g;

        const vx = (n.x - n.px) * (1 - LINEAR_DAMP * dt);
        const vy = (n.y - n.py) * (1 - LINEAR_DAMP * dt);
        const nx = n.x + vx + n.ax * dt * dt;
        const ny = n.y + vy + n.ay * dt * dt;

        n.px = n.x; n.py = n.y;
        n.x = nx;   n.y = ny;
      }

      // Constraint satisfaction (structural + bending)
      for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
        // Structural
        for (let i = 0; i < SEGMENTS - 1; i++) {
          const a = thread.nodes[i];
          const b = thread.nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1e-6;
          const diff = (dist - thread.structRest[i]) / dist;
          const corr = 0.5 * STRUCT_STIFFNESS * diff;
          const cx = dx * corr, cy = dy * corr;
          a.x += cx; a.y += cy;
          b.x -= cx; b.y -= cy;
        }
        // Bending
        for (let i = 0; i < SEGMENTS - 2; i++) {
          const a = thread.nodes[i];
          const c = thread.nodes[i + 2];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.hypot(dx, dy) || 1e-6;
          const diff = (dist - thread.bendRest[i]) / dist;
          const corr = 0.5 * BEND_STIFFNESS * diff;
          const cx = dx * corr, cy = dy * corr;
          a.x += cx; a.y += cy;
          c.x -= cx; c.y -= cy;
        }

        // --- New: positional anchoring (zero-energy correction), with ramp & weights ---
        for (let i = 0; i < SEGMENTS; i++) {
          const n = thread.nodes[i];
          const anch = anchorAt(i);
          const alpha = ANCHOR_POS_ALPHA * anchorGain * anch.w; // ~ few % toward target
          if (alpha > 0) {
            n.x += (anch.ax - n.x) * alpha;
            n.y += (anch.ay - n.y) * alpha;
          }
        }
      }

      // Soft bounds
      for (let i = 0; i < SEGMENTS; i++) {
        const n = thread.nodes[i];
        n.x = clamp(n.x, X_START, X_END);
        n.y = clamp(n.y, 0, 1);
        if (n.x === X_START || n.x === X_END) n.px = n.x - (n.x - n.px) * 0.2;
        if (n.y === 0 || n.y === 1) n.py = n.y - (n.y - n.py) * 0.2;
      }

      // Morph completion
      if (thread.isTransitioning && raw >= 1) {
        thread.isTransitioning = false;
        thread.transition = {
          fromPath: tr.toPath,
          toPath: tr.toPath,
          start: nowMs,
          duration: 1,
        };
        thread.settleStart = nowMs;
      }
    };

    const retargetThread = (thread: Thread, nextDirection: Direction, nowMs: number) => {
      const snapshot = nodesToPoints(thread.nodes);
      const targetPath = generateTargetPath(snapshot, nextDirection);
      const duration = nextDirection === "up"
        ? randomInRange(5600, 8200)
        : randomInRange(4200, 6400);

      thread.transition = {
        fromPath: snapshot,
        toPath: targetPath,
        start: nowMs,
        duration,
      };
      thread.isTransitioning = true;
      thread.currentDirection = nextDirection;
      thread.settleStart = nowMs + duration;
      thread.settleMs = nextDirection === "up"
        ? 15000 + randomInRange(-2400, 3200)
        : 10000 + randomInRange(-2000, 2800);
      // Calm ramp for anchor + wind
      thread.anchorRampStartMs = nowMs;
      thread.anchorRampDurMs = ANCHOR_RAMP_FLIP + randomInRange(-150, 150);
    };

    const triggerFlip = (nowMs: number) => {
      if (!threadsRef.current.length) return;

      const preferRescue = Math.random() < 0.75;
      const choose = (from: Direction) => {
        const eligible = threadsRef.current.filter((thread) =>
          !thread.isTransitioning &&
          thread.currentDirection === from &&
          nowMs - thread.settleStart > 800,
        );
        if (!eligible.length) return null;
        return eligible[Math.floor(Math.random() * eligible.length)];
      };

      let target: Thread | null = preferRescue ? choose("down") : choose("up");
      if (!target) target = preferRescue ? choose("up") : choose("down");
      if (!target) return;

      const newDirection = target.currentDirection === "down" ? "up" : "down";
      retargetThread(target, newDirection, nowMs);
    };

    // ---- render loop with fixed-timestep physics ----
    const render = (timestampMs: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Update wind field cache periodically (including first frame)
      const field = windFieldRef.current;
      if (field.frame === 0 || field.frame % WIND_UPDATE_INTERVAL === 0) {
        const tSec = timestampMs / 1000;
        // Use a global seed for the wind field (individual thread variation comes from position)
        updateWindField(tSec, 0, 100);
      }
      field.frame++;

      // schedule state
      if (nextTransitionAtRef.current === null) {
        nextTransitionAtRef.current = timestampMs + 6000;
      } else {
        while (nextTransitionAtRef.current !== null && timestampMs >= nextTransitionAtRef.current) {
          triggerFlip(nextTransitionAtRef.current);
          nextTransitionAtRef.current += 6000;
        }
      }

      // fixed-dt stepping
      const last = lastTimeRef.current ?? timestampMs;
      let dt = (timestampMs - last) / 1000; // seconds
      lastTimeRef.current = timestampMs;

      // avoid spiral of death on tab refocus
      dt = Math.min(dt, 0.1);
      accumulatorRef.current += dt;

      const physicsStart = performance.now();
      let steps = 0;
      while (accumulatorRef.current >= FIXED_DT && steps < MAX_SUBSTEPS) {
        const tSec = (timestampMs - accumulatorRef.current * 1000) / 1000;
        for (const thread of threadsRef.current) simulateThread(thread, FIXED_DT, tSec);
        accumulatorRef.current -= FIXED_DT;
        steps++;
      }
      const physicsTime = performance.now() - physicsStart;

      // --- draw ---
      const renderStart = performance.now();
      ctx.clearRect(0, 0, width, height);

      // Present guideline
      const presentX = lerp(0, width, clamp(PRESENT_X, 0, 1));
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(presentX, 0);
      ctx.lineTo(presentX, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(30, 30, 60, 0.05)";
      ctx.stroke();
      ctx.restore();

      const glowEnabled = glowEnabledRef.current;
      ctx.globalCompositeOperation = glowEnabled ? "lighter" : "source-over";

      for (let i = 0; i < threadsRef.current.length; i++) {
        const thread = threadsRef.current[i];

        const buffer = thread.drawBuffer;
        for (let n = 0; n < thread.nodes.length; n++) {
          const base = n * 2;
          const node = thread.nodes[n];
          buffer[base] = node.x * width;
          buffer[base + 1] = node.y * height;
        }

        const opacity = thread.opacityBase;

        ctx.beginPath();
        ctx.moveTo(buffer[0], buffer[1]);
        for (let p = 1; p < thread.nodes.length - 2; p++) {
          const current = p * 2;
          const next = (p + 1) * 2;
          const xc = (buffer[current] + buffer[next]) / 2;
          const yc = (buffer[current + 1] + buffer[next + 1]) / 2;
          ctx.quadraticCurveTo(buffer[current], buffer[current + 1], xc, yc);
        }
        const penultimateIndex = (thread.nodes.length - 2) * 2;
        const lastIndex = (thread.nodes.length - 1) * 2;
        ctx.quadraticCurveTo(
          buffer[penultimateIndex],
          buffer[penultimateIndex + 1],
          buffer[lastIndex],
          buffer[lastIndex + 1],
        );

        ctx.lineWidth = thread.weight * 1.05;
        ctx.lineCap = "round";
        ctx.strokeStyle = `hsla(${thread.color.h}, ${thread.color.s}%, ${thread.color.l}%, ${opacity.toFixed(3)})`;
        if (glowEnabled) {
          ctx.shadowBlur = 1;
          ctx.shadowColor = `hsla(${thread.color.h}, ${thread.color.s}%, ${clamp(thread.color.l + 10, 74, 98)}%, ${(opacity * 0.25).toFixed(3)})`;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        if (glowEnabled) {
          ctx.shadowBlur = 0;
        }
      }
      const renderTime = performance.now() - renderStart;

      // Performance logging (every 2 seconds)
      perfSamplesRef.current.push({ physics: physicsTime, render: renderTime });
      if (timestampMs - lastPerfLogRef.current > 2000) {
        const samples = perfSamplesRef.current;
        if (samples.length > 0) {
          const avgPhysics = samples.reduce((sum, s) => sum + s.physics, 0) / samples.length;
          const avgRender = samples.reduce((sum, s) => sum + s.render, 0) / samples.length;
          const avgTotal = avgPhysics + avgRender;
          const fps = 1000 / avgTotal;
          console.log(`[TimelineThreads] Physics: ${avgPhysics.toFixed(2)}ms | Render: ${avgRender.toFixed(2)}ms | Total: ${avgTotal.toFixed(2)}ms | FPS: ${fps.toFixed(1)}`);

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(PERF_EVENT_NAME, {
                detail: {
                  avgPhysics,
                  avgRender,
                  avgTotal,
                  fps,
                },
              }),
            );
          }

          const needsDowngrade = avgTotal > TARGET_FRAME_MS * 0.85;
          const hasHeadroom = avgTotal < TARGET_FRAME_MS * 0.55;

          if (needsDowngrade) {
            if (
              maxDprRef.current > DPR_MIN + 1e-2 &&
              timestampMs - lastDprAdjustRef.current > DPR_ADJUST_COOLDOWN_MS
            ) {
              maxDprRef.current = Math.max(DPR_MIN, maxDprRef.current - DPR_STEP);
              lastDprAdjustRef.current = timestampMs;
              sizeCanvas();
            }

            if (glowEnabledRef.current) {
              glowEnabledRef.current = false;
              lastGlowAdjustRef.current = timestampMs;
            }
          } else if (hasHeadroom) {
            if (
              !glowEnabledRef.current &&
              timestampMs - lastGlowAdjustRef.current > GLOW_ADJUST_COOLDOWN_MS
            ) {
              glowEnabledRef.current = true;
              lastGlowAdjustRef.current = timestampMs;
            }

            if (
              maxDprRef.current < DPR_MAX - 1e-2 &&
              timestampMs - lastDprAdjustRef.current > GLOW_ADJUST_COOLDOWN_MS
            ) {
              maxDprRef.current = Math.min(DPR_MAX, maxDprRef.current + DPR_STEP);
              lastDprAdjustRef.current = timestampMs;
              sizeCanvas();
            }
          }

          perfSamplesRef.current = [];
          lastPerfLogRef.current = timestampMs;
        }
      }

      animationIdRef.current = requestAnimationFrame(render);
    };

    animationIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      ro?.disconnect();
      nextTransitionAtRef.current = null;
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none animate-fade-in ${className ?? "absolute inset-0"}`}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          willChange: 'contents',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}
