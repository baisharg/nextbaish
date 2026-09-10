/**
 * Animation Worker Types
 */

import type { Direction, HSL } from "../utils/thread-utils";
import type { RendererKind } from "../types/renderer";

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export type InitMessage = {
  type: "init";
  canvas: OffscreenCanvas;
  config: {
    viewSize: number;
    blurStdDeviation: number;
    dpr: number;
    enableBlur: boolean;
    offsetXMultiplier?: number;
    offsetYMultiplier?: number;
  };
  threads: Array<{
    id: number;
    color: HSL;
    weight: number;
    opacity: number;
    profileNeutral: Float32Array;
    profileUp: Float32Array;
    profileDown: Float32Array;
    direction: Direction;
    swayPhase: number;
    driftPhase: number;
    swayFreq: number;
    driftFreq: number;
    swayAmp: number;
    driftAmp: number;
    duration: number;
  }>;
  frameInterval: number;
};

export type WorkerMessage =
  | InitMessage
  | { type: "pause" }
  | { type: "resume" }
  | { type: "terminate" }
  | { type: "tick"; now: number }
  // Pointer position in normalized viewbox space (same space as thread
  // points); active=false eases the interaction back out.
  | { type: "pointer"; x: number; y: number; active: boolean };

// Worker -> main thread: which renderer backend was initialized.
export type RendererReadyMessage = {
  type: "rendererReady";
  kind: RendererKind;
};
