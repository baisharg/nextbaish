"use client";

import { useRouter } from "next/navigation";

const MAX_SCROLL_ATTEMPTS = 30;
const SCROLL_RETRY_MS = 50;

interface ScrollToButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  navigateTo?: string; // Optional page to navigate to before scrolling
}

export function ScrollToButton({
  targetId,
  children,
  className = "button-primary",
  navigateTo,
  onClick,
  ...props
}: ScrollToButtonProps) {
  const router = useRouter();

  const scrollToTarget = (attempt = 0) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (attempt >= MAX_SCROLL_ATTEMPTS) {
      return;
    }

    window.setTimeout(() => scrollToTarget(attempt + 1), SCROLL_RETRY_MS);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Call the custom onClick handler if provided
    onClick?.(e);
    if (e.defaultPrevented) return;

    if (navigateTo) {
      const destination = navigateTo.includes("#")
        ? navigateTo
        : `${navigateTo}#${targetId}`;
      router.push(destination);
      window.setTimeout(() => scrollToTarget(), 0);
    } else {
      // Just scroll on current page
      scrollToTarget();
    }
  };

  return (
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
