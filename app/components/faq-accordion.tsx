"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { withLocale } from "@/app/utils/locale";
import type { AppLocale } from "@/i18n.config";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface FAQItem {
  question: string;
  answer: string | ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title: string;
  locale: AppLocale;
  resourcesPageLabel: string;
}

export default function FAQAccordion({ items, title, locale, resourcesPageLabel }: FAQAccordionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Process items with template replacement (moved from page)
  const processedItems = items.map((item) => {
    let answer: string | ReactNode = item.answer;

    if (typeof answer === 'string' && answer.includes('{resourcesLink}')) {
      const parts = answer.split('{resourcesLink}');
      answer = (
        <>
          {parts[0]}
          <Link
            href={withLocale(locale, "/resources")}
            className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
          >
            {resourcesPageLabel}
          </Link>
          {parts[1]}
        </>
      );
    }

    if (typeof answer === 'string' && answer.includes('{email}')) {
      const parts = answer.split('{email}');
      answer = (
        <>
          {parts[0]}
          <a
            href="mailto:baish@dc.uba.ar"
            className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
          >
            baish@dc.uba.ar
          </a>
          {parts[1]}
        </>
      );
    }

    return { question: item.question, answer };
  });

  return (
    <section className="space-y-8 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
      <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">
        {processedItems.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white transition hover:border-[var(--color-accent-primary)]"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
              aria-expanded={openFaqIndex === index}
            >
              <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={20}
                className={`flex-shrink-0 text-[var(--color-accent-primary)] transition-transform ${
                  openFaqIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openFaqIndex === index && (
              <div className="border-t border-slate-200 px-6 py-4">
                <p className="text-base text-slate-600">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
