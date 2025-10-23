import Image from "next/image";
import { TransitionLink } from "./transition-link";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { withLocale } from "@/app/utils/locale";

interface FooterProps {
  locale: AppLocale;
  t: Dictionary["footer"];
}

export default function Footer({ locale, t }: FooterProps) {

  return (
    <footer
      className="border-t border-slate-200 bg-white px-6 py-10 text-sm text-slate-600 sm:px-10"
      id="contact"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logos/logo-40.webp"
                alt="BAISH Logo"
                width={40}
                height={40}
                sizes="32px"
                className="object-contain"
              />
              <p className="text-base font-semibold text-slate-900">
                Buenos Aires AI Safety Hub
              </p>
            </div>
            <p>© {new Date().getFullYear()} BAISH. {t.copyright}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <TransitionLink className="hover:text-slate-900" href={withLocale(locale, "/about")}>
              {t.nav.about}
            </TransitionLink>
            <TransitionLink className="hover:text-slate-900" href={withLocale(locale, "/activities")}>
              {t.nav.activities}
            </TransitionLink>
            {/* <TransitionLink className="hover:text-slate-900" href={withLocale(locale, "/research")}>
              {t.nav.research}
            </TransitionLink> */}
            <TransitionLink className="hover:text-slate-900" href={withLocale(locale, "/resources")}>
              {t.nav.resources}
            </TransitionLink>
            <a className="hover:text-slate-900" href="#get-involved">
              {t.nav.getInvolved}
            </a>
            <TransitionLink className="hover:text-slate-900" href={withLocale(locale, "/contact")}>
              {t.nav.contact}
            </TransitionLink>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-6">
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/baish_arg"
              aria-label="Instagram"
              className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/baish-arg"
              aria-label="LinkedIn"
              className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a
              href="https://t.me/+zhSGhXrn56g1YjVh"
              aria-label="Telegram"
              className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </a>
            <a
              href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
              aria-label="WhatsApp"
              className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
          </div>
          <TransitionLink className="hover:text-slate-900" href={withLocale(locale, "/privacy-policy")}>
            {t.nav.privacyPolicy}
          </TransitionLink>
        </div>
      </div>
    </footer>
  );
}
