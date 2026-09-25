/**
 * Scroll maths for pinned, stepped sections (`data-thread-steps`): scroll
 * progress through the section picks a step, holds it, then morphs into the
 * next one.
 */

/** Share of each step spent holding its shape before morphing to the next */
export const STEP_HOLD = 0.6;

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

export type StepState = {
  /** Step being held or morphed away from */
  index: number;
  /** 0..1 progress of the morph into index + 1 */
  morph: number;
  /** Step whose copy should show */
  active: number;
};

/** Where a stepped section is, given its bounding rect and the viewport */
export function stepState(rect: DOMRect, count: number): StepState {
  const vh = window.innerHeight;
  const travel = Math.max(rect.height - vh, 1);
  const progress = clamp01(-rect.top / travel) * count;
  const index = Math.min(Math.floor(progress), count - 1);
  const within = progress - index;
  const morph =
    index < count - 1 ? smooth((within - STEP_HOLD) / (1 - STEP_HOLD)) : 0;
  return { index, morph, active: morph > 0.5 ? index + 1 : index };
}

/** Scroll position at which a stepped section shows `index` (mid-hold) */
export function stepScrollY(
  section: HTMLElement,
  index: number,
  count: number,
) {
  const top = section.getBoundingClientRect().top + window.scrollY;
  const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
  return top + (travel * (index + STEP_HOLD / 2)) / count;
}

/** Mark the active step on the section and its `[data-step-target]` buttons */
export function setActiveStep(section: HTMLElement, active: number) {
  if (section.dataset.activeStep === String(active)) return;
  section.dataset.activeStep = String(active);
  for (const button of section.querySelectorAll<HTMLElement>(
    "[data-step-target]",
  )) {
    if (Number(button.dataset.stepTarget) === active) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  }
}
