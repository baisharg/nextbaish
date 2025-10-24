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
  if (typeof window === "undefined") {
    return {
      offscreenCanvas: false,
      webgl2: false,
      webgl: false,
      sharedArrayBuffer: false,
    };
  }

  // Check OffscreenCanvas support
  const offscreenCanvas = "OffscreenCanvas" in window;

  // Check WebGL support
  let webgl = false;
  let webgl2 = false;
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    if (gl2) {
      webgl2 = true;
      webgl = true;
    } else {
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      webgl = !!gl;
    }
  } catch {
    // WebGL not supported
  }

  // Check SharedArrayBuffer support (requires COOP/COEP headers)
  const sharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";

  return {
    offscreenCanvas,
    webgl2,
    webgl,
    sharedArrayBuffer,
  };
}

/**
 * Renderer type enum
 */
export enum RendererType {
  SVG = "svg",
  Canvas2D = "canvas2d",
  WebGL = "webgl",
  WebGL2 = "webgl2",
}

/**
 * Choose the best renderer based on capabilities
 */
export function chooseBestRenderer(capabilities: RendererCapabilities): RendererType {
  // Prefer WebGL2 > WebGL > Canvas2D > SVG (fallback)
  if (capabilities.offscreenCanvas && capabilities.webgl2) {
    return RendererType.WebGL2;
  }
  if (capabilities.offscreenCanvas && capabilities.webgl) {
    return RendererType.WebGL;
  }
  if (capabilities.offscreenCanvas) {
    return RendererType.Canvas2D;
  }
  // Canvas2D can work without OffscreenCanvas (on main thread)
  return RendererType.Canvas2D;
}
