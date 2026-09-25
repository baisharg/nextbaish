import type { ReactNode } from "react";
import { TransitionLink } from "@/app/components/transition-link";
import { withLocale } from "@/app/utils/locale";
import type { AppLocale } from "@/i18n.config";

export const isExternal = (href: string) =>
  href.startsWith("http") || href.startsWith("mailto:");

/**
 * Internal paths get the locale prefix and a view transition; in-page anchors
 * and external URLs are plain links (external ones open in a new tab).
 */
export function SmartLink({
  href,
  locale,
  className,
  children,
  ...rest
}: {
  href: string;
  locale: AppLocale;
  className?: string;
  children: ReactNode;
  "data-thread-pulse"?: boolean;
}) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <TransitionLink
      href={withLocale(locale, href)}
      className={className}
      {...rest}
    >
      {children}
    </TransitionLink>
  );
}
