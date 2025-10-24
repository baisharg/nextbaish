import Link from "next/link";
import Script from "next/script";
import dynamic from "next/dynamic";
import Footer from "@/app/components/footer";
import { FadeInSection } from "@/app/components/fade-in-section";
import { AnimatedTitle } from "@/app/components/animated-title";
import { withLocale } from "@/app/utils/locale";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TelegramIcon,
  Location01Icon,
  SmartPhone01Icon,
  InstagramIcon,
  Linkedin01Icon,
  WhatsappIcon,
  ReloadIcon,
} from "@hugeicons/core-free-icons";

// Lazy load FAQ accordion since it's below the fold
const FAQAccordion = dynamic(() => import("@/app/components/faq-accordion"), {
  loading: () => <div className="h-96 animate-pulse rounded-xl bg-slate-100" />,
});

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);

  return (
    <>
      <div className="relative z-10 min-h-screen bg-transparent text-slate-900">

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <FadeInSection variant="fade" as="section">
            <section className="space-y-4">
              <div className="text-sm text-slate-600">
                <Link href={withLocale(currentLocale, "/")} className="hover:text-[var(--color-accent-primary)] transition">
                  {dict.contact.breadcrumb.home}
                </Link>
                {" / "}
                <span>{dict.contact.breadcrumb.current}</span>
              </div>
              <AnimatedTitle
                text={dict.contact.title}
                slug="contact"
                className="text-4xl font-semibold text-slate-900 sm:text-5xl"
                as="h1"
              />
              <p className="text-lg text-slate-700">
                {dict.contact.description}
              </p>
            </section>
          </FadeInSection>

          {/* Contact Info Cards */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section className="grid gap-6 md:grid-cols-3">
              {/* Telegram Card */}
              <article className="card-glass dither-macrogrid flex h-full flex-col justify-between p-6">
                <div className="space-y-4">
                  <div>
                    <HugeiconsIcon
                      icon={TelegramIcon}
                      size={32}
                      className="text-[var(--color-accent-primary)]"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Telegram</h3>
                  <p className="text-sm text-slate-600">
                    {dict.contact.cards.telegram.description}
                  </p>
                </div>
                <a
                  href="https://t.me/+zhSGhXrn56g1YjVh"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  t.me/+zfvMHU8TaAhjNjVh →
                </a>
              </article>

              {/* Location Card */}
              <article className="card-glass dither-macrogrid flex h-full flex-col justify-between p-6">
                <div className="space-y-4">
                  <div>
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={32}
                      className="text-[var(--color-accent-primary)]"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {dict.contact.cards.location.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {dict.contact.cards.location.description}
                  </p>
                </div>
                <address className="mt-6 text-sm text-slate-700 not-italic">
                  Pabellon 0+inf, Ciudad Universitaria
                  <br />
                  C1428EGA Buenos Aires
                  <br />
                  Argentina
                </address>
              </article>

              {/* Social Media Card */}
              <article className="card-glass dither-macrogrid flex h-full flex-col justify-between p-6">
                <div className="space-y-4">
                  <div>
                    <HugeiconsIcon
                      icon={SmartPhone01Icon}
                      size={32}
                      className="text-[var(--color-accent-primary)]"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {dict.contact.cards.social.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {dict.contact.cards.social.description}
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href="https://www.instagram.com/baish_arg"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <HugeiconsIcon icon={InstagramIcon} size={20} />
                    Instagram
                  </a>
                  <a
                    href="https://www.linkedin.com/company/baish-arg"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <HugeiconsIcon icon={Linkedin01Icon} size={20} />
                    LinkedIn
                  </a>
                  <a
                    href="https://t.me/+zhSGhXrn56g1YjVh"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                  >
                    <HugeiconsIcon icon={TelegramIcon} size={20} />
                    Telegram
                  </a>
                  <a
                    href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <HugeiconsIcon icon={WhatsappIcon} size={20} />
                    WhatsApp
                  </a>
                </div>
              </article>
            </section>
          </FadeInSection>

          {/* Contact Form & Newsletter - Dark Theme */}
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section className="grid gap-8 rounded-3xl bg-[#1e1e30] px-6 py-12 sm:px-12 md:grid-cols-[1.5fr_1fr]">
              {/* Left: Contact Form */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-white">
                    {dict.contact.form.title}
                  </h2>
                  <p className="text-base text-slate-300">
                    {dict.contact.form.description}
                  </p>
                </div>

                <div className="h-px bg-[#232336]" />

                <form action="https://formspree.io/f/xjkyoknb" method="POST" className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-white">
                      {dict.contact.form.nameLabel}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="w-full rounded-md border border-[#2a2a40] bg-[#161624] px-4 py-3 text-white placeholder-slate-500 transition focus:border-[var(--color-accent-primary)] focus:bg-[#2a2a45] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                      {dict.contact.form.emailLabel}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="w-full rounded-md border border-[#2a2a40] bg-[#161624] px-4 py-3 text-white placeholder-slate-500 transition focus:border-[var(--color-accent-primary)] focus:bg-[#2a2a45] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-white">
                      {dict.contact.form.messageLabel}
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={5}
                      required
                      className="w-full rounded-md border border-[#2a2a40] bg-[#161624] px-4 py-3 text-white placeholder-slate-500 transition focus:border-[var(--color-accent-primary)] focus:bg-[#2a2a45] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="reset"
                      className="inline-flex items-center gap-2 text-sm text-[#4a93fb] transition hover:text-[var(--color-accent-tertiary)]"
                    >
                      <HugeiconsIcon icon={ReloadIcon} size={18} />
                      {dict.contact.form.clearForm}
                    </button>
                    <button
                      type="submit"
                      className="button-primary"
                    >
                      {dict.contact.form.submit}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Get Involved / Newsletter */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-white">
                    {dict.contact.getInvolved.title}
                  </h2>
                  <p className="text-base text-slate-300">
                    {dict.contact.getInvolved.description}
                  </p>
                </div>

                <div className="space-y-4 rounded-lg border border-[#2a2a40] bg-[#232336] p-5">
                  <h3 className="text-xl font-semibold text-white">
                    {dict.contact.getInvolved.newsletter.title}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {dict.contact.getInvolved.newsletter.description}
                  </p>
                  <div id="custom-substack-embed"></div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* FAQ Section */}
          <FadeInSection variant="slide-up" delay={300} as="section">
            <FAQAccordion
              items={dict.contact.faq.items}
              title={dict.contact.faq.title}
              locale={currentLocale}
              resourcesPageLabel={dict.contact.linkText.resourcesPage}
            />
          </FadeInSection>
        </main>

        <Footer locale={currentLocale} t={dict.footer} />
      </div>

      {/* Substack Widget Script */}
      <Script id="substack-widget-config" strategy="afterInteractive">
        {`
          window.CustomSubstackWidget = {
            substackUrl: "baish.substack.com",
            placeholder: "example@gmail.com",
            buttonText: "Subscribe",
            theme: "custom",
            colors: {
              primary: "#5A9FFF",
              input: "#121620",
              email: "#606878",
              text: "#000000",
            },
          };
        `}
      </Script>
      <Script src="https://substackapi.com/widget.js" strategy="afterInteractive" />
    </>
  );
}
