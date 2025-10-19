'use client';

import { useState, useEffect } from 'react';

export function useLCPComplete() {
  const [isLCPComplete, setIsLCPComplete] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        // Wait a bit after LCP to ensure it's final
        timeoutId = setTimeout(() => {
          setIsLCPComplete(true);
          observer.disconnect();
        }, 100);
      }
    });

    try {
      observer.observe({
        type: 'largest-contentful-paint',
        buffered: true
      });
    } catch (e) {
      // Fallback if LCP not supported
      timeoutId = setTimeout(() => setIsLCPComplete(true), 2000);
    }

    // Fallback timeout - load after 3s regardless
    const fallbackTimeout = setTimeout(() => {
      setIsLCPComplete(true);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeout);
      observer.disconnect();
    };
  }, []);

  return isLCPComplete;
}
