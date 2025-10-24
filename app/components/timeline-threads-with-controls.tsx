"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import TimelineThreads from "./timeline-threads";
import ThreadControlPanel, { DEFAULT_PARAMS, type ThreadControlParams } from "./thread-control-panel";

type TimelineThreadsWithControlsProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Wrapper component that adds debug controls to TimelineThreads
 * Only use this for development/testing
 */
export default function TimelineThreadsWithControls({ className, style }: TimelineThreadsWithControlsProps) {
  const [params, setParams] = useState<ThreadControlParams>(DEFAULT_PARAMS);
  const [key, setKey] = useState(0);

  // Force re-mount when critical parameters change
  useEffect(() => {
    setKey((k) => k + 1);
  }, [
    params.threadCount,
    params.pivotX,
    params.pivotY,
    params.xStart,
    params.xEnd,
    params.offsetXMultiplier,
    params.offsetYMultiplier,
  ]);

  return (
    <>
      <TimelineThreads
        key={key}
        className={className}
        style={style}
        overrideParams={{
          threadCount: params.threadCount,
          pivotX: params.pivotX,
          pivotY: params.pivotY,
          xStart: params.xStart,
          xEnd: params.xEnd,
          offsetXMultiplier: params.offsetXMultiplier,
          offsetYMultiplier: params.offsetYMultiplier,
          flipInterval: params.flipInterval,
          upDurationMin: params.upDurationMin,
          upDurationMax: params.upDurationMax,
          downDurationMin: params.downDurationMin,
          downDurationMax: params.downDurationMax,
          blurStdDeviation: params.blurStdDeviation,
          enableBlur: params.enableBlur,
        }}
      />
      <ThreadControlPanel params={params} onChange={setParams} />
    </>
  );
}
