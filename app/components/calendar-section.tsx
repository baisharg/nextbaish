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
