// Final position decision: keeps a position only if it is confirmed by independent sources (or by hand),
// or, for a single-source position, if distances written on neighbouring cards support it. Writes positions_final.json.
//   node final-positions.mjs <positions_v2.json> <consistency.json> <out.json>
import fs from "node:fs";
const pos = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const cons = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const tally = {};
const out = pos.map((p) => {
  const c = cons[p.id]; let trust = p.trust, coord = p.coord, why = p.why;
  if (coord && p.trust !== "hand") {
    if (p.trust === "confirmed") { if (c && c.n >= 2 && c.bad >= 2 && c.bad / c.n >= 0.6) { coord = null; trust = "neighbour-conflict"; why = c.detail.join("; "); } }
    else if (p.trust === "single") {
      if (c && c.nT >= 1 && c.badT === 0 && c.bad <= Math.floor(c.n / 3)) trust = "neighbour-confirmed"; else { coord = null; trust = "unconfirmed"; why = `${p.why} only; ${c ? `${c.nT} trusted neighbour(s), ${c.badT} disagree` : "no neighbours to check"}`; }
    }
  }
  tally[trust] = (tally[trust] ?? 0) + 1;
  return { ...p, coord, trust, why };
});
fs.writeFileSync(process.argv[4], JSON.stringify(out));
console.log(tally, "usable:", out.filter((p) => p.coord).length, "of", out.length);
