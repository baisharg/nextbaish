import type { Dictionary } from "@/app/[locale]/dictionaries";
import { NEWSLETTER_SUBSCRIBE_URL } from "@/app/constants/social-links";

type Props = {
  t: Dictionary["substack"];
};

/**
 * Newsletter card linking straight to the Substack subscribe page.
 *
 * Replaces the Supascribe embed, whose loader now reports that the account
 * has hit the free-plan limit and renders nothing. A plain link needs no
 * third-party script and always works.
 */
export default function NewsletterSignup({ t }: Props) {
  return (
    <article className="card-glass card-refined flex flex-col">
      <div className="card-eyebrow">{t.eyebrow}</div>
      <h3 className="card-title">{t.title}</h3>
      <p className="card-body">{t.description}</p>
      <div className="mt-auto space-y-3">
        <a
          href={NEWSLETTER_SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="button-primary inline-flex w-full items-center justify-center gap-2"
        >
          {t.substackCta}
          <span aria-hidden="true">→</span>
        </a>
        <p className="text-xs text-slate-500">{t.disclaimer}</p>
      </div>
    </article>
  );
}
