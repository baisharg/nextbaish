"use client";

import { useId, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Robot01Icon,
  Crown02Icon,
  BombIcon,
  HierarchyCircle01Icon,
  BiohazardIcon,
  Brain02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

type RiskId =
  | "misalignment"
  | "powerConcentration"
  | "misuse"
  | "disempowerment"
  | "pandemics"
  | "digitalMinds";

export type Risk = {
  id: RiskId;
  title: string;
  description: string;
  readMoreUrl?: string;
  podcastUrl?: string;
};

interface ConcreteRisksProps {
  heading: string;
  intro: string;
  risks: Risk[];
  readMoreLabel: string;
  podcastLabel: string;
}

const RISK_ICONS: Record<RiskId, typeof Robot01Icon> = {
  misalignment: Robot01Icon,
  powerConcentration: Crown02Icon,
  misuse: BombIcon,
  disempowerment: HierarchyCircle01Icon,
  pandemics: BiohazardIcon,
  digitalMinds: Brain02Icon,
};

export function ConcreteRisks({
  heading,
  intro,
  risks,
  readMoreLabel,
  podcastLabel,
}: ConcreteRisksProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState<RiskId>(risks[0]?.id);
  const active = risks.find((r) => r.id === activeId) ?? risks[0];
  const ActiveIcon = RISK_ICONS[active.id];

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-slate-900">{heading}</h2>
        <p className="max-w-3xl text-base text-slate-600">{intro}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_1fr] md:items-start">
        <div
          role="tablist"
          aria-orientation="vertical"
          className="flex flex-col gap-2"
        >
          {risks.map((risk) => {
            const isActive = risk.id === activeId;
            const tabId = `${baseId}-tab-${risk.id}`;
            const panelId = `${baseId}-panel-${risk.id}`;
            return (
              <button
                key={risk.id}
                id={tabId}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(risk.id)}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "border-[var(--color-accent-primary)] bg-white text-slate-900 shadow-sm"
                    : "border-slate-200 bg-white/40 text-slate-700 hover:border-slate-300 hover:bg-white/70"
                }`}
              >
                {risk.title}
              </button>
            );
          })}
        </div>

        <div
          id={`${baseId}-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active.id}`}
          className="card-glass space-y-4 p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent-primary)_12%,transparent)]">
              <HugeiconsIcon
                icon={ActiveIcon}
                size={28}
                className="text-[var(--color-accent-primary)]"
              />
            </span>
            <h3 className="text-2xl font-semibold text-slate-900">
              {active.title}
            </h3>
          </div>
          <p className="text-base leading-relaxed text-slate-700">
            {active.description}
          </p>
          {(active.readMoreUrl || active.podcastUrl) && (
            <div className="flex flex-wrap gap-3 pt-1">
              {active.readMoreUrl ? (
                <a
                  href={active.readMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-outline inline-flex items-center gap-2 text-sm"
                >
                  {readMoreLabel}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </a>
              ) : null}
              {active.podcastUrl ? (
                <a
                  href={active.podcastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-outline inline-flex items-center gap-2 text-sm"
                >
                  {podcastLabel}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
