"use client";

import { useEffect, useRef, useState } from "react";

const TARGET_FPS = 120;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;
const MAX_DPR = 1.8;
const MIN_DPR = 1;
const DPR_STEP = 0.25;
const DPR_ADJUST_COOLDOWN_MS = 4000;
const PERF_EVENT_NAME = "timelineThreads:stats";

const LowMotionBackdrop = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`pointer-events-none ${className ?? "absolute inset-0"}`}
    style={{
      ...style,
      background:
        "radial-gradient(at 20% 20%, rgba(146, 117, 229, 0.25), transparent 55%), radial-gradient(at 80% 40%, rgba(168, 197, 255, 0.3), transparent 60%), radial-gradient(at 50% 80%, rgba(199, 125, 218, 0.25), transparent 65%)",
      filter: "blur(48px)",
      opacity: 0.55,
      transform: "translateZ(0)",
    }}
  />
);

/**
 * OffscreenCanvas + Web Worker version of TimelineThreads with fallback
 * Physics and rendering happen off the main thread for better performance
 */

type TimelineThreadsProps = { className?: string };

export default function TimelineThreadsWorker({ className, style }: TimelineThreadsProps & { style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const initializedRef = useRef(false);
  const [useFallback, setUseFallback] = useState(false);
  const dprCapRef = useRef(MAX_DPR);
  const effectiveDprRef = useRef(1);
  const lastDprAdjustRef = useRef(0);
  const fallbackPressureRef = useRef(0);

  useEffect(() => {
    if (useFallback) {
      // Ensure worker is torn down if we already fell back
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      initializedRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || initializedRef.current) return;

    if (typeof window === "undefined") return;

    // Check for OffscreenCanvas support
    if (!('OffscreenCanvas' in window)) {
      console.warn('[TimelineThreadsWorker] OffscreenCanvas not supported, using low-motion fallback');
      setUseFallback(true);
      return;
    }

    dprCapRef.current = Math.min(MAX_DPR, window.devicePixelRatio || 1);

    const stopWorker = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };

    const computeEffectiveDpr = () => {
      const rawDpr = window.devicePixelRatio || 1;
      const nextDpr = Math.min(rawDpr, dprCapRef.current);
      effectiveDprRef.current = nextDpr;
      return nextDpr;
    };

    const applyCanvasSize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = computeEffectiveDpr();
      const scaledWidth = Math.max(1, Math.floor(width * dpr));
      const scaledHeight = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'resize',
          data: { width: scaledWidth, height: scaledHeight },
        });
      } else {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
      }
    };

    const dispatchPerfEvent = (detail: Record<string, unknown>) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(PERF_EVENT_NAME, { detail }));
      }
    };

    // Create worker first
    try {
      workerRef.current = new Worker(
        new URL('./timeline-threads.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Listen for performance updates
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'performance') {
          const { physics, render, total, fps, qualityHint } = e.data.data;
          console.log(`[TimelineThreads Worker] Physics: ${physics.toFixed(2)}ms | Render: ${render.toFixed(2)}ms | Total: ${total.toFixed(2)}ms | FPS: ${fps.toFixed(1)}`);

          dispatchPerfEvent({
            avgPhysics: physics,
            avgRender: render,
            avgTotal: total,
            fps,
            source: 'worker',
          });

          const now = performance.now();
          const cooldownElapsed = now - lastDprAdjustRef.current > DPR_ADJUST_COOLDOWN_MS;
          const upscaleReady = now - lastDprAdjustRef.current > DPR_ADJUST_COOLDOWN_MS * 2;

          if (qualityHint === 'down') {
            if (dprCapRef.current > MIN_DPR + 1e-2 && cooldownElapsed) {
              dprCapRef.current = Math.max(MIN_DPR, dprCapRef.current - DPR_STEP);
              lastDprAdjustRef.current = now;
              applyCanvasSize();
              fallbackPressureRef.current = 0;
            } else if (dprCapRef.current <= MIN_DPR + 1e-2) {
              fallbackPressureRef.current += 1;
              if (fallbackPressureRef.current >= 2) {
                stopWorker();
                setUseFallback(true);
              }
            }
          } else if (qualityHint === 'up') {
            fallbackPressureRef.current = Math.max(0, fallbackPressureRef.current - 1);
            if (dprCapRef.current < MAX_DPR - 1e-2 && upscaleReady) {
              dprCapRef.current = Math.min(MAX_DPR, dprCapRef.current + DPR_STEP);
              lastDprAdjustRef.current = now;
              applyCanvasSize();
            }
          }
        }
      };

      initializedRef.current = true;
    } catch (err) {
      console.error('[TimelineThreadsWorker] Failed to create worker, using low-motion fallback:', err);
      setUseFallback(true);
      return;
    }

    // Initial size before transferring control
    const { width, height } = container.getBoundingClientRect();
    const initialDpr = computeEffectiveDpr();
    const initialScaledWidth = Math.max(1, Math.floor(width * initialDpr));
    const initialScaledHeight = Math.max(1, Math.floor(height * initialDpr));
    canvas.width = initialScaledWidth;
    canvas.height = initialScaledHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Transfer canvas control to worker
    const offscreen = canvas.transferControlToOffscreen();
    workerRef.current.postMessage(
      { type: 'init', data: { canvas: offscreen, width: initialScaledWidth, height: initialScaledHeight } },
      [offscreen]
    );

    // Ensure worker has current sizing data
    applyCanvasSize();

    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => applyCanvasSize())
      : null;
    ro?.observe(container);

    return () => {
      stopWorker();
      ro?.disconnect();
      initializedRef.current = false;
    };
  }, [useFallback]);

  // Use fallback if OffscreenCanvas not supported
  if (useFallback) {
    return <LowMotionBackdrop className={className} style={style} />;
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className ?? "absolute inset-0"}`}
      style={{
        ...style,
        contain: 'layout style paint',
        willChange: 'opacity',
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          transform: 'translateZ(0)',
          isolation: 'isolate',
        }}
      />
    </div>
  );
}
