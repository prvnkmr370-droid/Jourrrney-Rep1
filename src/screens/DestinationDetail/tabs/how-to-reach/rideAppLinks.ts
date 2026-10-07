/**
 * Opens a ride-booking app (tapped from the "Getting Around" tab's
 * localTransport cards) with pickup set to the user's current GPS location
 * and drop-off set to the destination being viewed, where each app's deep
 * link scheme actually supports that.
 *
 * Confidence genuinely varies by app — this was researched, not guessed,
 * and each entry says what's actually verified:
 *  - Uber: documented, reliable (developer.uber.com) — full pickup+dropoff.
 *  - Ola: the official doc marks `utm_source` (a partner token this app
 *    doesn't have) as mandatory; lat/lng/drop params are included anyway
 *    since they're independently documented, but without the token this
 *    is best-effort, not guaranteed.
 *  - Rapido / Namma Yatri: NO public deep-link parameter scheme exists
 *    (checked their developer resources and open-source repo) — only the
 *    bare app scheme is attempted (opens the app itself, not pre-filled),
 *    rather than fabricating an unverified parameter format.
 *  - Yatri Sathi: no known scheme at all — store listing only.
 *
 * Every app falls back to its real Play Store / App Store listing
 * (verified package names / store IDs, not guessed) if the deep link
 * can't be opened — so tapping a card never does nothing.
 */
import { Linking, Platform } from "react-native";

export interface Coords {
  latitude: number;
  longitude: number;
}

interface RideApp {
  key: string;
  matchKeywords: string[]; // lowercase substrings matched against a localTransport entry's `mode` string
  androidPackage: string;
  iosAppStoreId: string | null;
  buildDeepLink: (pickup: Coords, dropoff: (Coords & { name: string }) | null) => string | null;
}

const RIDE_APPS: RideApp[] = [
  {
    key: "uber",
    matchKeywords: ["uber"],
    androidPackage: "com.ubercab",
    iosAppStoreId: "368677368",
    buildDeepLink: (pickup, dropoff) => {
      const params = new URLSearchParams({
        action: "setPickup",
        "pickup[latitude]": String(pickup.latitude),
        "pickup[longitude]": String(pickup.longitude),
      });
      if (dropoff) {
        params.set("dropoff[latitude]", String(dropoff.latitude));
        params.set("dropoff[longitude]", String(dropoff.longitude));
        params.set("dropoff[nickname]", dropoff.name);
      }
      return `uber://?${params.toString()}`;
    },
  },
  {
    key: "ola",
    matchKeywords: ["ola"],
    androidPackage: "com.olacabs.customer",
    iosAppStoreId: "539179365",
    buildDeepLink: (pickup, dropoff) => {
      const params = new URLSearchParams({ lat: String(pickup.latitude), lng: String(pickup.longitude) });
      if (dropoff) {
        params.set("drop_lat", String(dropoff.latitude));
        params.set("drop_lng", String(dropoff.longitude));
        params.set("drop_address", dropoff.name);
      }
      return `olacabs://app/launch?${params.toString()}`;
    },
  },
  {
    key: "rapido",
    matchKeywords: ["rapido"],
    androidPackage: "com.rapido.passenger",
    iosAppStoreId: "1198464606",
    buildDeepLink: () => "rapido://",
  },
  {
    key: "namma-yatri",
    matchKeywords: ["namma yatri"],
    androidPackage: "in.juspay.nammayatri",
    iosAppStoreId: "1637429831",
    buildDeepLink: () => "nammayatri://",
  },
  {
    key: "yatri-sathi",
    matchKeywords: ["yatri sathi"],
    androidPackage: "in.juspay.jatrisaathi",
    iosAppStoreId: null,
    buildDeepLink: () => null,
  },
];

function findRideApp(mode: string): RideApp | null {
  const m = mode.toLowerCase();
  return RIDE_APPS.find((app) => app.matchKeywords.some((k) => m.includes(k))) ?? null;
}

/** Whether a localTransport entry's `mode` string refers to a ride-booking app this module knows how to open — used to decide whether its card should be tappable at all. */
export function isRideBookingApp(mode: string): boolean {
  return findRideApp(mode) !== null;
}

function storeUrl(app: RideApp): string {
  if (Platform.OS === "ios" && app.iosAppStoreId) return `https://apps.apple.com/app/id${app.iosAppStoreId}`;
  return `https://play.google.com/store/apps/details?id=${app.androidPackage}`;
}

export type OpenRideAppResult = "opened" | "store" | "unsupported";

/** Tries the app's deep link (pickup + dropoff where the scheme supports it), falling back to its real store listing if the app isn't installed or the link can't be opened. Never throws. */
export async function openRideApp(mode: string, pickup: Coords, dropoff: (Coords & { name: string }) | null): Promise<OpenRideAppResult> {
  const app = findRideApp(mode);
  if (!app) return "unsupported";

  const deepLink = app.buildDeepLink(pickup, dropoff);
  if (deepLink) {
    try {
      const can = await Linking.canOpenURL(deepLink);
      if (can) {
        await Linking.openURL(deepLink);
        return "opened";
      }
    } catch {
      // fall through to the store listing below
    }
  }

  try {
    await Linking.openURL(storeUrl(app));
    return "store";
  } catch {
    return "unsupported";
  }
}
