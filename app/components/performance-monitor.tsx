"use client";

import { useEffect } from "react";
import { onCLS, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

type VercelAnalyticsClient = (
  eventName: "beforeSend" | "event" | "pageview",
  payload?: Record<string, unknown>,
) => void;

const ANALYTICS_RETRY_MS = 150;
const MAX_VA_RETRIES = 3;

export function PerformanceMonitor() {
  useEffect(() => {
    const sentMetricIds = new Set<string>();
    const isDev = process.env.NODE_ENV === "development";

    const getVercelAnalyticsClient = (): VercelAnalyticsClient | undefined => {
      const candidate = (window as typeof window & { va?: unknown }).va;
      return typeof candidate === "function" ? candidate : undefined;
    };

    const sendToVercel = (payload: Record<string, unknown>) => {
      const trySend = (attempt: number) => {
        const analyticsClient = getVercelAnalyticsClient();
        if (analyticsClient) {
          analyticsClient("event", payload);
          return;
        }

        if (attempt < MAX_VA_RETRIES) {
          window.setTimeout(() => trySend(attempt + 1), ANALYTICS_RETRY_MS);
        }
      };

      trySend(0);
    };

    const sendMetric = (metric: Metric) => {
      const dedupeKey = `${metric.name}:${metric.id}`;
      if (sentMetricIds.has(dedupeKey)) {
        return;
      }
      sentMetricIds.add(dedupeKey);

      const payload = {
        metric: metric.name,
        value:
          metric.name === "CLS"
            ? Number(metric.value.toFixed(4))
            : Math.round(metric.value),
        rawValue: metric.value,
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType,
        device: window.innerWidth >= 1024 ? "desktop" : "mobile",
        page: window.location.pathname,
        timestamp: Date.now(),
      };

      if (isDev) {
        console.warn(
          `[RUM] ${metric.name} (${payload.device}):`,
          payload.rawValue,
          metric.rating ? `[${metric.rating}]` : "",
        );
      }

      sendToVercel(payload);
    };

    onLCP(sendMetric);
    onCLS(sendMetric);
    onTTFB(sendMetric);
    onINP(sendMetric);
  }, []);

  return null;
}
