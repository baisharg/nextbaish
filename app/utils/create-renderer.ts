/**
 * Renderer Factory - Creates the appropriate renderer based on capabilities
 *
 * Tries WebGPU (vgpu) first, then falls back to WebGL. The vgpu renderer is
 * loaded via dynamic import so browsers on the WebGL path never download it,
 * and the WebGL context probe only runs once WebGPU is out of the picture.
 */

import type {
  Renderer,
  RendererConfig,
  RendererKind,
} from "../types/renderer";
import {
  detectCapabilities,
  chooseBestRenderer,
  supportsWebGPU,
} from "../types/renderer";
import { WebGLRenderer } from "../renderers/webgl-renderer";

export type CreateRendererOptions = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  config: RendererConfig;
};

export async function createRenderer(
  options: CreateRendererOptions
): Promise<{ renderer: Renderer; kind: RendererKind }> {
  const { canvas, config } = options;

  if (supportsWebGPU()) {
    try {
      // VgpuRenderer requests the device before touching the canvas, so a
      // failure here leaves the canvas free for WebGL below.
      const { VgpuRenderer } = await import("../renderers/vgpu-renderer");
      const renderer = new VgpuRenderer();
      await renderer.init(canvas, config);
      return { renderer, kind: "webgpu" };
    } catch (error) {
      console.warn(
        "[Timeline] WebGPU unavailable, falling back to WebGL:",
        error,
      );
    }
  }

  if (!chooseBestRenderer(detectCapabilities())) {
    throw new Error(
      'WebGL not supported - timeline animation disabled.'
    );
  }

  const renderer: Renderer = new WebGLRenderer();
  await renderer.init(canvas, config);

  return { renderer, kind: "webgl" };
}
