"use client";

import { useState, useEffect, useRef } from "react";

interface AirtableEmbedProps {
  /** Airtable share ID (e.g., shrOUDQGe7Ucei5OG) */
  shareId: string;
  /** Airtable application/base ID (e.g., appdsx5KxeooxGPFO) */
  appId: string;
  /** Airtable table ID (e.g., tblD1rFhCfD8p5lfU) */
  tableId?: string;
  /** Optional view ID for specific view (e.g., viwzA8k7kslbbYTzr) */
  viewId?: string;
  /** Show view controls in the embed */
  showViewControls?: boolean;
  /** Height of the embed (default: 600px) */
  height?: string;
  /** Width of the embed (default: 100%) */
  width?: string;
  /** Optional title for accessibility */
  title?: string;
  /** Optional loading text for placeholders */
  loadingText?: string;
}

export default function AirtableEmbed({
  shareId,
  appId,
  tableId,
  viewId,
  showViewControls = false,
  height = "600px",
  width = "100%",
  title = "Airtable Timeline View",
  loadingText = "Loading timeline...",
}: AirtableEmbedProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy load with IntersectionObserver
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
      { rootMargin: "300px" }, // Start loading 300px before visible
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Build the embed URL
  const buildEmbedUrl = () => {
    let url = `https://airtable.com/embed/${appId}/${shareId}`;

    if (tableId) {
      url += `/${tableId}`;
    }

    if (viewId) {
      url += `/${viewId}`;
    }

    const params = new URLSearchParams();
    if (!showViewControls) {
      params.append("showViewControls", "false");
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  };

  const embedUrl = buildEmbedUrl();

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {!isVisible ? (
        // Show placeholder while not visible
        <div className="flex items-center justify-center w-full h-full bg-slate-100 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">{loadingText}</p>
        </div>
      ) : (
        // Render iframe when visible
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loadingText}
                </p>
              </div>
            </div>
          )}
          <iframe
            className="rounded-lg border border-gray-200 dark:border-gray-700"
            src={embedUrl}
            width={width}
            height={height}
            style={{
              background: "transparent",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
            title={title}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
          />
        </>
      )}
    </div>
  );
}
