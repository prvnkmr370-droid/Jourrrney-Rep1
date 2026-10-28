// Picks the nearest airport / railway station / bus station for each place.
//   node pick.mjs <registries.json> <places-with-coords.json> <work-dir> [id,id,...]
// Stage 1: straight-line candidates. Stage 2: road distance from the public OSRM server (cached).
// Stage 3: apply the picking rules. Writes <work-dir>/picked.json.
import fs from "node:fs";
const [, , REG, PLACES, WORK, ONLY] = process.argv;
const R = JSON.parse(fs.readFileSync(REG, "utf8"));
const places = JSON.parse(fs.readFileSync(PLACES, "utf8")).filter((p) => p.coord && (!ONLY || ONLY.split(",").includes(p.id)));
const verified = fs.existsSync(`${WORK}/airports_verified.json`) ? JSON.parse(fs.readFileSync(`${WORK}/airports_verified.json`, "utf8")) : null;

const rad = Math.PI / 180;
const hav = (a, b, c, d) => { const x = Math.sin(((c - a) * rad) / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };

/* ---------- registries, prepared once ---------- */
const air = R.airports.map((a) => {
  const v = verified?.[a.iata];
  const active = v ? v.service === "yes" || v.service === "seasonal" : a.pax != null || a.flag === "yes";
  let service = "few";
  const pax = a.pax ?? v?.pax2526 ?? null;
  if (pax != null) service = pax >= 5e6 ? "most" : pax >= 4e5 ? "more" : "few";
  else if (v?.flightsPerWeek != null) service = v.flightsPerWeek >= 35 ? "more" : "few";
  return { ...a, active, service, v };
}).filter((a) => a.active);
const rail = R.stations.filter((s) => s.trains >= 3);
const isHub = (s) => (s.junction && s.trains >= 25) || s.trains >= 100;
const isServed = (s) => s.trains >= 25 || s.junction;
const BAD_BUS = /taxi|jeep|sumo|shared|\bcab\b|\bauto\b|unofficial|depot|workshop|garage|parking|travels|tours|\\bbuses\\b|red ?bus|booking|ticket|office|school|college|hospital|\betc\b|,|\bto\b.*\b(bus|stand)|\(closed|disused|abandoned/i;
const BUSWORD = /\b(bus|stand|station|terminal|terminus|isbt|nilayam|adda)\b/i;
const bus = R.bus.filter((b) => !BAD_BUS.test(b.name) && b.name.length >= 4);
const towns = R.towns;

function candidates(p) {
  const { lat, lon } = p.coord;
  const byDist = (arr) => arr.map((x) => ({ x, d: hav(lat, lon, x.lat, x.lon) })).sort((a, b) => a.d - b.d);
  const A = byDist(air), S = byDist(rail), B = byDist(bus);
  const airC = new Map(), railC = new Map(), busC = new Map();
  for (const { x } of A.slice(0, 4)) airC.set(x.iata, x);
  const firstMore = A.find((o) => o.x.service !== "few" && o.d < 350); if (firstMore) airC.set(firstMore.x.iata, firstMore.x);
  const firstHub = A.find((o) => o.x.service === "most" && o.d < 450); if (firstHub) airC.set(firstHub.x.iata, firstHub.x);
  for (const { x } of S.filter((o) => !o.x.halt || o.x.trains >= 12).slice(0, 5)) railC.set(x.code, x);
  S.filter((o) => o.d < 150 && isServed(o.x) && !o.x.halt).slice(0, 4).forEach((o) => railC.set(o.x.code, o.x));
  S.filter((o) => o.d < 300 && isHub(o.x)).slice(0, 6).forEach((o) => railC.set(o.x.code, o.x));
  for (const { x } of B.slice(0, 4)) busC.set(x.id, x);
  return { air: [...airC.values()], rail: [...railC.values()], bus: [...busC.values()].filter((b) => hav(lat, lon, b.lat, b.lon) < 100) };
}

/* ---------- road distances ---------- */
const OSRM_CACHE = `${WORK}/osrm_cache.json`;
const cache = fs.existsSync(OSRM_CACHE) ? JSON.parse(fs.readFileSync(OSRM_CACHE, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function road(p, dests) {
  const key = (d) => `${p.id}|${d.kind}|${d.id}|${p.coord.lat.toFixed(4)},${p.coord.lon.toFixed(4)}`;
  const need = dests.filter((d) => !(key(d) in cache));
  if (need.length) {
    const coords = [`${p.coord.lon},${p.coord.lat}`, ...need.map((d) => `${d.lon},${d.lat}`)].join(";");
    const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&destinations=${need.map((_, i) => i + 1).join(";")}&annotations=distance,duration`;
    let j = null;
    for (let a = 0; a < 4 && !j; a++) {
      try { const r = await fetch(url, { headers: { "User-Agent": "JourneyApp-data/1.0 (https://jourrrney.in; prvnkmr370@gmail.com)" } }); if (r.ok) j = await r.json(); else await sleep(3000 * (a + 1)); }
      catch { await sleep(3000 * (a + 1)); }
    }
    await sleep(900);
    need.forEach((d, i) => { cache[key(d)] = j?.code === "Ok" && j.distances?.[0]?.[i] != null ? { km: j.distances[0][i] / 1000, min: j.durations[0][i] / 60 } : null; });
  }
  return dests.map((d) => ({ ...d, road: cache[key(d)] }));
}

/* ---------- rules ---------- */
// A road answer is only believed if it is not absurdly longer or slower than the straight line (islands get
// routed over the mainland by the router; that is not a road a traveller can use).
const valid = (d) => d.road && d.road.km >= d.straight * 0.85 - 2 && d.road.km <= (d.kind === "air" ? 800 : 600) && d.road.km <= d.straight * 3.2 + 20 && (d.road.km < 3 || d.road.km / (d.road.min / 60) >= 6);
const roundTime = (m) => Math.max(5, Math.round(m / 5) * 5);
function scaled(r) { const speed = r.km / (r.min / 60); const f = speed < 40 ? 1.8 : 1.5; return { km: Math.max(1, Math.round(r.km)), minutes: roundTime(Math.min(r.min * f, r.km * 3.2 + 10)) }; }
const baseName = (s) => s.replace(/\s+/g, " ").trim();

const take = (arr, n = 3) => { const out = []; for (const d of arr) if (d && !out.includes(d)) out.push(d); return out.slice(0, n).sort((a, b) => a.km - b.km); };
function pickAir(list) {
  const ok = list.filter(valid).map((d) => ({ ...d, ...scaled(d.road) })).sort((a, b) => a.km - b.km);
  if (!ok.length) return [];
  const first = ok[0];
  const close = ok.find((d) => d !== first && d.km <= first.km + Math.max(60, first.km * 0.5));            // another airport about as near
  const better = ok.find((d) => d !== first && d.service !== "few" && first.service === "few");              // the nearest one with more flights
  const hub = ok.find((d) => d.service === "most" && d !== first && d.km <= 350);                           // a big hub within reach
  return take([first, close, better, hub]);
}
function pickRail(list) {
  const ok = list.filter(valid).map((d) => ({ ...d, ...scaled(d.road) })).sort((a, b) => a.km - b.km);
  const usable = ok.filter((d) => !d.halt || d.trains >= 12);
  if (!usable.length) return [];
  const near = usable[0], slack = Math.max(4, near.km * 0.15);
  const first = usable.filter((d) => d.km <= near.km + slack).sort((a, b) => b.trains - a.trains || a.km - b.km)[0];   // nearest, unless a much better connected one is as near
  const second = usable.find((d) => d !== first && d.km <= first.km + 25);                                          // another station close by (small stations come in pairs)
  const served = usable.find((d) => d !== first && isServed(d) && d.km <= first.km + 80 && !d.halt);                // the nearest station with plenty of trains
  const hub = usable.find((d) => d !== first && isHub(d) && d.km <= first.km + 200 && d.trains > first.trains);      // the nearest big junction
  return take([first, hub, served, second]);
}
const BAD_NAME = /railway|station road|metro|\bto\b|^bus to|route|\bvia\b|\bstop\b/i;
function pickBus(list) {
  const ok = list.filter(valid).filter((d) => BUSWORD.test(d.name) && !BAD_NAME.test(d.name)).map((d) => ({ ...d, ...scaled(d.road) })).sort((a, b) => a.km - b.km);
  const out = [];
  for (const d of ok) { if (out.some((o) => o.name.toLowerCase() === d.name.toLowerCase() || hav(o.lat, o.lon, d.lat, d.lon) < 0.7)) continue; out.push(d); if (out.length === 2) break; }
  return out;
}

const result = {};
let n = 0;
for (const p of places) {
  const c = candidates(p);
  const dests = [...c.air.map((x) => ({ kind: "air", id: x.iata, ...x })), ...c.rail.map((x) => ({ kind: "rail", id: x.code, ...x })), ...c.bus.map((x) => ({ kind: "bus", id: x.id, ...x }))];
  let withRoad = (await road(p, dests)).map((d) => ({ ...d, straight: hav(p.coord.lat, p.coord.lon, d.lat, d.lon) }));
  if (/Andaman|Lakshadweep/.test(p.state)) withRoad = withRoad.filter((d) => d.kind !== "rail" && d.straight <= 120 && !/Lakshadweep/.test(p.state)); // no railway; Lakshadweep's islands are linked by sea, not road
  result[p.id] = {
    place: { id: p.id, name: p.name, state: p.state, coord: p.coord },
    air: pickAir(withRoad.filter((d) => d.kind === "air")),
    rail: pickRail(withRoad.filter((d) => d.kind === "rail")),
    bus: pickBus(withRoad.filter((d) => d.kind === "bus")).filter((d) => d.km <= 30),
    busTown: (() => {
      const bs = pickBus(withRoad.filter((d) => d.kind === "bus")); if (!bs.length || bs[0].km <= 30) return null;
      const t = towns.map((x) => ({ x, d: hav(bs[0].lat, bs[0].lon, x.lat, x.lon) })).filter((o) => o.d < 8).sort((a, b) => b.x.pop - a.x.pop)[0];
      return t ? { name: t.x.name, km: bs[0].km, minutes: bs[0].minutes, via: bs[0].name } : null;
    })(),
    nearestBusStraight: c.bus.length ? Math.round(Math.min(...c.bus.map((b) => hav(p.coord.lat, p.coord.lon, b.lat, b.lon)))) : null,
  };
  if (++n % 25 === 0) { fs.writeFileSync(OSRM_CACHE, JSON.stringify(cache)); console.error(`[${n}/${places.length}] ${p.name}`); }
}
fs.writeFileSync(OSRM_CACHE, JSON.stringify(cache));
fs.writeFileSync(`${WORK}/picked.json`, JSON.stringify(result));
console.log("picked", Object.keys(result).length);
