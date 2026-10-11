#!/usr/bin/env node
/**
 * Gathers CANDIDATE photos for destination cards from Wikimedia Commons, with
 * the licence, author and verification signals needed to check each one.
 * It does not pick final images and it does not edit any data file: a person
 * (or an agent that actually looks at the photo) must confirm every image
 * shows the destination before it goes onto a card.
 *
 *   node scripts/find-commons-images.mjs <cards.json> <out.json>
 *
 * cards.json: [{ id, name, aliases?: string[], state?: string, coords?: [lat, lon],
 *                existing?: string[] /* URLs already on the card *\/,
 *                queries?: string[]        /* explicit text searches (override the default name + state) *\/,
 *                categoryQueries?: string[] /* explicit category searches *\/,
 *                categoryAny?: string[]    /* a category title must contain one of these tokens *\/ }]
 *
 * Use queries/categoryQueries/categoryAny for places whose name is shared with
 * somewhere else ("Long Island", "Ross Island", "Campbell Bay"): without them
 * the search happily returns the Bahamas, Antarctica or Australia.
 *
 * Only freely reusable licences pass: CC0, public domain, CC BY, CC BY-SA
 * (any version). NC/ND and unknown licences are dropped.
 *
 * Per card it combines three searches, because each misses things alone:
 *   1. files in a Commons category whose name matches the place (+ 1 level of
 *      subcategories) — the strongest signal, curated by Commons editors;
 *   2. files geotagged near the card's coordinates;
 *   3. a text search on the place name (+ state).
 * and reports for each candidate: catMatch (a category contains the place's
 * name), geoKm (distance from the card's coordinates, if the file is
 * geotagged) and nameMatch (name in title/description).
 */
import { readFileSync, writeFileSync } from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "JourneyApp-ImageResearch/1.0 (https://github.com/prvnkmr370-droid/Jourrrney-Rep1)";
const THUMB_WIDTH = 1280;
const MIN_WIDTH = 1000;
const MAX_PER_CARD = 16;
// A geotagged file farther than this from the card's coordinates is not that place.
const MAX_GEO_KM = 150;

const [, , cardsPath, outPath] = process.argv;
if (!cardsPath || !outPath) {
  console.error("usage: node scripts/find-commons-images.mjs <cards.json> <out.json>");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params, attempt = 0) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt < 4) {
      await sleep(1500 * (attempt + 1));
      return api(params, attempt + 1);
    }
    console.error("api failed:", err.message, url.slice(0, 140));
    return {};
  }
}

const stripHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** "File:Foo_bar.jpg" from a upload.wikimedia.org URL (thumb or original). */
function titleFromUrl(url) {
  try {
    const parts = new URL(url).pathname.split("/");
    const i = parts.indexOf("thumb");
    const raw = i >= 0 ? parts[i + 3] : parts[parts.length - 1];
    return "File:" + decodeURIComponent(raw).replace(/_/g, " ");
  } catch {
    return null;
  }
}

function haversineKm(a, b) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]), dLon = toRad(b[1] - a[1]);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const LICENCE_OK = /^(cc[- ]by(?!.*(nc|nd))|cc[- ]by[- ]sa(?!.*(nc|nd))|cc0|public domain|pd[- ]|attribution)/i;
const LICENCE_BAD = /(nc|nd|non[- ]?commercial|no[- ]?deriv|gfdl only|fair use)/i;
const TITLE_SKIP = /(\bmap\b|locator|location map|flag|coat of arms|logo|diagram|chart|poster|stamp|signature|\.svg$|\.pdf$|\.tif$|\.gif$|screenshot|banner)/i;

async function imageInfo(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 20) {
    const batch = titles.slice(i, i + 20);
    const data = await api({
      action: "query",
      titles: batch.join("|"),
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: String(THUMB_WIDTH),
      iiextmetadatafilter: "LicenseShortName|Artist|ImageDescription|Categories|GPSLatitude|GPSLongitude|UsageTerms",
    });
    for (const page of data?.query?.pages ?? []) {
      const ii = page.imageinfo?.[0];
      if (ii) out.push({ title: page.title, ii });
    }
    await sleep(250);
  }
  return out;
}

async function categoryFiles(name, any = []) {
  const found = new Set();
  const data = await api({ action: "query", list: "search", srsearch: name, srnamespace: "14", srlimit: "8" });
  const target = norm(name);
  const anyTokens = any.map(norm).filter(Boolean);
  const cats = (data?.query?.search ?? [])
    .map((r) => r.title)
    .filter((t) => {
      const n = norm(t.replace(/^Category:/, ""));
      if (anyTokens.length > 0) return anyTokens.some((tok) => n.includes(tok));
      return n === target || n.startsWith(target + " ") || n.endsWith(" " + target) || n.includes(target);
    })
    .slice(0, 3);
  for (const cat of cats) {
    const files = await api({ action: "query", list: "categorymembers", cmtitle: cat, cmtype: "file", cmlimit: "60" });
    for (const f of files?.query?.categorymembers ?? []) found.add(f.title);
    const subs = await api({ action: "query", list: "categorymembers", cmtitle: cat, cmtype: "subcat", cmlimit: "8" });
    for (const sc of (subs?.query?.categorymembers ?? []).slice(0, 4)) {
      const sf = await api({ action: "query", list: "categorymembers", cmtitle: sc.title, cmtype: "file", cmlimit: "25" });
      for (const f of sf?.query?.categorymembers ?? []) found.add(f.title);
    }
    await sleep(200);
  }
  return [...found];
}

