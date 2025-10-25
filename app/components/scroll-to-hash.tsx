"use client";

import { useEffect } from "react";

/**
 * ScrollToHash - Instantly scrolls to hash anchor on mount
 *
 * This component reads the URL hash and scrolls to the target element
 * as early as possible, preventing jarring scroll behavior after
 * view transitions complete.
 */
export function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) return;

    // Remove the # from the hash
    const id = hash.substring(1);

    // Try to scroll immediately
    const scrollToElement = () => {
      const element = document.getElementById(id);

      if (element) {
        // Instant scroll - no smooth behavior
        element.scrollIntoView({
          behavior: "auto", // Important: "auto" = instant
          block: "start"
        });
        return true;
      }
      return false;
    };

    // Try immediately
    if (!scrollToElement()) {
      // If element not found, wait for next frame
      requestAnimationFrame(() => {
        scrollToElement();
      });
    }
  }, []); // Empty deps = only run once on mount

  return null;
}
