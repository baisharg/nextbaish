/**
 * WebGPU Renderer (vgpu) - GPU-side geometry with dual-level bloom
 *
 * Preferred renderer when WebGPU is available; WebGLRenderer remains the
 * fallback. Consumes the same FramePacket contract, but moves all bezier
 * tessellation and ribbon extrusion into the vertex shader: the CPU uploads
 * only the raw animated control points instead of tessellated triangles.
 *
 * Upgrades over the WebGL path:
 * - Analytic edge anti-aliasing on thread ribbons (feathered via fwidth)
 * - Dual-level bloom (half-res + quarter-res Gaussian) for a deeper glow
 * - Subtle shimmer flowing along each thread
 *
 * Kept identical to the WebGL path so the swap is invisible elsewhere:
 * coordinate mapping (square viewbox anisotropically mapped to the canvas),
 * per-thread gradient stops + bottom shading, overlay screen blend, and the
 * straight-alpha compositing math (converted to premultiplied only at the
 * final canvas write, since WebGPU surfaces don't support straight alpha).
 * The shared visual constants and helpers live in thread-utils.ts.
 */

import type {
  Renderer,
  RendererConfig,
  FramePacket,
  ColorStop,
} from "../types/renderer";
import {
  BEZIER_CONTROL_FACTOR,
  SEGMENTS_PER_CURVE,
  THREAD_WIDTH_SCALE,
  MAX_GRADIENT_STOPS,
  DEFAULT_OFFSET_X_MULTIPLIER,
  DEFAULT_OFFSET_Y_MULTIPLIER,
  PULSE_WIDTH,
  GRAIN_AMPLITUDE,
  hslToRgb,
  computeLinearGaussianWeights,
} from "../utils/thread-utils";
import {
  init,
  effect,
  surface,
  target,
  draw,
  frame,
  sampler,
  Uniform,
  type Gpu,
  type Surface,
  type Target,
  type Effect,
  type Draw,
} from "vgpu";

type LinearSampler = ReturnType<typeof sampler>;

// Uniform-buffer size guard: WebGPU guarantees 64KB uniform bindings and each
// thread's metadata is 112 bytes, so 256 threads stays well under the limit.
const MAX_THREADS = 256;
const SHIMMER_AMPLITUDE = 0.08;
// Split of the WebGL path's single 0.8 glow across two blur scales.
const GLOW_WEIGHT_HALF = 0.6;
const GLOW_WEIGHT_QUARTER = 0.4;

// Floats per ThreadMeta struct: stop vec4s + info0 + info1
const META_FLOATS = (MAX_GRADIENT_STOPS + 2) * 4;

const TRANSPARENT = [0, 0, 0, 0] as [number, number, number, number];

// ============================================================================
// WGSL SHADERS
// ============================================================================

/**
 * Gradient walk + bottom shading shared by the thread and composite shaders —
 * the single WGSL source of the math that keeps thread and overlay colors in
 * lockstep (and matching the WebGL fragment shader).
 */
const GRADIENT_WGSL = /* wgsl */ `
fn gradientColor(stops: array<vec4f, ${MAX_GRADIENT_STOPS}>, count: u32, g: f32) -> vec3f {
  var color = stops[0].rgb;
  for (var i = 1u; i < count; i++) {
    let sa = stops[i - 1u];
    let sb = stops[i];
    let tt = clamp((g - sa.w) / max(sb.w - sa.w, 1e-5), 0.0, 1.0);
    color = select(color, mix(sa.rgb, sb.rgb, tt), g >= sa.w);
  }
  return color;
}

fn bottomShade(color: vec3f, g: f32) -> vec3f {
  return mix(color, vec3f(0.0), smoothstep(0.93, 1.0, g) * 0.35);
}
`;

/**
 * Instanced thread ribbons. One instance per curve sub-segment quad; the
 * vertex stage evaluates the same cubic bezier the WebGL renderer tessellated
 * on the CPU (control points derived from polyline neighbors with
 * BEZIER_CONTROL_FACTOR) and extrudes the ribbon by the chord normal.
 */
