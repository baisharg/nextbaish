/**
 * Renderer Factory - Creates the appropriate renderer based on capabilities
 *
 * This factory abstracts renderer selection and instantiation, choosing the
 * best available renderer (WebGL > Canvas2D > SVG fallback) based on browser
 * capabilities and user preferences.
 */

import type {
  Renderer,
  RendererConfig,
  RendererCapabilities,
} from "../types/renderer";
import {
  RendererType,
  detectCapabilities,
  chooseBestRenderer,
} from "../types/renderer";
import { Canvas2DRenderer } from "../renderers/canvas2d-renderer";
import { WebGLRenderer } from "../renderers/webgl-renderer";

/**
 * Renderer factory options
 */
export type CreateRendererOptions = {
  /** Preferred renderer type (optional - will auto-select if not specified) */
  preferredRenderer?: RendererType;
  /** Force a specific renderer (bypasses capability checks) */
  forceRenderer?: RendererType;
  /** Canvas element to render to */
  canvas: HTMLCanvasElement | OffscreenCanvas;
  /** Renderer configuration */
  config: RendererConfig;
  /** Callback for when renderer initialization fails */
  onError?: (error: Error) => void;
};

/**
 * Renderer creation result
 */
export type CreateRendererResult = {
  renderer: Renderer;
  type: RendererType;
  capabilities: RendererCapabilities;
};

/**
 * Create a renderer instance based on browser capabilities
 *
 * Selection order (best to worst):
 * 1. WebGL2 (if OffscreenCanvas + WebGL2 available)
 * 2. WebGL (if OffscreenCanvas + WebGL available)
 * 3. Canvas2D (if OffscreenCanvas available, or as fallback)
 * 4. SVG (ultimate fallback - not implemented yet, will throw error)
 *
 * @param options - Renderer creation options
 * @returns Promise resolving to renderer instance, type, and capabilities
 * @throws Error if renderer initialization fails
 */
export async function createRenderer(
  options: CreateRendererOptions
): Promise<CreateRendererResult> {
  const { canvas, config, preferredRenderer, forceRenderer, onError } = options;

  // Detect browser capabilities
  const capabilities = detectCapabilities();

  // Determine renderer type (WebGL only - no fallbacks)
  let rendererType: RendererType | null;

  if (forceRenderer) {
    // Force specific renderer (bypass capability checks)
    rendererType = forceRenderer;
    console.warn(`[Timeline] Forcing renderer: ${forceRenderer}`);
  } else if (preferredRenderer) {
    // Use preferred renderer if capabilities allow
    rendererType = validateRendererChoice(preferredRenderer, capabilities);
  } else {
    // Auto-select best renderer (WebGL only)
    rendererType = chooseBestRenderer(capabilities);
  }

  // If no WebGL support, throw error (no fallback)
  if (!rendererType) {
    throw new Error(
      'WebGL not supported - timeline animation disabled. ' +
      'Please use a browser with WebGL support (Chrome, Firefox, Safari, Edge).'
    );
  }

  console.log(
    `[Timeline] Creating renderer: ${rendererType}`,
    capabilities
  );

  try {
    // Instantiate renderer
    const renderer = await instantiateRenderer(rendererType, canvas, config);

    return {
      renderer,
      type: rendererType,
      capabilities,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    // Call error callback if provided
    if (onError) {
      onError(err);
    }

    // No fallback - WebGL only
    console.error(`[Timeline] ${rendererType} renderer failed - no fallback available`, err);
    throw err;
  }
}

/**
 * Validate renderer choice against capabilities (WebGL only)
 */
function validateRendererChoice(
  preferredRenderer: RendererType,
  capabilities: RendererCapabilities
): RendererType | null {
  switch (preferredRenderer) {
    case RendererType.WebGL2:
      if (!capabilities.webgl2) {
        console.warn("[Timeline] WebGL2 not available");
        return chooseBestRenderer(capabilities);
      }
      return RendererType.WebGL2;

    case RendererType.WebGL:
      if (!capabilities.webgl) {
        console.warn("[Timeline] WebGL not available");
        return chooseBestRenderer(capabilities);
      }
      return RendererType.WebGL;

    case RendererType.Canvas2D:
    case RendererType.SVG:
      console.warn(
        `[Timeline] ${preferredRenderer} renderer not supported - WebGL only`
      );
      return chooseBestRenderer(capabilities);

    default:
      return chooseBestRenderer(capabilities);
  }
}

/**
 * Instantiate a renderer of the specified type
 */
async function instantiateRenderer(
  type: RendererType,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: RendererConfig
): Promise<Renderer> {
  let renderer: Renderer;

  switch (type) {
    case RendererType.WebGL2:
    case RendererType.WebGL:
      renderer = new WebGLRenderer();
      break;

    case RendererType.Canvas2D:
      renderer = new Canvas2DRenderer();
      break;

    case RendererType.SVG:
      throw new Error("SVG renderer not implemented yet");

    default:
      throw new Error(`Unknown renderer type: ${type}`);
  }

  // Initialize renderer
  await renderer.init(canvas, config);

  return renderer;
}

/**
 * Check if a renderer type is supported by the browser
 */
export function isRendererSupported(
  type: RendererType,
  capabilities?: RendererCapabilities
): boolean {
  const caps = capabilities || detectCapabilities();

  switch (type) {
    case RendererType.WebGL2:
      return caps.offscreenCanvas && caps.webgl2;

    case RendererType.WebGL:
      return caps.offscreenCanvas && caps.webgl;

    case RendererType.Canvas2D:
      return true; // Always supported

    case RendererType.SVG:
      return false; // Not implemented yet

    default:
      return false;
  }
}

/**
 * Get a human-readable description of the renderer
 */
export function getRendererDescription(type: RendererType): string {
  switch (type) {
    case RendererType.WebGL2:
      return "WebGL2 (GPU-accelerated with shader-based blur)";

    case RendererType.WebGL:
      return "WebGL (GPU-accelerated with shader-based blur)";

    case RendererType.Canvas2D:
      return "Canvas2D (GPU-accelerated with CSS filters)";

    case RendererType.SVG:
      return "SVG (DOM-based, legacy fallback)";

    default:
      return "Unknown renderer";
  }
}

/**
 * Log renderer capabilities and selection
 */
export function logRendererInfo(result: CreateRendererResult): void {
  const { type, capabilities } = result;

  console.group("[Timeline] Renderer Info");
  console.log("Selected renderer:", getRendererDescription(type));
  console.log("Capabilities:", {
    OffscreenCanvas: capabilities.offscreenCanvas ? "✅" : "❌",
    WebGL2: capabilities.webgl2 ? "✅" : "❌",
    WebGL: capabilities.webgl ? "✅" : "❌",
    SharedArrayBuffer: capabilities.sharedArrayBuffer ? "✅" : "❌",
  });
  console.groupEnd();
}
