"use client";

import { useEffect } from "react";

/**
 * Real User Monitoring (RUM) component
 * Measures Core Web Vitals (LCP, FID, CLS) and sends to analytics
 */
export default function RUMMonitor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Measure LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        const lcpTime = (lastEntry as any).renderTime || (lastEntry as any).loadTime || 0;
        const device = window.innerWidth >= 1024 ? "desktop" : "mobile";

        console.log(`[RUM] LCP (${device}):`, lcpTime.toFixed(2), "ms");

        // TODO: Send to Vercel Analytics when available
        // window.va("event", { name: "LCP", value: lcpTime, device });
      }
    });

    try {
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      console.warn("[RUM] LCP observation not supported");
    }

    // Measure FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fidTime = entry.processingStart - entry.startTime;
        const device = window.innerWidth >= 1024 ? "desktop" : "mobile";

        console.log(`[RUM] FID (${device}):`, fidTime.toFixed(2), "ms");

        // TODO: Send to Vercel Analytics when available
        // window.va("event", { name: "FID", value: fidTime, device });
      });
    });

    try {
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (e) {
      console.warn("[RUM] FID observation not supported");
    }

    // Measure CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as any;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
    });

    try {
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.warn("[RUM] CLS observation not supported");
    }

    // Report CLS on page visibility change or unload
    const reportCLS = () => {
      const device = window.innerWidth >= 1024 ? "desktop" : "mobile";
      console.log(`[RUM] CLS (${device}):`, clsValue.toFixed(4));

      // TODO: Send to Vercel Analytics when available
      // window.va("event", { name: "CLS", value: clsValue, device });
    };

    // Report CLS on visibility change (user leaving page)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        reportCLS();
      }
    });

    // Report CLS on page unload as fallback
    window.addEventListener("beforeunload", reportCLS);

    // Cleanup
    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      document.removeEventListener("visibilitychange", reportCLS);
      window.removeEventListener("beforeunload", reportCLS);
    };
  }, []);

  return null; // This component doesn't render anything
}
