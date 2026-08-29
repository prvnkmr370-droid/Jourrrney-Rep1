#!/usr/bin/env node
/**
 * Discovery-only, per the explicit call made on 2026-08-30: this script
 * does NOT fabricate fares, hotel names, or safety facts. It only answers
 * "which places in this state are prominent enough to be worth a card?" —
 * using Wikipedia's own curated tourist-attraction categories as the
 * source of "prominence" (editorially maintained, not a scrape of raw
 * search results), plus each page's own short extract as a blurb.
 *
 * Every real fact still needs the same verify-against-an-official-source
 * pass every existing card (Agra, the 89-destination safety pass, etc.)
 * has had — this script exists to stop wasting that effort re-deciding
 * *which* places to cover, not to skip the research itself.
 *
 * Usage:
 *   node scripts/discover-destinations.mjs "Karnataka"
 *   node scripts/discover-destinations.mjs "Karnataka" --scaffold-top 5
 *
 * Output: prints a ranked candidate list (already-covered destinations
 * marked so you don't duplicate) and writes it to
 *   src/data/drafts/discovered/<state>.json
 *
 * --scaffold-top N: also runs scaffold-destination.mjs for the top N
 * NOT-yet-covered candidates, dropping a TODO-filled draft for each —
 * still no invented facts, just saves the "add a new card" step.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEST_FILE = path.join(ROOT, "src/data/destinations.ts");
const OUT_DIR = path.join(ROOT, "src/data/drafts/discovered");

const [, , stateArg, ...flags] = process.argv;
if (!stateArg) {
  console.error('Usage: node scripts/discover-destinations.mjs "State" [--scaffold-top N]');
  process.exit(1);
}
const state = stateArg.trim();
const scaffoldIdx = flags.indexOf("--scaffold-top");
const scaffoldTop = scaffoldIdx !== -1 ? parseInt(flags[scaffoldIdx + 1], 10) : 0;

const API = "https://en.wikipedia.org/w/api.php";

async function apiGet(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": "journey-app-destination-discovery/1.0" } });
  if (!res.ok) throw new Error(`Wikipedia API ${res.status} for ${url}`);
  return res.json();
}

/** Pull every member of a category, following `continue` cursors. */
async function categoryMembers(category) {
  let members = [];
  let cmcontinue;
  do {
    const data = await apiGet({
      action: "query",
      list: "categorymembers",
      cmtitle: `Category:${category}`,
      cmlimit: "100",
      cmtype: "page",
      ...(cmcontinue ? { cmcontinue } : {}),
    });
    members = members.concat(data.query?.categorymembers ?? []);
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue);
  return members;
}

/** Short plain-text intro for a batch of page titles (up to 20 at a time, the API's cap). */
async function extracts(titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 20) {
    const batch = titles.slice(i, i + 20);
    const data = await apiGet({
      action: "query",
      prop: "extracts",
      exintro: "1",
      explaintext: "1",
      exsentences: "2",
      titles: batch.join("|"),
    });
    for (const page of Object.values(data.query?.pages ?? {})) {
      if (page.title) out[page.title] = (page.extract || "").trim();
    }
  }
  return out;
}

function existingDestinationNames() {
  const src = fs.readFileSync(DEST_FILE, "utf8");
  const names = new Set();
  const re = /\bname:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1].toLowerCase());
  return names;
}

function normalizedMatch(title, existing) {
  const t = title.toLowerCase();
  for (const n of existing) {
    if (t === n || t.includes(n) || n.includes(t)) return true;
  }
  return false;
}

async function main() {
  console.log(`Fetching Wikipedia's "Tourist attractions in ${state}" category…`);
  let members = await categoryMembers(`Tourist attractions in ${state}`);

  if (members.length === 0) {
    console.log(`No "Tourist attractions in ${state}" category — falling back to "Tourism in ${state}" and "Cities and towns in ${state}".`);
    const [a, b] = await Promise.all([
      categoryMembers(`Tourism in ${state}`),
      categoryMembers(`Cities and towns in ${state}`),
    ]);
    members = [...a, ...b];
  }

  if (members.length === 0) {
    console.error(`No Wikipedia category data found for "${state}". Check the spelling matches Wikipedia's own state name (e.g. "Tamil Nadu", "Uttar Pradesh").`);
    process.exit(1);
  }

  // De-dupe by title.
  const byTitle = new Map(members.map((m) => [m.title, m]));
  const titles = [...byTitle.keys()];

  console.log(`Found ${titles.length} candidate pages. Fetching short descriptions…`);
  const blurbs = await extracts(titles);

  const existing = existingDestinationNames();

  const candidates = titles
    .map((title) => ({
      title,
      blurb: blurbs[title] || "",
      alreadyInApp: normalizedMatch(title, existing),
      wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
    }))
    // Drop obvious non-places (disambiguation-ish, list pages) heuristically.
    .filter((c) => !/^list of /i.test(c.title))
    .sort((a, b) => a.title.localeCompare(b.title));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${state.toLowerCase().replace(/\s+/g, "-")}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ state, generatedAt: new Date().toISOString(), candidates }, null, 2));

  const fresh = candidates.filter((c) => !c.alreadyInApp);
  const covered = candidates.filter((c) => c.alreadyInApp);

  console.log(`\n=== ${state}: ${candidates.length} candidates (${covered.length} likely already in the app, ${fresh.length} new) ===\n`);
  for (const c of fresh) {
    console.log(`• ${c.title}`);
    if (c.blurb) console.log(`  ${c.blurb.split("\n")[0].slice(0, 160)}`);
    console.log(`  ${c.wikipediaUrl}`);
  }
  if (covered.length) {
    console.log(`\n(already appear to be in destinations.ts, skipped: ${covered.map((c) => c.title).join(", ")})`);
  }
  console.log(`\nFull list saved to ${path.relative(ROOT, outPath)}`);
  console.log(`\nThis is a discovery list, not verified content — each name still needs a real research pass (fares, hotels, safety facts, official sources) before it becomes a card, same as every existing destination.`);

  if (scaffoldTop > 0) {
    const toScaffold = fresh.slice(0, scaffoldTop);
    console.log(`\nScaffolding drafts for the top ${toScaffold.length}…`);
    for (const c of toScaffold) {
      execFileSync("node", [path.join(__dirname, "scaffold-destination.mjs"), c.title, state], { stdio: "inherit" });
    }
  }
}

main().catch((err) => {
  console.error("Discovery failed:", err.message);
  process.exit(1);
});
