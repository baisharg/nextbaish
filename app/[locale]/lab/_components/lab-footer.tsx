import Image from "next/image";
import { SmartLink } from "./smart-link";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import {
  NEWSLETTER_SUBSCRIBE_URL,
  ORGANIZATION_LINKEDIN_URL,
} from "@/app/constants/social-links";
import { FUNDERS } from "@/app/data/funders";
import type { AppLocale } from "@/i18n.config";

const WHATSAPP_URL = "https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P";

/**
 * Prototype footer: brand and main CTA, three link columns, and the funders
 * line. Lab pages link to each other; pages not yet redesigned link to the
 * live site.
 */
export function LabFooter({
  locale,
  dict,
}: {
  locale: AppLocale;
  dict: Dictionary;
}) {
  const t = dict.lab.footer;
  const nav = dict.footer.nav;

  const columns = [
    {
      title: t.columns.programs,
      links: [
        { label: t.links.courses, href: "/lab#programs" },
        { label: t.links.aisar, href: "https://scholarship.aisafety.ar/" },
        { label: t.links.labs, href: "/research#labs" },
        { label: nav.resources, href: "/resources" },
      ],
    },
    {
      title: t.columns.organization,
      links: [
        { label: nav.about, href: "/lab/about" },
        { label: nav.research, href: "/research" },
        { label: nav.contact, href: "/lab/contact" },
        { label: nav.privacyPolicy, href: "/privacy-policy" },
      ],
    },
    {
      title: t.columns.community,
      links: [
        { label: t.links.whatsapp, href: WHATSAPP_URL },
        { label: dict.footer.luma, href: "https://luma.com/BAISH" },
        { label: t.links.newsletter, href: NEWSLETTER_SUBSCRIBE_URL },
        { label: t.links.instagram, href: "https://www.instagram.com/baish_arg" },
        { label: t.links.linkedin, href: ORGANIZATION_LINKEDIN_URL },
      ],
    },
  ];

  const funders = FUNDERS.map((f) => dict.about.support[f.id].name);

  return (
    <footer className="lab-footer">
      <div className="lab-wrap">
        <div className="lab-footer-top">
          <div className="lab-footer-brand">
            <div className="lab-footer-logo">
              <Image src="/images/logo.svg" alt="" width={40} height={40} />
              <p>Buenos Aires AI Safety Hub</p>
            </div>
            <p className="lab-footer-tagline">{dict.about.whoWeAre.eyebrow}</p>
            <SmartLink
              href={WHATSAPP_URL}
              locale={locale}
              className="lab-button lab-button-sm"
            >
              {t.cta}
              <span aria-hidden="true">↗</span>
            </SmartLink>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="lab-footer-heading">{column.title}</p>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <SmartLink href={link.href} locale={locale}>
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="lab-footer-bottom">
          <p>
            {t.supportedBy}: {funders.join(" · ")}
          </p>
          <p>
            © {new Date().getFullYear()} BAISH. {dict.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
