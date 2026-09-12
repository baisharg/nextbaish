import { Fragment } from "react";
import Image from "next/image";
import { ExternalLinkIcon } from "@/app/components/external-link-icon";
import type { Funder, FunderCtaKey } from "@/app/data/funders";

type FunderCopy = { name: string; program: string; description: string };

const LINK_CLASS =
  "inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:underline font-medium text-sm";

/**
 * Funder card on the About page. Shows the logo when there is one, otherwise
 * the funder's name as a heading, then the program, description and links.
 */
export function FunderCard({
  funder,
  copy,
  ctaLabels,
}: {
  funder: Funder;
  copy: FunderCopy;
  ctaLabels: Record<FunderCtaKey, string>;
}) {
  return (
    <article className="card-glass relative overflow-hidden text-left">
      <div className="absolute inset-y-0 right-[-20%] w-1/2 rounded-full bg-[#9275E533] blur-3xl opacity-30" />
      <div className="relative space-y-3">
        <div className={funder.logo ? "space-y-2" : "space-y-1"}>
          {funder.logo ? (
            <Image
              src={funder.logo.src}
              alt={copy.name}
              width={funder.logo.width}
              height={funder.logo.height}
              className="h-8 w-auto"
              loading="lazy"
            />
          ) : (
            <h3 className="text-xl font-semibold text-slate-900">{copy.name}</h3>
          )}
          <p className="text-sm text-slate-600">{copy.program}</p>
        </div>
        <p className="text-base text-slate-700">{copy.description}</p>
        <div className="flex flex-wrap items-center gap-3">
          {funder.links.map((link, index) => (
            <Fragment key={link.url}>
              {index > 0 && (
                <span className="text-slate-400" aria-hidden="true">
                  ·
                </span>
              )}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                {"labelKey" in link ? ctaLabels[link.labelKey] : link.label}
                <ExternalLinkIcon />
              </a>
            </Fragment>
          ))}
        </div>
      </div>
    </article>
  );
}
