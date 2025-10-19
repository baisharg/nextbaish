"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link>;

/**
 * TransitionLink - Drop-in replacement for Next.js Link with View Transitions
 *
 * Uses the View Transitions API to create smooth page transitions.
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
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      router.push(href.toString());
      return;
    }

    // Start view transition
    document.startViewTransition(() => {
      router.push(href.toString());
    });
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