const threadShader = (pointsPerThread: number, threadCount: number) => {
  const quadsPerThread = (pointsPerThread - 1) * SEGMENTS_PER_CURVE;
  const pointsVec4 = Math.ceil((threadCount * pointsPerThread * 2) / 4);
  return /* wgsl */ `
struct Globals {
  g0: vec4f, // squareScale, offsetX, offsetY, timeSec
}
struct PointsBuf { data: array<vec4f, ${pointsVec4}> }
struct ThreadMeta {
  stops: array<vec4f, ${MAX_GRADIENT_STOPS}>, // rgb, yPct
  info0: vec4f, // halfWidthPx, opacity, adjustedMinY, yRangeInv
  info1: vec4f, // stopCount, shimmerPhase, pulsePos, pulseIntensity
}
struct MetaBuf { threads: array<ThreadMeta, ${threadCount}> }

@group(0) @binding(0) var<uniform> globals: Globals;
@group(0) @binding(1) var<uniform> points: PointsBuf;
@group(0) @binding(2) var<uniform> threadMeta: MetaBuf;

const N: u32 = ${pointsPerThread}u;
const SUB: u32 = ${SEGMENTS_PER_CURVE}u;
const QUADS: u32 = ${quadsPerThread}u;
const BEZ_F: f32 = ${BEZIER_CONTROL_FACTOR};
const SHIMMER_AMP: f32 = ${SHIMMER_AMPLITUDE};
const PULSE_W: f32 = ${PULSE_WIDTH};

fn threadPoint(t: u32, i: u32) -> vec2f {
  let flat = t * N + i;
  let v = points.data[flat >> 1u];
  return select(v.zw, v.xy, (flat & 1u) == 0u);
}

fn bez(p0: vec2f, c1: vec2f, c2: vec2f, p1: vec2f, u: f32) -> vec2f {
  let w = 1.0 - u;
  return w * w * w * p0 + 3.0 * w * w * u * c1 + 3.0 * w * u * u * c2 + u * u * u * p1;
}

struct VSOut {
  @builtin(position) position: vec4f,
  @location(0) grad: f32,
  @location(1) edge: f32,
  @location(2) lengthPos: f32,
  @location(3) @interpolate(flat) tid: u32,
}

@vertex fn vs_main(@builtin(vertex_index) vi: u32, @builtin(instance_index) inst: u32) -> VSOut {
  let t = inst / QUADS;
  let q = inst % QUADS;
  let s = q / SUB;
  let j = q % SUB;

  let m = threadMeta.threads[t];
  let scale = globals.g0.x;
  let off = globals.g0.yz;

  // Normalized polyline points; neighbors clamped like the CPU tessellator.
  let pn0 = threadPoint(t, s);
  let pn1 = threadPoint(t, s + 1u);
  let im = select(s - 1u, 0u, s == 0u);
  let pnm = threadPoint(t, im);
  let pnp = threadPoint(t, min(s + 2u, N - 1u));

  // To pixel space (same affine map as the WebGL path).
  let p0 = pn0 * scale + off;
  let p1 = pn1 * scale + off;
  let pm = pnm * scale + off;
  let pp = pnp * scale + off;

  let c1 = p0 + (p1 - pm) * BEZ_F;
  let c2 = p1 - (pp - p0) * BEZ_F;

  let u0 = f32(j) / f32(SUB);
  let u1 = f32(j + 1u) / f32(SUB);
  let a = bez(p0, c1, c2, p1, u0);
  let b = bez(p0, c1, c2, p1, u1);

  let d = b - a;
  let len = length(d);
  let halfWidth = m.info0.x;
  var n = vec2f(0.0);
  if (len > 0.0) {
    n = vec2f(-d.y, d.x) / len * halfWidth;
  }

  // Gradient position interpolates the polyline's normalized Y, offset by the
  // ribbon normal, then maps through the thread's adjusted gradient bounds.
  let ny0 = mix(pn0.y, pn1.y, u0);
  let ny1 = mix(pn0.y, pn1.y, u1);
  let nyNorm = n.y / scale;

  // Quad corners: (a+n, a-n, b+n), (a-n, b-n, b+n)
  let isB = vi == 2u || vi == 4u || vi == 5u;
  let isPlus = vi == 0u || vi == 2u || vi == 5u;
  let sgn = select(-1.0, 1.0, isPlus);
  let pos = select(a, b, isB) + n * sgn;
  let ny = select(ny0, ny1, isB);
  let uu = select(u0, u1, isB);

  var out: VSOut;
  let clip = pos / scale * 2.0 - 1.0;
  out.position = vec4f(clip.x, -clip.y, 0.0, 1.0);
  out.grad = clamp((ny + nyNorm * sgn - m.info0.z) * m.info0.w, 0.0, 1.0);
  out.edge = sgn;
  out.lengthPos = (f32(s) + uu) / f32(N - 1u);
  out.tid = t;
  return out;
}

${GRADIENT_WGSL}

@fragment fn fs_main(in: VSOut) -> @location(0) vec4f {
  let m = threadMeta.threads[in.tid];
  var color = gradientColor(m.stops, u32(m.info1.x), in.grad);
  color = bottomShade(color, in.grad);

  // Gentle energy shimmer traveling along the thread.
  let shimmer = 1.0 + SHIMMER_AMP * sin(in.lengthPos * 9.0 - globals.g0.w * 1.6 + m.info1.y);
  color *= shimmer;

  // Flip pulse: a brief highlight traveling the thread after a direction flip.
  let pd = (in.lengthPos - m.info1.z) / PULSE_W;
  color *= 1.0 + m.info1.w * exp(-pd * pd);

  // Feathered ribbon edges: a half-pixel coverage ramp in screen space.
  // (1 - |edge|) / fwidth(edge) is the distance to the ribbon edge in pixels;
  // a smoothstep over the whole fwidth would attenuate most of a ribbon that
  // is only 1-2 device pixels tall (DPR 1 after the anisotropic squish) and
  // read as a dotted line as it drifts across pixel rows.
  let fw = max(fwidth(in.edge), 1e-4);
  let edgeAlpha = clamp((1.0 - abs(in.edge)) / fw + 0.5, 0.0, 1.0);

  return vec4f(color, m.info0.y * edgeAlpha);
}
`;
};

