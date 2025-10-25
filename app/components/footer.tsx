import Image from "next/image";
import { TransitionLink } from "./transition-link";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { withLocale } from "@/app/utils/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  Linkedin01Icon,
  TelegramIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";

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
              <p className="text-base font-semibold text-slate-900 font-serif">
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
              <HugeiconsIcon icon={InstagramIcon} size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/baish-arg"
              aria-label="LinkedIn"
              className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon icon={Linkedin01Icon} size={20} />
            </a>
            <a
              href="https://t.me/+zhSGhXrn56g1YjVh"
              aria-label="Telegram"
              className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon icon={TelegramIcon} size={20} />
            </a>
            <a
              href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
              aria-label="WhatsApp"
              className="text-slate-600 hover:text-[var(--color-accent-primary)] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon icon={WhatsappIcon} size={20} />
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
