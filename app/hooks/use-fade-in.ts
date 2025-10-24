"use client";

import { useEffect, useRef, useState } from "react";

interface UseFadeInOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  startVisible?: boolean; // Start visible for above-the-fold content to improve LCP
}

export function useFadeIn(options?: UseFadeInOptions) {
  const {
    threshold = 0.05, // Lower threshold for faster response
    rootMargin = "50px", // Trigger 50px before entering viewport
    triggerOnce = true,
    startVisible = false,
  } = options ?? {};

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(startVisible);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already visible (above-the-fold), skip observer setup
    if (startVisible) return;

    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with improved settings
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          // Disconnect after first trigger for better performance
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!triggerOnce) {
          // Allow re-triggering if triggerOnce is false
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, startVisible]);

  return { ref, isVisible };
}
