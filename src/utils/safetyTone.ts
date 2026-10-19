/**
 * The friendly voice of the "Is it safe?" page and its home-page row.
 *
 * The guide's own data (womenSafety, journeyGuides) is written in many voices, so
 * this file only decides the wording the app puts around it: a plain, kind verdict
 * for each stay level, a one-line teaser for the home row, and a gentle rewrite of
 * the commonest blunt openings ("Avoid ..." -> "Better to skip ..."). It never hides
 * a risk: restricted areas, bad air and scams are still listed, with the reason.
 */
import type { Destination } from "@/data/destinations";
import { getJourneyGuide } from "@/data/journeyGuides";

/** Placeholders in the avoid / safe lists ("N/A — a well-managed attraction") are not places. */
const PLACEHOLDER = /^(n\/a|none|no specific|nothing)/i;
const AFTER_DARK = /night|dark|after \d|evening|late|9pm|10pm|11pm/i;

export function cleanAreas(items: string[] | undefined): string[] {
  return (items ?? []).map((s) => s.trim()).filter((s) => s && !PLACEHOLDER.test(s));
}

/** "Avoid X" -> "Better to skip X"; "Don't X" / "Never X" -> "Best not to X". */
export function softened(text: string): string {
  return text
    .replace(/^Avoid /i, "Better to skip ")
    .replace(/^(Don't|Do not|Never|Do NOT) /i, "Best not to ");
}

/** Our guide has something to say about evenings here (an area to skip, or a night-worded tip). */
export function hasEveningTips(d: Destination): boolean {
  const ws = d.womenSafety;
  return cleanAreas(ws.avoidAreas).length > 0 || ws.precautions.some((p) => AFTER_DARK.test(p));
}

/** One calm sentence for the top of the page. */
export function safetyVerdict(d: Destination): string {
  const base: Record<Destination["womenSafety"]["level"], string> = {
    "Very Safe": "A comfortable place for women to explore, including on your own.",
    Safe: "A comfortable place for most visitors. A few easy habits help.",
    Moderate: "Lovely to explore with a little planning. Busy tourist areas are the easiest.",
    "Exercise Caution": "Best explored with a little extra planning, ideally with company. Busy places and daylight make it easier.",
  };
  return base[d.womenSafety.level] + (hasEveningTips(d) ? " Evenings are nicest in busy, well-lit areas." : "");
}

/** The one line under "Is it safe?" on the home page. */
export function safetyTeaser(d: Destination): string {
  switch (d.womenSafety.level) {
    case "Very Safe":
    case "Safe":
      return hasEveningTips(d) ? "Easy going by day · evenings best in busy areas" : "Easy going, day and night";
    case "Moderate":
      return "Easy in busy areas · plan a little for evenings";
    default:
      return "Best with company · plan ahead for evenings";
  }
}

/** Notes in the guide's advisory that it marks as a warning (air quality, restricted areas...). */
export function headsUpCount(d: Destination): number {
  return getJourneyGuide(d.id)?.travelAdvisory?.alerts.filter((a) => a.level === "warning").length ?? 0;
}
