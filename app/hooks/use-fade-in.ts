"use client";

import { useEffect, useRef, useState } from "react";

interface UseFadeInOptions {
  threshold?: number;
  delay?: number;
}

export function useFadeIn(options?: UseFadeInOptions) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (options?.delay) {
            setTimeout(() => setIsVisible(true), options.delay);
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

    return () => observer.disconnect();
  }, [options?.threshold, options?.delay]);

  return { ref, isVisible };
}
