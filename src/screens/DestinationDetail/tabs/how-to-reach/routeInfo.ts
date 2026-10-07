/**
 * AI-generated, door-to-door route breakdown for an arbitrary origin city —
 * calls journey-backend's POST /plan-trip/route-info (Gemini-backed, with a
 * same-request Groq retry — see planTrip.js). Generalizes what used to be
 * Delhi/Mumbai/Bangalore-only hardcoded transport text in destinations.ts
 * to whatever origin the user actually picks in ArriveSection.
 *
 * Each transport option covers the FULL chain, not just one leg: a
 * departure waypoint near the origin (airport/station), an arrival
 * waypoint near the destination, and a last-mile leg (taxi/bus/auto) from
 * that arrival point to the actual destination — so "Flight" or "Train"
 * means a complete plan, not just "here's an airport, good luck."
 *
 * Deliberately never throws — same null-on-any-failure contract as
 * aiIntent.ts's tryParseTripIntent, so a failed/unavailable call just means
 * the route panel stays empty rather than crashing the screen.
 */
import { API_BASE_URL } from "@/config/api";
import { fetchAiJson } from "@/screens/PlanTrip/aiRequest";

export interface RouteWaypoint {
  name: string;
  code: string | null;
  /** Human-readable distance from the origin (departurePoint) or to the destination (arrivalPoint), e.g. "~12 km / 30 min by taxi". */
  distance: string;
}

export interface RouteLastMile {
  mode: string;
  duration: string;
  costRange: string;
  details: string;
}

export interface RouteTransportOption {
  mode: string;
  duration: string;
  costRange: string;
  details: string;
  tips: string;
  /** Airport/station nearest the origin — null for "Road" (direct, no transfer point). */
  departurePoint: RouteWaypoint | null;
  /** Airport/station nearest the destination — null for "Road". */
  arrivalPoint: RouteWaypoint | null;
  /** Alternative ways to cover the remaining distance from arrivalPoint to the actual destination (taxi, bus/shuttle, auto, …) — empty for "Road" or when the arrival point is effectively the destination. */
  lastMileOptions: RouteLastMile[];
}

export interface RouteInfoResult {
  distanceKm: number;
  transport: RouteTransportOption[];
}

// Same budget as tryParseTripIntent's text path — the backend has the same
// Gemini-then-Groq fallback chain, so a legitimate call can take as long as
// a full Gemini attempt plus a full Groq attempt back-to-back.
const REQUEST_TIMEOUT_MS = 28000;

function parseWaypoint(w: unknown, distanceKey: string): RouteWaypoint | null {
  if (!w || typeof w !== "object") return null;
  const rec = w as Record<string, unknown>;
  if (typeof rec.name !== "string") return null;
  return {
    name: rec.name,
    code: typeof rec.code === "string" ? rec.code : null,
    distance: typeof rec[distanceKey] === "string" ? (rec[distanceKey] as string) : "",
  };
}

function parseLastMileOptions(options: unknown): RouteLastMile[] {
  if (!Array.isArray(options)) return [];
  return options
    .filter((lm): lm is Record<string, unknown> => !!lm && typeof lm === "object" && typeof (lm as any).mode === "string")
    .map((lm) => ({
      mode: lm.mode as string,
      duration: typeof lm.duration === "string" ? lm.duration : "",
      costRange: typeof lm.costRange === "string" ? lm.costRange : "",
      details: typeof lm.details === "string" ? lm.details : "",
    }));
}

export async function fetchRouteInfo(
  origin: string,
  destination: { name: string; state: string },
  onWaking?: () => void,
): Promise<RouteInfoResult | null> {
  const res = await fetchAiJson(`${API_BASE_URL}/plan-trip/route-info`, { origin, destination }, REQUEST_TIMEOUT_MS, onWaking);
  if (!res || !res.ok) return null;

  try {
    const data = await res.json();
    if (typeof data?.distanceKm !== "number" || !Array.isArray(data?.transport)) return null;

    const transport: RouteTransportOption[] = data.transport
      .filter((t: unknown): t is Record<string, unknown> => !!t && typeof t === "object" && typeof (t as any).mode === "string")
      .map((t: Record<string, unknown>) => ({
        mode: t.mode as string,
        duration: typeof t.duration === "string" ? t.duration : "",
        costRange: typeof t.costRange === "string" ? t.costRange : "",
        details: typeof t.details === "string" ? t.details : "",
        tips: typeof t.tips === "string" ? t.tips : "",
        departurePoint: parseWaypoint(t.departurePoint, "distanceFromOrigin"),
        arrivalPoint: parseWaypoint(t.arrivalPoint, "distanceFromDestination"),
        lastMileOptions: parseLastMileOptions(t.lastMileOptions),
      }));
    if (transport.length === 0) return null;

    return { distanceKm: data.distanceKm, transport };
  } catch {
    return null;
  }
}
