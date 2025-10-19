"use client";

import { Link } from "next-view-transitions";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link>;

/**
 * TransitionLink - Drop-in replacement for Next.js Link with View Transitions
 *
 * Uses the View Transitions API via next-view-transitions library
 * to create smooth page transitions.
 * Gracefully falls back to instant navigation in unsupported browsers.
 *
 * @example
 * <TransitionLink href="/about">About</TransitionLink>
 */
export function TransitionLink({
  href,
  children,
  ...props
}: TransitionLinkProps) {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
