"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { Dictionary } from "@/app/[locale]/dictionaries";

type Props = {
  t: Dictionary["substack"];
};

export default function SupascribeSignup({ t }: Props) {
  const copy = t;
  const [isVisible, setIsVisible] = useState(false);
  const initializationAttemptedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryTimerRef = useRef<number | undefined>(undefined);

  // Lazy load form with IntersectionObserver
  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load 200px before visible
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const initializeSupascribe = useCallback(() => {
    const wrapper = containerRef.current;
    if (!wrapper) {
      return false;
    }

    const target = wrapper.querySelector<HTMLElement>("[data-supascribe-embed-id]");
    if (!target) {
      return false;
    }

    const embedId = target.getAttribute("data-supascribe-embed-id");
    if (!embedId) {
      return false;
    }

    const supascribe = (window as typeof window & {
      Supascribe?: {
        getWidget: (id: string) => unknown;
        createWidgetFromDOM?: (id: string, node: HTMLElement, type: string) => void;
        refreshAll?: (root?: HTMLElement) => void;
      };
    }).Supascribe;

    if (!supascribe) {
      return false;
    }

    const widgetType = "subscribe";

    try {
      if (!supascribe.getWidget(embedId)) {
        if (!supascribe.createWidgetFromDOM) {
          return false;
        }
        supascribe.createWidgetFromDOM(embedId, target, widgetType);
      } else {
        supascribe.refreshAll?.(target);
      }
    } catch (error) {
      console.error("Failed to initialize Supascribe embed", error);
      return false;
    }

    initializationAttemptedRef.current = true;
    return true;
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (initializationAttemptedRef.current) {
      return;
    }

    const attempt = () => {
      if (initializeSupascribe()) {
        if (retryTimerRef.current) {
          window.clearTimeout(retryTimerRef.current);
          retryTimerRef.current = undefined;
        }
        return;
      }

      retryTimerRef.current = window.setTimeout(attempt, 200);
    };

    attempt();

    return () => {
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = undefined;
      }
    };
  }, [initializeSupascribe, isVisible]);

  const handleScriptReady = useCallback(() => {
    if (!initializationAttemptedRef.current) {
      initializeSupascribe();
    }
  }, [initializeSupascribe]);

  return (
    <div ref={containerRef} className="min-h-[280px]">
      {isVisible ? (
        <article className="card-glass supascribe-card">
          <div className="card-eyebrow">{copy.eyebrow}</div>
          <h3 className="card-title">{copy.title}</h3>
          <p className="card-body">{copy.description}</p>

          <div className="mt-auto">
            {/* Supascribe embed */}
            <div data-supascribe-embed-id="737154090797" data-supascribe-subscribe></div>

            {/* Supascribe Script - only load when component is visible */}
            <Script
              src="https://js.supascribe.com/v1/loader/kjPdENDABbSEr1PA5UFDwB8n8xS2.js"
              strategy="afterInteractive"
              onReady={handleScriptReady}
              onLoad={handleScriptReady}
            />
          </div>
        </article>
      ) : (
        <div className="card-glass h-[280px] flex items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 mx-auto border-4 border-slate-200 border-t-[var(--color-accent-primary)] rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading newsletter signup...</p>
          </div>
        </div>
      )}
    </div>
  );
}
