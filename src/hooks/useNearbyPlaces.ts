/**
 * "More places nearby" — real points of interest around a destination,
 * fetched from our own backend's /places endpoint (which sources them
 * from OpenStreetMap; see journey-backend/src/routes/places.js). This is
 * a supplement to the hand-curated NearbyPlace list already in
 * destinations.ts, not a replacement — it surfaces the long tail of
 * smaller attractions/museums/viewpoints the curated list doesn't cover.
 */
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { DESTINATION_COORDS } from "@/data/destinationCoords";

export interface NearbyOsmPlace {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
}

interface State {
  loading: boolean;
  error: boolean;
  places: NearbyOsmPlace[];
}

export function useNearbyPlaces(destinationId: string): State {
  const [state, setState] = useState<State>({ loading: true, error: false, places: [] });

  useEffect(() => {
    const coords = DESTINATION_COORDS[destinationId];
    if (!coords) {
      setState({ loading: false, error: true, places: [] });
      return;
    }

    let cancelled = false;
    setState({ loading: true, error: false, places: [] });

    const url = `${API_BASE_URL}/places?destinationId=${encodeURIComponent(destinationId)}&lat=${coords.lat}&lon=${coords.lon}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Places API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data?.places)) throw new Error("Malformed places response");
        setState({ loading: false, error: false, places: data.places });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true, places: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [destinationId]);

  return state;
}