const DOWNSAMPLE_SHADER = /* wgsl */ `
@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  return textureSampleLevel(src, samp, uv, 0.0);
}
`;

// 5-tap separable Gaussian with linear-filtering optimization (same weights
// and texel offsets as the WebGL blur).
const BLUR_SHADER = /* wgsl */ `
struct Params {
  texel: vec2f,
  dir: vec2f,
  w: vec4f, // center, pair1, pair2, unused
  o: vec4f, // offset1, offset2, unused, unused
}
@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let d = params.dir * params.texel;
  var c = textureSampleLevel(src, samp, uv, 0.0) * params.w.x;
  c += textureSampleLevel(src, samp, uv + d * params.o.x, 0.0) * params.w.y;
  c += textureSampleLevel(src, samp, uv - d * params.o.x, 0.0) * params.w.y;
  c += textureSampleLevel(src, samp, uv + d * params.o.y, 0.0) * params.w.z;
  c += textureSampleLevel(src, samp, uv - d * params.o.y, 0.0) * params.w.z;
  return c;
}
`;

/**
 * Final composite: scene + two bloom levels, overlay gradient screen-blended
 * on top (full-strength RGB, frame.overlayOpacity alpha — exactly the WebGL
 * overlay pass), then converted to premultiplied alpha for the WebGPU canvas.
 */
