/**
 * Live city-search suggestions as the user types a starting point — via
 * Open-Meteo's free geocoding API (same provider already used for the
 * Weather Alert feature, no API key needed). Lets someone type "Hyderabad"
 * and get a real matched place (with state/country) instead of just
 * freeform, unvalidated text — which already technically worked as a
 * starting point (the route summary just joins whatever string is there),
 * but had no way to search or disambiguate what you typed.
 *
 * Two fixes on top of the raw API:
 * 1. India-only — this app only plans trips within India, but Open-Meteo
 *    returns global matches (e.g. "Belgau" surfaces Nepal towns ahead of
 *    the intended Indian ones), so results are filtered to
 *    country_code === "IN" before anything else happens.
 * 2. Typo tolerance — Open-Meteo does plain substring matching with ZERO
 *    fuzzy tolerance (verified live: "Hyderabab" returns nothing at all,
 *    not even a close match), so a one-letter typo otherwise looks like
 *    "no such place." When the India-filtered results come back empty (or
 *    don't already contain a near-exact match), the trimmed query is
 *    fuzzy-matched (edit distance) against INDIAN_CITY_NAMES, and on a hit
 *    the CORRECTED name is re-geocoded live for a real result — the
 *    static list only supplies names, never coordinates.
 */
import { useEffect, useRef, useState } from "react";
import { INDIAN_CITY_NAMES } from "@/data/indianCities";

export interface CitySuggestion {
  id: number;
  name: string;
  admin1?: string; // state/region
  country?: string;
  latitude: number;
  longitude: number;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface RawGeocodeResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
}

async function geocodeIndia(query: string, count: number): Promise<RawGeocodeResult[]> {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`);
  const data = await res.json();
  const results: RawGeocodeResult[] = data.results ?? [];
  return results.filter((r) => r.country_code === "IN");
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Stricter tolerance for short names (a 1-letter difference on a 3-letter
// query is a near-total rewrite, not a typo) and looser for longer ones.
function maxAllowedDistance(len: number): number {
  if (len <= 4) return 1;
  if (len <= 8) return 2;
  return 3;
}

/** Closest known Indian city name to `query` within typo tolerance, or null if the query already looks fine or nothing is close enough. */
function findTypoCorrection(query: string): string | null {
  const q = query.toLowerCase();
  let best: { name: string; dist: number } | null = null;
  for (const city of INDIAN_CITY_NAMES) {
    const c = city.toLowerCase();
    if (c === q) return null; // exact match already — nothing to correct
    const dist = levenshtein(q, c);
    if (dist <= maxAllowedDistance(Math.max(q.length, c.length)) && (!best || dist < best.dist)) {
      best = { name: city, dist };
    }
  }
  return best?.name ?? null;
}

function toCitySuggestion(r: RawGeocodeResult): CitySuggestion {
  return { id: r.id, name: r.name, admin1: r.admin1, country: r.country, latitude: r.latitude, longitude: r.longitude };
}

export function useCitySearch(query: string) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      try {
        const indiaResults = await geocodeIndia(trimmed, 6);
        if (requestId !== requestIdRef.current) return; // a newer query started — drop this stale response

        // Already have a close/exact match among the real results? Nothing
        // to correct — don't second-guess a query that already worked.
        const hasCloseMatch = indiaResults.some((r) => levenshtein(trimmed.toLowerCase(), r.name.toLowerCase()) <= 1);

        let results = indiaResults;
        if (!hasCloseMatch) {
          const correction = findTypoCorrection(trimmed);
          if (correction) {
            const corrected = await geocodeIndia(correction, 1);
            if (requestId !== requestIdRef.current) return;
            const already = new Set(results.map((r) => r.name.toLowerCase()));
            const fresh = corrected.filter((r) => !already.has(r.name.toLowerCase()));
            results = [...fresh, ...results];
          }
        }

        setSuggestions(results.map(toCitySuggestion));
      } catch {
        if (requestId === requestIdRef.current) setSuggestions([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, loading };
}

export function formatCitySuggestion(s: CitySuggestion): string {
  return s.admin1 ? `${s.name}, ${s.admin1}` : s.name;
}
