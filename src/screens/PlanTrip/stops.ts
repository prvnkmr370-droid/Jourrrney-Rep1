/**
 * Ties the places an AI itinerary names back to the app's own destination
 * data, so the result screen can tell the traveller which stops we actually
 * have a record of and which they should double-check.
 *
 * Two halves:
 *  - buildKnownPlaces(): what we tell the AI about the destination (its own
 *    highlights + nearby places), so it prefers those names.
 *  - resolveStops(): after the plan comes back, match each stop the AI listed
 *    against the same data. Matching happens here, not on the backend, because
 *    this is where the destination data (and the other cards) live.
 */
import { DESTINATIONS, type Destination } from "@/data/destinations";
import type { PlanStop } from "./data";

export interface KnownPlace {
  name: string;
  type?: string;
  distance?: string;
  /** Id of this place's own destination card, when it has one. */
  id?: string;
}

const MAX_KNOWN_PLACES = 14;
const DESTINATION_BY_ID = new Map(DESTINATIONS.map((d) => [d.id, d]));

const FILLER_WORDS = new Set(["the", "a", "an", "of", "in", "at", "to", "and", "view", "viewpoint", "point"]);

/** Lower-cases and strips punctuation, parentheticals and filler words, so
 * "Raja's Seat viewpoint" and "Raja's Seat" compare equal. */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t && !FILLER_WORDS.has(t))
    .join("");
}

/** Some highlights are whole sentences ("Day trips to Jai Valley and Padri
 * Pass"), which are no use as a place name to match against or to hand the AI. */
function looksLikePlaceName(name: string): boolean {
  return name.length <= 40 && !/[0-9,]/.test(name) && name.trim().split(/\s+/).length <= 6;
}

export function buildKnownPlaces(dest: Destination): KnownPlace[] {
  const byKey = new Map<string, KnownPlace>();
  const add = (name: string, id?: string, type?: string, distance?: string) => {
    if (id === dest.id) return;
    const card = id ? DESTINATION_BY_ID.get(id) : undefined;
    const linkedId = card ? card.id : undefined;
    if (!linkedId && !looksLikePlaceName(name)) return;
    const key = linkedId ? `id:${linkedId}` : `n:${normalise(name)}`;
    const existing = byKey.get(key);
    if (existing) {
      // The same place often appears as both a highlight and a nearby place —
      // keep the first name and fill in whatever the second one knows.
      existing.type ??= type;
      existing.distance ??= distance;
      return;
    }
    byKey.set(key, { name, type, distance, id: linkedId });
  };
  for (const h of dest.highlights) add(h.name, h.id);
  for (const n of dest.nearbyPlaces) add(n.name, n.id, n.type, n.distance);
  // Places with their own card are the richest, so they survive the cap first.
  const all = [...byKey.values()];
  return [...all.filter((p) => p.id), ...all.filter((p) => !p.id)].slice(0, MAX_KNOWN_PLACES);
}

function namesFor(place: KnownPlace): string[] {
  const card = place.id ? DESTINATION_BY_ID.get(place.id) : undefined;
  return [place.name, ...(card ? [card.name, ...(card.aliases ?? [])] : [])].map(normalise).filter(Boolean);
}

function findKnown(stopName: string, known: KnownPlace[]): KnownPlace | undefined {
  const key = normalise(stopName);
  if (!key) return undefined;
  const candidates = known.map((p) => ({ place: p, keys: namesFor(p) }));
  const exact = candidates.find((c) => c.keys.includes(key));
  if (exact) return exact.place;
  // Looser second pass — one name wholly contains the other ("Coffee Estate
  // Walk" vs "Coffee Estate walks"). The length floor and ratio keep short
  // generic words from matching everything.
  return candidates.find((c) =>
    c.keys.some((k) => {
      const [short, long] = k.length <= key.length ? [k, key] : [key, k];
      return short.length >= 6 && long.includes(short) && short.length / long.length >= 0.5;
    }),
  )?.place;
}

export function resolveStops(dest: Destination, stopNames: unknown): PlanStop[] {
  if (!Array.isArray(stopNames)) return [];
  const known = buildKnownPlaces(dest);
  const ownNames = new Set([dest.name, ...(dest.aliases ?? [])].map(normalise));
  const seen = new Set<string>();
  const out: PlanStop[] = [];

  for (const raw of stopNames) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const key = normalise(raw);
    // The destination itself isn't a "stop" within it.
    if (!key || ownNames.has(key)) continue;

    const place = findKnown(raw, known);
    const card = place?.id ? DESTINATION_BY_ID.get(place.id) : undefined;
    const dedupeKey = place ? `k:${place.id ?? normalise(place.name)}` : `u:${key}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    if (place && card) {
      out.push({
        // The card's own name — tapping this opens that card.
        name: card.name,
        kind: "card",
        type: place.type ?? card.category[0],
        distance: place.distance,
        destId: card.id,
        image: card.heroImage || card.image,
        safetyScore: card.womenSafety.score,
      });
    } else if (place) {
      out.push({ name: place.name, kind: "listed", type: place.type, distance: place.distance });
    } else {
      out.push({ name: raw.trim(), kind: "unlisted" });
    }
  }
  return out;
}