const COMPOSITE_SHADER = /* wgsl */ `
struct OvBuf {
  stops: array<vec4f, ${MAX_GRADIENT_STOPS}>, // rgb, yPct
  p0: vec4f, // stopCount, glowWeightHalf, glowWeightQuarter, overlayAlpha
}
@group(0) @binding(0) var sceneTex: texture_2d<f32>;
@group(0) @binding(1) var glowHalf: texture_2d<f32>;
@group(0) @binding(2) var glowQuarter: texture_2d<f32>;
@group(0) @binding(3) var samp: sampler;
@group(0) @binding(4) var<uniform> ov: OvBuf;

${GRADIENT_WGSL}

@fragment fn fs_main(@location(0) uv: vec2f, @builtin(position) fragPos: vec4f) -> @location(0) vec4f {
  let scene = textureSampleLevel(sceneTex, samp, uv, 0.0);
  let g1 = textureSampleLevel(glowHalf, samp, uv, 0.0);
  let g2 = textureSampleLevel(glowQuarter, samp, uv, 0.0);

  var col = scene.rgb + g1.rgb * ov.p0.y + g2.rgb * ov.p0.z;
  col = min(col, vec3f(1.0));

  // Overlay gradient by screen Y, with the same bottom shading.
  var ovColor = gradientColor(ov.stops, u32(ov.p0.x), uv.y);
  ovColor = bottomShade(ovColor, uv.y);

  // Screen blend, then straight->premultiplied for canvas compositing.
  let outRgb = ovColor + col * (1.0 - ovColor);
  let overlayAlpha = ov.p0.w;
  let outA = overlayAlpha + scene.a * (1.0 - overlayAlpha);

  // Interleaved gradient noise dither: debands the glow gradients and adds
  // the faintest paper grain (same formula as the WebGL composite).
  let n = fract(52.9829189 * fract(0.06711056 * fragPos.x + 0.00583715 * fragPos.y));
  let dithered = clamp(outRgb * outA + vec3f((n - 0.5) * ${GRAIN_AMPLITUDE}), vec3f(0.0), vec3f(1.0));
  return vec4f(dithered, outA);
}
`;

// ============================================================================
// CPU-SIDE HELPERS
// ============================================================================

/** Packs color stops as vec4 (rgb, yPct), clamping to the last stop. */
function packStops(dst: Float32Array, base: number, stops: ColorStop[]): number {
  const count = Math.min(stops.length, MAX_GRADIENT_STOPS);
  const lastIndex = count - 1;
  for (let k = 0; k < MAX_GRADIENT_STOPS; k++) {
    const stop = stops[k <= lastIndex ? k : lastIndex];
    const [r, g, b] = hslToRgb(stop.hsl[0], stop.hsl[1], stop.hsl[2]);
    const o = base + k * 4;
    dst[o] = r;
    dst[o + 1] = g;
    dst[o + 2] = b;
    dst[o + 3] = stop.yPct;
  }
  return count;
}

type BloomResources = {
  halfA: Target;
  halfB: Target;
  quarterA: Target;
  quarterB: Target;
  downHalf: Effect;
  downQuarter: Effect;
  blurHHalf: Effect;
  blurVHalf: Effect;
  blurHQuarter: Effect;
  blurVQuarter: Effect;
};

// ============================================================================
// RENDERER
// ============================================================================

export class VgpuRenderer implements Renderer {
  private gpu: Gpu | null = null;
  private canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  private config: RendererConfig | null = null;
  private canvasSurface: Surface | null = null;
  private sceneTarget: Target | null = null;
  private bloom: BloomResources | null = null;
  private composite: Effect | null = null;
  private linearSampler: LinearSampler | null = null;

  // Rebuilt when the frame geometry (points per thread, thread count) changes
  private threadsDraw: Draw | null = null;
  private builtPointsPerThread = 0;
  private builtThreadCount = 0;

  private globalsUniform: Uniform | null = null;
  private pointsUniform: Uniform | null = null;
  private metaUniform: Uniform | null = null;
  private overlayUniform: Uniform | null = null;

