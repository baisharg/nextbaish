"use client";

import { Link } from "next-view-transitions";
import { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link> & {
  scroll?: boolean;
  prefetch?: boolean;
};

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
