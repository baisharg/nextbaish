type AstnDict = {
  eyebrow: string;
  badge: string;
  title: string;
  description: string;
  features: {
    matching: { title: string; description: string };
    actions: { title: string; description: string };
    profile: { title: string; description: string };
  };
  cta: string;
  domain: string;
};

interface AstnPromoProps {
  t: AstnDict;
}

export function AstnPromo({ t }: AstnPromoProps) {
  return (
    <section className="section-open" id="astn">
      <div className="astn-promo relative rounded-3xl p-8 sm:p-12 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E07A5F]">
              {t.eyebrow}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#E07A5F]/10 border border-[#E07A5F]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E07A5F]">
              {t.badge}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 mb-4 tracking-tight">
            {t.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
            {t.description}
          </p>

          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            <div className="astn-feature rounded-2xl border border-[#E07A5F]/12 bg-[#E07A5F]/[0.04] p-5 text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E07A5F]/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E07A5F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-slate-900 mb-1">
                {t.features.matching.title}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.features.matching.description}
              </p>
            </div>

            <div className="astn-feature rounded-2xl border border-[#E07A5F]/12 bg-[#E07A5F]/[0.04] p-5 text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E07A5F]/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E07A5F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-slate-900 mb-1">
                {t.features.actions.title}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.features.actions.description}
              </p>
            </div>

            <div className="astn-feature rounded-2xl border border-[#E07A5F]/12 bg-[#E07A5F]/[0.04] p-5 text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E07A5F]/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E07A5F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-slate-900 mb-1">
                {t.features.profile.title}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.features.profile.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <a
              href="https://safetytalent.org/org/baish/join?token=d6866489-865f-472b-9d80-d70205c11ffc"
              target="_blank"
              rel="noopener noreferrer"
              className="astn-cta inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#E07A5F]/25 transition-all hover:bg-[#D06A4F] hover:shadow-xl hover:shadow-[#E07A5F]/30 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E07A5F]"
            >
              {t.cta}
              <span aria-hidden="true">→</span>
            </a>
            <span className="text-xs text-slate-400">{t.domain}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
