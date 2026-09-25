"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  createThreadChannel,
  registerChannel,
  type CanvasBox,
  type SceneTarget,
} from "../utils/thread-director";
import type { SceneId } from "../utils/thread-scenes";

/**
 * Thread count per scene, relative to the device's full count. Thin divider
 * bands read the same with far fewer threads, and every thread costs GPU
 * time on phones.
 */
const SCENE_THREAD_SCALE: Partial<Record<SceneId, number>> = {
  horizon: 0.6,
};
import { setActiveStep, stepState } from "../utils/thread-steps";

const TimelineThreads = dynamic(() => import("./timeline-threads"), {
  ssr: false,
});

/**
 * One set of threads, drawn in its own canvas that fills the parent section
 * (which must be positioned) and scrolls with it like any other content. The
 * shape is laid out inside the first visible `[data-thread-box]` in the
 * section; without one it uses the whole section.
 *
 * With `steps`, the set sits in a pinned section: scroll progress through the
 * nearest `[data-thread-steps]` ancestor picks the shape, morphs between
 * shapes, and marks the active step for the copy.
 */
export function ThreadSet({
  scene,
  steps,
  bleed,
}: {
  scene?: SceneId;
  steps?: SceneId[];
  /** Extra canvas above and below the section, so threads can overhang it */
  bleed?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [channel] = useState(createThreadChannel);
  // Steps arrive as a fresh array literal each render; key the effect on
  // their contents instead.
  const stepsKey = steps?.join(",") ?? "";
  const [near, setNear] = useState(false);

  // Only spin up a canvas (worker, GPU context) once the section is close.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => registerChannel(channel), [channel]);

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;
    const stepIds = stepsKey ? (stepsKey.split(",") as SceneId[]) : [];
    const stepped = stepIds.length
      ? section.closest<HTMLElement>("[data-thread-steps]")
      : null;

    // Relative to this set's own area, which scrolls with the box, so the
    // result does not depend on when it is measured.
    const boxOf = (): CanvasBox => {
      const area = el.getBoundingClientRect();
      const w = area.width || 1;
      const h = area.height || 1;
      const rel = (r: DOMRect): CanvasBox => [
        (r.left - area.left) / w,
        (r.top - area.top) / h,
        (r.right - area.left) / w,
        (r.bottom - area.top) / h,
      ];
      for (const box of section.querySelectorAll<HTMLElement>(
        "[data-thread-box]",
      )) {
        const r = box.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return rel(r);
      }
      return rel(section.getBoundingClientRect());
    };

    const update = () => {
      const box = boxOf();
      let targets: SceneTarget[];
      if (stepped) {
        const state = stepState(stepped.getBoundingClientRect(), stepIds.length);
        setActiveStep(stepped, state.active);
        // Reduced motion: switch shapes at the step boundary instead of
        // morphing as the page scrolls.
        if (reducedMotion.matches) {
          state.index = state.active;
          state.morph = 0;
        }
        targets = stepIds.map((id, i) => ({
          key: id,
          id,
          weight:
            i === state.index
              ? 1 - state.morph
              : i === state.index + 1
                ? state.morph
                : 0,
          box,
        }));
      } else if (scene) {
        targets = [{ key: scene, id: scene, weight: 1, box }];
      } else {
        return;
      }
      channel.setTargets(targets);
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.addEventListener("change", update);
    update();
    const resize = new ResizeObserver(update);
    resize.observe(section);
    window.addEventListener("resize", update, { passive: true });
    // Only stepped sets change with scroll; the rest move with the page.
    if (stepped) {
      window.addEventListener("scroll", update, { passive: true });
    }
    return () => {
      resize.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, [channel, scene, stepsKey]);

  return (
    <div
      ref={ref}
      className="thread-set"
      aria-hidden="true"
      style={bleed ? ({ "--thread-bleed": bleed } as CSSProperties) : undefined}
    >
      {near && (
        <TimelineThreads
          className="absolute inset-0"
          channel={channel}
          threadScale={scene ? (SCENE_THREAD_SCALE[scene] ?? 1) : 1}
        />
      )}
    </div>
  );
}
