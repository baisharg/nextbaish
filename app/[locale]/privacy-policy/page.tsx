import Link from "next/link";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

export default async function PrivacyPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.privacyPolicy;

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
      <Header locale={currentLocale} t={dict.header} />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header */}
        <section className="space-y-4">
          <div className="text-sm text-slate-600">
            <Link href={`/${currentLocale}`} className="hover:text-[var(--color-accent-primary)] transition">
              {t.breadcrumb.home}
            </Link>
            {" / "}
            <span>{t.breadcrumb.current}</span>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            {t.title}
          </h1>
        </section>

        {/* Privacy Content */}
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
          <div className="mx-auto max-w-3xl space-y-8">
            {/* Our Approach to Privacy */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.sections.approach.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {t.sections.approach.content}
              </p>
            </div>

            {/* Data Collection */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.sections.dataCollection.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {t.sections.dataCollection.content}
              </p>
            </div>

            {/* No Tracking or Cookies */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.sections.noTracking.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {t.sections.noTracking.content}
              </p>
            </div>

            {/* Third-Party Services */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.sections.thirdParty.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {t.sections.thirdParty.content}{" "}
                <a
                  href="https://substack.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition underline"
                >
                  {t.sections.thirdParty.substackLink}
                </a>{" "}
                {t.sections.thirdParty.content2}
              </p>
            </div>

            {/* Your Rights */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.sections.rights.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {t.sections.rights.content}
              </p>
            </div>

            {/* Changes to This Policy */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.sections.changes.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {t.sections.changes.content}
              </p>
            </div>

            {/* Contact Us */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.sections.contact.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {t.sections.contact.content}{" "}
                <Link
                  href={`/${currentLocale}/contact`}
                  className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition underline"
                >
                  {t.sections.contact.contactLink}
                </Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={currentLocale} t={dict.footer} />
    </div>
  );
}
