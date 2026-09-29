import { AnnouncementBar } from "./announcement-bar";
import { SmartLink } from "./smart-link";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { getCourseOpportunities } from "@/app/data/course-opportunities";
import type { AppLocale } from "@/i18n.config";

/**
 * Course announcement for the lab pages, shown only while applications are
 * open. Before that, the programs table already says when courses open.
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
  if (!anyOpen) return null;

  return (
    <AnnouncementBar id={`${t.id}-open`} dismissLabel={t.dismiss}>
      {t.open}{" "}
      <SmartLink href="/lab#programs" locale={locale} className="lab-link">
        {t.cta}
        <span aria-hidden="true">→</span>
      </SmartLink>
    </AnnouncementBar>
  );
}
