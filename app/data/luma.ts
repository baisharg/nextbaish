import "server-only";

/**
 * Public events from the BAISH Luma calendar, for server components.
 *
 * With LUMA_API_KEY set (Luma Plus; a calendar-scoped key) this uses the
 * official API at public-api.luma.com. Without it, it falls back to the
 * unauthenticated endpoint behind Luma's own calendar embed, which only
 * ever returns public events.
 *
 * Results are cached for REVALIDATE_SECONDS. Any failure returns an empty
 * list, so a missing key or a Luma outage never breaks a build or a page.
 */

export const LUMA_CALENDAR_ID = "cal-0oFAsTn5vpwcAwb";
export const LUMA_CALENDAR_URL = "https://luma.com/BAISH";
/** Adds every event to the visitor's Google Calendar, kept in sync */
export const LUMA_GOOGLE_CALENDAR_URL =
  "https://www.google.com/calendar/render?cid=http%3A%2F%2Fapi.lu.ma%2Fics%2Fget%3Fentity%3Dcalendar%26id%3D" +
  LUMA_CALENDAR_ID;

const REVALIDATE_SECONDS = 600;

export type LumaEvent = {
  id: string;
  name: string;
  url: string;
  startAt: string;
  endAt: string;
  /** IANA zone the event happens in; dates are shown in it */
  timezone: string;
  coverUrl: string | null;
  online: boolean;
  /** Venue name, only when Luma shows the address to everyone */
  venue: string | null;
  city: string | null;
  registrationOpen: boolean;
  /** Null when the event has no capacity limit */
  spotsRemaining: number | null;
};

type Address = {
  address?: string;
  city?: string;
  full_address?: string;
  description?: string;
} | null;

/** Fields shared by both endpoints, as each one names them */
type RawEvent = {
  id?: string;
  api_id?: string;
  name: string;
  url: string;
  start_at: string;
  end_at: string;
  timezone: string;
  cover_url?: string | null;
  visibility?: string;
  location_type?: string;
  location_visibility?: string;
  geo_address_json?: Address;
  geo_address_info?: Address;
  geo_address_visibility?: string;
  registration_open?: boolean;
  spots_remaining?: number | null;
};

const normalize = (raw: RawEvent, extra?: {
  registrationOpen?: boolean;
  spotsRemaining?: number | null;
}): LumaEvent => {
  const address = raw.geo_address_json ?? raw.geo_address_info ?? null;
  const addressPublic =
    (raw.location_visibility ?? raw.geo_address_visibility ?? "public") ===
    "public";
  return {
    id: raw.id ?? raw.api_id ?? raw.url,
    name: raw.name,
    url: raw.url.startsWith("http") ? raw.url : `https://luma.com/${raw.url}`,
    startAt: raw.start_at,
    endAt: raw.end_at,
    timezone: raw.timezone,
    coverUrl: raw.cover_url ?? null,
    online: raw.location_type !== undefined && raw.location_type !== "offline",
    venue: addressPublic ? (address?.address ?? null) : null,
    city: address?.city ?? null,
    registrationOpen: extra?.registrationOpen ?? raw.registration_open ?? true,
    spotsRemaining: extra?.spotsRemaining ?? raw.spots_remaining ?? null,
  };
};

async function fromOfficialApi(
  key: string,
  period: "future" | "past",
  limit: number,
): Promise<LumaEvent[]> {
  const now = new Date().toISOString();
  const params = new URLSearchParams({
    sort_column: "start_at",
    sort_direction: period === "future" ? "asc" : "desc",
    // Private events can be listed on the calendar too; over-fetch and
    // keep only public ones
    pagination_limit: String(limit * 3),
    [period === "future" ? "after" : "before"]: now,
  });
  const res = await fetch(
    `https://public-api.luma.com/v1/calendars/events/list?${params}`,
    {
      headers: { "x-luma-api-key": key },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["luma"] },
    },
  );
  if (!res.ok) throw new Error(`Luma API ${res.status}`);
  const data = (await res.json()) as { entries: RawEvent[] };
  return data.entries
    .filter((event) => event.visibility === "public")
    .slice(0, limit)
    .map((event) => normalize(event));
}

async function fromPublicEndpoint(
  period: "future" | "past",
  limit: number,
): Promise<LumaEvent[]> {
  const params = new URLSearchParams({
    calendar_api_id: LUMA_CALENDAR_ID,
    period,
    pagination_limit: String(limit),
  });
  const res = await fetch(`https://api.lu.ma/calendar/get-items?${params}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["luma"] },
  });
  if (!res.ok) throw new Error(`Luma ${res.status}`);
  const data = (await res.json()) as {
    entries: {
      event: RawEvent;
      ticket_info?: { is_sold_out?: boolean; spots_remaining?: number | null };
    }[];
  };
  return data.entries
    .filter((entry) => (entry.event.visibility ?? "public") === "public")
    .map((entry) =>
      normalize(entry.event, {
        registrationOpen: !entry.ticket_info?.is_sold_out,
        spotsRemaining: entry.ticket_info?.spots_remaining ?? null,
      }),
    );
}

async function listEvents(
  period: "future" | "past",
  limit: number,
): Promise<LumaEvent[]> {
  try {
    const key = process.env.LUMA_API_KEY;
    return key
      ? await fromOfficialApi(key, period, limit)
      : await fromPublicEndpoint(period, limit);
  } catch (error) {
    console.error("[luma] Could not load events:", error);
    return [];
  }
}

/** Upcoming public events, soonest first */
export const getUpcomingEvents = (limit = 6) => listEvents("future", limit);

/** Past public events, most recent first */
export const getPastEvents = (limit = 3) => listEvents("past", limit);
