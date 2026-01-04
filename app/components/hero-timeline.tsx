"use client";

import { TransitionLink } from "./transition-link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

type TimelineStep = {
  icon: IconSvgElement;
  shortLabel: string;
  fullTitle: string;
  description: string;
  link: string;
  isExternal?: boolean;
  badge?: string; // Optional badge like "200+ members"
};

interface HeroTimelineProps {
  steps: TimelineStep[];
  locale: string;
}

export function HeroTimeline({ steps, locale }: HeroTimelineProps) {
  return (
    <nav className="hero-timeline" aria-label="Your journey with BAISH">
      {/* The connecting line with glow */}
      <div className="timeline-track" aria-hidden="true">
        <div className="timeline-line" />
        <div className="timeline-glow" />
      </div>

      {/* Timeline steps */}
      <ol className="timeline-steps" role="list">
        {steps.map((step, index) => {
          const stepId = `timeline-step-${index}`;
          const descId = `timeline-desc-${index}`;

          return (
            <li
              key={step.shortLabel}
              className="timeline-step"
              style={{ "--step-index": index } as React.CSSProperties}
            >
              {step.isExternal ? (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="timeline-node"
                  aria-labelledby={stepId}
                  aria-describedby={descId}
                >
                  <span className="timeline-icon">
                    <HugeiconsIcon icon={step.icon} size={28} strokeWidth={1.5} />
                  </span>
                  <span className="timeline-ring" aria-hidden="true" />
                </a>
              ) : (
                <TransitionLink
                  href={`/${locale}${step.link}`}
                  className="timeline-node"
                  aria-labelledby={stepId}
                  aria-describedby={descId}
                >
                  <span className="timeline-icon">
                    <HugeiconsIcon icon={step.icon} size={28} strokeWidth={1.5} />
                  </span>
                  <span className="timeline-ring" aria-hidden="true" />
                </TransitionLink>
              )}
              <div className="timeline-content">
                <span className="timeline-label" id={stepId}>
                  {step.shortLabel}
                  {step.badge && (
                    <span className="timeline-badge">{step.badge}</span>
                  )}
                </span>
                {/* Description is always in DOM for screen readers, visually shown as tooltip on desktop */}
                <span className="timeline-tooltip" id={descId} role="tooltip">
                  {step.description}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
