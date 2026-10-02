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

/**
 * The pinned frame inside a stepped section (`[data-step-pin]`): where it
 * sticks (its CSS `top`) and how tall it is. Without one, the section pins
 * a full viewport at the top.
 */
function pinOf(section: HTMLElement) {
  const pin = section.querySelector<HTMLElement>("[data-step-pin]");
  if (!pin) return { top: 0, height: window.innerHeight };
  return {
    top: parseFloat(getComputedStyle(pin).top) || 0,
    height: pin.offsetHeight,
  };
}

/** Where a stepped section is in its scroll, as a step and a morph */
export function stepState(section: HTMLElement, count: number): StepState {
  const rect = section.getBoundingClientRect();
  const pin = pinOf(section);
  const travel = Math.max(rect.height - pin.height, 1);
  const progress = clamp01((pin.top - rect.top) / travel) * count;
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
  const pin = pinOf(section);
  const top = section.getBoundingClientRect().top + window.scrollY - pin.top;
  const travel = Math.max(section.offsetHeight - pin.height, 1);
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
