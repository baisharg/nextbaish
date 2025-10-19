"use client";

import { useEffect, useRef, useState } from "react";

interface UseFadeInOptions {
  threshold?: number;
  delay?: number;
  startVisible?: boolean; // New option to start visible for above-the-fold content
}

export function useFadeIn(options?: UseFadeInOptions) {
  const ref = useRef<HTMLElement>(null);
  // Start visible for above-the-fold content to improve LCP
  const [isVisible, setIsVisible] = useState(options?.startVisible ?? false);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    const element = ref.current;
    if (!element) return;

    // Check if element is already visible in viewport on mount
    // This handles: View Transitions, back button, and scroll-up cases
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport) {
      // Element already visible - show immediately without animation
      // Prevents double-animation and re-animation on scroll up
      setIsVisible(true);
      return;
    }

    // Element not visible yet - set up observer for scroll-based animation
    let timeoutId: number | null = null;
    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timeSinceMount = performance.now() - mountTimeRef.current;

          // If intersection happens very quickly (< 400ms), likely from View Transition
          // or back navigation - skip animation delay
          if (timeSinceMount < 400 || !options?.delay) {
            setIsVisible(true);
          } else {
            // Normal scroll-based animation with delay
            timeoutId = window.setTimeout(() => {
              if (!cancelled) {
                setIsVisible(true);
              }
            }, options.delay);
          }
          observer.disconnect(); // Only animate once, then cleanup
        }
      },
      { threshold: options?.threshold ?? 0.1 }
    );

    observer.observe(element);

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
