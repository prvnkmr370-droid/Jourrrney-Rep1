#!/usr/bin/env node
/**
 * Scaffolds a new destination "card" with the exact shape of every field
 * in `Destination` (src/data/destinations.ts) plus a matching
 * SAFETY_OVERRIDES skeleton (src/data/safetyOverrides.ts), so a new card
 * never has to be explained field-by-field again — this script IS the
 * spec, kept in sync with destinations.ts's own interface.
 *
 * This does NOT invent facts. Every field that needs a real, checkable
 * number or name (fares, hotel names, restaurant names, police stations,
 * hospitals, women-safety highlights) is left as a `TODO:` placeholder.
 * Filling those in is still a research pass — same standard as every
 * existing card (Agra, Jaipur, the 89-destination safety pass, etc.):
 * prefer an official government/tourism source, note it in a
 * `sourceNote`, and never fabricate a specific number or name.
 *
 * Usage:
 *   node scripts/scaffold-destination.mjs "Destination Name" "State"
 *   node scripts/scaffold-destination.mjs "Destination Name" "State" --append
 *
 * Default: prints the two TS blocks to stdout AND writes them to
 *   src/data/drafts/<id>.draft.ts
 * so nothing is silently merged into the real data files.
 *
 * --append: also inserts the destination block into destinations.ts
 *   (right before the closing `];`) and the safety block into
 *   safetyOverrides.ts (at the end of the file) automatically. Use this
 *   once the draft's TODOs are filled in for real — never append a
 *   draft still full of placeholders.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEST_FILE = path.join(ROOT, "src/data/destinations.ts");
const SAFETY_FILE = path.join(ROOT, "src/data/safetyOverrides.ts");
const DRAFTS_DIR = path.join(ROOT, "src/data/drafts");

const [, , nameArg, stateArg, ...flags] = process.argv;
const shouldAppend = flags.includes("--append");

if (!nameArg || !stateArg) {
  console.error('Usage: node scripts/scaffold-destination.mjs "Destination Name" "State" [--append]');
  process.exit(1);
}

const slugify = (s) =>
  s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const id = slugify(nameArg);
const name = nameArg.trim();
const state = stateArg.trim();

// Emits a quoted placeholder string (not a bare comment) so the draft
// stays syntactically valid TS — safe to eyeball, diff, or partially
// type-check before every TODO is replaced with real data.
const TODO = (label) => `"TODO: ${label.replace(/"/g, "'")}"`;

const destinationBlock = `  {
    id: "${id}",
    name: "${name}",
    state: "${state}",
    tagline: ${TODO("one short evocative line, e.g. Agra's \"Home of the Eternal Taj\"")},
    description: ${TODO("2-3 sentences — what makes this place worth visiting")},
    // Prefer an official state-tourism-site image (see Jaipur's entry for
    // the pattern) over a generic Unsplash search; note in a comment how
    // the photo was verified as genuinely of this place.
    image: ${TODO("lead photo URL, 600x400")},
    heroImage: ${TODO("hero photo URL, 900x600 — usually same image as \`image\`")},
    gallery: [
      ${TODO("3-6 real, place-specific photo URLs (landmark from a couple of angles + 2-3 named points of interest), 1200x900")}
    ],
    category: [${TODO('e.g. "Heritage", "UNESCO", "History" — pick from existing categories used elsewhere in this file')}],
    bestSeason: ${TODO('e.g. "October – March"')},
    duration: ${TODO('e.g. "2–3 days"')},
    highlights: [
      ${TODO('{ name: "..." } for each — add id: "<other-destination-id>" only if that place has its own real Destination entry')}
    ],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: ${TODO("real route/time")}, fromMumbai: ${TODO("real route/time")}, fromBangalore: ${TODO("real route/time")}, duration: ${TODO("range")}, costRange: ${TODO("real ₹ range")}, tips: ${TODO("real booking tip")} },
      { mode: "Road", icon: "🚗", fromDelhi: ${TODO("highway + time")}, fromMumbai: ${TODO("highway + time")}, fromBangalore: ${TODO("highway + time")}, duration: ${TODO("range")}, costRange: ${TODO("real ₹ range")}, tips: ${TODO("real tip, e.g. toll cost")} },
      { mode: "Flight", icon: "✈️", fromDelhi: ${TODO("nearest airport + connection")}, fromMumbai: ${TODO("...")}, fromBangalore: ${TODO("...")}, duration: ${TODO("range")}, costRange: ${TODO("real ₹ range or —")}, tips: ${TODO("real tip")} },
    ],
    accommodation: [
      { type: ${TODO('e.g. "Budget Guesthouses"')}, priceRange: ${TODO("real ₹ range")}, examples: [${TODO("real, named properties — verify they exist")}], description: ${TODO("one line")} },
      { type: ${TODO('e.g. "Mid-Range Hotels"')}, priceRange: ${TODO("real ₹ range")}, examples: [${TODO("real names")}], description: ${TODO("one line")} },
      { type: ${TODO('e.g. "Luxury Resorts"')}, priceRange: ${TODO("real ₹ range")}, examples: [${TODO("real names")}], description: ${TODO("one line")} },
    ],
    localTransport: [
      ${TODO('{ mode, cost, notes, available: true } rows for what actually operates here — auto, e-rickshaw, app cab, city bus, etc. Don’t list a mode that doesn’t exist locally.')}
    ],
    nearbyPlaces: [
      ${TODO('{ name, distance, type, isHidden } — set id: "<other-destination-id>" only when that place already has (or will have) its own Destination entry')}
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: ${TODO("₹")}, accommodation: ${TODO("₹")}, food: ${TODO("₹")}, transport: ${TODO("₹")}, activities: ${TODO("₹")} },
      { tier: "mid", label: "Comfortable", perDayPerPerson: ${TODO("₹")}, accommodation: ${TODO("₹")}, food: ${TODO("₹")}, transport: ${TODO("₹")}, activities: ${TODO("₹")} },
      { tier: "luxury", label: "Premium", perDayPerPerson: ${TODO("₹")}, accommodation: ${TODO("₹")}, food: ${TODO("₹")}, transport: ${TODO("₹")}, activities: ${TODO("₹")} },
    ],
    defaultItinerary: [
      { day: 1, title: ${TODO("...")}, morning: ${TODO("...")}, afternoon: ${TODO("...")}, evening: ${TODO("...")}, stay: ${TODO("...")}, meals: ${TODO("...")}, tips: ${TODO("...")} },
      ${TODO("repeat for each day matching \`duration\` above")}
    ],
    womenSafety: {
      score: ${TODO("0-10, honest")},
      level: ${TODO('"Very Safe" | "Safe" | "Moderate" | "Exercise Caution"')},
      highlights: [${TODO("real, specific positives")}],
      precautions: [${TODO("real, specific precautions")}],
      soloTips: [${TODO("real, specific tips")}],
      emergencyContacts: [${TODO('{ label: "Tourist Police <City>", number: "..." } etc — verify on the state police’s own site')}],
      safeZones: [${TODO("named areas")}],
      avoidAreas: [${TODO("named areas, factual not alarmist — see project note below")}],
    },
    rating: ${TODO("plausible, e.g. 4.5")},
    reviews: ${TODO("plausible count")},
    mustEat: [${TODO("real local dishes/named eateries")}],
    packingTips: [${TODO("real, climate/culture-specific tips")}],
  },`;

const safetyBlock = `SAFETY_OVERRIDES["${id}"] = {
  // Only add a category here if you have a REAL, sourced fact for it —
  // every other one of the 18 categories falls back to sensible
  // class-based defaults automatically (see safetyDetails.ts's
  // classify()). Prime categories worth prioritizing: safetyLevel,
  // toilets, womenFriendly, medical, police, accessibility.
  police: {
    summary: ${TODO("short line, e.g. named station + phone")},
    details: [
      ${TODO("full station name, address, phone — confirmed on the state police’s own site where possible")},
      ${TODO('"Police: 100 · <State> Police Helpline: <112 or state number>"')},
    ],
    sourceNote: ${TODO("state what was verified and how, e.g. ‘Confirmed directly on <state>police.gov.in’ vs ‘confirmed via a mapped listing’")},
  },
  medical: {
    summary: ${TODO("1-2 named hospitals")},
    details: [
      ${TODO("real hospital name, area, phone — aim for 2+ unless genuinely remote, and say so explicitly if only 1 exists")},
      ${TODO('"Ambulance: 108"')},
    ],
    sourceNote: ${TODO("same honesty standard as above")},
  },
};`;

const draftContent = `// DRAFT — generated by scripts/scaffold-destination.mjs, not yet real data.
// Fill in every /* TODO: ... */ with researched, sourced facts, then either
// paste the two blocks into destinations.ts / safetyOverrides.ts by hand,
// or re-run this script with --append once nothing but real data remains.

