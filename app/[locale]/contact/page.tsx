import Link from "next/link";
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

const SupascribeSignup = dynamic(() => import("@/app/components/supascribe-signup"), {
  loading: () => <div className="card-glass h-64 animate-pulse" />,
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
              {/* Community Card with Stacked Buttons */}
              <article className="card-glass dither-macrogrid">
                <div className="card-eyebrow">{dict.home.getInvolved.communityEyebrow}</div>
                <h3 className="card-title">
                  {dict.home.getInvolved.communityTitle}
                </h3>
                <p className="card-body">
                  {dict.home.getInvolved.communityDescription}
                </p>
                <div className="flex flex-col gap-3 mt-auto">
                  <a
                    className="button-primary flex flex-col items-center justify-center gap-1 py-4"
                    href="https://t.me/+zhSGhXrn56g1YjVh"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={TelegramIcon} size={20} />
                      <span className="font-semibold">{dict.home.getInvolved.telegramCta}</span>
                    </div>
                    <span className="text-xs opacity-90">{dict.home.getInvolved.telegramMembers}</span>
                  </a>
                  <a
                    className="button-primary flex flex-col items-center justify-center gap-1 py-4"
                    href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={WhatsappIcon} size={20} />
                      <span className="font-semibold">{dict.home.getInvolved.whatsappCta}</span>
                    </div>
                    <span className="text-xs opacity-90">{dict.home.getInvolved.whatsappMembers}</span>
                  </a>
                </div>
              </article>

              {/* Location Card */}
              <article className="card-glass dither-macrogrid">
                <div className="card-eyebrow">{dict.contact.cards.location.eyebrow}</div>
                <h3 className="card-title">
                  {dict.contact.cards.location.title}
                </h3>
                <p className="card-body">
                  {dict.contact.cards.location.description}
                </p>
                <address className="mt-auto text-sm text-slate-700 not-italic">
                  Pabellon 0+inf, Ciudad Universitaria
                  <br />
                  C1428EGA Buenos Aires
                  <br />
                  Argentina
                </address>
              </article>

              {/* Social Media Card */}
              <article className="card-glass dither-macrogrid">
                <div className="card-eyebrow">{dict.contact.cards.social.eyebrow}</div>
                <h3 className="card-title">
                  {dict.contact.cards.social.title}
                </h3>
                <p className="card-body">
                  {dict.contact.cards.social.description}
                </p>
                <div className="flex flex-col gap-3 mt-auto">
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
                </div>
              </article>
            </section>
          </FadeInSection>

          {/* Contact Form & Newsletter */}
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section className="relative overflow-hidden grid gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] p-8 shadow-sm md:grid-cols-2">
              <div className="absolute inset-y-0 right-[-10%] hidden w-1/3 rounded-full bg-[#9275E533] blur-3xl lg:block" />

              {/* Contact Form */}
              <article className="card-glass dither-macrogrid">
                <div className="card-eyebrow">{dict.contact.form.eyebrow}</div>
                <h2 className="card-title">
                  {dict.contact.form.title}
                </h2>
                <p className="card-body">
                  {dict.contact.form.description}
                </p>

                <form action="https://formspree.io/f/xjkyoknb" method="POST" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                      {dict.contact.form.nameLabel}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      {dict.contact.form.emailLabel}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                      {dict.contact.form.messageLabel}
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={5}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="reset"
                      className="inline-flex items-center gap-2 text-sm text-[var(--color-accent-primary)] transition hover:text-[var(--color-accent-tertiary)]"
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
              </article>

              {/* Newsletter Signup */}
              <SupascribeSignup t={dict.substack} />
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
    </>
  );
}
