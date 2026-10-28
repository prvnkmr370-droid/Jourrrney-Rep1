/**
 * Finds CANDIDATE "gateways" (the nearest airport, railway station and bus
 * station) for destinations, from open data, so a person can check them
 * before they go into src/data/gateways.ts. It never writes to the app:
 *
 *   node scripts/gateways/find-candidates.mjs hampi coorg munnar
 *   node scripts/gateways/find-candidates.mjs --all-with-coords      (every place that has map positions)
 *
 * Output: scripts/gateways/out/candidates.json (not committed), one entry per
 * place, with how each candidate was found and how far it is BY ROAD.
 *
 * Sources (all open, no keys):
 *   - Airports: OurAirports (public domain) airports.csv, every Indian airport
 *     that has an IATA code. Its "scheduled_service" flag is often stale (it says
 *     "no" for airports that do have a couple of flights), so a service level is
 *     only a hint here and MUST be checked by a person.
 *   - Railway stations: Wikidata (every station with an Indian Railways station
 *     code, property P5696, and a map position). It lists tiny halts too, so the
 *     nearest few AND the nearest big junctions are offered and a person picks.
 *   - Bus stations: OpenStreetMap through Nominatim (a name search inside a box
 *     around the place). OpenStreetMap's bus-station coverage in India is thin,
 *     so expect many places to come back empty: those need a person.
 *   - Road distance and time: OpenStreetMap routing (OSRM demo server).
 *
 * Be polite to these free services: the script waits between calls.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const outDir = path.join(here, "out");
const cacheDir = path.join(os.tmpdir(), "journey-gateways-cache");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rad = (d) => (d * Math.PI) / 180;
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/* ---------- places and their map positions ---------- */
function readCoords(file) {
  const src = fs.readFileSync(path.join(root, "src", "data", file), "utf8");
  const out = {};
  for (const m of src.matchAll(/\n\s+"?([a-z0-9_-]+)"?: \{ lat: ([\d.-]+), lon: ([\d.-]+) \}/g)) out[m[1]] = { lat: +m[2], lon: +m[3] };
  return out;
}
const curated = readCoords("destinationCoords.ts");
const geocoded = readCoords("destinationCoordsGeocoded.ts");
const coords = { ...geocoded, ...curated }; // hand-curated positions win

/* ---------- the app's own list of big junctions (to flag "major junction") ---------- */
const majorStations = new Set([...fs.readFileSync(path.join(root, "src", "data", "majorRailwayStations.ts"), "utf8").matchAll(/code: "([A-Z]+)"/g)].map((m) => m[1]));

/* ---------- airports ---------- */
async function loadAirports() {
  const file = path.join(cacheDir, "airports.csv");
  if (!fs.existsSync(file)) {
    const res = await fetch("https://davidmegginson.github.io/ourairports-data/airports.csv");
    if (!res.ok) throw new Error(`airports.csv: HTTP ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const text = fs.readFileSync(file, "utf8");
  const rows = [];
  let i = 0;
  const parseLine = () => { // minimal CSV reader (handles quoted commas)
    const cells = []; let cur = "", q = false;
    for (; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { cells.push(cur); cur = ""; }
      else if (ch === "\n") { cells.push(cur); i++; return cells; }
      else if (ch !== "\r") cur += ch;
    }
    cells.push(cur); return cells;
  };
  const header = parseLine();
  while (i < text.length) { const cells = parseLine(); if (cells.length === header.length) rows.push(Object.fromEntries(header.map((h, k) => [h, cells[k]]))); }
  return rows
    .filter((r) => r.iso_country === "IN" && r.iata_code && ["large_airport", "medium_airport", "small_airport"].includes(r.type))
    .map((r) => ({ name: r.name, iata: r.iata_code, type: r.type, scheduledFlag: r.scheduled_service === "yes", city: r.municipality, lat: +r.latitude_deg, lon: +r.longitude_deg }));
}

/* ---------- road distance (OSRM) ---------- */
async function road(a, b) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        const r = d.routes?.[0];
        if (r) return { km: Math.round(r.distance / 100) / 10, minutes: Math.round(r.duration / 60) };
      }
    } catch { /* retry */ }
    await sleep(1500);
  }
  return null;
}

/* ---------- Wikidata: railway stations with an Indian Railways code ---------- */
const UA = "JourneyApp-data/1.0 (https://jourrrney.in; prvnkmr370@gmail.com)";
async function wikidataStations(point, radiusKm) {
  const query = `SELECT ?sLabel ?code ?coord WHERE {
    SERVICE wikibase:around { ?s wdt:P625 ?coord . bd:serviceParam wikibase:center "Point(${point.lon} ${point.lat})"^^geo:wktLiteral . bd:serviceParam wikibase:radius "${radiusKm}" . }
    ?s wdt:P5696 ?code .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query), { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
      if (res.ok) {
        const rows = (await res.json()).results.bindings;
        return rows.map((b) => {
          const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value);
          return m ? { name: b.sLabel.value.replace(/ railway station$/i, ""), code: b.code.value, lon: +m[1], lat: +m[2] } : null;
        }).filter(Boolean);
      }
    } catch { /* retry */ }
    await sleep(3000);
  }
  return [];
}

