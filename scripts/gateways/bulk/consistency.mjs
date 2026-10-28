// Cross-checks each place's position against the "nearby places" distances written on its own card.
//   node consistency.mjs <positions.json> <out.json>
import fs from "node:fs";
const { DESTINATIONS } = await import("/Users/mpraveenkumar/Documents/Claude/journey-app/src/data/destinations.ts");
const pos = new Map(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).map((p) => [p.id, p]));
const rad = Math.PI / 180;
const hav = (a, b, c, d) => { const x = Math.sin(((c - a) * rad) / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const km = (s) => { const m = /(\d+(?:\.\d+)?)\s*km/i.exec(s ?? ""); return m ? +m[1] : null; };
// every claim "A is X km from B", from A's list of nearby places and from B's list pointing back at A
const claims = new Map();
const add = (a, b, k) => { if (a === b || k == null) return; (claims.get(a) ?? claims.set(a, []).get(a)).push({ other: b, k }); };
for (const d of DESTINATIONS) for (const n of d.nearbyPlaces ?? []) if (n.id) { const k = km(n.distance); add(d.id, n.id, k); add(n.id, d.id, k); }
const res = {};
for (const [id, list] of claims) {
  const p = pos.get(id); if (!p?.coord) continue;
  const r = { n: 0, bad: 0, nT: 0, badT: 0, detail: [] };
  for (const c of list) {
    const q = pos.get(c.other); if (!q?.coord) continue;
    const s = hav(p.coord.lat, p.coord.lon, q.coord.lat, q.coord.lon);
    // a road distance is never much shorter than the straight line, and rarely more than ~4x it
    const off = s > c.k * 1.25 + 8 || (c.k >= 25 && s < c.k * 0.25);
    r.n++; if (off) r.bad++;
    if (q.trust === "hand" || q.trust === "confirmed") { r.nT++; if (off) { r.badT++; r.detail.push(`${c.other}: says ${c.k} km, map ${Math.round(s)} km`); } }
  }
  if (r.n) res[id] = r;
}
fs.writeFileSync(process.argv[3], JSON.stringify(res));
