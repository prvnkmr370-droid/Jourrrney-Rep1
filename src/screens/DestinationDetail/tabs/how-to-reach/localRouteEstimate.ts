/**
 * The route-info panel's ONLY data source — ArriveSection deliberately
 * never calls the AI backend (fetchRouteInfo / POST /plan-trip/route-info)
 * for this feature, so distance/airport/station/transport info never
 * spends AI quota or credits just from someone browsing destinations and
 * trying different origins. Geocodes origin/destination via the same free
 * Open-Meteo API useCitySearch already uses, computes a straight-line
 * (haversine) distance, and picks the nearest entry from the curated
 * MAJOR_AIRPORTS / MAJOR_RAILWAY_STATIONS lists for each of the
 * Flight/Train/Bus legs (Bus reuses the railway-station hub's city as a
 * stand-in, since there's no separate bus-terminus dataset) — then builds
 * generic, distance-bracketed transport guidance rather than
 * destination-specific narrative (which would genuinely need AI/world
 * knowledge this module doesn't have, e.g. "which train" or "which
 * airline"). Always labelled as an estimate in the UI so it reads as
 * "approximate, from map data" rather than passing for AI-level detail.
 *
 * The AI route-info endpoint (journey-backend's planTrip.js) and its
 * client (routeInfo.ts) are both still intact and working — this module
 * just isn't called from fetchRouteInfo's former call site anymore. See
 * ArriveSection.tsx's route-fetch effect for how to switch back.
 */
import { DESTINATION_COORDS } from "@/data/destinationCoords";
import { DESTINATION_COORDS_GEOCODED } from "@/data/destinationCoordsGeocoded";
import { MAJOR_AIRPORTS } from "@/data/majorAirports";
import { MAJOR_RAILWAY_STATIONS } from "@/data/majorRailwayStations";
import { STATE_ANCHOR_COORDS } from "@/data/stateAnchorCoords";
import type { RouteInfoResult, RouteLastMile, RouteTransportOption } from "./routeInfo";

export interface GeoPoint {
  lat: number;
  lon: number;
}

async function geocode(query: string): Promise<GeoPoint | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    const data = await res.json();
    const r = data?.results?.[0];
    if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") return null;
    return { lat: r.latitude, lon: r.longitude };
  } catch {
    return null;
  }
}

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Shared by the Flight/Train/Bus legs below — each picks its nearest hub
 * from a different curated list (airports, railway stations; the Bus leg
 * reuses the railway-station list as a city-hub proxy, see buildBusLeg). */
function nearestHub<T extends { lat: number; lon: number }>(point: GeoPoint, hubs: T[]): { hub: T; distanceKm: number } {
  let best = hubs[0];
  let bestDistanceKm = Infinity;
  for (const hub of hubs) {
    const dist = haversineKm(point, { lat: hub.lat, lon: hub.lon });
    if (dist < bestDistanceKm) {
      bestDistanceKm = dist;
      best = hub;
    }
  }
  return { hub: best, distanceKm: bestDistanceKm };
}

/** A short list of last-mile alternatives (not just one) for covering a leg
 * of the given length from an arrival airport/station to the actual
 * destination — same shape the AI path returns, just templated instead of
 * generated. Auto-rickshaw is only realistic at shorter distances; a
 * bus/shared shuttle is offered at every distance since it's the cheapest
 * option even if slow. */