// ---------- destinations.ts entry ----------
${destinationBlock}

// ---------- safetyOverrides.ts entry ----------
${safetyBlock}
`;

fs.mkdirSync(DRAFTS_DIR, { recursive: true });
const draftPath = path.join(DRAFTS_DIR, `${id}.draft.ts`);
fs.writeFileSync(draftPath, draftContent, "utf8");
console.log(draftContent);
console.log(`\n✅ Draft written to ${path.relative(ROOT, draftPath)}`);

if (shouldAppend) {
  let destSrc = fs.readFileSync(DEST_FILE, "utf8");
  const closeIdx = destSrc.lastIndexOf("\n];");
  if (closeIdx === -1) {
    console.error("Could not find the closing `];` of DESTINATIONS in destinations.ts — append aborted.");
    process.exit(1);
  }
  destSrc = destSrc.slice(0, closeIdx) + "\n" + destinationBlock + "\n" + destSrc.slice(closeIdx);
  fs.writeFileSync(DEST_FILE, destSrc, "utf8");

  fs.appendFileSync(SAFETY_FILE, `\n${safetyBlock}\n`, "utf8");

  console.log(`\n✅ Appended "${name}" into destinations.ts and safetyOverrides.ts.`);
  console.log("   ⚠️  It's still full of TODO placeholders — fill in real data before committing.");
  console.log("   Run `npx tsc --noEmit` after editing to check the shape is valid.");
}
