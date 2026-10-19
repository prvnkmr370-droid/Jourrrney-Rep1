/**
 * What the "How to get there" section on a destination's home page says, read
 * from the place's transport list (mode, time, cost, tip), its journey guide (the
 * airport, station or bus stand to arrive at, and the steps from there to a stay)
 * and its local transport (autos, taxis, ferries once you are there). Nothing here
 * depends on where the traveller starts: that is the route planner's job.
 *
 * Some of the written text was made for the old "Getting There" tab ("see the
 * Getting There tab for a route from your city"). That tab is gone, so those
 * sentences are dropped here rather than pointing at something that isn't there.
 */
import type { Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";

export type ReachKind = "flight" | "train" | "water" | "road" | "other";
export type StepIcon = "bike" | "car" | "bus" | "footprints" | "pin";
export type LocalIcon = "ship" | "bike" | "bus" | "footprints" | "car";

export interface ReachStep {
  icon: StepIcon;
  action: string;
  cost: string;
  duration: string;
}

export interface ReachMode {
  key: string;
  /** "By train", "By air + road", "By road (from Guwahati)". */
  label: string;
  kind: ReachKind;
  /** The time as the guide writes it: "1.5–3h from Delhi". */
  duration: string;
  /** Just the time, for the row: "1.5–3h". */
  durationShort: string;
  /** The cost as the guide writes it: "₹800–₹2,500 cab / ₹200 bus". */
  cost: string;
  /** The first range only, for the row: "₹800–₹2,500". */
  costShort: string;
  /** Where to arrive: "Agra Cantt (AGC) — Main Station" ("" when the guide has none to trust). */
  arrivalName: string;
  /** "3 km from Taj Mahal". */
  arrivalDistance: string;
  tip: string;
  /** Steps from the airport / station / jetty / bus stand to a stay, at most three. */
  steps: ReachStep[];
  fastest: boolean;
  cheapest: boolean;
  bookAhead: boolean;
}

export interface LocalMode {
  key: string;
  icon: LocalIcon;
  mode: string;
  /** "" when the guide has no usable fare ("Varies by distance"). */
  cost: string;
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

const WORD: Record<ReachKind, string> = { flight: "air", train: "train", water: "water", road: "road", other: "" };

/** "Flight" -> "By air"; "Flight + Road" -> "By air + road"; "Road (from Guwahati)" keeps its bracket. */
export function labelOf(mode: string): string {
  const bracket = /\(([^)]*)\)/.exec(mode)?.[0];
  const base = mode.replace(/\([^)]*\)/g, "").trim();
  const parts = base.split("+").map((p) => {
    const k = kindOf(p);
    if (/helicopter/i.test(p)) return "helicopter";
    return WORD[k] || p.trim().toLowerCase();
  });
  return `By ${parts.join(" + ")}${bracket ? ` ${bracket}` : ""}`;
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

/** The time in minutes, or null when the text is not a clear time ("Jammu Airport is ~88 km away"). */
function minutesOf(text: string): number | null {
  const m = /(\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(h|hr|hrs|hour|hours|min|mins|minutes|day|days)\b/i.exec(text);
  if (!m) return null;
  const unit = m[2].toLowerCase();
  return parseFloat(m[1]) * (unit.startsWith("h") ? 60 : unit.startsWith("m") ? 1 : 1440);
}

/** The lowest rupee amount in the text ("₹800–₹2,500 cab / ₹200 bus" -> 200), or null. */
function lowestRupees(text: string): number | null {
  const all = [...text.matchAll(/₹\s*([\d,]+)/g)].map((m) => parseInt(m[1].replace(/,/g, ""), 10)).filter((n) => Number.isFinite(n));
  return all.length ? Math.min(...all) : null;
}

const originOf = (duration: string) => /\bfrom ([A-Za-z ]+?)(?:\s*[,.(]|$)/i.exec(duration)?.[1]?.toLowerCase() ?? "";

function stepIcon(action: string): StepIcon {
  if (/auto|rickshaw/i.test(action)) return "bike";
  if (/taxi|cab/i.test(action)) return "car";
  if (/bus|shuttle/i.test(action)) return "bus";
  if (/walk|exit/i.test(action)) return "footprints";
  return "pin";
}

function arrivalFor(kind: ReachKind, guide: JourneyGuide | undefined) {
  const ap = guide?.arrivalPoints.find((a) => kindOf(a.by) === kind);
  if (!ap || /^by /i.test(ap.name.trim())) return null; // "By car, cab, or bus" is not a place
  const distance = OLD_TAB.test(ap.distanceFromCity) ? "" : ap.distanceFromCity.trim();
  return { ap, name: ap.name.trim(), distance };
}

export function reachModes(d: Destination, guide: JourneyGuide | undefined): ReachMode[] {
  // About 160 lesser-known places carry transport text written from a template (it
  // points at the old "Getting There" tab). Their guide's arrival points can
  // contradict that text (Bhaderwah: an airport "~11 km" away, while its own text says the
  // nearest is ~88 km), so for those places the arrival line and steps are left out.
  const template = d.transport.some((t) => OLD_TAB.test(t.tips ?? ""));
  const modes: ReachMode[] = d.transport
    .map((t, i) => {
      const kind = kindOf(t.mode);
      const arrival = template ? null : arrivalFor(kind, guide);
      const duration = plain(t.duration);
      const cost = plain(t.costRange);
      const tip = withoutOldTab(t.tips);
      const steps: ReachStep[] = (arrival?.ap.toAccommodation ?? [])
        // Booking a ticket or checking in is not a way of getting from the arrival point to a stay.
        .filter((s) => !/ticket|book |check in|check-in|passport|water bottle|atm/i.test(s.action))
        .filter((s) => (s.cost && s.cost !== "—") || /prepaid|auto|taxi|bus|rickshaw/i.test(s.action))
        .slice(0, 3)
        .map((s) => ({
          icon: stepIcon(s.action),
          action: s.action.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim(),
          cost: s.cost === "—" ? "" : s.cost,
          duration: s.duration === "—" ? "" : s.duration,
        }));
      return {
        key: `${i}-${t.mode}`,
        label: labelOf(t.mode),
        kind,
        duration,
        durationShort: duration.replace(/\s+(from|by)\s.*$/i, ""),
        cost,
        costShort: /₹[\d,]*\d(\s*[–-]\s*₹?[\d,]*\d)?/.exec(cost)?.[0] ?? "",
        arrivalName: arrival?.name ?? "",
        arrivalDistance: arrival?.distance ?? "",
        tip,
        steps,
        fastest: false,
        cheapest: false,
        bookAhead: /\b(book|reserve)\b[^.]{0,60}\b(ahead|advance)\b|\bin advance\b/i.test(t.tips ?? ""),
      };
    })
    .filter((m) => m.duration || m.cost || m.arrivalName || m.tip);

  // Fastest / Cheapest only when at least two ways have a clear number to compare, the times
  // are for the same starting place, and one way is strictly best (a tie gets no badge).
  const timed = modes.map((m) => ({ m, v: minutesOf(m.duration) })).filter((x): x is { m: ReachMode; v: number } => x.v != null);
  if (timed.length >= 2 && new Set(timed.map((x) => originOf(x.m.duration))).size === 1) {
    const best = Math.min(...timed.map((x) => x.v));
    const winners = timed.filter((x) => x.v === best);
    if (winners.length === 1) winners[0].m.fastest = true;
  }
  const priced = modes.map((m) => ({ m, v: lowestRupees(m.cost) })).filter((x): x is { m: ReachMode; v: number } => x.v != null);
  if (priced.length >= 2) {
    const best = Math.min(...priced.map((x) => x.v));
    const winners = priced.filter((x) => x.v === best);
    if (winners.length === 1) winners[0].m.cheapest = true;
  }
  return modes;
}

/** How to get from the arrival point to the main sight, or "" when the guide has none. */
export function sightText(guide: JourneyGuide | undefined): string {
  return withoutOldTab(guide?.fromCityToSight ?? "");
}

function localIcon(mode: string): LocalIcon {
  if (/ferry|boat|kayak|ship/i.test(mode)) return "ship";
  if (/scooter|bike|cycle|rapido/i.test(mode)) return "bike";
  if (/bus/i.test(mode)) return "bus";
  if (/walk/i.test(mode)) return "footprints";
  return "car";
}

/** Autos, taxis, ferries... once you are there: the ones the guide marks as available, at most four. */
export function localModes(d: Destination): LocalMode[] {
  return d.localTransport
    .filter((l) => l.available && l.mode.trim())
    .slice(0, 4)
    .map((l, i) => ({ key: `${i}-${l.mode}`, icon: localIcon(l.mode), mode: l.mode.trim(), cost: plain(l.cost) }));
}
