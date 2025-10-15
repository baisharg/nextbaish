"use client";

import { useState, type ReactNode } from "react";

interface FAQItem {
  question: string;
  answer: string | ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
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
              className={`flex-shrink-0 text-[var(--color-accent-primary)] transition-transform ${
                openFaqIndex === index ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {openFaqIndex === index && (
            <div className="border-t border-slate-200 px-6 py-4">
              <p className="text-base text-slate-600">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
