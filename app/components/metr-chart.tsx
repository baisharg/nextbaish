"use client";

import { useEffect, useRef, useState } from "react";

type ScaleMode = "linear" | "log";

type MetrPoint = {
  /** decimal release year */
  year: number;
  /** 50%-success time horizon, in human-minutes */
  minutes: number;
  label?: string;
  anchor?: "above" | "left";
  dy?: number;
  /** label nudge used on the log scale instead of dy */
  dyLog?: number;
  /** also labeled on the sparse mobile layer */
  mobile?: boolean;
  /** sits in the >16h zone: hollow marker, not part of the line */
  unreliable?: boolean;
};

// 50%-success time horizons, approximated from METR's published chart
// (metr.org). Model names are proper nouns — not translated.
const POINTS: MetrPoint[] = [
  { year: 2019.1, minutes: 0.03, label: "GPT-2", anchor: "above", mobile: true },
  { year: 2020.5, minutes: 0.15, label: "GPT-3", anchor: "above" },
  { year: 2022.2, minutes: 0.6, label: "GPT-3.5", anchor: "above", dyLog: -8 },
  { year: 2023.2, minutes: 5, label: "GPT-4", anchor: "above", mobile: true },
  { year: 2024.4, minutes: 9 },
  { year: 2024.95, minutes: 39 },
  { year: 2025.1, minutes: 59 },
  { year: 2025.3, minutes: 92, label: "o3", anchor: "left", dy: -4 },
  { year: 2025.6, minutes: 137, label: "GPT-5", anchor: "left", dy: -6 },
  { year: 2025.85, minutes: 300, label: "Claude Opus 4.5", anchor: "left", dy: 12, dyLog: 3 },
  { year: 2025.97, minutes: 360, label: "GPT-5.2 (high)", anchor: "left", dy: -8 },
  { year: 2026.1, minutes: 720, label: "Claude Opus 4.6", anchor: "left", dyLog: 3, mobile: true },
  {
    year: 2026.35,
    minutes: 1000,
    label: "Claude Mythos Preview",
    anchor: "left",
    unreliable: true,
  },
];

const VB_W = 800;
const VB_H = 460;
const MARGIN = { top: 24, right: 96, bottom: 56, left: 64 };
const PLOT_W = VB_W - MARGIN.left - MARGIN.right;
const PLOT_H = VB_H - MARGIN.top - MARGIN.bottom;
const PLOT_BOTTOM = MARGIN.top + PLOT_H;
const PLOT_RIGHT = MARGIN.left + PLOT_W;

const YEAR_MIN = 2018.9;
const YEAR_MAX = 2026.6;
const LINEAR_MAX = 1150;
const LOG_MIN = 0.02;
const LOG_MAX = 2400;
const UNRELIABLE_MIN = 960; // 16 hrs in minutes

const xPos = (year: number) =>
  MARGIN.left + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * PLOT_W;

const yPos = (minutes: number, mode: ScaleMode) => {
  const t =
    mode === "linear"
      ? minutes / LINEAR_MAX
      : (Math.log10(minutes) - Math.log10(LOG_MIN)) /
        (Math.log10(LOG_MAX) - Math.log10(LOG_MIN));
  return MARGIN.top + PLOT_H * (1 - t);
};

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

interface MetrChartProps {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  scaleToggle: { label: string; linear: string; log: string };
  yAnchorLabels: {
    oneMin: string;
    thirtyMin: string;
    twoHrs: string;
    eightHrs: string;
    sixteenHrs: string;
  };
  taskExamples: { short: string; long: string };
  unreliableZoneCaption: string;
  sourceLabel: string;
  sourceUrl: string;
}

