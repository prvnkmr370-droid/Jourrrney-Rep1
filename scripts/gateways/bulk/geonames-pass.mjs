// A free third opinion on where a place is: the GeoNames list of places in India (local file).
// Used only when the name is unambiguous inside the state (all same-named features lie within 20 km of each other).
//   node geonames-pass.mjs <geonames-dir> <places.json> <out.jsonl>
import fs from "node:fs";
const [, , GN, PLACES, OUT] = process.argv;
const norm = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const GENERIC = new Set("river lake temple fort palace museum beach park garden gardens sanctuary national wildlife reserve reserved forest falls waterfall waterfalls dam hill hills valley mandir masjid mosque church bus stand station road village town city district the of and new old east west north south ghat island islands point view heritage resort rural tourism conservation fishing harbour harbor".split(" "));
const rad = Math.PI / 180;
const hav = (a, b, c, d) => { const x = Math.sin(((c - a) * rad) / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const adm = {}; for (const l of fs.readFileSync(`${GN}/admin1CodesASCII.txt`, "utf8").split("\n")) { const p = l.split("\t"); if (p[0]?.startsWith("IN.")) adm[p[0].slice(3)] = norm(p[1]); }
const STATE_OK = { "Jammu and Kashmir (UT)": ["jammu and kashmir"], "Ladakh (UT)": ["ladakh", "jammu and kashmir"], Delhi: ["delhi"], "Puducherry (UT)": ["puducherry"], "Chandigarh (UT)": ["chandigarh"], "Diu (UT)": ["dadra and nagar haveli and daman and diu"], "Daman (UT)": ["dadra and nagar haveli and daman and diu"], "Dadra and Nagar Haveli (UT)": ["dadra and nagar haveli and daman and diu"], "Andaman & Nicobar": ["andaman and nicobar"], Lakshadweep: ["lakshadweep"] };
const okStates = (s) => STATE_OK[s] ?? [norm(s)];
const idx = new Map(); // "state|name" -> [{lat, lon, pop, cls}]
for (const line of fs.readFileSync(`${GN}/IN.txt`, "utf8").split("\n")) {
  const c = line.split("\t"); if (c.length < 15) continue;
  const st = adm[c[10]]; if (!st) continue;
  const rec = { lat: +c[4], lon: +c[5], pop: +c[14] || 0, cls: c[6] };
  const names = new Set([norm(c[1]), norm(c[2]), ...c[3].split(",").filter((x) => x.length < 50).map(norm)]);
  for (const n of names) if (n) { const k = `${st}|${n}`; (idx.get(k) ?? idx.set(k, []).get(k)).push(rec); }
}
function variants(name) {
  const base = name.replace(/\s*\([^)]*\)/g, " ").trim();
  const out = [base, ...base.split(/,|&| and |\/|–| - /).map((s) => s.trim()).filter(Boolean), ...[...name.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).filter((p) => p.length > 2 && !/^\d/.test(p))];
  const seen = new Set(); return out.filter((v) => { const n = norm(v); if (!n || n.length < 4 || seen.has(n)) return false; if (n.split(" ").every((t) => GENERIC.has(t))) return false; seen.add(n); return true; }).slice(0, 4);
}
const places = JSON.parse(fs.readFileSync(PLACES, "utf8")).filter((p) => p.src !== "hand");
let found = 0; const lines = [];
for (const p of places) {
  let hit = null;
  for (const v of variants(p.name)) {
    const feats = okStates(p.state).flatMap((st) => idx.get(`${st}|${norm(v)}`) ?? []);
    if (!feats.length) continue;
    // cluster the same-named features; only a single cluster is informative
    const clusters = []; for (const f of feats) { const cl = clusters.find((c) => hav(c[0].lat, c[0].lon, f.lat, f.lon) <= 20); cl ? cl.push(f) : clusters.push([f]); }
    if (clusters.length === 1) { const f = clusters[0].sort((a, b) => b.pop - a.pop)[0]; hit = { lat: +f.lat.toFixed(5), lon: +f.lon.toFixed(5), confidence: "medium", query: v, osm_name: v }; break; }
  }
  if (hit) found++;
  lines.push(JSON.stringify({ id: p.id, found: hit }));
}
fs.writeFileSync(OUT, lines.join("\n") + "\n");
console.log("places:", places.length, " with an unambiguous GeoNames match:", found);
