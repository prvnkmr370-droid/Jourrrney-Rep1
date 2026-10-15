/**
 * Live opening hours for a destination from Google Maps, via our backend's
 * GET /places/hours (journey-backend/src/routes/places.js).
 *
 * Google's terms don't allow storing Places content, so this is kept only in
 * memory for the running session (one lookup per destination, not one per
 * view) and is never written to disk or into the destination data files.
 * Anything unavailable — no key on the server, no confident match, offline —
 * resolves to null and the caller falls back to the curated hours.
 */
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { DESTINATION_COORDS } from "@/data/destinationCoords";
import type { Destination } from "@/data/destinations";
import { fromGoogle, type WeeklyHours } from "@/utils/openingHours";

const session = new Map<string, WeeklyHours | null>();
const inFlight = new Map<string, Promise<WeeklyHours | null>>();

async function load(d: Destination): Promise<WeeklyHours | null> {
  const coords = DESTINATION_COORDS[d.id];
  const params = new URLSearchParams({ name: d.name.replace(/\s*\([^)]*\)\s*/g, " ").trim(), state: d.state.replace(/\s*\([^)]*\)\s*/g, " ").trim() });
  if (coords) {
    params.set("lat", String(coords.lat));
    params.set("lon", String(coords.lon));
  }
  try {
    const res = await fetch(`${API_BASE_URL}/places/hours?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.found === true ? fromGoogle(data.weekdayDescriptions) : null;
  } catch {
    return null;
  }
}

export function useLiveOpeningHours(d: Destination): WeeklyHours | null {
  const [hours, setHours] = useState<WeeklyHours | null>(session.get(d.id) ?? null);

  useEffect(() => {
    let cancelled = false;
    if (session.has(d.id)) {
      setHours(session.get(d.id) ?? null);
      return;
    }
    setHours(null);
    let p = inFlight.get(d.id);
    if (!p) {
      p = load(d).then((h) => {
        session.set(d.id, h);
        inFlight.delete(d.id);
        return h;
      });
      inFlight.set(d.id, p);
    }
    p.then((h) => {
      if (!cancelled) setHours(h);
    });
    return () => {
      cancelled = true;
    };
  }, [d.id]);

  return hours;
}
