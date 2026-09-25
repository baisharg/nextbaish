import type { ReactNode } from "react";
import { ThreadSet } from "@/app/components/thread-set";
import { SmartLink } from "./smart-link";
import type { AppLocale } from "@/i18n.config";

/**
 * Opening band shared by the inner lab pages: breadcrumb, serif title, lede
 * and optional jump links on the left, and the signature thread animation in
 * the right column, like the home hero. On phones the threads take a band
 * below the text.
 */
export function TitleBand({
  locale,
  homeLabel,
  eyebrow,
  title,
  lede,
  jumpLabel,
  jumps,
}: {
  locale: AppLocale;
  homeLabel: string;
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  jumpLabel?: string;
  jumps?: { href: string; label: string }[];
}) {
  return (
    <section className="lab-title-band">
      <ThreadSet scene="free" />
      <div className="lab-wrap lab-title-grid">
        <div className="lab-title-copy lab-veil">
        <p className="lab-kicker">
          <SmartLink href="/lab" locale={locale} className="lab-crumb">
            {homeLabel}
          </SmartLink>
          <span aria-hidden="true"> / </span>
          {eyebrow}
        </p>
        <h1 className="lab-display lab-display-sm">{title}</h1>
        {lede && <div className="lab-lede lab-title-lede">{lede}</div>}
        {jumps && jumps.length > 0 && (
          <nav className="lab-jumps" aria-label={jumpLabel}>
            {jumps.map((jump) => (
              <a key={jump.href} href={jump.href} className="lab-link lab-link-sm">
                {jump.label}
                <span aria-hidden="true">↓</span>
              </a>
            ))}
          </nav>
        )}
        </div>
        <div
          className="lab-title-box lab-box-wide"
          data-thread-box
          aria-hidden="true"
        />
      </div>
      <div
        className="lab-title-band-narrow lab-box-narrow"
        data-thread-box
        aria-hidden="true"
      />
    </section>
  );
}
