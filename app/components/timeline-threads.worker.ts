/**
 * Web Worker for TimelineThreads rendering
 * Runs physics simulation and Canvas 2D rendering off the main thread
 */

type Point = { x: number; y: number };

type PathProfile = {
  neutral: Point[];
  up: Point[];
  down: Point[];
};

type Direction = "up" | "down";

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
  nodes: MassPoint[];
  structRest: number[];
  bendRest: number[];
  pivotIndex: number;
  drawBuffer: Float32Array;
  color: { h: number; s: number; l: number };
  weight: number;
  opacityBase: number;
  currentDirection: Direction;
  transition: {
    fromPath: Point[];
    toPath: Point[];
    start: number;
    duration: number;
  };
  isTransitioning: boolean;
  settleStart: number;
  windSeedX: number;
  windSeedY: number;
  settleMs: number;
  anchorRampStartMs: number;
  anchorRampDurMs: number;
};

// 120fps optimized parameters
const THREAD_COUNT = 15;        // Reduced from 21 for better performance
const SEGMENTS = 20;             // Reduced from 28 for better performance
const DURATION_MS = 9000;
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

// Physics tuning for 120fps
const FIXED_DT = 1 / 120;        // Target 120fps physics
const MAX_SUBSTEPS = 2;          // Reduced from 4 to prevent spiral of death
const LINEAR_DAMP = 3.0;
const WIND_STRENGTH_X = 0.07;
const WIND_STRENGTH_Y = 0.05;
const GRAVITY_UP = -0.04;
const GRAVITY_DOWN = 0.10;
const STRUCT_STIFFNESS = 0.75;
const BEND_STIFFNESS = 0.28;
const CONSTRAINT_ITERS = 1;      // Reduced from 2 for performance
const ANCHOR_POS_ALPHA = 0.065;
const ANCHOR_K_PIVOT_BOOST = 1.35;
const ANCHOR_K_PREPIVOT = 1.4;
const ANCHOR_RAMP_BOOT = 1400;
const ANCHOR_RAMP_FLIP = 900;
const WIND_RAMP_MS = 1800;

const TARGET_FPS = 120;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;
const GLOW_ADJUST_COOLDOWN_MS = 8000;

// Math helpers
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

// Noise functions
const fract = (x: number) => x - Math.floor(x);
const prng2 = (x: number, y: number) => {
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
  return lerp(top, bot, v);
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
  return sum / ampSum;
};

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