/* ---------- Nominatim: bus stations inside a box around the place ---------- */
async function nominatimBus(point, halfDeg = 0.3) {
  const box = `${point.lon - halfDeg},${point.lat + halfDeg},${point.lon + halfDeg},${point.lat - halfDeg}`;
  const out = [];
  for (const q of ["bus station", "bus stand"]) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&viewbox=${box}&bounded=1&limit=12&countrycodes=in&extratags=1`, { headers: { "User-Agent": UA } });
      if (res.ok) for (const r of await res.json()) out.push({ name: r.name || r.display_name?.split(",")[0], operator: r.extratags?.operator ?? r.extratags?.network ?? null, lat: +r.lat, lon: +r.lon });
    } catch { /* skip */ }
    await sleep(1200); // Nominatim allows about one request a second
  }
  const seen = new Set();
  return out.filter((b) => b.name && !seen.has(b.name + b.lat.toFixed(3)) && seen.add(b.name + b.lat.toFixed(3)));
}

async function candidatesFor(id, point, airports) {
  const out = { id, point, air: [], rail: [], bus: [] };

  // Airports: the nearest few by straight line, plus the nearest large/medium ones with a scheduled-service flag.
  const byLine = airports.map((a) => ({ ...a, line: haversine(point, a) })).sort((x, y) => x.line - y.line);
  const pick = new Map();
  for (const a of byLine.slice(0, 3)) pick.set(a.iata, a);
  for (const a of byLine.filter((a) => a.scheduledFlag && a.type !== "small_airport").slice(0, 2)) pick.set(a.iata, a);
  const hub = byLine.find((a) => a.type === "large_airport" && a.line < 450);
  if (hub) pick.set(hub.iata, hub);
  for (const a of pick.values()) {
    const r = await road(point, a); await sleep(400);
    out.air.push({ name: a.name, iata: a.iata, type: a.type, scheduledFlag: a.scheduledFlag, city: a.city, lat: a.lat, lon: a.lon, straightKm: Math.round(a.line), road: r });
  }
  out.air.sort((x, y) => (x.road?.km ?? 9999) - (y.road?.km ?? 9999));

  // Railway stations (Wikidata, with an Indian Railways code).
  const stations = await wikidataStations(point, 150);
  const st = stations.map((e) => ({ ...e, line: haversine(point, e), major: majorStations.has(e.code) })).sort((x, y) => x.line - y.line);
  const stPick = new Map();
  for (const s of st.slice(0, 3)) stPick.set(s.code, s);
  for (const s of st.filter((s) => s.major).slice(0, 2)) stPick.set(s.code, s);
  for (const s of st.filter((s) => /junction|central|terminus|cantt|city/i.test(s.name)).slice(0, 2)) stPick.set(s.code, s);
  for (const s of stPick.values()) {
    const r = await road(point, s); await sleep(400);
    out.rail.push({ name: s.name, code: s.code, major: s.major, lat: s.lat, lon: s.lon, straightKm: Math.round(s.line), road: r });
  }
  out.rail.sort((x, y) => (x.road?.km ?? 9999) - (y.road?.km ?? 9999));
  await sleep(1500);

  // Bus stations (OpenStreetMap through Nominatim), named only.
  const bs = (await nominatimBus(point)).map((b) => ({ ...b, line: haversine(point, b) })).sort((x, y) => x.line - y.line);
  for (const b of bs.slice(0, 3)) {
    const r = await road(point, b); await sleep(400);
    out.bus.push({ name: b.name, operator: b.operator, lat: b.lat, lon: b.lon, straightKm: Math.round(b.line), road: r });
  }
  out.bus.sort((x, y) => (x.road?.km ?? 9999) - (y.road?.km ?? 9999));
  await sleep(1000);
  return out;
}

const args = process.argv.slice(2);
const ids = args.includes("--all-with-coords") ? Object.keys(coords) : args.filter((a) => !a.startsWith("--"));
if (!ids.length) { console.error("Give place ids, e.g.  node scripts/gateways/find-candidates.mjs hampi coorg"); process.exit(1); }
const unknown = ids.filter((id) => !coords[id]);
if (unknown.length) console.warn("No map position for:", unknown.join(", "), "(skipped)");

const airports = await loadAirports();
console.log(`${airports.length} Indian airports with an IATA code loaded`);
const outFile = path.join(outDir, "candidates.json");
const results = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : {};
for (const id of ids.filter((id) => coords[id])) {
  process.stdout.write(`${id} ... `);
  results[id] = await candidatesFor(id, coords[id], airports);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
  const r = results[id];
  console.log(`air ${r.air.map((a) => `${a.iata} ${a.road?.km}km`).join(", ")} | rail ${r.rail.map((s) => `${s.code} ${s.road?.km}km`).join(", ")} | bus ${r.bus.map((b) => `${b.name} ${b.road?.km}km`).join("; ") || "none in OSM"}`);
}
console.log("Wrote", path.relative(root, outFile));
