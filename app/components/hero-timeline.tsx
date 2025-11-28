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
};

interface HeroTimelineProps {
  steps: TimelineStep[];
  locale: string;
}

export function HeroTimeline({ steps, locale }: HeroTimelineProps) {
  return (
    <div className="hero-timeline">
      {/* The connecting line with glow */}
      <div className="timeline-track" aria-hidden="true">
        <div className="timeline-line" />
        <div className="timeline-glow" />
      </div>

      {/* Timeline steps */}
      <div className="timeline-steps">
        {steps.map((step, index) => (
          <div
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
                aria-label={`${step.fullTitle}: ${step.description}`}
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
                aria-label={`${step.fullTitle}: ${step.description}`}
              >
                <span className="timeline-icon">
                  <HugeiconsIcon icon={step.icon} size={28} strokeWidth={1.5} />
                </span>
                <span className="timeline-ring" aria-hidden="true" />
              </TransitionLink>
            )}
            <div className="timeline-content">
              <span className="timeline-label">{step.shortLabel}</span>
              <span className="timeline-tooltip">{step.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
