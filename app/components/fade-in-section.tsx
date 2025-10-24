"use client";

import { useFadeIn } from "@/app/hooks/use-fade-in";
import React from "react";

type AnimationVariant =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale";

interface FadeInSectionProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  duration?: number;
  delay?: number; // CSS transition delay in ms
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  as?: React.ElementType;
  startVisible?: boolean; // Start visible for above-the-fold content to improve LCP
}

const variantClasses: Record<
  AnimationVariant,
  { hidden: string; visible: string }
> = {
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  "slide-up": {
    hidden: "opacity-0 translate-y-4", // Reduced from 8 for subtler movement
    visible: "opacity-100 translate-y-0",
  },
  "slide-down": {
    hidden: "opacity-0 -translate-y-4",
    visible: "opacity-100 translate-y-0",
  },
  "slide-left": {
    hidden: "opacity-0 translate-x-4",
    visible: "opacity-100 translate-x-0",
  },
  "slide-right": {
    hidden: "opacity-0 -translate-x-4",
    visible: "opacity-100 translate-x-0",
  },
  scale: {
    hidden: "opacity-0 scale-98", // More subtle scale
    visible: "opacity-100 scale-100",
  },
};

export function FadeInSection({
  children,
  variant = "slide-up",
  duration = 400, // Reduced from 700ms for snappier feel
  delay = 0,
  threshold = 0.05,
  rootMargin = "50px",
  triggerOnce = true,
  className = "",
  as: Component = "div",
  startVisible = false,
}: FadeInSectionProps) {
  const { ref, isVisible } = useFadeIn({
    threshold,
    rootMargin,
    triggerOnce,
    startVisible,
  });

  const variantClass = variantClasses[variant];
  const durationClass = `duration-${duration}`;
  const delayClass = delay > 0 ? `delay-${delay}` : "";

  return (
    <Component
      ref={ref}
      className={`transition-all ease-out ${durationClass} ${delayClass} ${
        isVisible ? variantClass.visible : variantClass.hidden
      } ${className}`}
    >
      {children}
    </Component>
  );
}
