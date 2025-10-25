"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { Dictionary } from "@/app/[locale]/dictionaries";

type Props = {
  t: Dictionary["substack"];
};

export default function SupascribeSignup({ t }: Props) {
  const copy = t;
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="min-h-[280px]">
      {isVisible ? (
        <article className="card-glass">
          <div className="card-eyebrow">{copy.eyebrow}</div>
          <h3 className="card-title">{copy.title}</h3>
          <p className="card-body">{copy.description}</p>

          <div className="mt-auto">
            {/* Supascribe embed */}
            <div data-supascribe-embed-id="737154090797" data-supascribe-subscribe></div>

            {/* Supascribe Script - only load when component is visible */}
            <Script
              src="https://js.supascribe.com/v1/loader/kjPdENDABbSEr1PA5UFDwB8n8xS2.js"
              strategy="lazyOnload"
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
