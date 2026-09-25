import { AnnouncementBar } from "./announcement-bar";
import { SmartLink } from "./smart-link";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { getCourseOpportunities } from "@/app/data/course-opportunities";
import type { AppLocale } from "@/i18n.config";

/**
 * Course announcement for the lab pages. The copy follows the live course
 * status, so it never says "open" before applications actually are.
 */
export async function LabAnnouncement({
  locale,
  dict,
}: {
  locale: AppLocale;
  dict: Dictionary;
}) {
  const t = dict.lab.announcement;
  const courses = await getCourseOpportunities();
  const anyOpen = courses.some((c) => c.status === "applications_open");

  return (
    <AnnouncementBar
      id={`${t.id}-${anyOpen ? "open" : "eoi"}`}
      dismissLabel={t.dismiss}
    >
      {anyOpen ? t.open : t.eoi}{" "}
      <SmartLink href="/lab#programs" locale={locale} className="lab-link">
        {t.cta}
        <span aria-hidden="true">→</span>
      </SmartLink>
    </AnnouncementBar>
  );
}
