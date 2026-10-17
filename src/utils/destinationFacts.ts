/**
 * Short, plain-language facts for the destination page's quick-facts row and
 * "Explore" tiles, derived from the data each destination already has:
 *
 *  - openStatus     "Open now · Closes 6:30 PM", the usual hours and closed days, worked
 *                   out from the curated visiting hours and the time in India right now
 *  - bestTimeMonths the best time to visit as one short line of months
 *  - fromPrice      cheapest stay from the accommodation price ranges
 *  - modesPhrase    "By flight, train or road" from the transport list
 *
 * Everything here is cautious: if the data isn't in a shape we can read with
 * confidence, the function says less (or returns null) instead of guessing.
 */
import type { VisitingHours } from "@/data/destinations";
import { DAYS, closedDaysFromNote, todayIndex } from "@/utils/openingHours";

const MONTH_NAMES: Record<string, string> = {
  january: "Jan", february: "Feb", march: "Mar", april: "Apr", may: "May", june: "Jun",
  july: "Jul", august: "Aug", september: "Sep", sept: "Sep", october: "Oct", november: "Nov", december: "Dec",
};
const MONTH_RE = "(?:january|february|march|april|may|june|july|august|september|sept|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)";
const MOD_RE = "(?:(?:early|mid|late)[ -]?)?";
const WINDOW = new RegExp(`\\b(${MOD_RE})(${MONTH_RE})\\b\\.?(?:\\s*(?:–|-|—|\\bto\\b)\\s*(${MOD_RE})(${MONTH_RE})\\b\\.?)?`, "gi");
// Where a best-time sentence stops being "the months" and starts being a reason or a warning.
const STOP = /;|\(| for | with | avoid| if | — |\. | but | unless | when /i;

const monthAbbr = (m: string) => {
  const k = m.toLowerCase();
  return MONTH_NAMES[k] ?? (k.charAt(0).toUpperCase() + k.slice(1, 3));
};
const withModifier = (mod: string, month: string) => {
  const m = mod.trim().replace(/-$/, "").toLowerCase();
  return m ? `${m}-${monthAbbr(month)}`.replace(/^(early|late)-/, "$1 ") : monthAbbr(month);
};

/**
 * The best time to visit as one short line of months, for the note under the
 * status: "Nov – Apr", "Apr – Jun and Sep – Nov", "Feb – Mar and late Oct – mid-Nov".
 * The place's own sentence can carry reasons and warnings ("avoid July – August
 * (landslide risk)", "winter for migratory birds"); those are left out on
 * purpose, and the full sentence stays in the data and on the Trip Prep screens.
 * A second visiting window is kept. With no months in the text ("Year-round")
 * the first few words are shown as written.
 */
export function bestTimeMonths(raw: string | undefined): string {
  const text = (raw ?? "").trim();
  if (!text) return "";
  const firstClause = text.split(STOP)[0].trim();
  if (/^(year[- ]round|all year|any time|throughout the year)/i.test(firstClause)) return "Year-round";

  const windows = (source: string) => {
    const out: string[] = [];
    for (const m of source.matchAll(WINDOW)) {
      const a = withModifier(m[1] ?? "", m[2]);
      const b = m[4] ? withModifier(m[3] ?? "", m[4]) : null;
      out.push(b && b !== a ? `${a} – ${b}` : a);
    }
    return out;
  };
  let found = windows(firstClause);
  if (found.length === 0) found = windows(text).slice(0, 2);
  if (found.length > 0) {
    const shown = found.slice(0, 3);
    return shown.length === 1 ? shown[0] : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
  }
  // No months at all: a season word if there is one ("Summer"), otherwise the first few words as written.
  const season = /\b(post-monsoon|pre-monsoon|monsoon|winter|summer|spring|autumn)\b/i.exec(firstClause);
  if (season) return season[1].charAt(0).toUpperCase() + season[1].slice(1).toLowerCase();
  const cut = firstClause.replace(/[.,]+$/, "");
  return cut.length > 40 ? `${cut.slice(0, 38).replace(/\s+\S*$/, "")}…` : cut;
}

/** "9:00 AM" -> minutes since midnight, or null if it isn't a plain clock time. */
export function parseClock(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) return null;
  const h = Number(m[1]) % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0);
  return h * 60 + Number(m[2]);
}

function indiaMinutes(now: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).formatToParts(now);
    const h = Number(parts.find((p) => p.type === "hour")?.value);
    const m = Number(parts.find((p) => p.type === "minute")?.value);
    if (Number.isFinite(h) && Number.isFinite(m)) return (h % 24) * 60 + m;
  } catch {
    // No timezone support: fall through to the device clock.
  }
  return now.getHours() * 60 + now.getMinutes();
}

