import { IMPACT } from "@/app/data/impact";

export type ImpactStatKey =
  | "communityMembers"
  | "fellowshipPlacements"
  | "fullTimeRoles"
  | "publications";

/**
 * Row of headline numbers. Values come from `app/data/impact.ts`; labels are
 * passed in from the dictionary so home and About can never show different
 * figures for the same thing.
 */
export function ImpactStats({
  labels,
  keys = [
    "communityMembers",
    "fellowshipPlacements",
    "fullTimeRoles",
    "publications",
  ],
  className = "",
}: {
  labels: Partial<Record<ImpactStatKey, string>>;
  keys?: ImpactStatKey[];
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-6 sm:gap-10 text-center ${className}`}
    >
      {keys.map((key) => (
        <div key={key} className="social-proof-stat">
          <span className="stat-number">{IMPACT[key]}</span>
          <span className="stat-label">{labels[key]}</span>
        </div>
      ))}
    </div>
  );
}
