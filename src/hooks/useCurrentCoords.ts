/**
 * Raw GPS coordinates for the ride-app deep links in rideAppLinks.ts —
 * useDetectLocation.ts already does this same permission/accuracy/timeout
 * dance but only returns a city NAME (for the origin-city text field);
 * opening Uber/Ola/etc. with the right pickup point needs the actual
 * lat/lon, so this is a separate, smaller function rather than changing
 * that hook's return contract (used in three other places already).
 */
import { Alert } from "react-native";
import * as Location from "expo-location";

const FIX_TIMEOUT_MS = 15000;

/** Resolves to the device's current coordinates, or null on any failure (permission denied, location services off, no GPS fix) — an alert is already shown in that case. */
export async function getCurrentCoords(): Promise<{ latitude: number; longitude: number } | null> {
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
          ? "Allow location access when prompted so the ride app can be opened with your pickup point filled in."
          : "Location access is turned off for Jourrrney — enable it in your phone's Settings app to use this.",
      );
      return null;
    }

    const fix = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), FIX_TIMEOUT_MS)),
    ]);
    if (!fix) {
      Alert.alert("Couldn't get a GPS fix", "This can take longer with a weak signal (e.g. indoors) — move somewhere with clearer sky view and try again.");
      return null;
    }

    return { latitude: fix.coords.latitude, longitude: fix.coords.longitude };
  } catch {
    Alert.alert("Couldn't get your location", "Something went wrong finding your location. Try again.");
    return null;
  }
}
