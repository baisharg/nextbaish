/**
 * Canvas2D Renderer - GPU-accelerated canvas rendering
 *
 * Features:
 * - Works with both HTMLCanvasElement and OffscreenCanvas
 * - GPU-accelerated via CSS filters (blur) or canvas filters
 * - Gradient strokes using Path2D
 * - Significantly faster than SVG DOM updates
 */

import type {
  Renderer,
  RendererConfig,
  FramePacket,
  ThreadFrame,
  ColorStop,
} from "../types/renderer";
import { BEZIER_CONTROL_FACTOR } from "../utils/thread-utils";

export class Canvas2DRenderer implements Renderer {
  private ctx:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;
  private canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  private config: RendererConfig | null = null;

  // Offscreen canvas for blur effect (if needed)
  private blurCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  private blurCtx:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;

  // Path2D cache for reuse
  private path2DCache = new Map<number, Path2D>();

  async init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    config: RendererConfig,
  ): Promise<void> {
    this.canvas = canvas;
    this.config = config;

    // Get 2D context with optimal settings
    const contextOptions: CanvasRenderingContext2DSettings = {
      alpha: true,
      desynchronized: true, // Enable desynchronized mode for better performance
      willReadFrequently: false,
    };

    this.ctx = canvas.getContext("2d", contextOptions) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;

    if (!this.ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Setup canvas dimensions
    this.updateCanvasSize();

    // Create blur canvas if blur is enabled
    if (config.enableBlur) {
      this.createBlurCanvas();
    }
  }

  private updateCanvasSize(): void {
    if (!this.canvas || !this.config) return;

    const { viewSize, dpr } = this.config;

    // Set canvas internal resolution (high DPI)
    this.canvas.width = viewSize * dpr;
    this.canvas.height = viewSize * dpr;

    // Set canvas display size (CSS pixels) - only for HTMLCanvasElement
    if ("style" in this.canvas) {
      this.canvas.style.width = `${viewSize}px`;
      this.canvas.style.height = `${viewSize}px`;
    }

    // Scale context for high DPI
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  private createBlurCanvas(): void {
    if (!this.config) return;

    const { viewSize, dpr } = this.config;

    // Create offscreen canvas for blur effect at lower resolution (0.5x for performance)
    const blurScale = 0.5;
    const blurSize = viewSize * blurScale;

    if (typeof OffscreenCanvas !== "undefined") {
      this.blurCanvas = new OffscreenCanvas(blurSize * dpr, blurSize * dpr);
    } else if (typeof document !== "undefined") {
      this.blurCanvas = document.createElement("canvas");
      this.blurCanvas.width = blurSize * dpr;
      this.blurCanvas.height = blurSize * dpr;
    }

    if (this.blurCanvas) {
      this.blurCtx = this.blurCanvas.getContext("2d") as
        | CanvasRenderingContext2D
        | OffscreenCanvasRenderingContext2D
        | null;

      if (this.blurCtx) {
        this.blurCtx.scale(dpr * blurScale, dpr * blurScale);
      }
    }
  }

  updateConfig(config: Partial<RendererConfig>): void {
    if (!this.config) return;

    const oldViewSize = this.config.viewSize;
    const oldDpr = this.config.dpr;
    const oldBlur = this.config.enableBlur;

    this.config = { ...this.config, ...config };

    // Resize if needed
    if (oldViewSize !== this.config.viewSize || oldDpr !== this.config.dpr) {
      this.updateCanvasSize();
    }

    // Recreate blur canvas if blur settings changed
    if (oldBlur !== this.config.enableBlur) {
      if (this.config.enableBlur) {
        this.createBlurCanvas();
      } else {
        this.blurCanvas = null;
        this.blurCtx = null;
      }
    }
  }

  draw(frame: FramePacket): void {
    if (!this.ctx || !this.config) return;

    const { viewSize } = this.config;

    // Clear canvas
    this.ctx.clearRect(0, 0, viewSize, viewSize);

    // Draw to blur canvas if enabled, otherwise draw directly
    const targetCtx =
      this.config.enableBlur && this.blurCtx ? this.blurCtx : this.ctx;
    const targetSize = this.config.enableBlur ? viewSize * 0.5 : viewSize;

    // Save context state
    targetCtx.save();

    // Draw each thread
    for (let i = 0; i < frame.threads.length; i++) {
      const thread = frame.threads[i];
      this.drawThread(targetCtx, thread, targetSize);
    }

    targetCtx.restore();

    // If using blur canvas, apply blur and composite to main canvas
    if (this.config.enableBlur && this.blurCanvas && this.blurCtx) {
      this.applyBlurComposite(viewSize);
    }

    // Draw overlay
    this.drawOverlay(frame, viewSize);
  }

  private drawThread(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    thread: ThreadFrame,
    viewSize: number,
  ): void {
    const { points, width, opacity, colorStops, gradientMinY, gradientMaxY } =
      thread;

    // Build path
    const path = this.buildPath(points, viewSize);

    // Create gradient using static bounds (matches SVG gradientUnits="userSpaceOnUse")
    const gradient = this.createGradient(
      ctx,
      colorStops,
      viewSize,
      gradientMinY,
      gradientMaxY,
    );

    // Draw thread with gradient stroke
    ctx.save();
    ctx.strokeStyle = gradient;
    // Scale up thread width to match SVG visual weight
    const WIDTH_SCALE = 2.0; // Increase base width for better visibility
    ctx.lineWidth = width * WIDTH_SCALE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity;
    ctx.stroke(path);
    ctx.restore();
  }

  private buildPath(points: Float32Array, viewSize: number): Path2D {
    const path = new Path2D();
    const n = points.length >>> 1;

    if (n === 0) return path;

    // Move to first point
    const x0 = points[0] * viewSize;
    const y0 = points[1] * viewSize;
    path.moveTo(x0, y0);

    // Build cubic bezier path (matching SVG implementation)
    let prevPrevX = x0;
    let prevPrevY = y0;
    let prevX = x0;
    let prevY = y0;

    for (let i = 1; i < n; i++) {
      const currIdx = i << 1;
      const currX = points[currIdx] * viewSize;
      const currY = points[currIdx + 1] * viewSize;

      const nextIdx = i < n - 1 ? (i + 1) << 1 : currIdx;
      const nextX = points[nextIdx] * viewSize;
      const nextY = points[nextIdx + 1] * viewSize;

      const cp1x = prevX + (currX - prevPrevX) * BEZIER_CONTROL_FACTOR;
      const cp1y = prevY + (currY - prevPrevY) * BEZIER_CONTROL_FACTOR;
      const cp2x = currX - (nextX - prevX) * BEZIER_CONTROL_FACTOR;
      const cp2y = currY - (nextY - prevY) * BEZIER_CONTROL_FACTOR;

      path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currX, currY);

      prevPrevX = prevX;
      prevPrevY = prevY;
      prevX = currX;
      prevY = currY;
    }

    return path;
  }

  private createGradient(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    colorStops: ColorStop[],
    viewSize: number,
    minY: number = 0,
    maxY: number = 1,
  ): CanvasGradient {
    // Create vertical linear gradient spanning the thread's vertical range
    // This matches SVG's gradientUnits="userSpaceOnUse"
    const y1 = minY * viewSize;
    const y2 = maxY * viewSize;
    const gradient = ctx.createLinearGradient(0, y1, 0, y2);

    // Add color stops
    for (const stop of colorStops) {
      const [h, s, l] = stop.hsl;
      const color = `hsl(${h}, ${s}%, ${l}%)`;
      gradient.addColorStop(stop.yPct, color);
    }

    return gradient;
  }

  private applyBlurComposite(viewSize: number): void {
    if (!this.ctx || !this.blurCanvas || !this.config) return;

    const { blurStdDeviation } = this.config;

    // Apply blur filter (using CSS filters or canvas filter)
    this.ctx.save();

    // Draw blur layer (glow effect)
    this.ctx.globalAlpha = 0.5; // Match feColorMatrix opacity
    this.ctx.filter = `blur(${blurStdDeviation}px)`;
    const blurSource = this.blurCanvas as CanvasImageSource;
    this.ctx.drawImage(blurSource, 0, 0, viewSize, viewSize);

    // Draw sharp layer on top (no blur)
    this.ctx.globalAlpha = 1;
    this.ctx.filter = "none";
    this.ctx.drawImage(blurSource, 0, 0, viewSize, viewSize);

    this.ctx.restore();
  }

  private drawOverlay(frame: FramePacket, viewSize: number): void {
    if (!this.ctx) return;

    const { overlayGradient } = frame;

    // Create overlay gradient
    const gradient = this.createGradient(this.ctx, overlayGradient, viewSize);

    // Draw overlay rect with screen blend mode
    this.ctx.save();
    // Increase overlay brightness to make threads more visible against background
    this.ctx.globalAlpha = 0.45;
    this.ctx.globalCompositeOperation = "screen";
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, viewSize, viewSize);
    this.ctx.restore();
  }

  dispose(): void {
    this.ctx = null;
    this.canvas = null;
    this.blurCanvas = null;
    this.blurCtx = null;
    this.config = null;
    this.path2DCache.clear();
  }
}
