import type { Metadata } from "next";
import { ThreadPage } from "@/app/components/thread-page";
import { ThreadSet } from "@/app/components/thread-set";
import { getDictionary } from "../../dictionaries";
import { fillImpact } from "@/app/data/impact";
import {
  NEWSLETTER_SUBSCRIBE_URL,
  ORGANIZATION_LINKEDIN_URL,
} from "@/app/constants/social-links";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";
import { LabAnnouncement } from "../_components/lab-announcement";
import { LabFooter } from "../_components/lab-footer";
import { SmartLink, isExternal } from "../_components/smart-link";
import { TitleBand } from "../_components/title-band";
import "../lab.css";

const WHATSAPP_URL = "https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P";
const LUMA_URL = "https://luma.com/BAISH";
const INSTAGRAM_URL = "https://www.instagram.com/baish_arg";
const FORM_ACTION = "https://formspree.io/f/xjkyoknb";

type Action = { label: string; href: string; primary?: boolean };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  return {
    title: `${dict.contact.title} · ${dict.lab.metaTitle}`,
    robots: { index: false, follow: false },
  };
}

export default async function LabContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.contact;
  const lab = dict.lab;
  const page = lab.contactPage;
  const p = page.purposes;
  const cta = dict.about.callToAction;

  // One row per reason to get in touch, each with the channel that fits it.
  const rows: { title: string; text: string; actions: Action[] }[] = [
    {
      title: p.course.title,
      text: p.course.text,
      actions: [
        { label: lab.hero.seeCourses, href: "/lab#programs", primary: true },
      ],
    },
    {
      title: p.community.title,
      text: fillImpact(p.community.text),
      actions: [
        { label: lab.footer.links.whatsapp, href: WHATSAPP_URL, primary: true },
        { label: dict.footer.luma, href: LUMA_URL },
      ],
    },
    {
      title: p.career.title,
      text: cta.description,
      actions: [
        { label: cta.bookWithEitan, href: "https://calendly.com/eitusprejer" },
        { label: cta.bookWithLuca, href: "https://lvca.dev/meet" },
      ],
    },
    {
      title: p.research.title,
      text: dict.research.labs.ctaDescription,
      actions: [{ label: page.writeToUs, href: "#contact-form" }],
    },
    {
      title: p.press.title,
      text: p.press.text,
      actions: [{ label: page.writeToUs, href: "#contact-form" }],
    },
    {
      title: p.follow.title,
      text: p.follow.text,
      actions: [
        { label: lab.footer.links.newsletter, href: NEWSLETTER_SUBSCRIBE_URL },
        { label: lab.footer.links.instagram, href: INSTAGRAM_URL },
        { label: lab.footer.links.linkedin, href: ORGANIZATION_LINKEDIN_URL },
      ],
    },
  ];

  // FAQ answers may reference the resources page as {resourcesLink}.
  const renderAnswer = (answer: string) =>
    answer.split("{resourcesLink}").flatMap((part, i) =>
      i === 0
        ? [part]
        : [
            <SmartLink
              key={i}
              href="/resources"
              locale={currentLocale}
              className="lab-link"
            >
              {t.linkText.resourcesPage}
            </SmartLink>,
            part,
          ],
    );

  return (
    <div className="lab">
      <ThreadPage />
      <LabAnnouncement locale={currentLocale} dict={dict} />

      <TitleBand
        locale={currentLocale}
        homeLabel={lab.band.home}
        eyebrow={dict.header.nav.contact}
        title={t.title}
        lede={<p>{t.description}</p>}
      />

      {/* Routing table: purpose → channel */}
      <section className="lab-section lab-section-tight">
        <div className="lab-wrap">
          <header className="lab-section-head">
            <h2 className="lab-h2">{page.routingTitle}</h2>
          </header>
          <div className="lab-table" role="table">
            <div className="lab-route lab-trow-head" role="row">
              <span role="columnheader">{page.columns.purpose}</span>
              <span role="columnheader">{page.columns.how}</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.title}
                className="lab-route"
                role="row"
                data-thread-pulse
              >
                <div role="cell">
                  <h3 className="lab-trow-title">{row.title}</h3>
                  <p className="lab-trow-desc">{row.text}</p>
                </div>
                <div role="cell" className="lab-route-actions">
                  {row.actions.map((action) => (
                    <SmartLink
                      key={action.href}
                      href={action.href}
                      locale={currentLocale}
                      className={
                        action.primary
                          ? "lab-button lab-button-sm"
                          : "lab-link lab-link-sm"
                      }
                    >
                      {action.label}
                      <span aria-hidden="true">
                        {isExternal(action.href)
                          ? "↗"
                          : action.href.startsWith("#")
                            ? "↓"
                            : "→"}
                      </span>
                    </SmartLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form: the threads knot beside it */}
      <section
        className="lab-section lab-join"
        id="contact-form"
      >
        <ThreadSet scene="knot" />
        <div className="lab-wrap lab-join-grid">
          <div className="lab-join-copy lab-veil">
            <p className="lab-kicker">{t.form.eyebrow}</p>
            <h2 className="lab-h2">{t.form.title}</h2>
            <p className="lab-section-desc">{t.form.description}</p>
            <form action={FORM_ACTION} method="POST" className="lab-form">
              <label>
                <span>{t.form.nameLabel}</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>
              <label>
                <span>{t.form.emailLabel}</span>
                <input type="email" name="email" autoComplete="email" required />
              </label>
              <label>
                <span>{t.form.messageLabel}</span>
                <textarea name="message" rows={5} required />
              </label>
              <div className="lab-form-actions">
                <button type="submit" className="lab-button">
                  {t.form.submit}
                </button>
                <button type="reset" className="lab-link lab-link-sm">
                  {t.form.clearForm}
                </button>
              </div>
            </form>
          </div>
          <div className="lab-join-knot" data-thread-box aria-hidden="true" />
        </div>
      </section>

      {/* FAQ */}
      <section className="lab-section lab-section-tight">
        <div className="lab-wrap lab-about">
          <header>
            <h2 className="lab-h2">{t.faq.title}</h2>
          </header>
          <div className="lab-faq">
            {t.faq.items.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{renderAnswer(item.answer)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <LabFooter locale={currentLocale} dict={dict} />
    </div>
  );
}
