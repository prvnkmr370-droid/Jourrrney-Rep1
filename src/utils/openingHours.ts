/**
 * Turns the two places opening hours can come from into the same seven rows:
 *
 *  - live Google Maps weekday lines ("Monday: 6:00 AM – 1:00 PM, 5:00 PM – 9:00 PM")
 *    fetched through our backend (see hooks/useOpeningHours.ts), and
 *  - the hand-curated `visitingHours` on each destination card
 *    ({ opens, closes, note }), which has no per-day detail of its own.
 *
 * For the curated data a weekday is only marked closed when the note's own
 * sentence says exactly that ("Closed on Mondays.", "Closed Sundays and
 * Mondays; ...", "Closed Mondays and national holidays."). Anything vaguer
 * — "museum closed Fridays", "second Saturday", "evening safaris closed
 * Wednesdays" — is left in the note rather than guessed into a day, because a
 * wrong "Closed" on a day is worse than a missing one.
 */
import type { VisitingHours } from "@/data/destinations";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export interface DayRow {
  day: (typeof DAYS)[number];
  /** One entry per opening session, e.g. ["6:00 AM – 1:00 PM", "5:00 PM – 9:00 PM"]. */
  sessions: string[];
  closed: boolean;
}

export interface WeeklyHours {
  rows: DayRow[];
  /** True when every day reads the same, so a day-by-day list adds nothing. */
  uniform: boolean;
  source: "google" | "curated";
}

const DAY_ALIASES: Record<string, number> = {
  mon: 0, monday: 0, mondays: 0,
  tue: 1, tues: 1, tuesday: 1, tuesdays: 1,
  wed: 2, weds: 2, wednesday: 2, wednesdays: 2,
  thu: 3, thur: 3, thurs: 3, thursday: 3, thursdays: 3,
  fri: 4, friday: 4, fridays: 4,
  sat: 5, saturday: 5, saturdays: 5,
  sun: 6, sunday: 6, sundays: 6,
};

/** 0 = Monday … 6 = Sunday, in India's timezone (every destination here is). */
export function todayIndex(now: Date = new Date()): number {
  try {
    const name = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Kolkata" }).format(now);
    const i = DAYS.indexOf(name as (typeof DAYS)[number]);
    if (i >= 0) return i;
  } catch {
    // Intl without timeZone support — fall through to the device's own day.
  }
  return (now.getDay() + 6) % 7;
}

const cleanSpaces = (s: string) => s.replace(/[   ]/g, " ").replace(/\s+/g, " ").trim();

function sessionsOf(text: string): string[] {
  return text.split(/\s*,\s*(?=\d{1,2}(?::\d{2})?\s?(?:AM|PM|am|pm)?\s*[–-])/).map((s) => s.trim()).filter(Boolean);
}

function isUniform(rows: DayRow[]): boolean {
  const key = (r: DayRow) => (r.closed ? "closed" : r.sessions.join("|"));
  return rows.every((r) => key(r) === key(rows[0]));
}

/** Google's `weekdayDescriptions` (always 7 lines, Monday first in English). */
export function fromGoogle(lines: string[]): WeeklyHours | null {
  if (!Array.isArray(lines) || lines.length !== 7) return null;
  const rows: DayRow[] = [];
  for (const line of lines) {
    const clean = cleanSpaces(String(line));
    const at = clean.indexOf(":");
    if (at < 0) return null;
    const dayIdx = DAY_ALIASES[clean.slice(0, at).trim().toLowerCase()];
    if (dayIdx === undefined) return null;
    const text = clean.slice(at + 1).trim();
    if (!text) return null;
    const closed = /^closed$/i.test(text);
    rows[dayIdx] = { day: DAYS[dayIdx], closed, sessions: closed ? [] : sessionsOf(text) };
  }
  if (rows.length !== 7 || rows.some((r) => !r)) return null;
  return { rows, uniform: isUniform(rows), source: "google" };
}

/** Days named by a note sentence that is purely "Closed [on] <days> [and national holidays]". */
export function closedDaysFromNote(note: string | undefined): number[] {
  if (!note) return [];
  const dayWord = "(?:mon|tues?|wed(?:nes)?|thu(?:rs?)?|fri|sat(?:ur)?|sun)(?:day)?s?";
  const pattern = new RegExp(
    `^closed\\s+(?:on\\s+)?(?:every\\s+)?(${dayWord}(?:\\s*(?:,|and|&)\\s*${dayWord})*)(?:\\s+and\\s+(?:national|public|gazetted|government)\\s+holidays?)?$`,
    "i",
  );
  for (const sentence of note.split(/[.;]\s*/)) {
    const m = sentence.trim().match(pattern);
    if (!m) continue;
    const out = new Set<number>();
    for (const word of m[1].toLowerCase().split(/\s*(?:,|and|&)\s*/)) {
      const idx = DAY_ALIASES[word.trim()];
      if (idx !== undefined) out.add(idx);
    }
    return [...out];
  }
  return [];
}

/** The card's own { opens, closes, note }, spread over the week. */
export function fromCurated(v: VisitingHours | undefined): WeeklyHours | null {
  if (!v || !v.opens) return null;
  const text = v.closes && v.closes !== v.opens ? `${v.opens} – ${v.closes}` : v.opens;
  const closedDays = new Set(closedDaysFromNote(v.note));
  const rows: DayRow[] = DAYS.map((day, i) =>
    closedDays.has(i) ? { day, closed: true, sessions: [] } : { day, closed: false, sessions: [text] },
  );
  return { rows, uniform: isUniform(rows), source: "curated" };
}
