"use client";

import { useEffect, useRef, useState } from "react";

interface UseFadeInOptions {
  threshold?: number;
  delay?: number;
}

export function useFadeIn(options?: UseFadeInOptions) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    // Track mount time to detect immediate intersections (View Transitions)
    mountTimeRef.current = performance.now();

    let timeoutId: number | null = null;
    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timeSinceMount = performance.now() - mountTimeRef.current;

          // If intersection happens immediately (< 100ms), likely from View Transition
          // Skip animation to prevent double-animation effect
          if (timeSinceMount < 100) {
            setIsVisible(true);
            observer.disconnect();
            return;
          }

          // Normal scroll-based animation with optional delay
          if (options?.delay) {
            timeoutId = window.setTimeout(() => {
              if (!cancelled) {
                setIsVisible(true);
              }
            }, options.delay);
          } else {
            setIsVisible(true);
          }
          observer.disconnect(); // Only animate once, then cleanup
        }
      },
      { threshold: options?.threshold ?? 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [options?.threshold, options?.delay]);

  return { ref, isVisible };
}
