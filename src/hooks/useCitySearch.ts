/**
 * Live city-search suggestions as the user types a starting point — via
 * Open-Meteo's free geocoding API (same provider already used for the
 * Weather Alert feature, no API key needed). Lets someone type "Hyderabad"
 * and get a real matched place (with state/country) instead of just
 * freeform, unvalidated text — which already technically worked as a
 * starting point (the route summary just joins whatever string is there),
 * but had no way to search or disambiguate what you typed.
 */
import { useEffect, useRef, useState } from "react";

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
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`,
        );
        const data = await res.json();
        if (requestId !== requestIdRef.current) return; // a newer query started — drop this stale response
        const results: CitySuggestion[] = (data.results ?? []).map(
          (r: { id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => ({
            id: r.id,
            name: r.name,
            admin1: r.admin1,
            country: r.country,
            latitude: r.latitude,
            longitude: r.longitude,
          }),
        );
        setSuggestions(results);
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
