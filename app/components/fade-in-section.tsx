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
  delay?: number;
  threshold?: number;
  className?: string;
  as?: React.ElementType;
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
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  "slide-down": {
    hidden: "opacity-0 -translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  "slide-left": {
    hidden: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  "slide-right": {
    hidden: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  scale: {
    hidden: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
};

export function FadeInSection({
  children,
  variant = "slide-up",
  duration = 700,
  delay = 0,
  threshold = 0.1,
  className = "",
  as: Component = "div",
}: FadeInSectionProps) {
  const { ref, isVisible } = useFadeIn({ threshold, delay });

  const variantClass = variantClasses[variant];
  const durationClass = `duration-${duration}`;

  return (
    <Component
      ref={ref}
      className={`transition-all ease-out ${durationClass} ${
        isVisible ? variantClass.visible : variantClass.hidden
      } ${className}`}
    >
      {children}
    </Component>
  );
}
