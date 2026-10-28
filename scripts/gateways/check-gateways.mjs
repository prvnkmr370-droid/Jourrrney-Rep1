/**
 * Checks src/data/gateways.ts for mistakes a person could easily make when adding a place:
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/gateways/check-gateways.mjs
 *
 * It does NOT prove an entry is true (only a person checking the sources can do
 * that); it catches the slips: an unknown place id, a malformed airport or station
 * code, distances that aren't nearest-first, drive times that are impossible, a
 * bus website that isn't https, and so on. Exits with an error if anything is wrong.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
// An optional file path lets the checker be tested on a deliberately broken file.
const { GATEWAYS } = await import(path.resolve(process.argv[2] ?? path.join(root, "src", "data", "gateways.ts")));

const destSrc = fs.readFileSync(path.join(root, "src", "data", "destinations.ts"), "utf8");
const knownIds = new Set([...destSrc.matchAll(/\n    id: "([a-z0-9_-]+)"/g)].map((m) => m[1]));

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

const isNum = (n) => typeof n === "number" && Number.isFinite(n);
const nonEmpty = (s) => typeof s === "string" && s.trim().length > 0 && !/TODO|FIXME|xxx|\.\.\.|…/.test(s);

function checkHub(id, kind, hub, i) {
  const at = `${kind}[${i}] ${hub.name ?? "?"}`;
  if (!nonEmpty(hub.name)) err(id, `${at}: missing name`);
  if (hub.area !== undefined && !nonEmpty(hub.area)) err(id, `${at}: empty area`);
  if (!isNum(hub.km) || hub.km <= 0 || hub.km > 1500) err(id, `${at}: km must be a number between 1 and 1500 (got ${hub.km})`);
  if (!isNum(hub.minutes) || hub.minutes <= 0) err(id, `${at}: minutes must be a positive number (got ${hub.minutes})`);
  if (isNum(hub.km) && isNum(hub.minutes) && hub.minutes > 0) {
    const kmh = hub.km / (hub.minutes / 60);
    if (hub.km >= 5 && kmh > 85) err(id, `${at}: ${hub.km} km in ${hub.minutes} min is ${Math.round(kmh)} km/h, too fast for Indian roads`);
    if (hub.km >= 5 && kmh < 12) warn(id, `${at}: ${hub.km} km in ${hub.minutes} min is only ${Math.round(kmh)} km/h, please double-check`);
  }
  if (hub.note !== undefined && !nonEmpty(hub.note)) err(id, `${at}: empty note`);
}

function nearestFirst(id, kind, list) {
  for (let i = 1; i < list.length; i++) if (list[i].km < list[i - 1].km) err(id, `${kind} must be listed nearest first (${list[i].name} is closer than ${list[i - 1].name})`);
}

let hubs = 0;
for (const [id, g] of Object.entries(GATEWAYS)) {
  if (!knownIds.has(id)) err(id, "no destination with this id in destinations.ts");
  if (!/^[A-Z][a-z]{2} 20\d\d$/.test(g.checked ?? "")) err(id, `checked must look like "Oct 2026" (got ${JSON.stringify(g.checked)})`);
  if (!Array.isArray(g.air) || !Array.isArray(g.rail) || !Array.isArray(g.bus)) { err(id, "air, rail and bus must all be arrays (use [] when empty)"); continue; }
  if (g.air.length + g.rail.length + g.bus.length === 0) err(id, "has no airport, station or bus station at all: remove the entry instead");

  g.air.forEach((a, i) => {
    hubs++; checkHub(id, "air", a, i);
    if (!/^[A-Z]{3}$/.test(a.code ?? "")) err(id, `air[${i}] ${a.name}: code must be a 3-letter IATA code (got ${JSON.stringify(a.code)})`);
    if (!["few", "more", "most"].includes(a.service)) err(id, `air[${i}] ${a.name}: service must be few, more or most`);
  });
  nearestFirst(id, "air", g.air);
  if (new Set(g.air.map((a) => a.code)).size !== g.air.length) err(id, "the same airport is listed twice");
  if (g.air.length > 4) err(id, "more than 4 airports");

  g.rail.forEach((s, i) => {
    hubs++; checkHub(id, "rail", s, i);
    if (!/^[A-Z]{2,5}$/.test(s.code ?? "")) err(id, `rail[${i}] ${s.name}: code must be 2 to 5 capital letters (got ${JSON.stringify(s.code)})`);
  });
  nearestFirst(id, "rail", g.rail);
  if (new Set(g.rail.map((s) => s.code)).size !== g.rail.length) err(id, "the same station is listed twice");
  if (g.rail.length > 3) err(id, "more than 3 stations");
  if (g.railNone !== undefined) {
    if (!nonEmpty(g.railNone)) err(id, "railNone is empty");
    if (g.rail.length === 0) err(id, "railNone is set but rail[] has no nearest railhead");
    else if (g.rail[0].km < 40) warn(id, `railNone is set but the nearest railhead is only ${g.rail[0].km} km away`);
  } else if (g.rail[0] && g.rail[0].km > 120) warn(id, `nearest station is ${g.rail[0].km} km away: should this have railNone?`);

  g.bus.forEach((b, i) => {
    hubs++; checkHub(id, "bus", b, i);
    if (!["government", "private", "both"].includes(b.operator)) err(id, `bus[${i}] ${b.name}: operator must be government, private or both`);
    if (b.bookingUrl !== undefined && !/^https:\/\/[^\s]+$/.test(b.bookingUrl)) err(id, `bus[${i}] ${b.name}: bookingUrl must be an https address`);
    if (b.goesTo) {
      if (b.goesTo.length > 5) err(id, `bus[${i}] ${b.name}: more than 5 places in goesTo`);
      for (const r of b.goesTo) if (!nonEmpty(r.place)) err(id, `bus[${i}] ${b.name}: a goesTo entry has no place`);
    }
  });
  nearestFirst(id, "bus", g.bus);
  if (g.bus.length === 0 && g.busTown) {
    if (!nonEmpty(g.busTown.name) || !isNum(g.busTown.km) || !isNum(g.busTown.minutes)) err(id, "busTown needs a name, km and minutes");
  }
  if (g.bus.length > 0 && g.busTown) warn(id, "busTown is only used when bus[] is empty");
  for (const [k, v] of Object.entries(g.fromHub ?? {})) if (!nonEmpty(v)) err(id, `fromHub.${k} is empty`);
}

console.log(`${Object.keys(GATEWAYS).length} places, ${hubs} hubs checked.`);
for (const w of warnings) console.log("  warning:", w);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log("All good.");
