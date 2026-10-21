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
 *
 * Accuracy: requests Location.Accuracy.Highest, which asks Android/iOS to
 * use GPS rather than settle for network/cell-tower-based positioning —
 * the previous "Balanced" setting let the OS return a coarse, sometimes
 * wildly-off city-level fix instead of your actual GPS position. Highest
 * accuracy can take longer (a few seconds, more indoors/underground), so
 * this races it against a 15s timeout rather than hanging forever.
 *
 * One thing app code can't control: if you tapped "Approximate" instead
 * of "Precise" on Android's location permission prompt, every fix you get
 * back is coarse regardless of the accuracy requested here — the OS
 * enforces that ceiling. If results still look wrong after this fix,
 * check Settings → Apps → Jourrrney → Permissions → Location, and make
 * sure "Use precise location" is turned on.
 */
import { useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

const FIX_TIMEOUT_MS = 15000;

export type DetectResult =
  | {
      ok: true;
      /** "Chennai, Tamil Nadu", or "Your location" when the phone could not name the place. */
      city: string;
      cityKnown: boolean;
      /** The phone's exact position. */
      lat: number;
      lon: number;
      /** The phone shared only a rough position (an "approximate" permission, or a fix wider than a few km). */
      approximate: boolean;
    }
  | { ok: false; reason: "services-off" | "denied" | "blocked" | "no-fix" | "failed" };

/** What the phone currently allows: "granted", "denied" (turned off in Settings: asking again would do nothing), or "unasked". */
export async function getLocationPermission(): Promise<"granted" | "denied" | "unasked"> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") return "granted";
    return canAskAgain ? "unasked" : "denied";
  } catch {
    return "unasked";
  }
}

/** Anything wider than this is not an exact position, whatever the permission says. */
const APPROXIMATE_ABOVE_M = 3000;

/** Finds the phone's position (and a name for the place), without showing any alert: the caller decides what to say. */
async function findPosition(accuracy: Location.LocationAccuracy): Promise<DetectResult> {
  try {
    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, reason: "services-off" };

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") return { ok: false, reason: permission.canAskAgain ? "denied" : "blocked" };

    const fix = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), FIX_TIMEOUT_MS)),
    ]);
    if (!fix) return { ok: false, reason: "no-fix" };

    const { latitude: lat, longitude: lon, accuracy: widthM } = fix.coords;
    const coarse = (permission as { android?: { accuracy?: string } }).android?.accuracy === "coarse";
    const approximate = coarse || (typeof widthM === "number" && widthM > APPROXIMATE_ABOVE_M);

    // A name is nice to show but not needed: the exact position is what the routes use.
    let city = "";
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      const name = place?.city ?? place?.subregion ?? place?.region;
      if (name) city = place?.region && place.region !== name ? `${name}, ${place.region}` : name;
    } catch {
      // keep the unnamed position
    }
    return { ok: true, city: city || "Your location", cityKnown: !!city, lat, lon, approximate };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export function useDetectLocation() {
  const [locating, setLocating] = useState(false);

  /** Resolves to a "City" or "City, Region" string on success, or null if
   * it failed for any reason (an alert is already shown in that case —
   * callers don't need to show their own error UI). */
  const detect = async (): Promise<string | null> => {
    setLocating(true);
    try {
      const result = await findPosition(Location.Accuracy.Highest);
      if (result.ok) {
        if (result.cityKnown) return result.city;
        Alert.alert("Couldn't determine your city", "Found your location, but couldn't match it to a city name — try entering it manually.");
        return null;
      }
      switch (result.reason) {
        case "services-off":
          Alert.alert("Location is off", "Turn on Location Services for your phone, then try again.");
          break;
        case "denied":
          Alert.alert("Location permission needed", "Allow location access when prompted so we can fill in your current city.");
          break;
        case "blocked":
          Alert.alert("Location permission needed", "Location access is turned off for Jourrrney — enable it in your phone's Settings app to use this.");
          break;
        case "no-fix":
          Alert.alert("Couldn't get a GPS fix", "This can take longer with a weak signal (e.g. indoors) — move somewhere with clearer sky view and try again.");
          break;
        default:
          Alert.alert("Couldn't get your location", "Something went wrong finding your location. Try again, or enter your city manually.");
      }
      return null;
    } finally {
      setLocating(false);
    }
  };

  /** Same, for a screen that shows its own friendly messages: returns the phone's exact position (with a name for
   * the place when there is one) and never shows an alert. */
  const detectQuietly = async (): Promise<DetectResult> => {
    setLocating(true);
    try {
      return await findPosition(Location.Accuracy.High);
    } finally {
      setLocating(false);
    }
  };

  return { locating, detect, detectQuietly };
}