function lastMileOptionsEstimate(km: number, arrivalPointName: string, destinationName: string): RouteLastMile[] {
  const options: RouteLastMile[] = [];

  const taxi = km < 5 ? { duration: "~10–15 min", costRange: "₹100–₹250" }
    : km < 20 ? { duration: "~25–40 min", costRange: "₹250–₹600" }
    : km < 50 ? { duration: "~45–75 min", costRange: "₹600–₹1,500" }
    : { duration: "~90+ min", costRange: "₹1,500–₹3,000" };
  options.push({ mode: "Taxi/App cab", duration: taxi.duration, costRange: taxi.costRange, details: `Direct from ${arrivalPointName} to ${destinationName}.` });

  if (km < 30) {
    const auto = km < 5 ? { duration: "~12–18 min", costRange: "₹60–₹150" }
      : km < 20 ? { duration: "~30–50 min", costRange: "₹150–₹350" }
      : { duration: "~50–70 min", costRange: "₹350–₹550" };
    options.push({ mode: "Auto-rickshaw", duration: auto.duration, costRange: auto.costRange, details: "Cheaper than a cab for shorter distances; usually available right outside." });
  }

  const bus = km < 20 ? { duration: "~30–50 min", costRange: "₹30–₹100" }
    : km < 50 ? { duration: "~50–90 min", costRange: "₹80–₹200" }
    : { duration: "~90–150 min", costRange: "₹150–₹400" };
  options.push({ mode: "Bus/Shared shuttle", duration: bus.duration, costRange: bus.costRange, details: `Public or shared bus toward ${destinationName}, where available — cheapest but slowest option.` });

  return options;
}

function buildGenericTransport(distanceKm: number, originPoint: GeoPoint, destPoint: GeoPoint, origin: string, destinationName: string): RouteTransportOption[] {
  const estimateNote = "Estimated from map distance, not AI-generated.";
  const options: RouteTransportOption[] = [];

  const originAirport = nearestHub(originPoint, MAJOR_AIRPORTS);
  const destAirport = nearestHub(destPoint, MAJOR_AIRPORTS);
  // Flying between the same nearest airport on both ends (origin and
  // destination share a regional hub) isn't a real route — skip it rather
  // than suggest a flight to/from the same place. Same logic applies below
  // for Train (same nearest station) and Bus (same nearest city hub).
  if (originAirport.hub.iata !== destAirport.hub.iata) {
    options.push({
      mode: "Flight",
      duration: distanceKm > 1500 ? "~2.5–4h flight" : "~1–2h flight",
      costRange: distanceKm > 1500 ? "₹5,000–₹12,000" : "₹2,500–₹7,000",
      details: estimateNote,
      tips: "Fares vary a lot by how far in advance you book.",
      departurePoint: { name: originAirport.hub.name, code: originAirport.hub.iata, distance: `~${Math.round(originAirport.distanceKm)} km from ${origin}` },
      arrivalPoint: { name: destAirport.hub.name, code: destAirport.hub.iata, distance: `~${Math.round(destAirport.distanceKm)} km from ${destinationName}` },
      lastMileOptions: lastMileOptionsEstimate(destAirport.distanceKm, destAirport.hub.name, destinationName),
    });
  }

  const originStation = nearestHub(originPoint, MAJOR_RAILWAY_STATIONS);
  const destStation = nearestHub(destPoint, MAJOR_RAILWAY_STATIONS);
  // Indian Railways realistically covers almost any two cities in the
  // country (multi-day journeys with a transfer or two included) — the AI
  // path itself offers Train well past 2,000km (e.g. Chennai→Chandigarh,
  // ~2,400km), so this shouldn't cut Train off at a short-haul-only
  // distance the way Flight/Bus legitimately can.
  if (distanceKm < 3200 && originStation.hub.code !== destStation.hub.code) {
    options.push({
      mode: "Train",
      duration: `~${Math.max(2, Math.round(distanceKm / 55))}h`,
      costRange: distanceKm < 1200 ? "₹300–₹2,000" : "₹800–₹4,500",
      details: estimateNote,
      tips: "Book sleeper/AC class in advance on long routes.",
      departurePoint: { name: originStation.hub.name, code: originStation.hub.code, distance: `~${Math.round(originStation.distanceKm)} km from ${origin}` },
      arrivalPoint: { name: destStation.hub.name, code: destStation.hub.code, distance: `~${Math.round(destStation.distanceKm)} km from ${destinationName}` },
      lastMileOptions: lastMileOptionsEstimate(destStation.distanceKm, destStation.hub.name, destinationName),
    });
  }

  // No dedicated bus-terminus dataset (unlike airports/stations, specific
  // ISBT/bus-stand names and locations aren't something this module has
  // high confidence in across the country) — reuses the railway-station
  // hub's city as a reliable stand-in location, described generically
  // rather than naming a specific facility that might not be accurate.
  if (distanceKm < 1200 && originStation.hub.code !== destStation.hub.code) {
    options.push({
      mode: "Bus",
      duration: `~${Math.max(3, Math.round(distanceKm / 45))}h`,
      costRange: "₹400–₹2,000",
      details: `${estimateNote} The specific bus terminus isn't resolved in this estimate — check the main inter-state bus stand in ${originStation.hub.city} and near ${destinationName} directly.`,
      tips: "State transport corporation (government) buses are cheaper; private Volvo/sleeper buses cost more but are more comfortable overnight.",
      departurePoint: { name: `${originStation.hub.city} Inter-State Bus Terminus`, code: null, distance: `~${Math.round(originStation.distanceKm)} km from ${origin}` },
      arrivalPoint: { name: `${destStation.hub.city} Inter-State Bus Terminus`, code: null, distance: `~${Math.round(destStation.distanceKm)} km from ${destinationName}` },
      lastMileOptions: lastMileOptionsEstimate(destStation.distanceKm, `${destStation.hub.city} Inter-State Bus Terminus`, destinationName),
    });
  }

  if (distanceKm < 800) {
    options.push({
      mode: "Road",
      duration: `~${Math.max(2, Math.round(distanceKm / 50))}h`,
      costRange: "₹1,000–₹4,000 (self-drive fuel or private cab)",
      details: `${estimateNote} Self-drive or a private cab — not a scheduled service.`,
      tips: "Add buffer time for traffic near city limits.",
      departurePoint: null,
      arrivalPoint: null,
      lastMileOptions: [],
    });
  }
  return options;
}

