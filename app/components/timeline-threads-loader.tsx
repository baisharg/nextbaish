"use client";

import dynamic from "next/dynamic";
import { useLCPComplete } from "@/app/hooks/use-lcp-complete";
import type { CSSProperties } from "react";

const TimelineThreads = dynamic(() => import("./timeline-threads"), {
  ssr: false,
});

type TimelineThreadsLoaderProps = {
  className?: string;
  style?: CSSProperties;
};

export default function TimelineThreadsLoader(props: TimelineThreadsLoaderProps) {
  const isLCPComplete = useLCPComplete();

  // Show placeholder until LCP completes
  if (!isLCPComplete) {
    return (
      <div
        className={props.className}
        style={{
          ...props.style,
          backgroundColor: "#f5f5f5",
        }}
      />
    );
  }

  return <TimelineThreads {...props} />;
}
