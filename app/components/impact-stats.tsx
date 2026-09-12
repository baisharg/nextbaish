import { IMPACT } from "@/app/data/impact";

export type ImpactStatKey =
  | "communityMembers"
  | "fellowshipPlacements"
  | "fullTimeRoles"
  | "publications";

type Layout = "row" | "grid";

const LAYOUT_CLASSES: Record<Layout, string> = {
  /** Centered wrapping row, used on the home page. */
  row: "flex flex-wrap justify-center gap-6 sm:gap-10",
  /** Two-column grid, used in the About sidebar. */
  grid: "grid grid-cols-2 gap-6",
};

/**
 * Row of headline numbers. Values come from `app/data/impact.ts`; labels are
 * passed in from the dictionary so home and About can never show different
 * figures for the same thing.
 *
 * The component owns its layout classes. To add outer spacing, wrap it in a
 * container instead of passing classes that would compete with them.
 */
export function ImpactStats({
  labels,
  keys = [
    "communityMembers",
    "fellowshipPlacements",
    "fullTimeRoles",
    "publications",
  ],
  layout = "row",
}: {
  labels: Partial<Record<ImpactStatKey, string>>;
  keys?: ImpactStatKey[];
  layout?: Layout;
}) {
  return (
    <div className={`${LAYOUT_CLASSES[layout]} text-center`}>
      {keys.map((key) => (
        <div key={key} className="social-proof-stat">
          <span className="stat-number">{IMPACT[key]}</span>
          <span className="stat-label">{labels[key]}</span>
        </div>
      ))}
    </div>
  );
}
