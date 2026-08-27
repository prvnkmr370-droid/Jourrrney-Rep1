import { useEffect } from "react";
import * as Location from "expo-location";
import { useOriginStore } from "@/store/useOriginStore";

/**
 * Replaces the web app's `navigator.geolocation.getCurrentPosition(...)` +
 * a manual fetch to nominatim.openstreetmap.org (used in App.tsx,
 * SearchScreen.tsx and DestinationDetail.tsx). Requests permission once
 * and writes the detected city into useOriginStore; silently keeps the
 * "Bengaluru" default on denial/error, matching the web app's fallback.
 */
export function useReverseGeocode() {
  const setOriginCity = useOriginStore((s) => s.setOriginCity);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;

      try {
        const position = await Location.getCurrentPositionAsync({});
        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const city = place?.city ?? place?.subregion ?? place?.region;
        if (city && !cancelled) setOriginCity(city);
      } catch {
        // keep the default origin city
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setOriginCity]);
}
