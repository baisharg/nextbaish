// ============================================================================
// RENDERER INTERFACE & TYPES
// ============================================================================

/**
 * Renderer abstraction layer - allows swapping between SVG, Canvas2D, and WebGL
 * implementations without touching animation logic.
 */

/**
 * Per-thread color gradient stops (y position in normalized [0..1] space)
 */
export type ColorStop = {
  yPct: number; // Position in [0..1]
  hsl: [number, number, number]; // [h, s, l]
};

/**
 * Single thread's frame data
 */
export type ThreadFrame = {
  // Flat array of normalized [0..1] coordinates: [x0,y0,x1,y1,...]
  points: Float32Array;
  width: number; // Stroke width
  opacity: number; // Stroke opacity [0..1]
  colorStops: ColorStop[]; // Gradient stops for this thread
  // Static gradient bounds (from thread's base profile, not animated)
  gradientMinY: number; // Min Y in normalized [0..1] space
  gradientMaxY: number; // Max Y in normalized [0..1] space
};

/**
 * Complete frame data for all threads
 */
export type FramePacket = {
  time: number; // Current timestamp in ms
  viewSize: number; // VIEWBOX_SIZE constant
  threads: ThreadFrame[];
  overlayMixMode: "screen"; // Capture <rect> overlay behavior
  overlayGradient: ColorStop[]; // Overlay gradient stops
};

/**
 * Renderer capabilities
 */
export type RendererCapabilities = {
  offscreenCanvas: boolean;
  webgl2: boolean;
  webgl: boolean;
  sharedArrayBuffer: boolean;
};

/**
 * Renderer configuration
 */
export type RendererConfig = {
  viewSize: number; // VIEWBOX_SIZE
  blurStdDeviation: number; // Blur amount for glow effect
  dpr: number; // Device pixel ratio
  enableBlur: boolean; // Whether to apply blur effect
  offsetXMultiplier?: number; // Horizontal offset multiplier (0.5 = center)
  offsetYMultiplier?: number; // Vertical offset multiplier (0.5 = center, 1.0 = bottom)
};

/**
 * Renderer interface - all renderers must implement this
 */
export interface Renderer {
  /**
   * Initialize the renderer with a canvas element
   * @param canvas - HTMLCanvasElement or OffscreenCanvas
   * @param config - Renderer configuration
   */
  init(canvas: HTMLCanvasElement | OffscreenCanvas, config: RendererConfig): Promise<void>;

  /**
   * Draw a single frame
   * @param frame - Frame data to render
   */
  draw(frame: FramePacket): void;

  /**
   * Update configuration (e.g., blur amount, viewport size)
   * @param config - New configuration
   */
  updateConfig(config: Partial<RendererConfig>): void;

  /**
   * Clean up resources
   */
  dispose(): void;
}

/**
 * Detect available renderer capabilities
 */
export function detectCapabilities(): RendererCapabilities {
  const isWindow = typeof window !== "undefined";

  // Worker-safe detection: fall back to OffscreenCanvas probing when window is absent
  const createProbeCanvas = () => {
    try {
      return typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(1, 1)
        : isWindow
          ? document.createElement("canvas")
          : null;
    } catch {
      return null;
    }
  };

  const probeCanvas = createProbeCanvas();
  const offscreenCanvas = Boolean(probeCanvas && typeof OffscreenCanvas !== "undefined");

  let webgl = false;
  let webgl2 = false;
  if (probeCanvas) {
    try {
      const gl2 = probeCanvas.getContext("webgl2");
      if (gl2) {
        webgl2 = true;
        webgl = true;
      } else {
        const gl =
          probeCanvas.getContext("webgl") ||
          // @ts-expect-error experimental-webgl exists only in browsers
          probeCanvas.getContext("experimental-webgl");
        webgl = Boolean(gl);
      }
    } catch {
      // Ignore context errors
    }
  }

  const sharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";

  return {
    offscreenCanvas,
    webgl2,
    webgl,
    sharedArrayBuffer,
  };
}

/**
 * Renderer type enum (WebGL only)
 */
export enum RendererType {
  SVG = "svg", // Not implemented - kept for future fallback
  WebGL = "webgl",
  WebGL2 = "webgl2",
}

/**
 * Choose the best renderer based on capabilities
 * Only returns WebGL - no fallbacks
 */
export function chooseBestRenderer(capabilities: RendererCapabilities): RendererType | null {
  // WebGL2 preferred, WebGL acceptable
  if (capabilities.webgl2) {
    return RendererType.WebGL2;
  }
  if (capabilities.webgl) {
    return RendererType.WebGL;
  }
  // No WebGL support - return null (no animation)
  return null;
}
