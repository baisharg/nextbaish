"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

const TimelineThreads = dynamic(() => import("./timeline-threads"), {
  ssr: false,
  loading: () => null,
});

type TimelineThreadsLoaderProps = {
  className?: string;
  style?: CSSProperties;
};

export default function TimelineThreadsLoader(props: TimelineThreadsLoaderProps) {
  return <TimelineThreads {...props} />;
}
