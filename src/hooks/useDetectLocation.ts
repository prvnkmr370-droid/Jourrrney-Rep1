/**
 * Shared "use my current location to fill in a city" logic — previously
 * duplicated near-identically in three places (Search's Origin Prompt,
 * Plan Trip's Route step, and Destination Detail's How to Reach → Getting
 * There), each of which silently swallowed every failure (permission
 * denied, device location services off, no reverse-geocode match) with
 * an empty catch block — so tapping the button did nothing with zero
 * indication of why, which is exactly what "not working" looks like from
 * the outside. Every failure path here now tells the user what actually
 * went wrong instead.
 */
import { useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

export function useDetectLocation() {
  const [locating, setLocating] = useState(false);

  /** Resolves to a "City" or "City, Region" string on success, or null if
   * it failed for any reason (an alert is already shown in that case —
   * callers don't need to show their own error UI). */
  const detect = async (): Promise<string | null> => {
    setLocating(true);
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert("Location is off", "Turn on Location Services for your phone, then try again.");
        return null;
      }

      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission needed",
          canAskAgain
            ? "Allow location access when prompted so we can fill in your current city."
            : "Location access is turned off for Jourrrney — enable it in your phone's Settings app to use this.",
        );
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      const city = place?.city ?? place?.subregion ?? place?.region;
      if (!city) {
        Alert.alert("Couldn't determine your city", "Found your location, but couldn't match it to a city name — try entering it manually.");
        return null;
      }
      return place?.region ? `${city}, ${place.region}` : city;
    } catch {
      Alert.alert("Couldn't get your location", "Something went wrong finding your location. Try again, or enter your city manually.");
      return null;
    } finally {
      setLocating(false);
    }
  };

  return { locating, detect };
}
