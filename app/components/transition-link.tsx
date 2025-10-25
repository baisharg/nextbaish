"use client";

import { Link } from "next-view-transitions";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link> & {
  scroll?: boolean;
  prefetch?: boolean;
};

/**
 * TransitionLink - Drop-in replacement for Next.js Link with View Transitions
 *
 * Uses the View Transitions API via next-view-transitions library
 * to create smooth page transitions.
 * Gracefully falls back to instant navigation in unsupported browsers.
 *
 * @example
 * <TransitionLink href="/about">About</TransitionLink>
 * <TransitionLink href="/es" prefetch={false}>Español</TransitionLink>
 */
export function TransitionLink({
  href,
  children,
  scroll = true,
  prefetch = true,
  ...props
}: TransitionLinkProps) {
  return (
    <Link href={href} scroll={scroll} prefetch={prefetch} {...props}>
      {children}
    </Link>
  );
}