  private globalsScratch = new Float32Array(4);
  private pointsScratch = new Float32Array(0);
  private metaScratch = new Float32Array(0);
  private overlayScratch = new Float32Array(MAX_GRADIENT_STOPS * 4 + 4);

  // Thread metadata changes only on direction flips (colorStops identity) and
  // config changes; the overlay gradient is a stable reference. Cache both so
  // clean frames upload just points + globals.
  private threadStopsCache: (ColorStop[] | null)[] = [];
  private metaDirty = true;
  private lastOverlayGradient: ColorStop[] | null = null;
  private lastOverlayOpacity = -1;
  private overlayDirty = true;

  private squareScale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private broken = false;
  private warnedThreadOverflow = false;

  async init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    config: RendererConfig,
  ): Promise<void> {
    // Device first: if WebGPU is unavailable this throws before the canvas is
    // touched, leaving it free for the WebGL fallback to claim a context.
    const gpu = await init({ powerPreference: "high-performance" });
    this.gpu = gpu;
    this.canvas = canvas;
    this.config = config;

    gpu.device.gpu.lost.then((info: { message?: string }) => {
      if (!this.broken) {
        console.warn("[Timeline] WebGPU device lost:", info.message);
        this.broken = true;
      }
    });

    this.updateGeometryMapping();

    this.canvasSurface = surface(gpu, canvas, {
      alphaMode: "premultiplied",
      autoResize: false,
    });

    const w = Math.max(1, canvas.width);
    const h = Math.max(1, canvas.height);
    // 4x MSAA on the sharp scene: ribbons can be under 2 device pixels tall
    // at DPR 1, where center-sampled rasterization alone leaves gaps. The
    // WebGL fallback gets the same from its antialias:true canvas.
    this.sceneTarget = target(gpu, {
      size: [w, h],
      format: "rgba8unorm",
      msaa: true,
    });

    this.linearSampler = sampler(gpu, {
      minFilter: "linear",
      magFilter: "linear",
    });

    this.globalsUniform = new Uniform(gpu.device, {
      size: this.globalsScratch.byteLength,
      label: "thread-globals",
    });
    this.overlayUniform = new Uniform(gpu.device, {
      size: this.overlayScratch.byteLength,
      label: "overlay-params",
    });

    if (config.enableBlur) {
      this.setupBloom();
    }

    this.composite = effect(gpu, COMPOSITE_SHADER);
    this.bindComposite();
  }

  /** Same square-viewbox mapping as WebGLRenderer.updateCanvasSize. */
  private updateGeometryMapping(): void {
    if (!this.canvas || !this.config) return;
    this.squareScale = Math.max(this.canvas.width, this.canvas.height, 1);
    const offsetXMultiplier =
      this.config.offsetXMultiplier ?? DEFAULT_OFFSET_X_MULTIPLIER;
    const offsetYMultiplier =
      this.config.offsetYMultiplier ?? DEFAULT_OFFSET_Y_MULTIPLIER;
    this.offsetX = (this.canvas.width - this.squareScale) * offsetXMultiplier;
    this.offsetY = (this.canvas.height - this.squareScale) * offsetYMultiplier;
    this.metaDirty = true; // thread meta bakes in squareScale-derived bounds
  }

  private setupBloom(): void {
    if (!this.gpu || !this.canvas || !this.config || this.bloom) return;
    const gpu = this.gpu;
    const w = Math.max(1, this.canvas.width);
    const h = Math.max(1, this.canvas.height);
    const half = [Math.max(1, Math.floor(w / 2)), Math.max(1, Math.floor(h / 2))] as [number, number];
    const quarter = [Math.max(1, Math.floor(w / 4)), Math.max(1, Math.floor(h / 4))] as [number, number];

    const halfA = target(gpu, { size: half, format: "rgba8unorm" });
    const quarterA = target(gpu, { size: quarter, format: "rgba8unorm" });
    this.bloom = {
      halfA,
      halfB: target(gpu, { size: half, format: "rgba8unorm" }),
      quarterA,
      quarterB: target(gpu, { size: quarter, format: "rgba8unorm" }),
      downHalf: effect(gpu, DOWNSAMPLE_SHADER, {
        set: { src: this.sceneTarget, samp: this.linearSampler },
      }),
      downQuarter: effect(gpu, DOWNSAMPLE_SHADER, {
        set: { src: halfA, samp: this.linearSampler },
      }),
      blurHHalf: effect(gpu, BLUR_SHADER),
      blurVHalf: effect(gpu, BLUR_SHADER),
      blurHQuarter: effect(gpu, BLUR_SHADER),
      blurVQuarter: effect(gpu, BLUR_SHADER),
    };
    this.applyBlurParams();
    this.overlayDirty = true; // glow weights depend on bloom availability
  }

  /** Bakes direction + weights into each blur effect (no per-frame sets). */
  private applyBlurParams(): void {
    const b = this.bloom;
    if (!this.config || !b) return;
    const { weights, offsets } = computeLinearGaussianWeights(
      this.config.blurStdDeviation,
    );
    const w = [weights[0], weights[1], weights[2], 0];
    const o = [offsets[0], offsets[1], 0, 0];

    const bind = (
      fx: Effect,
      src: Target,
      size: readonly [number, number],
      dir: [number, number],
    ) => {
      fx.set({
        src,
        samp: this.linearSampler,
        params: { texel: [1 / size[0], 1 / size[1]], dir, w, o },
      });
    };

    bind(b.blurHHalf, b.halfA, b.halfA.size, [1, 0]);
    bind(b.blurVHalf, b.halfB, b.halfA.size, [0, 1]);
    bind(b.blurHQuarter, b.quarterA, b.quarterA.size, [1, 0]);
    bind(b.blurVQuarter, b.quarterB, b.quarterA.size, [0, 1]);
  }

  private bindComposite(): void {
    if (!this.composite || !this.sceneTarget) return;
    // Without bloom the glow slots are bound to the scene with zero weights.
    this.composite.set({
      sceneTex: this.sceneTarget,
      glowHalf: this.bloom?.halfA ?? this.sceneTarget,
      glowQuarter: this.bloom?.quarterA ?? this.sceneTarget,
      samp: this.linearSampler,
      ov: this.overlayUniform,
    });
  }

  /**
   * (Re)creates the threads draw, scratch buffers, and per-thread uniforms,
   * all sized to the actual frame geometry.
   */
  private ensureThreadsDraw(pointsPerThread: number, threadCount: number): void {
    if (!this.gpu) return;
    if (
      this.threadsDraw &&
      this.builtPointsPerThread === pointsPerThread &&
      this.builtThreadCount === threadCount
    ) {
      return;
    }
    this.builtPointsPerThread = pointsPerThread;
    this.builtThreadCount = threadCount;

    const pointsFloats = Math.ceil((threadCount * pointsPerThread * 2) / 4) * 4;
    this.pointsScratch = new Float32Array(pointsFloats);
    this.metaScratch = new Float32Array(threadCount * META_FLOATS);
    this.threadStopsCache = new Array(threadCount).fill(null);
    this.metaDirty = true;

    this.pointsUniform?.dispose();
    this.pointsUniform = new Uniform(this.gpu.device, {
      size: this.pointsScratch.byteLength,
      label: "thread-points",
    });
    this.metaUniform?.dispose();
    this.metaUniform = new Uniform(this.gpu.device, {
      size: this.metaScratch.byteLength,
      label: "thread-meta",
    });

    (this.threadsDraw as { dispose?: () => void } | null)?.dispose?.();
    this.threadsDraw = draw(this.gpu, {
      shader: threadShader(pointsPerThread, threadCount),
      vertices: 6,
      instances: threadCount * (pointsPerThread - 1) * SEGMENTS_PER_CURVE,
      // Explicit straight-alpha blend on both channels, matching the WebGL
      // path's blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA) so accumulated
      // target alpha stays identical.
      blend: {
        color: { src: "src-alpha", dst: "one-minus-src-alpha" },
        alpha: { src: "src-alpha", dst: "one-minus-src-alpha" },
      },
      set: {
        globals: this.globalsUniform,
        points: this.pointsUniform,
        threadMeta: this.metaUniform,
      },
      label: "threads",
    });
  }

  /**
   * Copies points (every frame) and thread metadata (only for threads whose
   * colorStops identity changed, i.e. direction flips, or after a config
   * change). Returns whether the meta buffer needs re-uploading.
   */
  private writeFrameData(framePacket: FramePacket, threadCount: number): boolean {
    if (!this.config) return false;
    const { dpr } = this.config;
    const pointsPerThread = this.builtPointsPerThread;
    const meta = this.metaScratch;
    let metaChanged = false;

    for (let t = 0; t < threadCount; t++) {
      const thread = framePacket.threads[t];
      this.pointsScratch.set(thread.points, t * pointsPerThread * 2);

      const base = t * META_FLOATS;
      const i0 = base + MAX_GRADIENT_STOPS * 4;

      const halfWidth = (thread.width * dpr * THREAD_WIDTH_SCALE) / 2;
      const gradientMargin = halfWidth / this.squareScale;
      const adjustedMinY = thread.gradientMinY - gradientMargin;
      const adjustedMaxY = thread.gradientMaxY + gradientMargin;
      const yRange = adjustedMaxY - adjustedMinY;

      // Skip untouched threads: same gradient stops, opacity and gradient
      // span, and no pulse now (meta[i0 + 7] holds the last written pulse
      // intensity). meta is float32, so compare against rounded values.
      if (
        !this.metaDirty &&
        this.threadStopsCache[t] === thread.colorStops &&
        meta[i0 + 1] === Math.fround(thread.opacity) &&
        meta[i0 + 2] === Math.fround(adjustedMinY) &&
        thread.pulseIntensity === 0 &&
        meta[i0 + 7] === 0
      ) {
        continue;
      }
      this.threadStopsCache[t] = thread.colorStops;
      metaChanged = true;

      const stopCount = packStops(meta, base, thread.colorStops);

      meta[i0] = halfWidth;
      meta[i0 + 1] = thread.opacity;
      meta[i0 + 2] = adjustedMinY;
      meta[i0 + 3] = yRange > 0 ? 1 / yRange : 0;
      meta[i0 + 4] = stopCount;
      meta[i0 + 5] = t * 2.3999632; // golden-angle shimmer phase
      meta[i0 + 6] = thread.pulsePos;
      meta[i0 + 7] = thread.pulseIntensity;
    }

    this.metaDirty = false;
    return metaChanged;
  }

  draw(framePacket: FramePacket): void {
    if (
      this.broken ||
      !this.gpu ||
      !this.config ||
      !this.canvasSurface ||
      !this.sceneTarget ||
      !this.composite ||
      framePacket.threads.length === 0
    ) {
      return;
    }

    try {
      const pointsPerThread = framePacket.threads[0].points.length >>> 1;
      if (pointsPerThread < 2) return;

      if (framePacket.threads.length > MAX_THREADS && !this.warnedThreadOverflow) {
        this.warnedThreadOverflow = true;
        console.warn(
          `[Timeline] ${framePacket.threads.length} threads exceeds WebGPU renderer capacity (${MAX_THREADS}); extra threads are dropped.`,
        );
      }
      const threadCount = Math.min(framePacket.threads.length, MAX_THREADS);
      this.ensureThreadsDraw(pointsPerThread, threadCount);
      if (!this.threadsDraw) return;

      const metaChanged = this.writeFrameData(framePacket, threadCount);

      const g = this.globalsScratch;
      g[0] = this.squareScale;
      g[1] = this.offsetX;
      g[2] = this.offsetY;
      g[3] = framePacket.time * 0.001;
      this.globalsUniform!.write(g);
      this.pointsUniform!.write(this.pointsScratch);
      if (metaChanged) {
        this.metaUniform!.write(this.metaScratch);
      }

      const bloom = this.config.enableBlur ? this.bloom : null;

      if (
        framePacket.overlayGradient !== this.lastOverlayGradient ||
        framePacket.overlayOpacity !== this.lastOverlayOpacity ||
        this.overlayDirty
      ) {
        const ov = this.overlayScratch;
        const base = MAX_GRADIENT_STOPS * 4;
        ov[base] = packStops(ov, 0, framePacket.overlayGradient);
        ov[base + 1] = bloom ? GLOW_WEIGHT_HALF : 0;
        ov[base + 2] = bloom ? GLOW_WEIGHT_QUARTER : 0;
        ov[base + 3] = framePacket.overlayOpacity;
        this.overlayUniform!.write(ov);
        this.lastOverlayGradient = framePacket.overlayGradient;
        this.lastOverlayOpacity = framePacket.overlayOpacity;
        this.overlayDirty = false;
      }

      frame(this.gpu, (f) => {
        f.pass({ target: this.sceneTarget!, clear: TRANSPARENT }, (p) => {
          p.draw(this.threadsDraw!);
        });
        if (bloom) {
          f.pass({ target: bloom.halfA, clear: TRANSPARENT }, (p) => p.draw(bloom.downHalf));
          f.pass({ target: bloom.halfB, clear: TRANSPARENT }, (p) => p.draw(bloom.blurHHalf));
          f.pass({ target: bloom.halfA, clear: TRANSPARENT }, (p) => p.draw(bloom.blurVHalf));
          f.pass({ target: bloom.quarterA, clear: TRANSPARENT }, (p) => p.draw(bloom.downQuarter));
          f.pass({ target: bloom.quarterB, clear: TRANSPARENT }, (p) => p.draw(bloom.blurHQuarter));
          f.pass({ target: bloom.quarterA, clear: TRANSPARENT }, (p) => p.draw(bloom.blurVQuarter));
        }
        f.pass({ target: this.canvasSurface!, clear: TRANSPARENT }, (p) => {
          p.draw(this.composite!);
        });
      });
    } catch (error) {
      if (!this.broken) {
        this.broken = true;
        console.error("[Timeline] WebGPU render failed, stopping:", error);
      }
    }
  }

  updateConfig(config: Partial<RendererConfig>): void {
    if (!this.config) return;
    const oldBlurStdDev = this.config.blurStdDeviation;
    const oldBlur = this.config.enableBlur;

    this.config = { ...this.config, ...config };
    this.updateGeometryMapping();

    if (this.config.enableBlur && !oldBlur && !this.bloom) {
      this.setupBloom();
      this.bindComposite();
    } else if (oldBlurStdDev !== this.config.blurStdDeviation) {
      this.applyBlurParams();
    }
    if (oldBlur !== this.config.enableBlur) {
      this.overlayDirty = true; // glow weights follow the enableBlur flag
    }
  }

  dispose(): void {
    this.broken = true;
    const resources: unknown[] = [
      this.threadsDraw,
      this.composite,
      this.sceneTarget,
      this.canvasSurface,
      this.globalsUniform,
      this.pointsUniform,
      this.metaUniform,
      this.overlayUniform,
      ...(this.bloom ? Object.values(this.bloom) : []),
    ];
    for (const item of resources) {
      (item as { dispose?: () => void } | null)?.dispose?.();
    }
    try {
      this.gpu?.device.destroy();
    } catch {
      // Device may already be lost
    }

    this.gpu = null;
    this.canvas = null;
    this.config = null;
    this.canvasSurface = null;
    this.sceneTarget = null;
    this.bloom = null;
    this.composite = null;
    this.linearSampler = null;
    this.threadsDraw = null;
    this.builtPointsPerThread = 0;
    this.builtThreadCount = 0;
    this.globalsUniform = null;
    this.pointsUniform = null;
    this.metaUniform = null;
    this.overlayUniform = null;
    this.threadStopsCache = [];
    this.lastOverlayGradient = null;
  }
}
