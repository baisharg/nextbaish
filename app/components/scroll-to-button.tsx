"use client";

import { useRouter } from "next/navigation";

interface ScrollToButtonProps {
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
}: ScrollToButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const performScroll = () => {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (navigateTo) {
      // Navigate to the page first, then scroll after navigation
      router.push(navigateTo);
      // Small delay to allow DOM to render before scrolling
      setTimeout(performScroll, 100);
    } else {
      // Just scroll on current page
      performScroll();
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
