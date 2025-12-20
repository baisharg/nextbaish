"use client";

import { ArrowRight02Icon, Notification03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface SurveyBannerProps {
  badge: string;
  title: string;
  description: string;
  cta: string;
  surveyUrl: string;
}

export function SurveyBanner({
  badge,
  title,
  description,
  cta,
  surveyUrl,
}: SurveyBannerProps) {
  return (
    <a
      href={surveyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="survey-banner group"
    >
      {/* Animated background glow */}
      <div className="survey-glow" aria-hidden="true" />

      {/* Shimmer effect */}
      <div className="survey-shimmer" aria-hidden="true" />

      {/* Content container */}
      <div className="survey-content">
        {/* Left side: Icon + Badge */}
        <div className="survey-left">
          <div className="survey-icon-wrap">
            <HugeiconsIcon icon={Notification03Icon} size={20} />
          </div>
          <span className="survey-badge">{badge}</span>
        </div>

        {/* Center: Title + Description */}
        <div className="survey-center">
          <span className="survey-title">{title}</span>
          <span className="survey-desc">{description}</span>
        </div>

        {/* Right: CTA */}
        <div className="survey-cta">
          <span>{cta}</span>
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={18}
            className="survey-arrow"
          />
        </div>
      </div>
    </a>
  );
}
