#!/usr/bin/env node
/**
 * Third-pass helper: finds each card's Wikidata item and its Commons category
 * (P373 / commonswiki sitelink), which earlier name-based searches could miss
 * because many files sit in a place's category under generic file names.
 *
 *   node scripts/image-campaign/harvest-wikidata.mjs <cards.json> <out.json>
 *
 * cards.json: [{ id, name, aliases?, state, coords?: [lat, lon], cardText? }]
 * out.json:   [{ id, name, state, entity?: { qid, label, description, coords, category, why } , reason? }]
 *
 * An item is accepted only when it is in India (P17 = Q668 or India-bbox
 * coordinates) AND is tied to the card's place: within 120 km of the card's
 * coordinates when both have them, otherwise the state name appears in the
 * item's description / located-in labels. Ambiguity is dropped, not guessed.
 */
import { readFileSync, writeFileSync } from "node:fs";

const WD = "https://www.wikidata.org/w/api.php";
const UA = "JourneyApp-ImageResearch/1.0 (https://github.com/prvnkmr370-droid/Jourrrney-Rep1)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params, attempt = 0) {
  const url = `${WD}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (attempt < 4) { await sleep(1500 * (attempt + 1)); return api(params, attempt + 1); }
    return {};
  }
}

async function commons(params, attempt = 0) {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (attempt < 4) { await sleep(1500 * (attempt + 1)); return commons(params, attempt + 1); }
    return {};
  }
}

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const STATE_SYN = {
  odisha: ["odisha", "orissa"], uttarakhand: ["uttarakhand", "uttaranchal"], puducherry: ["puducherry", "pondicherry"],
  "jammu and kashmir": ["jammu and kashmir", "kashmir", "jammu"], "tamil nadu": ["tamil nadu"], "andaman and nicobar islands": ["andaman", "nicobar"],
  "dadra and nagar haveli": ["dadra", "nagar haveli", "daman", "diu"], "daman and diu": ["daman", "diu"], delhi: ["delhi"],
};
function stateWords(state) {
  const s = norm(state.replace(/\(.*?\)/g, " "));
  return STATE_SYN[s] ?? [s];
}
function haversineKm(a, b) {
  const R = 6371, t = (d) => (d * Math.PI) / 180;
  const x = Math.sin(t(b[0] - a[0]) / 2) ** 2 + Math.cos(t(a[0])) * Math.cos(t(b[0])) * Math.sin(t(b[1] - a[1]) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
const inIndia = (c) => c && c[0] >= 6 && c[0] <= 37.5 && c[1] >= 68 && c[1] <= 98.5;

const cards = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out = [];

for (const card of cards) {
  const base = card.name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const terms = [...new Set([base, ...(card.aliases ?? []).map((a) => a.replace(/\s*\([^)]*\)\s*/g, " ").trim())])].filter(Boolean).slice(0, 3);
  const hits = new Map();
  for (const t of terms) {
    const r = await api({ action: "wbsearchentities", search: t, language: "en", type: "item", limit: "8" });
    for (const h of r.search ?? []) if (!hits.has(h.id)) hits.set(h.id, { label: h.label ?? "", description: h.description ?? "", term: t });
    await sleep(120);
  }
  if (hits.size === 0) { out.push({ id: card.id, name: card.name, state: card.state, reason: "no wikidata hit" }); continue; }

  const ents = await api({ action: "wbgetentities", ids: [...hits.keys()].join("|"), props: "claims|sitelinks|labels|descriptions", languages: "en" });
  const parents = new Set();
  const info = [];
  for (const [qid, e] of Object.entries(ents.entities ?? {})) {
    const cl = e.claims ?? {};
    const val = (p) => (cl[p] ?? []).map((c) => c.mainsnak?.datavalue?.value).filter(Boolean);
    const countries = val("P17").map((v) => v.id);
    const c = val("P625")[0];
    const coords = c ? [c.latitude, c.longitude] : null;
    const cat = val("P373")[0] ?? (e.sitelinks?.commonswiki?.title?.startsWith("Category:") ? e.sitelinks.commonswiki.title.slice(9) : null);
    const loc = val("P131").map((v) => v.id);
    loc.forEach((p) => parents.add(p));
    info.push({ qid, label: e.labels?.en?.value ?? hits.get(qid)?.label ?? "", description: e.descriptions?.en?.value ?? hits.get(qid)?.description ?? "", countries, coords, cat, loc });
  }
  const plabel = {};
  if (parents.size) {
    const pr = await api({ action: "wbgetentities", ids: [...parents].slice(0, 50).join("|"), props: "labels", languages: "en" });
    for (const [q, e] of Object.entries(pr.entities ?? {})) plabel[q] = e.labels?.en?.value ?? "";
  }

  const want = stateWords(card.state);
  const baseN = norm(base);
  let best = null;
  for (const it of info) {
    const india = it.countries.includes("Q668") || inIndia(it.coords);
    if (!india) continue;
    const text = norm(`${it.description} ${it.loc.map((q) => plabel[q] ?? "").join(" ")}`);
    const stateOk = want.some((w) => text.includes(w));
    let why = null;
    if (card.coords && it.coords) {
      const km = haversineKm(card.coords, it.coords);
      if (km <= 120) why = `coords ${km.toFixed(0)} km`;
    }
    if (!why && stateOk) why = "state in description/location";
    if (!why) continue;
    const lab = norm(it.label);
    const score = (lab === baseN ? 4 : lab.startsWith(baseN) || baseN.startsWith(lab) ? 2 : 0) + (it.coords ? 1 : 0) + (stateOk ? 1 : 0);
    if (!best || score > best.score) best = { ...it, why, score };
  }
  if (!best) { out.push({ id: card.id, name: card.name, state: card.state, reason: `no India/${card.state} item (${[...hits.values()].map((h) => h.label).slice(0, 3).join(" / ")})` }); continue; }
  if (!best.cat) {
    // item is the right place but is not linked to a Commons category: try one named after it
    for (const guess of [...new Set([best.label, base])]) {
      const q = await commons({ action: "query", titles: `Category:${guess}`, prop: "categoryinfo" });
      const pg = (q.query?.pages ?? [])[0];
      if (pg && !pg.missing && (pg.categoryinfo?.files ?? 0) + (pg.categoryinfo?.subcats ?? 0) > 0) { best.cat = guess; best.why += " + category by name"; break; }
      await sleep(100);
    }
  }
  if (!best.cat) { out.push({ id: card.id, name: card.name, state: card.state, reason: `item ${best.qid} (${best.label}) has no Commons category` }); continue; }
  out.push({ id: card.id, name: card.name, state: card.state, entity: { qid: best.qid, label: best.label, description: best.description, coords: best.coords, category: best.cat, why: best.why } });
}

writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
const ok = out.filter((o) => o.entity).length;
console.error(`${ok}/${out.length} cards matched a Wikidata item with a Commons category -> ${process.argv[3]}`);
