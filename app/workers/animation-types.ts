/**
 * Animation Worker Types
 */

import type { Direction, HSL } from "../utils/thread-utils";
import type { RendererKind } from "../types/renderer";
import type { SceneBox, SceneId } from "../utils/thread-scenes";

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
  | { type: "pointer"; x: number; y: number; active: boolean }
  // Scroll-driven scenes (see utils/thread-scenes.ts). Boxes and edges are in
  // viewbox space; an empty list eases back to the free animation.
  | {
      type: "scenes";
      targets: Array<{
        key: string;
        id: SceneId;
        weight: number;
        box: SceneBox;
      }>;
      /** Viewbox x of the screen's left and right edges */
      edges: [number, number];
      /** Viewbox y of the screen's top and bottom edges */
      verticalEdges: [number, number];
    }
  // Send a highlight along `count` random threads
  | { type: "pulse"; count: number };

// Worker -> main thread: which renderer backend was initialized.
export type RendererReadyMessage = {
  type: "rendererReady";
  kind: RendererKind;
};