const spawnThread = (id: number, now: number): Thread => {
  const direction: Direction = Math.random() < UP_FRACTION ? "up" : "down";
  const morphDuration = DURATION_MS + randomInRange(-1200, 1400);
  const pathProfile = createPathProfile(id);
  const pivotIndex = Math.round(PRESENT_X * (SEGMENTS - 1));
  const targetPath = direction === "up" ? pathProfile.up : pathProfile.down;

  const nodes: MassPoint[] = new Array(SEGMENTS);
  for (let i = 0; i < SEGMENTS; i++) {
    const p = pathProfile.neutral[i];
    const jitterX = randomInRange(-0.0015, 0.0015);
    const jitterY = randomInRange(-0.0015, 0.0015);
    nodes[i] = { x: p.x + jitterX, y: p.y + jitterY, px: p.x + jitterX, py: p.y + jitterY, ax: 0, ay: 0 };
  }

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
      start: now,
      duration: morphDuration,
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

const nodesToPoints = (nodes: MassPoint[]): Point[] => nodes.map(n => ({ x: n.x, y: n.y }));

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

// Worker state
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let threads: Thread[] = [];
let nextTransitionAt: number | null = null;
let lastTime: number | null = null;
let accumulator = 0;
let animationId: number | null = null;
let isRunning = false;

// Performance tracking
let perfSamples: { physics: number; render: number }[] = [];
let lastPerfLog = 0;
let glowEnabled = true;
let lastGlowAdjust = 0;

// Wind field cache - optimized for 120fps
const WIND_GRID_SIZE = 12;       // Reduced from 16 for fewer calculations
const WIND_UPDATE_INTERVAL = 5;  // Increased from 3 for better performance
const windField: { x: number[][]; y: number[][]; frame: number } = {
  x: Array(WIND_GRID_SIZE).fill(0).map(() => Array(WIND_GRID_SIZE).fill(0)),
  y: Array(WIND_GRID_SIZE).fill(0).map(() => Array(WIND_GRID_SIZE).fill(0)),
  frame: 0,
};

const updateWindField = (tSec: number, seedX: number, seedY: number) => {
  const scale = 1.6;

  for (let gy = 0; gy < WIND_GRID_SIZE; gy++) {
    for (let gx = 0; gx < WIND_GRID_SIZE; gx++) {
      const x = gx / (WIND_GRID_SIZE - 1);
      const y = gy / (WIND_GRID_SIZE - 1);

      const nx = fbm2(x * scale + seedX + tSec * 0.12, y * scale + seedY) - 0.5;
      const ny = fbm2(x * scale + seedY, y * scale + seedX + tSec * 0.12) - 0.5;

      windField.x[gy][gx] = nx * WIND_STRENGTH_X;
      windField.y[gy][gx] = ny * WIND_STRENGTH_Y;
    }
  }
};

const windVec = (x: number, y: number) => {
  const cx = clamp(x, 0, 1);
  const cy = clamp(y, 0, 1);

  const gx = cx * (WIND_GRID_SIZE - 1);
  const gy = cy * (WIND_GRID_SIZE - 1);

  const gxi = Math.floor(gx);
  const gyi = Math.floor(gy);
  const gxi1 = Math.min(gxi + 1, WIND_GRID_SIZE - 1);
  const gyi1 = Math.min(gyi + 1, WIND_GRID_SIZE - 1);

  const fx = gx - gxi;
  const fy = gy - gyi;

  // Bilinear interpolation
  const wx00 = windField.x[gyi][gxi];
  const wx10 = windField.x[gyi][gxi1];
  const wx01 = windField.x[gyi1][gxi];
  const wx11 = windField.x[gyi1][gxi1];

  const wy00 = windField.y[gyi][gxi];
  const wy10 = windField.y[gyi][gxi1];
  const wy01 = windField.y[gyi1][gxi];
  const wy11 = windField.y[gyi1][gxi1];

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

  const raw = clamp((nowMs - tr.start) / duration, 0, 1);
  const eased = thread.currentDirection === "up" ? slowFastSettle(raw) : easeInCubic(raw);

  const anchorRamp = clamp((nowMs - thread.anchorRampStartMs) / thread.anchorRampDurMs, 0, 1);
  const anchorGain = anchorRamp * anchorRamp;
  const windGain = smoothstep(clamp((nowMs - thread.anchorRampStartMs) / WIND_RAMP_MS, 0, 1));

  const anchorAt = (i: number) => {
    const A = tr.fromPath[i];
    const B = tr.toPath[i];
    const ax = lerp(A.x, B.x, eased);
    const ay = lerp(A.y, B.y, eased);
    const pivotIdx = thread.pivotIndex;
    const distToPivot = Math.abs(i - pivotIdx) / (SEGMENTS - 1);
    const wPivot = 1 + (1 - distToPivot) * (ANCHOR_K_PIVOT_BOOST - 1);
    const wPre = i <= pivotIdx ? ANCHOR_K_PREPIVOT : 1;
    return { ax, ay, w: wPivot * wPre };
  };

  for (let i = 0; i < SEGMENTS; i++) {
    const n = thread.nodes[i];
    const g = (thread.currentDirection === "down" ? GRAVITY_DOWN : GRAVITY_UP) * (0.6 * anchorGain);
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

  for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
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

    for (let i = 0; i < SEGMENTS; i++) {
      const n = thread.nodes[i];
      const anch = anchorAt(i);
      const alpha = ANCHOR_POS_ALPHA * anchorGain * anch.w;
      if (alpha > 0) {
        n.x += (anch.ax - n.x) * alpha;
        n.y += (anch.ay - n.y) * alpha;
      }
    }
  }

  for (let i = 0; i < SEGMENTS; i++) {
    const n = thread.nodes[i];
    n.x = clamp(n.x, X_START, X_END);
    n.y = clamp(n.y, 0, 1);
    if (n.x === X_START || n.x === X_END) n.px = n.x - (n.x - n.px) * 0.2;
    if (n.y === 0 || n.y === 1) n.py = n.y - (n.y - n.py) * 0.2;
  }

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
  thread.anchorRampStartMs = nowMs;
  thread.anchorRampDurMs = ANCHOR_RAMP_FLIP + randomInRange(-150, 150);
};

const triggerFlip = (nowMs: number) => {
  if (!threads.length) return;

  const preferRescue = Math.random() < 0.75;
  const choose = (from: Direction) => {
    const eligible = threads.filter((thread) =>
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

const render = (timestampMs: number) => {
  if (!isRunning || !canvas || !ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Update wind field cache periodically (including first frame)
  if (windField.frame === 0 || windField.frame % WIND_UPDATE_INTERVAL === 0) {
    const tSec = timestampMs / 1000;
    updateWindField(tSec, 0, 100);
  }
  windField.frame++;

  // Schedule state
  if (nextTransitionAt === null) {
    nextTransitionAt = timestampMs + 6000;
  } else {
    while (nextTransitionAt !== null && timestampMs >= nextTransitionAt) {
      triggerFlip(nextTransitionAt);
      nextTransitionAt += 6000;
    }
  }

  // Fixed-dt stepping
  const last = lastTime ?? timestampMs;
  let dt = (timestampMs - last) / 1000;
  lastTime = timestampMs;

  dt = Math.min(dt, 0.1);
  accumulator += dt;

  const physicsStart = performance.now();
  let steps = 0;
  while (accumulator >= FIXED_DT && steps < MAX_SUBSTEPS) {
    const tSec = (timestampMs - accumulator * 1000) / 1000;
    for (const thread of threads) simulateThread(thread, FIXED_DT, tSec);
    accumulator -= FIXED_DT;
    steps++;
  }
  const physicsTime = performance.now() - physicsStart;

  // Draw
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

  ctx.globalCompositeOperation = glowEnabled ? "lighter" : "source-over";

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];

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

  // Performance logging
  perfSamples.push({ physics: physicsTime, render: renderTime });
  if (timestampMs - lastPerfLog > 2000) {
    const samples = perfSamples;
    if (samples.length > 0) {
      const avgPhysics = samples.reduce((sum, s) => sum + s.physics, 0) / samples.length;
      const avgRender = samples.reduce((sum, s) => sum + s.render, 0) / samples.length;
      const avgTotal = avgPhysics + avgRender;
      const fps = 1000 / avgTotal;

      const needsDowngrade = avgTotal > TARGET_FRAME_MS * 0.85;
      const hasHeadroom = avgTotal < TARGET_FRAME_MS * 0.55;

      if (needsDowngrade && glowEnabled) {
        glowEnabled = false;
        lastGlowAdjust = timestampMs;
      } else if (
        hasHeadroom &&
        !glowEnabled &&
        timestampMs - lastGlowAdjust > GLOW_ADJUST_COOLDOWN_MS
      ) {
        glowEnabled = true;
        lastGlowAdjust = timestampMs;
      }

      let qualityHint: 'down' | 'up' | null = null;
      if (needsDowngrade) qualityHint = 'down';
      else if (hasHeadroom) qualityHint = 'up';

      postMessage({
        type: 'performance',
        data: { physics: avgPhysics, render: avgRender, total: avgTotal, fps, qualityHint },
      });
      perfSamples = [];
      lastPerfLog = timestampMs;
    }
  }

  if (isRunning) {
    animationId = requestAnimationFrame(render);
  }
};

// Message handler
self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;

  switch (type) {
    case 'init':
      canvas = data.canvas as OffscreenCanvas;
      if (typeof data.width === 'number' && canvas) {
        canvas.width = data.width;
      }
      if (typeof data.height === 'number' && canvas) {
        canvas.height = data.height;
      }
      ctx = canvas.getContext('2d');
      if (ctx) {
        const now = performance.now();
        threads = Array.from({ length: THREAD_COUNT }, (_, i) => spawnThread(i, now));
        nextTransitionAt = now + 6000;
        isRunning = true;
        animationId = requestAnimationFrame(render);
      }
      break;

    case 'resize':
      if (canvas) {
        canvas.width = data.width;
        canvas.height = data.height;
      }
      break;

    case 'stop':
      isRunning = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      break;

    default:
      break;
  }
};