/** Also used directly by rideAppLinks.ts (via LocalTransportSection) to resolve the destination's drop-off point — same precision tiers as the route-info estimate above. */
export async function getDestinationPoint(destination: { id: string; name: string; state: string }): Promise<GeoPoint | null> {
  const known = DESTINATION_COORDS[destination.id];
  if (known) return { lat: known.lat, lon: known.lon };

  // One-time bulk-geocoded (and state-cross-validated) coordinates — see
  // destinationCoordsGeocoded.ts's header for how these were produced.
  // Covers ~19% of all destinations (336/1786); not hand-verified like
  // DESTINATION_COORDS above, but checked to be in both the right country
  // and the right state.
  const geocodedOnce = DESTINATION_COORDS_GEOCODED[destination.id];
  if (geocodedOnce) return { lat: geocodedOnce.lat, lon: geocodedOnce.lon };

  // Open-Meteo's geocoder is a plain-settlement database — most specific
  // landmarks (as opposed to towns/cities) simply aren't in it (e.g.
  // "Sukhna Lake" has no match even with city+country appended, though
  // "Rock Garden" happens to). Try the landmark name live (in case
  // something new got indexed since the bulk pass above), then fall back
  // to a reliable state-level anchor rather than failing outright.
  const stateForQuery = destination.state.replace(/\s*\(UT\)\s*/, "").trim();
  const geocoded = await geocode(`${destination.name}, ${stateForQuery}, India`);
  if (geocoded) return geocoded;

  const anchor = STATE_ANCHOR_COORDS[destination.state];
  return anchor ? { lat: anchor.lat, lon: anchor.lon } : null;
}

export async function estimateRouteInfoLocally(
  origin: string,
  destination: { id: string; name: string; state: string },
): Promise<RouteInfoResult | null> {
  const [originPoint, destPoint] = await Promise.all([geocode(`${origin}, India`), getDestinationPoint(destination)]);
  if (!originPoint || !destPoint) return null;

  const distanceKm = haversineKm(originPoint, destPoint);

  return {
    distanceKm: Math.round(distanceKm),
    transport: buildGenericTransport(distanceKm, originPoint, destPoint, origin, destination.name),
  };
}
