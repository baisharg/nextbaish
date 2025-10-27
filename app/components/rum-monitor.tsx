"use client";

import { useEffect } from "react";

type VercelAnalyticsClient = (
  eventName: "beforeSend" | "event" | "pageview",
  payload?: Record<string, unknown>,
) => void;

/**
 * Real User Monitoring (RUM) component
 * Measures Core Web Vitals (LCP, FID, CLS, INP, TTFB) and sends to analytics
 */
export default function RUMMonitor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDev = process.env.NODE_ENV === "development";
    const device = () => (window.innerWidth >= 1024 ? "desktop" : "mobile");

    const getAnalyticsClient = (): VercelAnalyticsClient | undefined => {
      const candidate = (window as typeof window & { va?: unknown }).va;
      return typeof candidate === "function" ? candidate : undefined;
    };

    // Helper to send metrics to Vercel Analytics
    const sendMetric = (name: string, value: number, rating?: string) => {
      const metric = {
        name,
        value,
        device: device(),
        rating,
        pathname: window.location.pathname,
      };

      // Log in development
      if (isDev) {
        console.warn(
          `[RUM] ${name} (${metric.device}):`,
          value.toFixed(2),
          "ms",
          rating ? `[${rating}]` : "",
        );
      }

      getAnalyticsClient()?.("event", metric);
    };

    // Helper to determine rating based on Web Vitals thresholds
    const getLCPRating = (value: number) => {
      if (value <= 2500) return "good";
      if (value <= 4000) return "needs-improvement";
      return "poor";
    };

    const getFIDRating = (value: number) => {
      if (value <= 100) return "good";
      if (value <= 300) return "needs-improvement";
      return "poor";
    };

    const getCLSRating = (value: number) => {
      if (value <= 0.1) return "good";
      if (value <= 0.25) return "needs-improvement";
      return "poor";
    };

    const getINPRating = (value: number) => {
      if (value <= 200) return "good";
      if (value <= 500) return "needs-improvement";
      return "poor";
    };

    const getTTFBRating = (value: number) => {
      if (value <= 800) return "good";
      if (value <= 1800) return "needs-improvement";
      return "poor";
    };

    // Measure LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as
        | LargestContentfulPaint
        | undefined;

      if (lastEntry) {
        const lcpTime =
          lastEntry.renderTime ??
          lastEntry.loadTime ??
          lastEntry.startTime ??
          0;
        sendMetric("LCP", lcpTime, getLCPRating(lcpTime));
      }
    });

    try {
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (error) {
      if (isDev) console.warn("[RUM] LCP observation not supported", error);
    }

    // Measure FID (First Input Delay) - Legacy metric, being replaced by INP
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        const fidTime = fidEntry.processingStart - fidEntry.startTime;
        sendMetric("FID", fidTime, getFIDRating(fidTime));
      });
    });

    try {
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (error) {
      if (isDev) console.warn("[RUM] FID observation not supported", error);
    }

    // Measure INP (Interaction to Next Paint) - New responsiveness metric
    // Using event timing API which measures interaction latency
    let worstINP = 0;
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEventTiming;
        // Duration property gives the total interaction latency
        const inpTime = eventEntry.duration || 0;
        if (inpTime > worstINP && inpTime > 40) {
          worstINP = inpTime;
        }
      }
    });

    try {
      const eventObserverInit: PerformanceObserverInit & {
        durationThreshold?: number;
      } = {
        type: "event",
        buffered: true,
        durationThreshold: 40,
      };
      inpObserver.observe(eventObserverInit);
    } catch (error) {
      if (isDev) console.warn("[RUM] INP observation not supported", error);
    }

    // Measure TTFB (Time to First Byte)
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const navigationEntry = entry as PerformanceNavigationTiming;
        const ttfb =
          navigationEntry.responseStart - navigationEntry.requestStart;
        if (ttfb > 0) {
          sendMetric("TTFB", ttfb, getTTFBRating(ttfb));
        }
      });
    });

    try {
      navigationObserver.observe({ type: "navigation", buffered: true });
    } catch (error) {
      if (isDev) console.warn("[RUM] Navigation timing not supported", error);
    }

    // Measure CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as LayoutShift;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
    });

    try {
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (error) {
      if (isDev) console.warn("[RUM] CLS observation not supported", error);
    }

    // Report CLS and INP on page visibility change or unload
    const reportFinalMetrics = () => {
      sendMetric("CLS", clsValue, getCLSRating(clsValue));

      if (worstINP > 0) {
        sendMetric("INP", worstINP, getINPRating(worstINP));
      }
    };

    // Report CLS and INP on visibility change (user leaving page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        reportFinalMetrics();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Report CLS and INP on page unload as fallback
    window.addEventListener("beforeunload", reportFinalMetrics);

    // Cleanup
    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
      navigationObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", reportFinalMetrics);
    };
  }, []);

  return null; // This component doesn't render anything
}
