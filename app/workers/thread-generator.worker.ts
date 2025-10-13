import {
  type Direction,
  type HSL,
  type PathProfile,
  GOLDEN_RATIO_SEED,
  THREAD_COUNT,
  UP_FRACTION,
  chooseColor,
  createPathProfile,
  createSeededRandom,
  directionDurationSeeded,
  randomInRangeWith,
  clamp,
} from "../utils/thread-utils";

// ============================================================================
// TYPES
// ============================================================================

export type WorkerThreadData = {
  id: number;
  color: HSL;
  weight: number;
  opacity: number;
  direction: Direction;
  profileNeutral: Float32Array;
  profileUp: Float32Array;
  profileDown: Float32Array;
  swayPhase: number;
  driftPhase: number;
  swayFreq: number;
  driftFreq: number;
  swayAmp: number;
  driftAmp: number;
  duration: number;
};

export type GenerateThreadsMessage = {
  type: "generateThreads";
  count: number;
};

export type ThreadsGeneratedMessage = {
  type: "threadsGenerated";
  threads: WorkerThreadData[];
};

// ============================================================================
// THREAD GENERATION
// ============================================================================

const generateThread = (id: number): WorkerThreadData => {
  const rng = createSeededRandom(GOLDEN_RATIO_SEED ^ (id + 1));
  const profile = createPathProfile(id, rng);
  const direction: Direction = rng() < UP_FRACTION ? "up" : "down";

  return {
    id,
    color: chooseColor(rng),
    weight: randomInRangeWith(rng, 0.8, 1.4),
    opacity: clamp(0.52 + id / (THREAD_COUNT * 3.5), 0.56, 0.82),
    direction,
    profileNeutral: profile.neutral,
    profileUp: profile.up,
    profileDown: profile.down,
    swayPhase: randomInRangeWith(rng, 0, Math.PI * 2),
    driftPhase: randomInRangeWith(rng, 0, Math.PI * 2),
    swayFreq: randomInRangeWith(rng, 0.0008, 0.0015),
    driftFreq: randomInRangeWith(rng, 0.0006, 0.0012),
    swayAmp: randomInRangeWith(rng, 0.00375, 0.00875),
    driftAmp: randomInRangeWith(rng, 0.003, 0.007),
    duration: directionDurationSeeded(direction, rng),
  };
};

// ============================================================================
// WORKER MESSAGE HANDLER
// ============================================================================

self.onmessage = (event: MessageEvent<GenerateThreadsMessage>) => {
  if (event.data.type === "generateThreads") {
    const count = event.data.count;
    const threads: WorkerThreadData[] = [];

    // Generate all threads
    for (let i = 0; i < count; i++) {
      threads.push(generateThread(i));
    }

    // Ensure at least one thread starts pointing up
    const hasUpThread = threads.some((t) => t.direction === "up");
    if (!hasUpThread && threads.length > 0) {
      threads[0].direction = "up";
    }

    // Collect all Float32Array buffers for transfer
    const transferables: ArrayBuffer[] = [];
    threads.forEach((thread) => {
      transferables.push(
        thread.profileNeutral.buffer as ArrayBuffer,
        thread.profileUp.buffer as ArrayBuffer,
        thread.profileDown.buffer as ArrayBuffer
      );
    });

    // Send threads back with zero-copy transfer
    const message: ThreadsGeneratedMessage = {
      type: "threadsGenerated",
      threads,
    };

    self.postMessage(message, { transfer: transferables });
  }
};
