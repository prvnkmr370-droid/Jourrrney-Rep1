/**
 * The address line and the maps links for a destination.
 *
 * `DESTINATION_SOURCE_ADDRESSES` holds what the official tourism websites publish about where a place is
 * (data/destinationSourceAddresses.ts). `DESTINATION_ADDRESSES` holds full addresses (with a postal code where one was
 * confirmed) that were looked up and checked against each place's name and
 * position (see data/destinationAddresses.ts for where they come from). Everything else shows only what we know for
 * sure: the place's name and its state. The Directions button works either way, since
 * Google Maps finds a place from its name and state.
 */
import type { Destination } from "@/data/destinations";
import { DESTINATION_ADDRESSES } from "@/data/destinationAddresses";
import { DESTINATION_SOURCE_ADDRESSES } from "@/data/destinationSourceAddresses";

const clean = (s: string) => s.replace(/\s*\([^)]*\)/g, "").trim();

export interface PlaceAddress {
  /** What is written on the page. */
  text: string;
  /** True when `text` is a looked-up street address rather than just name and state. */
  verified: boolean;
  /** What the maps app is asked to find. */
  mapQuery: string;
}

export function placeAddress(d: Destination): PlaceAddress {
  const name = clean(d.name);
  const state = clean(d.state);
  const found = DESTINATION_ADDRESSES[d.id];
  const official = DESTINATION_SOURCE_ADDRESSES[d.id];
  // In order: an address field the official site publishes, a street address we looked up and checked,
  // the official site's location line, then just the name and state.
  if (official && official[1] === "a") return { text: official[0], verified: true, mapQuery: `${name}, ${official[0]}` };
  if (found) return { text: found, verified: true, mapQuery: `${name}, ${found}` };
  if (official) return { text: official[0], verified: true, mapQuery: `${name}, ${official[0]}` };
  return { text: `${name}, ${state}`, verified: false, mapQuery: `${name}, ${state}` };
}

/** Opens Google Maps with directions to the place (the app if it is installed, else the browser). */
export function directionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

/** Opens the place itself in Google Maps (the app if it is installed, else the browser). */
export function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
