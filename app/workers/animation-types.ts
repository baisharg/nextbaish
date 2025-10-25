/**
 * Animation Worker Types
 *
 * Type definitions for animation worker messages and communication.
 * These types are used by the main thread to communicate with animation workers.
 */

import type { Direction, HSL } from "../utils/thread-utils";
import type { FramePacket } from "../types/renderer";

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export type InitMessage = {
  type: "init";
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
  viewSize: number;
  frameInterval: number;
};

export type PauseMessage = {
  type: "pause";
};

export type ResumeMessage = {
  type: "resume";
};

export type TerminateMessage = {
  type: "terminate";
};

export type TickMessage = {
  type: "tick";
  now: number;
};

export type WorkerMessage = InitMessage | PauseMessage | ResumeMessage | TerminateMessage | TickMessage;

export type FrameMessage = {
  type: "frame";
  packet: FramePacket;
};
