"use client";

import { useRef, useState, useEffect } from "react";

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
            className="rounded-xl border-0"
            style={{ maxWidth: "800px" }}
          />
        ) : (
          <div className="flex h-[450px] w-full max-w-[800px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            {calendarPlaceholder}
          </div>
        )}
      </div>
      <div className="flex justify-center mt-6">
        <a
          href="https://www.google.com/calendar/render?cid=http%3A%2F%2Fapi.lu.ma%2Fics%2Fget%3Fentity%3Dcalendar%26id%3Dcal-0oFAsTn5vpwcAwb"
          className="button-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {subscribeText}
        </a>
      </div>
    </>
  );
}
