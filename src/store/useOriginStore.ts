import { create } from "zustand";
import { readJson, writeJson } from "./deviceStorage";

const STORAGE_KEY = "journey-origin-v1";
const MAX_RECENT = 3;

export type OriginSource = "gps" | "picked";

/** The phone's own position, when the start came from "Use my location". It stays on this phone. */
export interface OriginPoint {
  lat: number;
  lon: number;
  /** The phone shared only a rough position. */
  approximate: boolean;
}

interface OriginState {
  originCity: string;
  /** Where the city came from: found from the phone's location, or chosen by the person. */
  originSource: OriginSource | null;
  /** The exact position behind a "gps" start (null for a chosen city). */
  originPoint: OriginPoint | null;
  /** When that position was read (ms since 1970), so it can be refreshed once it is old. */
  originFixedAt: number;
  /** The last few cities used as a starting point, newest first (the current one included). */
  recentOrigins: string[];
  setOriginCity: (city: string) => void;
  setOrigin: (city: string, source: OriginSource, point?: OriginPoint | null) => void;
}

/** The city a trip starts from, shared by every screen that needs it (How to get there, Search, Plan Trip).
 *
 * Starts empty, not a hardcoded city — every screen that reads this
 * already has a proper placeholder/fallback for an empty value (see
 * OriginPrompt, ArriveSection, ChatStep), and a fake default here was
 * indistinguishable from a real detected location, which made "location
 * detection isn't actually working" look like "it detected Bengaluru."
 *
 * What the person chose is kept on this phone, so they aren't asked again after
 * closing the app: the city, and, when it came from "Use my location", the phone's
 * exact position too (used to find the nearest airport and station). None of it is
 * sent to the app's own server. */
export const useOriginStore = create<OriginState>((set, get) => ({
  originCity: "",
  originSource: null,
  originPoint: null,
  originFixedAt: 0,
  recentOrigins: [],

  setOrigin: (city, source, point = null) => {
    const clean = city.trim();
    if (!clean) {
      set({ originCity: "", originSource: null, originPoint: null, originFixedAt: 0 });
      return;
    }
    // A position with no name ("Your location") is not worth listing as a recent city.
    const named = source === "picked" || clean !== "Your location";
    const recent = named ? [clean, ...get().recentOrigins.filter((c) => c !== clean)].slice(0, MAX_RECENT) : get().recentOrigins;
    set({ originCity: clean, originSource: source, originPoint: source === "gps" ? point : null, originFixedAt: source === "gps" && point ? Date.now() : 0, recentOrigins: recent });
  },

  setOriginCity: (city) => get().setOrigin(city, "picked"),
}));

// Write-through, skipped until the saved copy has been read back so the first
// (empty) state can't overwrite it.
let hydrated = false;
useOriginStore.subscribe((s) => {
  if (hydrated) void writeJson(STORAGE_KEY, { originCity: s.originCity, originSource: s.originSource, originPoint: s.originPoint, originFixedAt: s.originFixedAt, recentOrigins: s.recentOrigins });
});

void (async () => {
  const stored = await readJson<{ originCity?: unknown; originSource?: unknown; originPoint?: unknown; originFixedAt?: unknown; recentOrigins?: unknown }>(STORAGE_KEY);
  if (stored && typeof stored === "object") {
    const current = useOriginStore.getState();
    const recent = Array.isArray(stored.recentOrigins) ? stored.recentOrigins.filter((c): c is string => typeof c === "string" && c.trim().length > 0).slice(0, MAX_RECENT) : [];
    // Anything chosen while the saved copy was being read wins over it.
    const sp = stored.originPoint as { lat?: unknown; lon?: unknown; approximate?: unknown } | null | undefined;
    const point: OriginPoint | null = sp && typeof sp.lat === "number" && typeof sp.lon === "number" ? { lat: sp.lat, lon: sp.lon, approximate: sp.approximate === true } : null;
    const source = stored.originSource === "gps" || stored.originSource === "picked" ? stored.originSource : null;
    useOriginStore.setState({
      originCity: current.originCity || (typeof stored.originCity === "string" ? stored.originCity : ""),
      originSource: current.originCity ? current.originSource : source,
      originPoint: current.originCity ? current.originPoint : source === "gps" ? point : null,
      originFixedAt: current.originCity ? current.originFixedAt : typeof stored.originFixedAt === "number" ? stored.originFixedAt : 0,
      recentOrigins: [...current.recentOrigins, ...recent.filter((c) => !current.recentOrigins.includes(c))].slice(0, MAX_RECENT),
    });
  }
  hydrated = true;
})();
