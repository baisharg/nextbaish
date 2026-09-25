"use client";

import { useEffect } from "react";
import { pulseAll } from "../utils/thread-director";
import { stepScrollY } from "../utils/thread-steps";

const PULSE_THREADS = 14;

/**
 * Page-level wiring for pages whose sections carry their own ThreadSets.
 * Mount once per page. It:
 *
 * - hides the site-wide background canvas (`html[data-threads="sections"]`),
 * - sends highlights along the threads when any `[data-thread-pulse]` element
 *   is hovered or focused,
 * - makes `[data-step-target="<index>"]` buttons in a stepped section jump to
 *   that step, and scrolls a step into place when something inside
 *   `[data-step="<index>"]` gets focus, so keyboard users reach every step.
 */
export function ThreadPage() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.threads = "sections";

    let lastPulsed: Element | null = null;
    const handlePulse = (event: Event) => {
      const target = (event.target as Element | null)?.closest(
        "[data-thread-pulse]",
      );
      if (target && target !== lastPulsed) pulseAll(PULSE_THREADS);
      lastPulsed = target ?? null;
    };

    const goToStep = (target: Element | null) => {
      const section = target?.closest<HTMLElement>("[data-thread-steps]");
      if (!target || !section) return false;
      const stepEl = target.closest<HTMLElement>(
        "[data-step-target], [data-step]",
      );
      const index = Number(
        stepEl?.dataset.stepTarget ?? stepEl?.dataset.step ?? NaN,
      );
      if (Number.isNaN(index)) return false;
      if (section.dataset.activeStep === String(index)) return true;
      const count = section.dataset.threadSteps?.split(",").length ?? 1;
      window.scrollTo({ top: stepScrollY(section, index, count) });
      return true;
    };

    const handleStepClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest(
        "[data-step-target]",
      );
      if (button && goToStep(button)) event.preventDefault();
    };

    const handleStepFocus = (event: FocusEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-step]")) goToStep(target);
    };

    document.addEventListener("pointerover", handlePulse, { passive: true });
    document.addEventListener("focusin", handlePulse);
    document.addEventListener("click", handleStepClick);
    document.addEventListener("focusin", handleStepFocus);

    return () => {
      document.removeEventListener("pointerover", handlePulse);
      document.removeEventListener("focusin", handlePulse);
      document.removeEventListener("click", handleStepClick);
      document.removeEventListener("focusin", handleStepFocus);
      delete root.dataset.threads;
    };
  }, []);

  return null;
}