export function MetrChart({
  title,
  xAxisLabel,
  yAxisLabel,
  scaleToggle,
  yAnchorLabels,
  taskExamples,
  unreliableZoneCaption,
  sourceLabel,
  sourceUrl,
}: MetrChartProps) {
  const [scale, setScale] = useState<ScaleMode>("linear");
  // "static" = fully drawn (SSR, no-JS, reduced motion). The hidden → drawing
  // cycle only ever happens client-side after mount, so server HTML always
  // shows the finished chart and there is no hydration mismatch.
  const [phase, setPhase] = useState<"static" | "hidden" | "drawing">("static");
  const [fast, setFast] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const el = wrapRef.current;
    if (reducedRef.current || !el || typeof IntersectionObserver === "undefined") {
      return;
    }
    setPhase("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setPhase("drawing"))
          );
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const switchScale = (next: ScaleMode) => {
    if (next === scale) return;
    setScale(next);
    if (phase === "drawing" && !reducedRef.current) {
      // Snap to hidden with the new geometry (transitions off), then redraw fast.
      setFast(true);
      setPhase("hidden");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setPhase("drawing"))
      );
    }
  };

  const hidden = phase === "hidden";
  const drawing = phase === "drawing";
  const duration = fast ? 650 : 1600;

  const solid = POINTS.filter((p) => !p.unreliable);
  const outlier = POINTS.find((p) => p.unreliable);
  const coords = solid.map((p) => ({
    ...p,
    x: xPos(p.year),
    y: yPos(p.minutes, scale),
  }));

  let totalLen = 0;
  const fractions = coords.map((c, i) => {
    if (i > 0) {
      totalLen += Math.hypot(c.x - coords[i - 1].x, c.y - coords[i - 1].y);
    }
    return totalLen;
  });
  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const pointStyle = (lengthAt: number) => ({
    opacity: hidden ? 0 : 1,
    transition: drawing
      ? `opacity 400ms ease ${Math.round((lengthAt / totalLen) * duration)}ms`
      : "none",
  });

  const yTicks = [
    ...(scale === "log" ? [{ v: 1, label: yAnchorLabels.oneMin }] : []),
    { v: 30, label: yAnchorLabels.thirtyMin },
    { v: 120, label: yAnchorLabels.twoHrs },
    { v: 480, label: yAnchorLabels.eightHrs },
    { v: 960, label: yAnchorLabels.sixteenHrs },
  ];

  const bandTop = MARGIN.top;
  const bandBottom = yPos(UNRELIABLE_MIN, scale);

  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="max-w-md text-base font-semibold text-slate-900">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{scaleToggle.label}</span>
          <div
            role="group"
            aria-label={scaleToggle.label}
            className="flex rounded-full border border-slate-200 bg-slate-50 p-0.5"
          >
            {(["linear", "log"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={scale === mode}
                onClick={() => switchScale(mode)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  scale === mode
                    ? "bg-[var(--color-accent-primary)] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {scaleToggle[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="mt-3 w-full"
        style={{ aspectRatio: "800 / 460" }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-full w-full"
          role="img"
          aria-label={title}
        >
          {/* unreliable zone */}
          <rect
            x={MARGIN.left}
            y={bandTop}
            width={PLOT_W}
            height={Math.max(bandBottom - bandTop, 0)}
            className="fill-slate-100"
            opacity={0.8}
          />
          <text
            x={MARGIN.left + PLOT_W / 2}
            y={(bandTop + bandBottom) / 2 + 4}
            textAnchor="middle"
            fontStyle="italic"
            className="fill-slate-400 text-[15px] sm:text-[11px]"
          >
            {unreliableZoneCaption}
          </text>

          {/* gridlines + y ticks */}
          {yTicks.map((tick) => {
            const ty = yPos(tick.v, scale);
            return (
              <g key={tick.v}>
                <line
                  x1={MARGIN.left}
                  x2={PLOT_RIGHT}
                  y1={ty}
                  y2={ty}
                  className="stroke-slate-200"
                  strokeDasharray="3 4"
                />
                <text
                  x={MARGIN.left - 8}
                  y={ty + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[15px] sm:text-[11px]"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* x axis */}
          <line
            x1={MARGIN.left}
            x2={PLOT_RIGHT}
            y1={PLOT_BOTTOM}
            y2={PLOT_BOTTOM}
            className="stroke-slate-300"
          />
          {YEARS.map((year) => (
            <g key={year} className={year % 2 === 1 ? "" : "max-sm:hidden"}>
              <line
                x1={xPos(year)}
                x2={xPos(year)}
                y1={PLOT_BOTTOM}
                y2={PLOT_BOTTOM + 5}
                className="stroke-slate-300"
              />
              <text
                x={xPos(year)}
                y={PLOT_BOTTOM + 22}
                textAnchor="middle"
                className="fill-slate-500 text-[15px] sm:text-[11px]"
              >
                {year}
              </text>
            </g>
          ))}

          {/* axis titles */}
          <text
            x={MARGIN.left + PLOT_W / 2}
            y={VB_H - 10}
            textAnchor="middle"
            className="fill-slate-600 text-[15px] font-medium sm:text-[11px]"
          >
            {xAxisLabel}
          </text>
          <text
            transform={`rotate(-90 16 ${MARGIN.top + PLOT_H / 2})`}
            x={16}
            y={MARGIN.top + PLOT_H / 2}
            textAnchor="middle"
            className="fill-slate-600 text-[15px] font-medium sm:text-[11px]"
          >
            {yAxisLabel}
          </text>

          {/* the line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-accent-primary)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="max-sm:[stroke-width:4]"
            style={{
              strokeDasharray: totalLen,
              strokeDashoffset: hidden ? totalLen : 0,
              transition: drawing
                ? `stroke-dashoffset ${duration}ms cubic-bezier(0.33, 0, 0.2, 1)`
                : "none",
            }}
          />

          {/* data points */}
          {coords.map((c, i) => (
            <circle
              key={c.label ?? c.year}
              cx={c.x}
              cy={c.y}
              r={c.label ? 4.5 : 3}
              className={
                c.label
                  ? "fill-white stroke-[var(--color-accent-primary)] [stroke-width:2] max-sm:[r:7]"
                  : "fill-[var(--color-accent-secondary)] max-sm:[r:5]"
              }
              style={pointStyle(fractions[i])}
            />
          ))}

          {/* desktop point labels */}
          <g className="max-sm:hidden">
            {coords.map(
              (c, i) =>
                c.label && (
                  <text
                    key={c.label}
                    x={c.anchor === "left" ? c.x - 10 : c.x}
                    y={
                      (c.anchor === "left" ? c.y + 4 : c.y - 11) +
                      ((scale === "log" ? c.dyLog : undefined) ?? c.dy ?? 0)
                    }
                    textAnchor={c.anchor === "left" ? "end" : "middle"}
                    className="fill-slate-600 text-[11.5px] font-medium"
                    style={pointStyle(fractions[i])}
                  >
                    {c.label}
                  </text>
                )
            )}
          </g>

          {/* sparse mobile point labels */}
          <g className="sm:hidden">
            {coords.map(
              (c, i) =>
                c.mobile && (
                  <text
                    key={c.label}
                    x={c.anchor === "left" ? c.x - 14 : c.x}
                    y={c.anchor === "left" ? c.y + 6 : c.y - 14}
                    textAnchor={c.anchor === "left" ? "end" : "middle"}
                    className="fill-slate-600 text-[16px] font-medium"
                    style={pointStyle(fractions[i])}
                  >
                    {c.label}
                  </text>
                )
            )}
          </g>

          {/* outlier in the unreliable zone */}
          {outlier && (
            <g style={pointStyle(totalLen * 1.1)}>
              <circle
                cx={xPos(outlier.year)}
                cy={yPos(outlier.minutes, scale)}
                r={4.5}
                className="fill-white stroke-slate-400 [stroke-width:2] max-sm:[r:7]"
              />
              <text
                x={xPos(outlier.year) - 10}
                y={yPos(outlier.minutes, scale) + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11.5px] font-medium max-sm:hidden"
              >
                {outlier.label}
              </text>
            </g>
          )}
        </svg>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          {yAnchorLabels.thirtyMin} ≈ {taskExamples.short} ·{" "}
          {yAnchorLabels.sixteenHrs} ≈ {taskExamples.long}
        </span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-slate-300 underline-offset-2 transition hover:text-[var(--color-accent-primary)]"
        >
          {sourceLabel}
        </a>
      </figcaption>
    </figure>
  );
}
