/**
 * One-time generator for journeyGuides.ts entries covering every
 * destination that doesn't already have a hand-written guide. No AI API
 * calls (Gemini/Groq both rate-limited at India-catalog scale) — grounded
 * instead in:
 *  - Real nearest-airport/station data (same MAJOR_AIRPORTS /
 *    MAJOR_RAILWAY_STATIONS lookup localRouteEstimate.ts already uses).
 *  - Genuinely reliable state-level knowledge (stateJourneyTemplates.ts) —
 *    actual regional climate, India's standardized emergency numbers.
 * Deliberately generates ONLY the 4 fields the app actually renders
 * (arrivalPoints, weatherSeasons, cityEssentials, fromCityToSight) —
 * cityHurdles/localAttractions/firstThingsToDo ship as empty arrays
 * (required by the type, but nothing currently renders them), and
 * travelAdvisory is omitted (optional).
 */
import { readFileSync, writeFileSync } from "fs";

const DESTINATION_COORDS = (await import("../src/data/destinationCoords.ts")).DESTINATION_COORDS;
const DESTINATION_COORDS_GEOCODED = (await import("../src/data/destinationCoordsGeocoded.ts")).DESTINATION_COORDS_GEOCODED;
const STATE_ANCHOR_COORDS = (await import("../src/data/stateAnchorCoords.ts")).STATE_ANCHOR_COORDS;
const MAJOR_AIRPORTS = (await import("../src/data/majorAirports.ts")).MAJOR_AIRPORTS;
const MAJOR_RAILWAY_STATIONS = (await import("../src/data/majorRailwayStations.ts")).MAJOR_RAILWAY_STATIONS;
const { getStateTemplate, NATIONAL_EMERGENCY, NATIONAL_POWER, NATIONAL_UPI } = await import("../src/data/stateJourneyTemplates.ts");

const ALL_COORDS = { ...DESTINATION_COORDS, ...DESTINATION_COORDS_GEOCODED };

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestHub(point, hubs) {
  let best = hubs[0];
  let bestKm = Infinity;
  for (const hub of hubs) {
    const d = haversineKm(point, { lat: hub.lat, lon: hub.lon });
    if (d < bestKm) { bestKm = d; best = hub; }
  }
  return { hub: best, km: bestKm };
}

function getDestPoint(destination) {
  const c = ALL_COORDS[destination.id];
  if (c) return c;
  const anchor = STATE_ANCHOR_COORDS[destination.state];
  return anchor ?? null;
}

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function lastMileStep(stepNum, fromName, destName, km) {
  const { duration, cost } = km < 5
    ? { duration: "10-15 min", cost: "₹100-₹250" }
    : km < 20
      ? { duration: "25-40 min", cost: "₹250-₹600" }
      : km < 50
        ? { duration: "45-75 min", cost: "₹600-₹1,500" }
        : { duration: "90+ min", cost: "₹1,500-₹3,000" };
  return { step: stepNum, icon: "🚗", action: `Take a taxi or auto-rickshaw from ${fromName} to ${destName}`, cost, duration, tip: "Agree on the fare upfront or insist on the meter — prepaid counters are common at bigger stations/airports." };
}

function buildArrivalPoints(destination, destPoint) {
  const points = [];
  const originAirport = nearestHub(destPoint, MAJOR_AIRPORTS);
  const originStation = nearestHub(destPoint, MAJOR_RAILWAY_STATIONS);

  points.push({
    by: "Flight",
    icon: "✈️",
    name: `${originAirport.hub.name} (${originAirport.hub.iata})`,
    distanceFromCity: `~${Math.round(originAirport.km)} km from ${destination.name}`,
    toAccommodation: [
      lastMileStep(1, `${originAirport.hub.name} airport`, destination.name, originAirport.km),
      { step: 2, icon: "🏨", action: "Check in and confirm your return transport option with your hotel", cost: "—", duration: "—", tip: "Save your hotel's address in the local script/language if you don't speak the regional language — makes showing a driver much easier." },
    ],
  });

  points.push({
    by: "Train",
    icon: "🚂",
    name: `${originStation.hub.name} (${originStation.hub.code})`,
    distanceFromCity: `~${Math.round(originStation.km)} km from ${destination.name}`,
    toAccommodation: [
      lastMileStep(1, `${originStation.hub.name} station`, destination.name, originStation.km),
      { step: 2, icon: "🏨", action: "Check in and store valuables securely", cost: "—", duration: "—", tip: "Keep a photo of your ID on your phone — useful for check-ins and ticket counters." },
    ],
  });

  points.push({
    by: "Road",
    icon: "🚗",
    name: "By car, cab, or bus",
    distanceFromCity: "Varies by origin — see the \"Getting There\" tab for a route from your specific starting city",
    toAccommodation: [
      { step: 1, icon: "🚗", action: `Self-drive, a private cab, or an interstate bus are all realistic options to reach ${destination.name} directly`, cost: "Varies by distance", duration: "Varies by distance", tip: "Check the \"Getting There\" tab above for a distance and cost estimate from your actual starting city." },
      { step: 2, icon: "🏨", action: "Check in and confirm parking (if self-driving) or your onward transport with your hotel", cost: "—", duration: "—", tip: "If driving yourself, ask about secure parking when you book — not every stay has it." },
    ],
  });

  return points;
}

