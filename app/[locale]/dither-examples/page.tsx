"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useDict } from "@/app/contexts/language-context";

export default function DitherExamplesPage() {
  const locale = useLocale();
  const dict = useDict();
  const t = dict.ditherExamples;

  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const toggleCode = (id: string) => {
    setExpandedCode(expandedCode === id ? null : id);
  };

  // Dot Matrix variants
  const dotMatrixVariants = [
    {
      id: "ethereal",
      name: t.dotMatrix.variants.ethereal.name,
      description: t.dotMatrix.variants.ethereal.description,
      className: "dither-ethereal",
      css: `.dither-ethereal {
  background:
    linear-gradient(135deg, rgba(146, 117, 229, 0.18) 0%, transparent 60%),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.1) 1px,
      transparent 1px
    );
  background-size: 100% 100%, 16px 16px;
  border: 1px solid rgba(147, 136, 255, 0.2);
  border-radius: var(--radius-16);
  box-shadow: 0 2px 8px rgba(147, 117, 229, 0.08);
  backdrop-filter: blur(16px);
}`,
    },
    {
      id: "whisper",
      name: t.dotMatrix.variants.whisper.name,
      description: t.dotMatrix.variants.whisper.description,
      className: "dither-whisper",
      css: `.dither-whisper {
  background:
    linear-gradient(135deg, rgba(146, 117, 229, 0.12) 0%, transparent 55%),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(245, 245, 250, 0.12));
  background-size: 100% 100%, 16px 16px, 100% 100%;
  border: 1px solid rgba(147, 136, 255, 0.18);
  border-radius: var(--radius-16);
  box-shadow: 0 2px 8px rgba(147, 117, 229, 0.06);
  backdrop-filter: blur(14px);
}`,
    },
    {
      id: "bold",
      name: t.dotMatrix.variants.bold.name,
      description: t.dotMatrix.variants.bold.description,
      className: "dither-bold",
      css: `.dither-bold {
  background:
    linear-gradient(135deg, rgba(146, 117, 229, 0.3) 0%, transparent 55%),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.18) 1px,
      transparent 1px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(245, 245, 250, 0.18));
  background-size: 100% 100%, 16px 16px, 100% 100%;
  border: 1px solid rgba(147, 136, 255, 0.35);
  border-radius: var(--radius-16);
  box-shadow: 0 4px 12px rgba(147, 117, 229, 0.15);
  backdrop-filter: blur(10px);
}`,
    },
    {
      id: "finemesh",
      name: t.dotMatrix.variants.fineMesh.name,
      description: t.dotMatrix.variants.fineMesh.description,
      className: "dither-finemesh",
      css: `.dither-finemesh {
  background:
    linear-gradient(135deg, rgba(146, 117, 229, 0.2) 0%, transparent 50%),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.12) 0.8px,
      transparent 0.8px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(245, 245, 250, 0.15));
  background-size: 100% 100%, 8px 8px, 100% 100%;
  border: 1px solid rgba(147, 136, 255, 0.25);
  border-radius: var(--radius-16);
  box-shadow: 0 2px 8px rgba(147, 117, 229, 0.08);
  backdrop-filter: blur(12px);
}`,
    },
    {
      id: "macrogrid",
      name: t.dotMatrix.variants.macroGrid.name,
      description: t.dotMatrix.variants.macroGrid.description,
      className: "dither-macrogrid",
      css: `.dither-macrogrid {
  background:
    linear-gradient(135deg, rgba(146, 117, 229, 0.22) 0%, transparent 50%),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.2) 2px,
      transparent 2px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(245, 245, 250, 0.12));
  background-size: 100% 100%, 32px 32px, 100% 100%;
  border: 1px solid rgba(147, 136, 255, 0.28);
  border-radius: var(--radius-16);
  box-shadow: 0 2px 8px rgba(147, 117, 229, 0.1);
  backdrop-filter: blur(14px);
}`,
    },
    {
      id: "verticalsweep",
      name: t.dotMatrix.variants.verticalSweep.name,
      description: t.dotMatrix.variants.verticalSweep.description,
      className: "dither-verticalsweep",
      css: `.dither-verticalsweep {
  background:
    linear-gradient(180deg, rgba(146, 117, 229, 0.25) 0%, transparent 50%),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.14) 1px,
      transparent 1px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(245, 245, 250, 0.14));
  background-size: 100% 100%, 16px 16px, 100% 100%;
  border: 1px solid rgba(147, 136, 255, 0.26);
  border-radius: var(--radius-16);
  box-shadow: 0 2px 8px rgba(147, 117, 229, 0.09);
  backdrop-filter: blur(12px);
}`,
    },
    {
      id: "cornerglow",
      name: t.dotMatrix.variants.cornerGlow.name,
      description: t.dotMatrix.variants.cornerGlow.description,
      className: "dither-cornerglow",
      css: `.dither-cornerglow {
  background:
    radial-gradient(
      circle at 0% 0%,
      rgba(146, 117, 229, 0.28) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.15) 1px,
      transparent 1px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(245, 245, 250, 0.15));
  background-size: 100% 100%, 16px 16px, 100% 100%;
  border: 1px solid rgba(147, 136, 255, 0.3);
  border-radius: var(--radius-16);
  box-shadow: 0 4px 12px rgba(147, 117, 229, 0.12);
  backdrop-filter: blur(16px);
}`,
    },
    {
      id: "dualtone",
      name: t.dotMatrix.variants.dualTone.name,
      description: t.dotMatrix.variants.dualTone.description,
      className: "dither-dualtone",
      css: `.dither-dualtone {
  background:
    linear-gradient(135deg, rgba(146, 117, 229, 0.22) 0%, transparent 40%),
    linear-gradient(-45deg, rgba(199, 125, 218, 0.18) 0%, transparent 40%),
    radial-gradient(
      circle at center,
      rgba(100, 100, 100, 0.14) 1px,
      transparent 1px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(245, 245, 250, 0.18));
  background-size: 100% 100%, 100% 100%, 16px 16px, 100% 100%;
  border: 1px solid rgba(147, 136, 255, 0.32);
  border-radius: var(--radius-16);
  box-shadow: 0 4px 12px rgba(147, 117, 229, 0.14);
  backdrop-filter: blur(10px);
}`,
    },
  ];

  return (
    <>
      <style jsx>{`
        .dither-ethereal {
          background: linear-gradient(
              135deg,
              rgba(146, 117, 229, 0.18) 0%,
              transparent 60%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.1) 1px,
              transparent 1px
            );
          background-size: 100% 100%, 16px 16px;
          border: 1px solid rgba(147, 136, 255, 0.2);
          border-radius: var(--radius-16);
          box-shadow: 0 2px 8px rgba(147, 117, 229, 0.08);
          backdrop-filter: blur(16px);
        }

        .dither-whisper {
          background: linear-gradient(
              135deg,
              rgba(146, 117, 229, 0.12) 0%,
              transparent 55%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.15),
              rgba(245, 245, 250, 0.12)
            );
          background-size: 100% 100%, 16px 16px, 100% 100%;
          border: 1px solid rgba(147, 136, 255, 0.18);
          border-radius: var(--radius-16);
          box-shadow: 0 2px 8px rgba(147, 117, 229, 0.06);
          backdrop-filter: blur(14px);
        }

        .dither-bold {
          background: linear-gradient(
              135deg,
              rgba(146, 117, 229, 0.3) 0%,
              transparent 55%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.18) 1px,
              transparent 1px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.2),
              rgba(245, 245, 250, 0.18)
            );
          background-size: 100% 100%, 16px 16px, 100% 100%;
          border: 1px solid rgba(147, 136, 255, 0.35);
          border-radius: var(--radius-16);
          box-shadow: 0 4px 12px rgba(147, 117, 229, 0.15);
          backdrop-filter: blur(10px);
        }

        .dither-finemesh {
          background: linear-gradient(
              135deg,
              rgba(146, 117, 229, 0.2) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.12) 0.8px,
              transparent 0.8px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.18),
              rgba(245, 245, 250, 0.15)
            );
          background-size: 100% 100%, 8px 8px, 100% 100%;
          border: 1px solid rgba(147, 136, 255, 0.25);
          border-radius: var(--radius-16);
          box-shadow: 0 2px 8px rgba(147, 117, 229, 0.08);
          backdrop-filter: blur(12px);
        }

        .dither-macrogrid {
          background: linear-gradient(
              135deg,
              rgba(146, 117, 229, 0.22) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.2) 2px,
              transparent 2px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.15),
              rgba(245, 245, 250, 0.12)
            );
          background-size: 100% 100%, 32px 32px, 100% 100%;
          border: 1px solid rgba(147, 136, 255, 0.28);
          border-radius: var(--radius-16);
          box-shadow: 0 2px 8px rgba(147, 117, 229, 0.1);
          backdrop-filter: blur(14px);
        }

        .dither-verticalsweep {
          background: linear-gradient(
              180deg,
              rgba(146, 117, 229, 0.25) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.14) 1px,
              transparent 1px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.16),
              rgba(245, 245, 250, 0.14)
            );
          background-size: 100% 100%, 16px 16px, 100% 100%;
          border: 1px solid rgba(147, 136, 255, 0.26);
          border-radius: var(--radius-16);
          box-shadow: 0 2px 8px rgba(147, 117, 229, 0.09);
          backdrop-filter: blur(12px);
        }

        .dither-cornerglow {
          background: radial-gradient(
              circle at 0% 0%,
              rgba(146, 117, 229, 0.28) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.15) 1px,
              transparent 1px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.18),
              rgba(245, 245, 250, 0.15)
            );
          background-size: 100% 100%, 16px 16px, 100% 100%;
          border: 1px solid rgba(147, 136, 255, 0.3);
          border-radius: var(--radius-16);
          box-shadow: 0 4px 12px rgba(147, 117, 229, 0.12);
          backdrop-filter: blur(16px);
        }

        .dither-dualtone {
          background: linear-gradient(
              135deg,
              rgba(146, 117, 229, 0.22) 0%,
              transparent 40%
            ),
            linear-gradient(
              -45deg,
              rgba(199, 125, 218, 0.18) 0%,
              transparent 40%
            ),
            radial-gradient(
              circle at center,
              rgba(100, 100, 100, 0.14) 1px,
              transparent 1px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.2),
              rgba(245, 245, 250, 0.18)
            );
          background-size: 100% 100%, 100% 100%, 16px 16px, 100% 100%;
          border: 1px solid rgba(147, 136, 255, 0.32);
          border-radius: var(--radius-16);
          box-shadow: 0 4px 12px rgba(147, 117, 229, 0.14);
          backdrop-filter: blur(10px);
        }

        .example-card {
          padding: 24px;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .code-block {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: "Courier New", monospace;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 12px;
        }

        .toggle-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 6px;
          border: 1px solid rgba(147, 136, 255, 0.35);
          background: rgba(255, 255, 255, 0.8);
          color: var(--brand-600);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-button:hover {
          background: rgba(147, 117, 229, 0.1);
          border-color: var(--brand-600);
        }
      `}</style>

      <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <section className="space-y-4">
            <div className="text-sm text-slate-600">
              <Link
                href={`/${locale}`}
                className="hover:text-[var(--color-accent-primary)] transition"
              >
                {t.breadcrumb.home}
              </Link>
              {" / "}
              <span>{t.breadcrumb.current}</span>
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {t.title}
            </h1>
            <p className="text-lg text-slate-600">{t.description}</p>
          </section>

          {/* Dot Matrix Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900">
                {t.dotMatrix.title}
              </h2>
              <p className="text-slate-600">{t.dotMatrix.description}</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {dotMatrixVariants.map((variant) => (
                <div key={variant.id} className="space-y-3">
                  <div className={`example-card ${variant.className}`}>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {variant.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {variant.description}
                    </p>
                    <div className="mt-auto">
                      <p className="text-slate-700">{t.sampleCard.body}</p>
                    </div>
                  </div>
                  <button
                    className="toggle-button"
                    onClick={() => toggleCode(variant.id)}
                  >
                    {expandedCode === variant.id
                      ? t.hideCode
                      : t.showCode}
                  </button>
                  {expandedCode === variant.id && (
                    <pre className="code-block">{variant.css}</pre>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
