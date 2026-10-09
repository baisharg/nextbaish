import Image from "next/image";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import {
  getPastEvents,
  getUpcomingEvents,
  LUMA_CALENDAR_URL,
  LUMA_GOOGLE_CALENDAR_URL,
  type LumaEvent,
} from "@/app/data/luma";
import type { AppLocale } from "@/i18n.config";

const INTL_LOCALE: Record<AppLocale, string> = { en: "en-US", es: "es-AR" };

/** Date parts in the event's own timezone, in the page's language */
function dateParts(event: LumaEvent, locale: AppLocale) {
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      timeZone: event.timezone,
      ...options,
    });
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const time = fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
  return {
    day: fmt({ day: "numeric" }).format(start),
    month: fmt({ month: "short" }).format(start).replace(".", ""),
    weekday: fmt({ weekday: "short" }).format(start).replace(".", ""),
    time: `${time.format(start)}–${time.format(end)}`,
    short: fmt({ day: "numeric", month: "short", year: "numeric" })
      .format(start)
      .replace(".", ""),
  };
}

function Cover({ event, size }: { event: LumaEvent; size: number }) {
  if (!event.coverUrl) {
    return <div className="lab-event-cover lab-event-cover-empty" aria-hidden="true" />;
  }
  return (
    <Image
      className="lab-event-cover"
      src={event.coverUrl}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
    />
  );
}

/**
 * Upcoming events from the BAISH Luma calendar, as a list hung on a single
 * thread (a knot per event), with a strip of recent events below. With
 * nothing scheduled, it says so and offers the calendar subscription.
 */
export async function LabEvents({
  locale,
  dict,
}: {
  locale: AppLocale;
  dict: Dictionary;
}) {
  const t = dict.lab.events;
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(6),
    getPastEvents(3),
  ]);

  const subscribe = (
    <div className="lab-events-actions">
      <a
        className="lab-button lab-button-sm"
        href={LUMA_GOOGLE_CALENDAR_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.subscribe}
        <span aria-hidden="true">↗</span>
      </a>
      <a
        className="lab-link lab-link-sm"
        href={LUMA_CALENDAR_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.follow}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );

  return (
    <div className="lab-events">
      {upcoming.length > 0 ? (
        <ol className="lab-events-list">
          {upcoming.map((event) => {
            const d = dateParts(event, locale);
            const place = event.online
              ? t.online
              : [event.venue, event.city].filter(Boolean).join(", ");
            const full = !event.registrationOpen || event.spotsRemaining === 0;
            return (
              <li key={event.id} className="lab-event">
                <time className="lab-event-date" dateTime={event.startAt}>
                  <span className="lab-event-day">{d.day}</span>
                  <span className="lab-event-month">
                    {d.month}
                    <span className="lab-event-sep"> · </span>
                    <span className="lab-event-weekday">{d.weekday}</span>
                  </span>
                </time>
                <div className="lab-event-body">
                  <h3 className="lab-event-name">
                    <a href={event.url} target="_blank" rel="noopener noreferrer">
                      {event.name}
                    </a>
                  </h3>
                  <p className="lab-event-meta">
                    {d.time}
                    {place && <> · {place}</>}
                  </p>
                  <div className="lab-event-foot">
                    <a
                      className="lab-button lab-button-sm"
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${full ? t.waitlist : t.register}: ${event.name}`}
                      data-thread-lift
                    >
                      {full ? t.waitlist : t.register}
                      <span aria-hidden="true">↗</span>
                    </a>
                    {!full && event.spotsRemaining !== null && event.spotsRemaining <= 20 && (
                      <span className="lab-event-spots">
                        {t.spotsLeft.replace("{count}", String(event.spotsRemaining))}
                      </span>
                    )}
                  </div>
                </div>
                <Cover event={event} size={160} />
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="lab-events-empty">
          <p className="lab-events-empty-title">{t.emptyTitle}</p>
          <p className="lab-body">{t.emptyText}</p>
        </div>
      )}

      {subscribe}

      {past.length > 0 && (
        <div className="lab-events-past">
          <h3 className="lab-team-heading">{t.pastTitle}</h3>
          <ul>
            {past.map((event) => (
              <li key={event.id}>
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  <Cover event={event} size={96} />
                  <span>
                    <span className="lab-event-past-date">
                      {dateParts(event, locale).short}
                    </span>
                    <span className="lab-event-past-name">{event.name}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
