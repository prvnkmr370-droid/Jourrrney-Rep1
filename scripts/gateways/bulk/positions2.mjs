// Decides the final map position for every place and how far to trust it.
//   node positions.mjs <analysis-dir> <out.json>
// Sources, best first: hand-checked (61), OpenStreetMap search (state-checked), Wikidata (state-checked),
// then the older approximate geocoder (540, state-checked settlement names).
import fs from "node:fs";
const [, , AN, OUT] = process.argv;
const places = JSON.parse(fs.readFileSync(`${AN}/places.json`, "utf8"));
const lines = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : []);
const GENERIC = new Set("river lake temple fort palace museum beach park garden gardens sanctuary national wildlife reserve reserved forest falls waterfall waterfalls dam hill hills valley mandir masjid mosque church bus stand station road village town city district the of and shri sri sree new old east west north south ghat island islands point view heritage resort rural tourism conservation ka ki ke ko tila tilla mahal darwaza gate bagh baag kund talab tal sarovar ashram dham pur nagar".split(" "));
const toks = (s) => (s ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
// A match must share a distinctive word with the name searched for, not just words like "river" or "temple".
function distinctive(query, found) {
  const a = toks(query).filter((t) => !GENERIC.has(t)), b = toks(found);
  if (!b.length) return "unreadable";            // e.g. a name in Devanagari: cannot compare
  if (!a.length) return true;                    // nothing distinctive to compare
  const shared = a.filter((t) => b.some((u) => u === t || (t.length > 4 && u.length > 4 && (u.startsWith(t.slice(0, 4)) || t.startsWith(u.slice(0, 4)))))).length;
  return shared / a.length >= 0.6;
}
const vet = (f) => { if (!f) return null; const d = distinctive(f.query, f.osm_name ?? f.wd_label); if (d === false) return null; if (d === "unreadable" && f.confidence === "high") return { ...f, confidence: "medium" }; return f; };
const osmN = new Map(lines(`${AN}/geocode_cache.jsonl`).map((d) => [d.id, d]));
const phot = new Map(lines(`${AN}/photon_cache.jsonl`).map((d) => [d.id, d]));
const osm = new Map();
for (const id of new Set([...osmN.keys(), ...phot.keys()])) {
  const a = vet(osmN.get(id)?.found), b = vet(phot.get(id)?.found);
  let f = a ?? b;
  if (a && b) { const dist = (x, y) => { const R = Math.PI / 180, q = Math.sin(((y.lat - x.lat) * R) / 2) ** 2 + Math.cos(x.lat * R) * Math.cos(y.lat * R) * Math.sin(((y.lon - x.lon) * R) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(q)); }; if (dist(a, b) > 25) f = { ...a, confidence: "disagree" }; }
  osm.set(id, { found: f, seen: true });
}
const wdm = new Map([...lines(`${AN}/wikidata_cache.jsonl`), ...lines(`${AN}/wikidata_cache_0.jsonl`), ...lines(`${AN}/wikidata_cache_1.jsonl`), ...lines(`${AN}/wikidata_cache_2.jsonl`)].map((d) => [d.id, { ...d, found: d.found && vet({ ...d.found, osm_name: d.found.wd_label }) }]));
const rad = Math.PI / 180;
const hav = (a, b, c, d) => { const x = Math.sin(((c - a) * rad) / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
// ---- v2: a position is trusted only when independent sources agree, or its own neighbours' distances support it ----
const nomMain = lines(`${AN}/geocode_cache.jsonl`), nomVer = lines(`${AN}/verify_nom.jsonl`);
const phoMain = lines(`${AN}/photon_cache.jsonl`), phoVer = [...lines(`${AN}/verify_photon.jsonl`), ...lines(`${AN}/verify_photon_a.jsonl`), ...lines(`${AN}/verify_photon_b.jsonl`)];
const best = (...lists) => { const m = new Map(); for (const l of lists) for (const d of l) { const f = vet(d.found); if (f && (f.confidence === "high" || f.confidence === "medium")) { const cur = m.get(d.id); if (!cur || (cur.confidence !== "high" && f.confidence === "high")) m.set(d.id, f); } } return m; };
const NOM = best(nomMain, nomVer), PHO = best(phoMain, phoVer), GN = best(lines(`${AN}/geonames_cache.jsonl`));
const WD = new Map([...wdm].filter(([, d]) => d.found).map(([id, d]) => [id, d.found]));
const out = [], tally = {}; const bump = (k) => (tally[k] = (tally[k] ?? 0) + 1);
for (const p of places) {
  if (p.src === "hand") { bump("hand"); out.push({ id: p.id, name: p.name, state: p.state, coord: p.coord, trust: "hand", why: "" }); continue; }
  const srcs = [];
  if (NOM.has(p.id)) srcs.push({ k: "osm", ...NOM.get(p.id) });
  if (PHO.has(p.id)) srcs.push({ k: "photon", ...PHO.get(p.id) });
  if (WD.has(p.id)) srcs.push({ k: "wikidata", ...WD.get(p.id) });
  if (GN.has(p.id)) srcs.push({ k: "geonames", ...GN.get(p.id) });
  if (p.src === "geocoded") srcs.push({ k: "older", lat: p.coord.lat, lon: p.coord.lon });
  let coord = null, trust, why = "";
  if (srcs.length === 0) trust = "not-found";
  else if (srcs.length === 1) { coord = { lat: srcs[0].lat, lon: srcs[0].lon }; trust = "single"; why = srcs[0].k; }
  else {
    // the largest group of sources that agree within 20 km
    let bestGroup = [];
    for (const a of srcs) { const g = srcs.filter((b) => hav(a.lat, a.lon, b.lat, b.lon) <= 20); if (g.length > bestGroup.length) bestGroup = g; }
    if (bestGroup.length >= 2) { const a = bestGroup.find((x) => x.k === "osm") ?? bestGroup.find((x) => x.k === "photon") ?? bestGroup[0]; coord = { lat: a.lat, lon: a.lon }; trust = "confirmed"; why = bestGroup.map((x) => x.k).join("+"); }
    else { trust = "conflict"; why = srcs.map((x) => `${x.k} ${x.lat.toFixed(2)},${x.lon.toFixed(2)}`).join(" vs "); }
  }
  bump(trust); out.push({ id: p.id, name: p.name, state: p.state, coord, trust, why });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(tally, "with a position (before the neighbour check):", out.filter((p) => p.coord).length, "of", out.length);
