// Builds the three hub registries (airports, stations, bus stations) from the downloaded open data.
//   node registries.mjs <open-data-dir> <analysis-dir> <out.json>
import fs from "node:fs";
const [, , OD, AN, OUT] = process.argv;
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

/* ---- stations: Datameet (positions + 2016 timetable) cross-checked with Wikidata's current codes ---- */
const st = read(`${OD}/railways/stations.json`).features;
const wd = read(`${OD}/wikidata/codes.json`);
const sch = read(`${OD}/railways/schedules.json`);
const trainsAt = new Map();
for (const r of sch) { if (!r.station_code) continue; let s = trainsAt.get(r.station_code); if (!s) trainsAt.set(r.station_code, (s = new Set())); s.add(r.train_number); }
const title = (s) => s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\bJn\b\.?/g, "Junction").replace(/\bCantt\b\.?/g, "Cantt");
const rad = Math.PI / 180;
const hav = (a, b, c, d) => { const x = Math.sin(((c - a) * rad) / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const parsePt = (c) => { const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(c || ""); return m ? { lon: +m[1], lat: +m[2] } : null; };
const wdLabel = (code) => (wd[code]?.label ?? "").replace(/\s+(railway\s+)?station$/i, "").replace(/\s+halt$/i, " Halt").trim();
const notRailway = /metro|rrts|monorail|tram|bus/i;
const first = (s) => (s || "").toLowerCase().replace(/[^a-z ]/g, " ").trim().split(/\s+/)[0];
const dm = new Map(); // datameet stations by code
for (const f of st) { const p = f.properties, g = f.geometry?.coordinates; if (!g || !p.code) continue; dm.set(p.code, { code: p.code, name: title(p.name), lat: g[1], lon: g[0], trains: trainsAt.get(p.code)?.size ?? 0, state: p.state }); }
const wdPts = Object.entries(wd).map(([code, v]) => ({ code, label: v.label || "", ...(parsePt(v.coord) ?? {}) })).filter((x) => x.lat != null && !notRailway.test(x.label));
// Station codes that Indian Railways changed after the 2016 timetable (checked: Wikidata, and the earlier hand review for BNRS and VGLJ).
const MANUAL_RENAMES = { MGS: ["DDU", "Pt. Deen Dayal Upadhyaya Junction"], ALD: ["PRYJ", "Prayagraj Junction"], FD: ["AYC", "Ayodhya Cantt"], HBJ: ["RKMP", "Rani Kamalapati"], CSTM: ["CSMT", "Mumbai CSMT"], MUV: ["BNRS", "Banaras"], JHS: ["VGLJ", "Jhansi Junction (Virangana Lakshmibai)"], BCT: ["MMCT", "Mumbai Central"] };
let movedStations = 0;
const stations = [], renamed = [], dropped = [];
for (const s of dm.values()) {
  if (s.trains < 3) continue;
  let code = s.code, from = null, unverified = false, forcedName = null;
  if (MANUAL_RENAMES[s.code]) { [code, forcedName] = MANUAL_RENAMES[s.code]; from = s.code; renamed.push(`${s.code} -> ${code}`); }
  else if (!wd[s.code]) {
    // the code no longer exists: look for a successor at the same spot with the same first word
    const succ = wdPts.filter((w) => !dm.has(w.code) && Math.abs(w.lat - s.lat) < 0.03 && Math.abs(w.lon - s.lon) < 0.03 && hav(s.lat, s.lon, w.lat, w.lon) < 2.5 && first(w.label) === first(s.name)).sort((a, b) => hav(s.lat, s.lon, a.lat, a.lon) - hav(s.lat, s.lon, b.lat, b.lon))[0];
    if (succ) { code = succ.code; from = s.code; renamed.push(`${s.code}(${s.name},${s.trains}t) -> ${code}(${succ.label})`); }
    else { dropped.push(`${s.code} ${s.name} ${s.trains}t`); unverified = true; }
  }
  // The old dataset has some wrong positions (Osra was placed in the middle of Ujjain, 24 km off): trust Wikidata's where they disagree by more than 3 km.
  const wp = parsePt(wd[code]?.coord); if (wp && hav(s.lat, s.lon, wp.lat, wp.lon) > 3) { s.lat = wp.lat; s.lon = wp.lon; movedStations++; }
  const label = forcedName || wdLabel(code);
  const nm = label || s.name;
  const junction = /junction/i.test(wd[code]?.label ?? "") || /\bjunction\b/i.test(s.name);
  stations.push({ code, name: nm, lat: s.lat, lon: s.lon, trains: s.trains, junction: junction || !!forcedName && /junction/i.test(forcedName), halt: /halt/i.test(nm), renamedFrom: from, unverified, state: s.state });
}
// Stations Wikidata lists but the 2016 timetable does not (opened since, or too small to appear): usable, with unknown train counts.
const have = new Set(stations.map((x) => x.code));
const skipLabel = /metro|rrts|monorail|tram|halt|siding|yard|goods|cabin|depot|bus|airport/i;
for (const w of wdPts) {
  if (have.has(w.code) || dm.has(w.code) || skipLabel.test(w.label)) continue;
  if (Object.values(MANUAL_RENAMES).some(([c]) => c === w.code)) continue;
  stations.push({ code: w.code, name: wdLabel(w.code) || w.label, lat: w.lat, lon: w.lon, trains: 12, junction: /junction/i.test(w.label), halt: false, unknownTrains: true, renamedFrom: null, unverified: false, state: null });
}
console.log("stations moved to Wikidata's position:", movedStations);
console.log("renamed:", renamed.length, " kept but unverified (code not in Wikidata):", dropped.length);
console.log("  renamed ex:", renamed.slice(0, 12).join("; "));

/* ---- bus stations: OpenStreetMap, named ---- */
const bus = [];
const seen = new Set();
for (const e of read(`${OD}/osm/bus_stations_all.json`)) {
  const t = e.tags ?? {}; const name = (t["name:en"] || t.name || "").trim();
  if (!name || !/[A-Za-z]/.test(name)) continue;
  const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon; if (lat == null) continue;
  const key = `${name.toLowerCase()}|${lat.toFixed(2)}|${lon.toFixed(2)}`;
  if (seen.has(key)) continue; seen.add(key);
  bus.push({ id: `${e.type[0]}${e.id}`, name, lat, lon, operator: t.operator ?? t["operator:short"] ?? null, city: t["addr:city"] ?? null, street: t["addr:street"] ?? null });
}
/* ---- airports: OurAirports (positions) with the traffic table (passengers FY 2025-26) ---- */
const csv = fs.readFileSync(`${OD}/airports/airports.csv`, "utf8").split("\n");
const hdr = csv[0].match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((x) => x.replace(/,$/, "").replace(/^"|"$/g, "")); // not used; parse below with a proper splitter
function splitCsv(line) { const out = []; let cur = "", q = false; for (let i = 0; i < line.length; i++) { const ch = line[i]; if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; } else if (ch === '"') q = true; else if (ch === ",") { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; }
const H = splitCsv(csv[0]); const ix = Object.fromEntries(H.map((h, i) => [h, i]));
const traffic = read(`${AN}/traffic.json`);
const airports = [];
for (const line of csv.slice(1)) {
  if (!line.trim()) continue; const c = splitCsv(line);
  if (c[ix.iso_country] !== "IN" || !c[ix.iata_code] || !["large_airport", "medium_airport", "small_airport"].includes(c[ix.type])) continue;
  const iata = c[ix.iata_code];
  airports.push({ iata, name: c[ix.name], city: c[ix.municipality], region: c[ix.iso_region], lat: +c[ix.latitude_deg], lon: +c[ix.longitude_deg], flag: c[ix.scheduled_service], pax: traffic[iata]?.pax_2526 ?? null });
}
/* ---- towns (GeoNames, population 40,000+), used to name "the nearest bigger town" for bus ---- */
const towns = [];
for (const line of fs.readFileSync(`${OD}/geonames/IN.txt`, "utf8").split("\n")) {
  const c = line.split("\t"); if (c.length < 15 || c[6] !== "P") continue;
  const pop = +c[14]; if (pop < 40000) continue;
  towns.push({ name: c[2] || c[1], lat: +c[4], lon: +c[5], pop });
}
// Wikidata's "state of use": leave out stations that are decommissioned, closed, proposed or still being built.
const sou = fs.existsSync(`${OD}/wikidata_state/state_of_use.json`) ? read(`${OD}/wikidata_state/state_of_use.json`) : {};
const notInUse = stations.filter((s) => sou[s.code]?.state && sou[s.code].state !== "in use");
const notPassenger = /^ghum$|cabin|siding|\byard\b|goods|block and catch|workshop|depot|\bph\b|\bcolony\b|\bsdg\b/i;
const seenCode = new Map();
for (const s of stations.filter((x) => !notInUse.includes(x) && !notPassenger.test(x.name))) { const cur = seenCode.get(s.code); if (!cur || s.trains > cur.trains) seenCode.set(s.code, s); }   // one entry per code
const inUse = [...seenCode.values()];
console.log("dropped as cabins/sidings/yards/duplicates:", stations.length - notInUse.length - inUse.length);
console.log("left out because Wikidata says not in use:", notInUse.length, notInUse.slice(0, 14).map((s) => `${s.code} (${sou[s.code].state.split(" ")[0]})`).join(", "));
fs.writeFileSync(OUT, JSON.stringify({ stations: inUse, bus, airports, towns }));
console.log("towns:", towns.length);
console.log({ stations: stations.length, stationsWith10Trains: stations.filter((s) => s.trains >= 10).length, junctions: stations.filter((s) => s.junction).length, bus: bus.length, airports: airports.length });
for (const code of ["AGC", "JP", "MAO", "NJP", "BSB", "BNRS", "DDU", "MYS", "KURJ", "STA", "VGLJ", "JHS", "ABR", "MXO", "IDH", "PRYJ", "ALD", "MMCT", "AYC", "RKMP", "HW", "RKSH"]) { const s = stations.find((x) => x.code === code); console.log(code, s ? `${s.name} trains=${s.trains} junction=${s.junction}${s.renamedFrom ? " (was " + s.renamedFrom + ")" : ""}` : "MISSING"); }
