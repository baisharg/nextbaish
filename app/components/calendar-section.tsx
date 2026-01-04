"use client";

import { useRef, useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";

interface CalendarSectionProps {
  calendarPlaceholder: string;
  subscribeText: string;
}

export default function CalendarSection({
  calendarPlaceholder,
  subscribeText,
}: CalendarSectionProps) {
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const node = calendarContainerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setCalendarVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="flex justify-center" ref={calendarContainerRef}>
        {calendarVisible ? (
          <div className="relative w-full max-w-[800px]">
            {/* Loading skeleton - shows until iframe loads */}
            {!iframeLoaded && (
              <div className="absolute inset-0 calendar-skeleton flex h-[450px] w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)]/10 to-[var(--color-accent-secondary)]/10 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        size={28}
                        className="text-[var(--color-accent-primary)] animate-pulse"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent-primary)]/20 animate-ping" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">{calendarPlaceholder}</p>
                    <div className="flex justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <iframe
              title="BAISH Event Calendar"
              src="https://lu.ma/embed/calendar/cal-0oFAsTn5vpwcAwb/events?lt=light"
              width="100%"
              height="450"
              frameBorder="0"
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className={`rounded-xl border-0 transition-opacity duration-500 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        ) : (
          <div className="calendar-skeleton flex h-[450px] w-full max-w-[800px] items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-200/60 flex items-center justify-center">
                <HugeiconsIcon icon={Calendar03Icon} size={24} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">{calendarPlaceholder}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-6">
        <a
          href="https://www.google.com/calendar/render?cid=http%3A%2F%2Fapi.lu.ma%2Fics%2Fget%3Fentity%3Dcalendar%26id%3Dcal-0oFAsTn5vpwcAwb"
          className="button-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HugeiconsIcon icon={Calendar03Icon} size={18} />
          {subscribeText}
        </a>
      </div>
    </>
  );
}