function buildCityEssentials(destination, destPoint) {
  const t = getStateTemplate(destination.state);
  const nearestCityHub = nearestHub(destPoint, MAJOR_RAILWAY_STATIONS).hub.city;
  return {
    atm: `ATMs and bank branches are available in ${nearestCityHub}, the nearest major town; carry some cash for ${destination.name} itself in case local options are limited.`,
    sim: t.atmSimWifi.sim,
    wifi: t.atmSimWifi.wifi,
    medical: `${t.medical} ${nearestCityHub} has larger hospitals for anything beyond minor issues.`,
    language: t.language,
    localEmergency: NATIONAL_EMERGENCY,
    upi: NATIONAL_UPI,
    powerOutlet: NATIONAL_POWER,
  };
}

function buildFromCityToSight(destination, destPoint) {
  const nearestCityHub = nearestHub(destPoint, MAJOR_RAILWAY_STATIONS).hub.city;
  return `From ${nearestCityHub}, the nearest major transport hub, ${destination.name} is reached by road — taxis and autos cover the final stretch. See the "Getting There" tab above for a distance and transport breakdown from your specific starting city.`;
}

function buildGuide(destination) {
  const destPoint = getDestPoint(destination);
  if (!destPoint) return null; // shouldn't happen — STATE_ANCHOR_COORDS covers every state used in destinations.ts

  const t = getStateTemplate(destination.state);
  return {
    destId: destination.id,
    arrivalPoints: buildArrivalPoints(destination, destPoint),
    weatherSeasons: t.weatherSeasons,
    cityHurdles: [],
    cityEssentials: buildCityEssentials(destination, destPoint),
    localAttractions: [],
    fromCityToSight: buildFromCityToSight(destination, destPoint),
    firstThingsToDo: [],
  };
}

function guideToTs(g) {
  const arrivalPointsTs = g.arrivalPoints
    .map(
      (ap) => `      {
        by: "${esc(ap.by)}", icon: "${esc(ap.icon)}", name: "${esc(ap.name)}", distanceFromCity: "${esc(ap.distanceFromCity)}",
        toAccommodation: [
${ap.toAccommodation.map((s) => `          { step: ${s.step}, icon: "${esc(s.icon)}", action: "${esc(s.action)}", cost: "${esc(s.cost)}", duration: "${esc(s.duration)}", tip: "${esc(s.tip)}" },`).join("\n")}
        ],
      },`,
    )
    .join("\n");

  const weatherTs = g.weatherSeasons
    .map(
      (w) =>
        `      { season: "${esc(w.season)}", months: "${esc(w.months)}", icon: "${esc(w.icon)}", tempRange: "${esc(w.tempRange)}", feels: "${esc(w.feels)}", carry: [${w.carry.map((c) => `"${esc(c)}"`).join(", ")}], warning: "${esc(w.warning)}", clothingAdvice: "${esc(w.clothingAdvice)}" },`,
    )
    .join("\n");

  const ce = g.cityEssentials;
  return `  {
    destId: "${esc(g.destId)}",
    arrivalPoints: [
${arrivalPointsTs}
    ],
    weatherSeasons: [
${weatherTs}
    ],
    cityHurdles: [],
    cityEssentials: {
      atm: "${esc(ce.atm)}", sim: "${esc(ce.sim)}", wifi: "${esc(ce.wifi)}", medical: "${esc(ce.medical)}",
      language: "${esc(ce.language)}", localEmergency: "${esc(ce.localEmergency)}", upi: "${esc(ce.upi)}", powerOutlet: "${esc(ce.powerOutlet)}",
    },
    localAttractions: [],
    fromCityToSight: "${esc(g.fromCityToSight)}",
    firstThingsToDo: [],
  },`;
}

// --- main ---
const destContent = readFileSync("src/data/destinations.ts", "utf8");
const destStartIdx = destContent.indexOf("const DESTINATIONS_PART_1");
const destBody = destContent.slice(destStartIdx);
const idMarker = /^    id: "([^"]+)",/gm;
const indices = [];
let m;
while ((m = idMarker.exec(destBody))) indices.push({ idx: m.index, id: m[1] });

const allDestinations = [];
for (let i = 0; i < indices.length; i++) {
  const start = indices[i].idx;
  const end = i + 1 < indices.length ? indices[i + 1].idx : destBody.length;
  const chunk = destBody.slice(start, end);
  const nameMatch = chunk.match(/name: "((?:[^"\\]|\\.)*)"/);
  const stateMatch = chunk.match(/state: "((?:[^"\\]|\\.)*)"/);
  if (nameMatch && stateMatch) allDestinations.push({ id: indices[i].id, name: nameMatch[1], state: stateMatch[1] });
}

const guidesContent = readFileSync("src/data/journeyGuides.ts", "utf8");
const existingIds = new Set([...guidesContent.matchAll(/destId: "([^"]+)"/g)].map((mm) => mm[1]));

const toGenerate = allDestinations.filter((d) => !existingIds.has(d.id));
console.error(`${allDestinations.length} total destinations, ${existingIds.size} already have a hand-written guide, generating ${toGenerate.length}`);

let generated = 0;
let skipped = 0;
const tsChunks = [];
for (const d of toGenerate) {
  const g = buildGuide(d);
  if (!g) { skipped++; continue; }
  tsChunks.push(guideToTs(g));
  generated++;
}
console.error(`generated: ${generated}, skipped (no coords at all): ${skipped}`);

// Insert before the closing `];` of JOURNEY_GUIDES.
const closeIdx = guidesContent.lastIndexOf("\n];");
if (closeIdx === -1) throw new Error("couldn't find JOURNEY_GUIDES closing bracket");
const newContent = guidesContent.slice(0, closeIdx) + "\n" + tsChunks.join("\n") + guidesContent.slice(closeIdx);
writeFileSync("src/data/journeyGuides.ts", newContent);
console.error(`wrote ${generated} new guides into src/data/journeyGuides.ts`);
