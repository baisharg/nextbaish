"use client";

import { useEffect, useState, useRef } from "react";

interface PerformanceStats {
  fps: number;
  frameTime: number;
  domMutations: number;
  transitioningThreads: number;
  totalThreads: number;
  animationFrameTime: number;
}

interface TimelinePerformanceMonitorProps {
  transitioningThreadCount: number;
  totalThreadCount: number;
  onDomMutation?: () => void;
}

export default function TimelinePerformanceMonitor({
  transitioningThreadCount,
  totalThreadCount,
}: TimelinePerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    domMutations: 0,
    transitioningThreads: 0,
    totalThreads: 0,
    animationFrameTime: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const mutationCountRef = useRef(0);
  const lastMutationResetRef = useRef(performance.now());
  const rafIdRef = useRef(0);

  // Keyboard shortcut to toggle visibility (Ctrl/Cmd + Shift + P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Monitor performance
  useEffect(() => {
    if (!isVisible) return;

    const measureFrame = (now: number) => {
      frameCountRef.current++;

      // Calculate frame time
      const frameTime = now - lastTimeRef.current;
      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Update stats every 500ms
      if (now - lastMutationResetRef.current >= 500) {
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);

        // Calculate DOM mutations per second
        const timeDiff = (now - lastMutationResetRef.current) / 1000;
        const mutationsPerSec = Math.round(mutationCountRef.current / timeDiff);

        setStats({
          fps: isFinite(fps) ? fps : 0,
          frameTime: Math.round(avgFrameTime * 100) / 100,
          domMutations: mutationsPerSec,
          transitioningThreads: transitioningThreadCount,
          totalThreads: totalThreadCount,
          animationFrameTime: Math.round(avgFrameTime * 100) / 100,
        });

        mutationCountRef.current = 0;
        lastMutationResetRef.current = now;
      }

      lastTimeRef.current = now;
      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    rafIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isVisible, transitioningThreadCount, totalThreadCount]);

  // Expose mutation counter to parent
  useEffect(() => {
    // Create a global function for the animation to call when it mutates DOM
    (window as any).__timelineReportMutation = () => {
      mutationCountRef.current++;
    };

    return () => {
      delete (window as any).__timelineReportMutation;
    };
  }, []);

  if (!isVisible) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded cursor-pointer z-50"
        onClick={() => setIsVisible(true)}
        title="Click or press Ctrl+Shift+P to show performance stats"
      >
        📊 Timeline Perf
      </div>
    );
  }

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return "text-green-400";
    if (fps >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  const getMutationColor = (mutations: number) => {
    if (mutations <= 10) return "text-green-400";
    if (mutations <= 100) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white text-xs p-3 rounded-lg shadow-xl z-50 font-mono space-y-1 min-w-[280px]">
      <div className="flex justify-between items-center border-b border-white/20 pb-1 mb-2">
        <span className="font-bold">Timeline Performance</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white px-1"
          title="Click or press Ctrl+Shift+P to hide"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-white/60">FPS:</span>
        </div>
        <div className={`text-right font-bold ${getFpsColor(stats.fps)}`}>
          {stats.fps} fps
        </div>

        <div>
          <span className="text-white/60">Frame Time:</span>
        </div>
        <div className="text-right">
          {stats.frameTime.toFixed(2)} ms
        </div>

        <div>
          <span className="text-white/60">DOM Mutations:</span>
        </div>
        <div className={`text-right font-bold ${getMutationColor(stats.domMutations)}`}>
          {stats.domMutations}/sec
        </div>

        <div>
          <span className="text-white/60">Transitioning:</span>
        </div>
        <div className="text-right">
          {stats.transitioningThreads} / {stats.totalThreads}
        </div>

        <div className="col-span-2 border-t border-white/20 pt-1 mt-1">
          <div className="text-white/40 text-[10px]">
            Press <kbd className="px-1 bg-white/10 rounded">Ctrl+Shift+P</kbd> to toggle
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 pt-2 mt-2 space-y-1">
        <div className="text-[10px] text-white/60">
          ✅ Green: Excellent | ⚠️ Yellow: Acceptable | 🔴 Red: Poor
        </div>
        <div className="text-[10px] text-white/60">
          Target: 60 FPS, &lt;10 mutations/sec
        </div>
      </div>
    </div>
  );
}
