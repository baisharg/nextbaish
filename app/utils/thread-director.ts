/**
 * Channels between a component that steers a set of threads (ThreadSet) and
 * the TimelineThreads canvas that draws them. Each section of a page gets its
 * own set and channel; canvases without a channel (the site-wide background)
 * keep their free animation.
 */

import type { SceneId } from "./thread-scenes";

/**
 * [u0, v0, u1, v1] as fractions of the set's own canvas area. Both scroll
 * together, so the box only changes when the layout does.
 */
export type CanvasBox = [number, number, number, number];

export type SceneTarget = {
  /** Identifies the scene within its set (a set can blend several shapes) */
  key: string;
  id: SceneId;
  weight: number;
  /** Where the shape is laid out */
  box: CanvasBox;
};

type Listener = {
  onTargets: (targets: SceneTarget[] | null) => void;
  onPulse: (count: number) => void;
};

export type ThreadChannel = {
  readonly targets: SceneTarget[] | null;
  setTargets(targets: SceneTarget[]): void;
  pulse(count?: number): void;
  subscribe(listener: Listener): () => void;
};

const live = new Set<ThreadChannel>();

export function createThreadChannel(): ThreadChannel {
  const listeners = new Set<Listener>();
  let latest: SceneTarget[] | null = null;

  return {
    get targets() {
      return latest;
    },
    setTargets(targets) {
      latest = targets;
      listeners.forEach((l) => l.onTargets(targets));
    },
    pulse(count = 6) {
      listeners.forEach((l) => l.onPulse(count));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Channels currently on the page, so page-wide effects reach every set */
export function registerChannel(channel: ThreadChannel) {
  live.add(channel);
  return () => {
    live.delete(channel);
  };
}

/** Send highlights along a few threads of every set on the page */
export function pulseAll(count = 6) {
  live.forEach((channel) => channel.pulse(count));
}
