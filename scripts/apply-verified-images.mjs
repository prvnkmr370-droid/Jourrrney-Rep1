#!/usr/bin/env node
/**
 * Applies photos that have ALREADY been visually verified (see
 * find-commons-images.mjs for how candidates are gathered) to destination
 * cards, and records each photo's credit so the in-app "Photo credits" screen
 * stays complete.
 *
 *   node scripts/apply-verified-images.mjs <verified.json> [<verified.json> ...]
 *
 * verified.json: [{ id, name, verified: [{ title, thumbUrl, pageUrl, licence, author }] }]
 *
 * For each card id it:
 *   - HEAD-checks every URL (must answer 200 with an image content type);
 *   - appends the new photos to the card's `gallery` (creating it from the
 *     card's heroImage when the card has none), skipping any file the card
 *     already has, capped at MAX_GALLERY photos;
 *   - merges the credits into scripts/data/photo-credits.json and regenerates
 *     src/data/photoCredits.ts from it.
 * It never touches hero/image fields, names or any other card data.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEST_FILE = join(ROOT, "src/data/destinations.ts");
const CREDITS_JSON = join(ROOT, "scripts/data/photo-credits.json");
const CREDITS_TS = join(ROOT, "src/data/photoCredits.ts");
const UA = "JourneyApp-ImageResearch/1.0 (https://github.com/prvnkmr370-droid/Jourrrney-Rep1)";
const MAX_GALLERY = 12;

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/apply-verified-images.mjs <verified.json> [...]");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fileKey(url) {
  try {
    const parts = new URL(url).pathname.split("/");
    const i = parts.indexOf("thumb");
    const raw = i >= 0 ? parts[i + 3] : parts[parts.length - 1];
    return decodeURIComponent(raw).replace(/_/g, " ").toLowerCase();
  } catch {
    return url;
  }
}

async function urlOk(url) {
  for (let attempt = 0; attempt < 7; attempt++) {
    try {
      const res = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA } });
      if (res.status === 429 || res.status >= 500) { await sleep(2500 * (attempt + 1)); continue; }
      return res.status === 200 && /^image\//.test(res.headers.get("content-type") ?? "");
    } catch {
      await sleep(800);
    }
  }
  return false;
}

// ---- gather verified entries
const entries = [];
for (const f of files) entries.push(...JSON.parse(readFileSync(f, "utf8")));

let src = readFileSync(DEST_FILE, "utf8");
const credits = existsSync(CREDITS_JSON) ? JSON.parse(readFileSync(CREDITS_JSON, "utf8")) : {};
const report = [];

for (const entry of entries) {
  const startMarker = `\n  {\n    id: "${entry.id}",\n`;
  const start = src.indexOf(startMarker);
  if (start < 0) { report.push(`${entry.id}: CARD NOT FOUND`); continue; }
  const nextCard = src.indexOf("\n  {\n    id: \"", start + startMarker.length);
  const end = nextCard < 0 ? src.length : nextCard;
  let block = src.slice(start, end);

  const heroMatch = block.match(/\n    heroImage: "([^"]+)",/);
  if (!heroMatch) { report.push(`${entry.id}: no heroImage, skipped`); continue; }
  const galleryRe = /\n    gallery: \[([^\]]*)\],/;
  const galleryMatch = block.match(galleryRe);
  const existing = galleryMatch ? [...galleryMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
  const base = existing.length > 0 ? existing : [heroMatch[1]];
  const have = new Set([...base, heroMatch[1]].map(fileKey));

  const added = [];
  for (const v of entry.verified ?? []) {
    if (!v.thumbUrl || have.has(fileKey(v.thumbUrl))) continue;
    if (base.length + added.length >= MAX_GALLERY) break;
    if (!(await urlOk(v.thumbUrl))) { report.push(`${entry.id}: dead URL dropped: ${v.title}`); continue; }
    have.add(fileKey(v.thumbUrl));
    added.push(v);
    await sleep(150);
  }

  const newGallery = [...base, ...added.map((a) => a.thumbUrl)];
  const rendered = `\n    gallery: [\n${newGallery.map((u) => `      "${u}",`).join("\n")}\n    ],`;
  block = galleryMatch
    ? block.replace(galleryRe, () => rendered)
    : block.replace(/(\n    heroImage: "[^"]+",)/, (m) => m + rendered);
  src = src.slice(0, start) + block + src.slice(end);

  if (added.length > 0) {
    const list = credits[entry.id] ?? [];
    const seen = new Set(list.map((c) => c.title));
    for (const a of added) {
      if (seen.has(a.title)) continue;
      list.push({
        title: a.title.replace(/^File:/, ""),
        author: (a.author || "Unknown author").slice(0, 100),
        licence: a.licence,
        pageUrl: a.pageUrl,
      });
    }
    credits[entry.id] = list;
  }
  report.push(`${entry.id}: gallery ${existing.length || 1} -> ${newGallery.length} (+${added.length})`);
}

writeFileSync(DEST_FILE, src);
writeFileSync(CREDITS_JSON, JSON.stringify(credits, null, 1) + "\n");

const ts = `/**
 * Credits for gallery photos added to destination cards beyond each card's
 * original hero image (those are credited by the card's own \`imageCredit\`).
 * GENERATED by scripts/apply-verified-images.mjs from
 * scripts/data/photo-credits.json — do not edit by hand.
 */
export interface PhotoCredit {
  /** Commons file name, without the "File:" prefix. */
  title: string;
  author: string;
  licence: string;
  /** The photo's page on its source site, where its licence is stated. */
  pageUrl: string;
}

export const GALLERY_CREDITS: Record<string, PhotoCredit[]> = ${JSON.stringify(credits, null, 2)};
`;
writeFileSync(CREDITS_TS, ts);

console.log(report.join("\n"));