async function geoFiles(coords, radiusM) {
  const data = await api({
    action: "query", list: "geosearch", gscoord: `${coords[0]}|${coords[1]}`,
    gsradius: String(Math.min(radiusM, 10000)), gsnamespace: "6", gslimit: "60",
  });
  return (data?.query?.geosearch ?? []).map((g) => g.title);
}

async function textFiles(q) {
  const data = await api({ action: "query", list: "search", srsearch: q, srnamespace: "6", srlimit: "40" });
  return (data?.query?.search ?? []).map((r) => r.title);
}

const cards = JSON.parse(readFileSync(cardsPath, "utf8"));
const results = [];

for (const card of cards) {
  const baseName = card.name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const names = [...new Set([baseName, ...(card.aliases ?? []).map((a) => a.replace(/\s*\([^)]*\)\s*/g, " ").trim())])].filter(Boolean).slice(0, 3);
  const existing = new Set((card.existing ?? []).map(titleFromUrl).filter(Boolean));
  const isWide = /island|andaman|nicobar|sanctuary|national park|lake|valley|range/i.test(card.name);
  const radiusM = isWide ? 10000 : 3000;

  process.stderr.write(`• ${card.id} ...`);
  const titles = new Set();
  const fromCat = new Set();
  const catQueries = card.categoryQueries ?? names;
  for (const n of catQueries) for (const t of await categoryFiles(n, card.categoryAny ?? [])) { titles.add(t); fromCat.add(t); }
  if (card.coords) for (const t of await geoFiles(card.coords, radiusM)) titles.add(t);
  const textQueries = card.queries ?? names.slice(0, 2).map((n) => `${n} ${card.state ?? ""}`.trim());
  for (const q of textQueries) for (const t of await textFiles(q)) titles.add(t);

  const fresh = [...titles].filter((t) => !existing.has(t) && !TITLE_SKIP.test(t));
  const infos = await imageInfo(fresh);

  const nameTokens = [...names, ...(card.nameHints ?? [])].map(norm).filter(Boolean);
  const candidates = [];
  for (const { title, ii } of infos) {
    const md = ii.extmetadata ?? {};
    const licence = stripHtml(md.LicenseShortName?.value);
    if (!licence || LICENCE_BAD.test(licence) || !LICENCE_OK.test(licence)) continue;
    if (!/^image\/(jpeg|png|webp)$/.test(ii.mime ?? "")) continue;
    if ((ii.width ?? 0) < MIN_WIDTH) continue;
    const ratio = ii.width / ii.height;
    if (ratio < 0.6 || ratio > 2.6) continue;

    const cats = stripHtml(md.Categories?.value).split("|").map((c) => c.trim()).filter(Boolean);
    const catText = norm(cats.join(" | "));
    const desc = stripHtml(md.ImageDescription?.value);
    const hay = norm(`${title} ${desc}`);
    const catMatch = nameTokens.some((n) => catText.includes(n));
    const nameMatch = nameTokens.some((n) => hay.includes(n));
    let geoKm = null;
    const lat = parseFloat(md.GPSLatitude?.value), lon = parseFloat(md.GPSLongitude?.value);
    if (card.coords && Number.isFinite(lat) && Number.isFinite(lon)) geoKm = +haversineKm(card.coords, [lat, lon]).toFixed(1);

    // Hard geographic guard: a geotagged file outside India, or far from this
    // destination, is a different place with the same name (Long Island in the
    // Bahamas, Ross Island in Antarctica...) — drop it before anyone sees it.
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const inIndia = lat >= 6 && lat <= 37.5 && lon >= 68 && lon <= 98.5;
      if (!inIndia) continue;
      if (geoKm !== null && geoKm > MAX_GEO_KM) continue;
    }
    const near = geoKm !== null && geoKm <= (isWide ? 25 : 6);
    if (!(catMatch || nameMatch || near || fromCat.has(title))) continue;

    candidates.push({
      title,
      pageUrl: ii.descriptionurl,
      thumbUrl: ii.thumburl,
      width: ii.width, height: ii.height,
      licence,
      author: stripHtml(md.Artist?.value).slice(0, 120),
      description: desc.slice(0, 200),
      categories: cats.slice(0, 6),
      signals: { catMatch, nameMatch, geoKm, inPlaceCategory: fromCat.has(title) },
    });
  }

  const score = (c) => (c.signals.inPlaceCategory ? 4 : 0) + (c.signals.catMatch ? 3 : 0) + (c.signals.geoKm !== null && c.signals.geoKm <= 3 ? 2 : 0) + (c.signals.nameMatch ? 1 : 0);
  candidates.sort((a, b) => score(b) - score(a) || b.width * b.height - a.width * a.height);
  results.push({ id: card.id, name: card.name, state: card.state, existingCount: existing.size, candidateCount: candidates.length, candidates: candidates.slice(0, MAX_PER_CARD) });
  process.stderr.write(` ${candidates.length} candidates\n`);
}

writeFileSync(outPath, JSON.stringify(results, null, 1));
console.error(`wrote ${outPath}`);
