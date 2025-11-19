"use client";

import { useRouter } from "next/navigation";

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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const performScroll = () => {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Call the custom onClick handler if provided
    onClick?.(e);

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
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
