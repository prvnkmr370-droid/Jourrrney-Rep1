/**
 * What the "How to get there" section on a destination's home page says, read
 * from the place's transport list (mode, time, cost, tip) and its journey guide
 * (the airport, station or bus stand to arrive at). Nothing here depends on where
 * the traveller starts: that is the route planner's job, one tap away.
 *
 * Some of the written text was made for the old "Getting There" tab ("see the
 * Getting There tab for a route from your city"). That tab is gone, so those
 * sentences are dropped here rather than pointing at something that isn't there.
 */
import type { Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";

export type ReachKind = "flight" | "train" | "water" | "road" | "other";

export interface ReachMode {
  key: string;
  /** As the data words it: "Flight", "Ferry", "Road (from Guwahati)". */
  mode: string;
  kind: ReachKind;
  duration: string;
  cost: string;
  /** Where to arrive: "Agra Cantt (AGC) — Main Station · 3 km from Taj Mahal". */
  arrival: string;
  tip: string;
}

const OLD_TAB = /getting there/i;
// "—", "N/A", and filler such as "Varies by origin" say nothing a traveller can use.
const NOTHING = /^((—|-|–|n\/a|na)|varies( by [a-z /]{1,24})?)?$/i;

export function kindOf(mode: string): ReachKind {
  const m = mode.toLowerCase();
  if (/flight|air|helicopter/.test(m)) return "flight";
  if (/train|rail/.test(m)) return "train";
  if (/ferry|boat|ship|cruise/.test(m)) return "water";
  if (/road|bus|cab|car|drive/.test(m)) return "road";
  return "other";
}

/** Drops the sentences that point at the old tab. */
function withoutOldTab(text: string): string {
  return (text ?? "").split(/(?<=[.!?])\s+/).filter((s) => s && !OLD_TAB.test(s)).join(" ").trim();
}

/** "N/A (train preferred)" -> "Train preferred"; "—" and "N/A" -> "". */
function plain(value: string): string {
  const v = (value ?? "").trim();
  if (NOTHING.test(v)) return "";
  const na = /^n\/a\s*\((.*)\)$/i.exec(v);
  if (na) return na[1].charAt(0).toUpperCase() + na[1].slice(1);
  return v;
}

function arrivalFor(kind: ReachKind, guide: JourneyGuide | undefined): string {
  const ap = guide?.arrivalPoints.find((a) => kindOf(a.by) === kind);
  if (!ap || /^by /i.test(ap.name.trim())) return ""; // "By car, cab, or bus" is not a place
  const distance = OLD_TAB.test(ap.distanceFromCity) ? "" : ap.distanceFromCity.trim();
  return distance ? `${ap.name.trim()} · ${distance}` : ap.name.trim();
}

export function reachModes(d: Destination, guide: JourneyGuide | undefined): ReachMode[] {
  // About 160 lesser-known places carry transport text written from a template (it
  // points at the old "Getting There" tab). Their guide's arrival points can
  // contradict that text (Bhaderwah: an airport "~11 km" away, while its own text says the
  // nearest is ~88 km), so for those places the arrival line is left out.
  const template = d.transport.some((t) => OLD_TAB.test(t.tips ?? ""));
  return d.transport
    .map((t, i) => {
      const kind = kindOf(t.mode);
      return {
        key: `${i}-${t.mode}`,
        mode: t.mode.trim(),
        kind,
        duration: plain(t.duration),
        cost: plain(t.costRange),
        arrival: template ? "" : arrivalFor(kind, guide),
        tip: withoutOldTab(t.tips),
      };
    })
    .filter((m) => m.duration || m.cost || m.arrival || m.tip);
}

/** How to get from the arrival point to the main sight, or "" when the guide has none. */
export function sightText(guide: JourneyGuide | undefined): string {
  return withoutOldTab(guide?.fromCityToSight ?? "");
}
