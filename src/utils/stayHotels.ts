/**
 * The hotels on a destination's Hotels page, read from the stay guide
 * (`accommodation` in destinations.ts).
 *
 * The guide names real properties under each stay level ("Taj, Sector 17" under
 * Luxury) but also writes general advice in the same list ("Hotels near the bus
 * stand", "Old-city havelis"). Only the first kind is a hotel, so each entry is
 * read cautiously: if it doesn't look like the name of one property it is left
 * out of the list. It is not lost: the Typical prices section still shows it as
 * written. The guide holds no price, photo or rating for any single hotel, so a
 * hotel carries only its stay level and that level's typical price.
 */
import type { Destination } from "@/data/destinations";
import { priceParts, type PriceParts } from "@/utils/stayPrice";

export type HotelLevel = "Budget" | "Mid-range" | "Luxury";

export interface Hotel {
  /** Unique within the place. */
  key: string;
  name: string;
  /** Where it is, if the guide says ("Sector 17"). */
  area: string;
  /** A short remark from the guide ("prior permission"). */
  note: string;
  /** Budget, Mid-range or Luxury when the guide's stay type says so, else null. */
  level: HotelLevel | null;
  /** The stay type as the guide words it, without brackets ("Heritage Boutique Hotels"). */
  typeLabel: string;
  /** The typical nightly price for this stay level. */
  price: PriceParts;
  /** The line exactly as the guide has it, so the price guide can skip it. */
  source: string;
  /** What the maps app is asked to find. */
  mapQuery: string;
}

const PLURAL_KIND = /\b(hotels|guest ?houses|homestays|resorts|lodges|camps|huts|shacks|havelis|hostels|stays|chains|properties|options|cottages|villas|tents|dharamshalas|bnbs|rooms|accommodations?)\b/i;
const KIND_WORD = /^(hotel|guest|house|resort|lodge|inn|palace|camp|homestay|haveli|hostel|villa|cottage|rest|dharamshala|heritage|residency|regency|the)$/i;
const ALLOWED_LOWER = new Set(["of", "the", "and", "&", "de", "la", "le", "du", "by"]);

/** True when `text` reads as the name of one property rather than general advice. */
export function isPropertyName(text: string): boolean {
  const t = text.replace(/\([^)]*\)/g, " ").trim();
  if (t.length < 3 || t.length > 60) return false;
  if (/^check\b/i.test(t) || PLURAL_KIND.test(t)) return false;
  const name = t.split(",")[0].trim();
  const tokens = name.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  for (const tok of tokens) {
    if (ALLOWED_LOWER.has(tok.toLowerCase()) && tok === tok.toLowerCase()) continue;
    // Every part of "Old-city" must start like a name: capital letter or digit.
    if (tok.split("-").some((part) => /^[a-z]/.test(part))) return false;
  }
  return tokens.some((tok) => !KIND_WORD.test(tok.replace(/[^A-Za-z]/g, "")));
}

function levelOf(type: string): HotelLevel | null {
  const t = type.toLowerCase();
  if (/\bmid/.test(t)) return "Mid-range";
  if (/luxury|premium|palace|five.?star|5.?star|upscale/.test(t)) return "Luxury";
  if (/budget|hostel|dharamshala|homestay|guest ?house|economy/.test(t)) return "Budget";
  return null;
}

const clean = (s: string) => s.replace(/\s*\([^)]*\)/g, "").trim();
const sentence = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function hotelsFor(d: Destination): Hotel[] {
  const placeName = clean(d.name);
  const state = clean(d.state);
  const seen = new Set<string>();
  const out: Hotel[] = [];

  const add = (acc: Destination["accommodation"][number], source: string, name: string, area: string, note: string, query?: string) => {
    const id = name.toLowerCase();
    if (!name || seen.has(id)) return;
    seen.add(id);
    const typeLabel = clean(acc.type);
    out.push({
      key: `${out.length}-${id}`,
      name, area, note: sentence(note),
      level: levelOf(acc.type),
      typeLabel,
      price: priceParts(acc.priceRange),
      source,
      mapQuery: query ?? [name, area, placeName, state].filter(Boolean).join(", "),
    });
  };

  for (const acc of d.accommodation) {
    // Venues come with their own maps search, so they go first.
    for (const v of acc.venues ?? []) add(acc, v.name, v.name, v.location ?? "", "", v.mapsQuery);
    for (const raw of acc.examples) {
      const line = raw.trim();
      if (!isPropertyName(line)) continue;
      const note = /\(([^)]*)\)/.exec(line)?.[1]?.trim() ?? "";
      const [name, ...rest] = clean(line).split(",");
      add(acc, line, name.trim(), rest.join(",").trim(), note);
    }
  }
  return out;
}

const LEVEL_ORDER: HotelLevel[] = ["Budget", "Mid-range", "Luxury"];

/**
 * A couple of hotels to show on the home page. When the hotels span more than one of
 * Budget / Mid-range / Luxury, the first of the lowest and the first of the highest, so
 * the two show the range; otherwise the first two.
 */
export function previewHotels(hotels: Hotel[], count = 2): Hotel[] {
  if (hotels.length <= count) return hotels;
  const levels = LEVEL_ORDER.filter((l) => hotels.some((h) => h.level === l));
  if (count === 2 && levels.length >= 2) {
    return [hotels.find((h) => h.level === levels[0])!, hotels.find((h) => h.level === levels[levels.length - 1])!];
  }
  return hotels.slice(0, count);
}