/** "Closing soon" means closing within this many minutes. */
const CLOSING_SOON_MINUTES = 60;

export interface OpenStatus {
  kind: "open" | "closed" | "always" | "text";
  /** Short heading: "Open now", "Closing soon", "Closed now", "Closed today" or "Hours". */
  label: string;
  /** Second line, e.g. "Closes 6:30 PM", "Opens 9:00 AM", "Opens tomorrow, 9:00 AM", "Sunrise – Sunset". */
  detail: string;
  /** Open, but closing within the hour. */
  soon?: boolean;
  /** The usual daily hours, "9:00 AM – 6:30 PM", when both are plain clock times. */
  usual?: string;
  /** "Closed Mondays" or "Open daily", only when the note says so plainly. */
  days?: string;
}

/** "Closed Mondays", "Closed Sundays and Mondays" or "Open daily", read from a note; undefined when it isn't that plain. */
export function daysText(note: string | undefined): string | undefined {
  const closed = closedDaysFromNote(note);
  if (closed.length > 0) {
    // Kept in the order the note gives them ("Sundays and Mondays").
    const names = closed.map((i) => `${DAYS[i]}s`);
    return `Closed ${names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`}`;
  }
  // "Open daily; boating only in daylight" is plain; "Closed the second Saturday; open daily otherwise" is not.
  if (note && /\bopen daily\b/i.test(note) && !/\b(closed|except|apart from|but)\b/i.test(note)) return "Open daily";
  return undefined;
}

/** What to say about opening hours right now, or null when there are no hours. */
export function openStatus(v: VisitingHours | undefined, now: Date = new Date()): OpenStatus | null {
  if (!v || !v.opens) return null;
  const opens = v.opens.trim();
  const closes = (v.closes ?? "").trim();

  if (/24\s*hours/i.test(opens) || (opens === "12:00 AM" && closes === "12:00 AM")) {
    const note = /\(([^)]+)\)/.exec(opens)?.[1];
    return { kind: "always", label: "Open now", detail: note ? `24 hours · ${note}` : "24 hours" };
  }

  const o = parseClock(opens);
  const c = parseClock(closes);
  if (o == null || c == null) {
    // "Sunrise – Sunset", "Daylight hours", "Varies" ...: show as written.
    return { kind: "text", label: "Hours", detail: closes && closes !== opens ? `${opens} – ${closes}` : opens };
  }

  const usual = `${opens} – ${closes}`;
  const days = daysText(v.note);

  const today = todayIndex(now);
  const closedDays = closedDaysFromNote(v.note);
  const nextOpen = () => {
    for (let i = 1; i <= 7; i++) {
      const idx = (today + i) % 7;
      if (!closedDays.includes(idx)) return i === 1 ? "tomorrow" : DAYS[idx];
    }
    return "tomorrow";
  };

  if (closedDays.includes(today)) return { kind: "closed", label: "Closed today", detail: `Opens ${nextOpen()}, ${opens}`, usual, days };

  const nowMin = indiaMinutes(now);
  const isOpen = o < c ? nowMin >= o && nowMin < c : nowMin >= o || nowMin < c;
  if (isOpen) {
    const minutesLeft = (c - nowMin + 1440) % 1440;
    const soon = minutesLeft <= CLOSING_SOON_MINUTES;
    return { kind: "open", label: soon ? "Closing soon" : "Open now", detail: `Closes ${closes}`, soon, usual, days };
  }
  if (nowMin < o) return { kind: "closed", label: "Closed now", detail: `Opens ${opens}`, usual, days };
  return { kind: "closed", label: "Closed now", detail: `Opens ${nextOpen()}, ${opens}`, usual, days };
}

/** Cheapest nightly price across the accommodation types, in rupees (or null). */
export function fromPrice(accommodation: { priceRange: string }[] | undefined): number | null {
  let best: number | null = null;
  for (const a of accommodation ?? []) {
    if (!/night/i.test(a.priceRange)) continue;
    const m = a.priceRange.match(/₹\s*([\d,]+)/);
    if (!m) continue;
    const n = Number(m[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0 && (best == null || n < best)) best = n;
  }
  return best;
}

/** ["Flight", "Train", "Road"] -> "By flight, train or road". */
export function modesPhrase(transport: { mode: string }[] | undefined): string {
  const modes = [...new Set((transport ?? []).map((t) => t.mode.trim().toLowerCase()).filter(Boolean))].slice(0, 3);
  if (modes.length === 0) return "Flights, trains and road";
  if (modes.length === 1) return `By ${modes[0]}`;
  return `By ${modes.slice(0, -1).join(", ")} or ${modes[modes.length - 1]}`;
}
