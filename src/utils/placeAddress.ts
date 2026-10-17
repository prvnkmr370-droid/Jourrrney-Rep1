/**
 * The address line and the maps links for a destination.
 *
 * `DESTINATION_ADDRESSES` holds full addresses (with a postal code where one was
 * confirmed) that were looked up and checked against each place's name and
 * position (see data/destinationAddresses.ts for where they come from). Everything else shows only what we know for
 * sure: the place's name and its state. The Map button works either way, since
 * Google Maps finds a place from its name and state.
 */
import type { Destination } from "@/data/destinations";
import { DESTINATION_ADDRESSES } from "@/data/destinationAddresses";

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
  if (found) return { text: found, verified: true, mapQuery: `${name}, ${found}` };
  return { text: `${name}, ${state}`, verified: false, mapQuery: `${name}, ${state}` };
}

/** Opens the place itself in Google Maps (the app if it is installed, else the browser). */
export function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
