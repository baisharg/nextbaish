"use client";

import { useEffect, useState, type ReactNode } from "react";

const storageKey = (id: string) => `baish-announcement-dismissed:${id}`;

/**
 * Dismissible strip for time-sensitive news. Dismissal is remembered per
 * announcement id, so a new announcement shows again. Storage can be
 * unavailable (private mode, blocked site data); then the bar just shows.
 */
export function AnnouncementBar({
  id,
  dismissLabel,
  children,
}: {
  id: string;
  dismissLabel: string;
  children: ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey(id))) setDismissed(true);
    } catch {
      // Storage blocked: keep showing the bar.
    }
  }, [id]);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey(id), "1");
    } catch {
      // Storage blocked: dismissal lasts for this page view only.
    }
  };

  return (
    <aside className="lab-announcement" aria-label={dismissLabel}>
      <div className="lab-wrap lab-announcement-inner">
        <p>{children}</p>
        <button
          type="button"
          className="lab-announcement-close"
          onClick={dismiss}
          aria-label={dismissLabel}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </aside>
  );
}
