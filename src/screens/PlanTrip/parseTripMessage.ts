/**
 * Turns a free-text chat message ("I want to go to Mysore for 5 days",
 * "Help me plan a trip to Bali") into whatever structured trip info can be
 * pulled out of it — a destination match (reusing the same fuzzy/prefix
 * matcher that powers Home and Search, so "araku vally" still resolves the
 * same way here), a day count, and a rough scan for stated interests.
 * Deliberately simple regex/keyword parsing rather than another AI round-
 * trip — good enough for these patterns, and instant (no network wait)
 * for what's meant to feel like a live conversation.
 */
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { findLiveMatches, resolveUnambiguousMatch } from "@/data/matchDestination";
import { PREFERENCES } from "./data";

// Phrases people commonly lead with that aren't part of the destination
// name itself — stripped before matching so "help me plan a trip to
// mysore" still finds Mysuru the same way typing "mysore" alone would.
const LEAD_IN_PHRASES = [
  "help me plan a trip to",
  "i want to go to",
  "i want to plan a trip to",
  "i'd like to go to",
  "plan a trip to",
  "plan my trip to",
  "planning a trip to",
  "trip to",
  "travel to",
  "going to",
  "visit",
];

function stripLeadIn(text: string): string {
  let out = text.toLowerCase().trim();
  for (const phrase of LEAD_IN_PHRASES) {
    if (out.startsWith(phrase)) {
      out = out.slice(phrase.length).trim();
      break;
    }
  }
  return out;
}

// Also strip a trailing day-count clause ("... for 5 days", "... 5 days")
// before destination-matching, so "mysore for 5 days" matches on "mysore"
// alone rather than the whole uncut phrase.
function stripDayClause(text: string): string {
  return text.replace(/\bfor\s+\d+\s*-?\s*days?\b/i, "").replace(/\b\d+\s*-?\s*days?\b/i, "").trim();
}

export interface ParsedTripMessage {
  /** Set only when the message unambiguously resolved to one destination. */
  destination: Destination | null;
  /** A handful of candidates when the message named a place but more than
   * one destination plausibly matches — caller shows these as quick-reply
   * chips rather than guessing. Empty whenever `destination` is set. */
  candidates: Destination[];
  /** True when the message seems to be naming a real place (has enough
   * letters to be an attempt at one) but nothing in the database matched
   * it at all — the signal for "we're India-focused for now" rather than
   * silently doing nothing. */
  unmatchedPlaceAttempt: boolean;
  days: number | null;
  /** PREFERENCES ids opportunistically found by keyword in the message. */
  interests: string[];
}

const DAY_PATTERNS = [
  /\bfor\s+(\d{1,2})\s*-?\s*days?\b/i,
  /\b(\d{1,2})\s*-?\s*days?\b/i,
  /\b(\d{1,2})\s*-?\s*d\b/i, // "5d"
];

export function extractDays(text: string): number | null {
  for (const re of DAY_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 30) return n;
    }
  }
  return null;
}

const INTEREST_KEYWORDS: Record<string, string[]> = {
  heritage: ["heritage", "history", "historical", "temple", "fort", "monument"],
  nature: ["nature", "outdoor", "hill", "mountain", "forest", "wildlife"],
  food: ["food", "cuisine", "eat", "foodie"],
  adventure: ["adventure", "trek", "trekking", "hike", "hiking", "sport"],
  wellness: ["wellness", "spa", "relax", "ayurveda", "yoga"],
  photography: ["photo", "photography"],
  offbeat: ["offbeat", "hidden", "unexplored", "quiet"],
  shopping: ["shopping", "shop", "market"],
};

function extractInterests(text: string): string[] {
  const lower = text.toLowerCase();
  return PREFERENCES.filter((p) => (INTEREST_KEYWORDS[p.id] ?? []).some((kw) => lower.includes(kw))).map((p) => p.id);
}

export function parseTripMessage(raw: string): ParsedTripMessage {
  const days = extractDays(raw);
  const interests = extractInterests(raw);

  const cleaned = stripDayClause(stripLeadIn(raw));
  // A bare day-count reply ("5 days", "5") to a follow-up question has
  // nothing left to match as a place once the day clause is stripped —
  // don't treat empty leftover text as a failed place-name attempt.
  if (!cleaned) {
    return { destination: null, candidates: [], unmatchedPlaceAttempt: false, days, interests };
  }

  const exact = resolveUnambiguousMatch(cleaned);
  if (exact) {
    return { destination: exact, candidates: [], unmatchedPlaceAttempt: false, days, interests };
  }

  const live = findLiveMatches(cleaned, 4);
  if (live.length === 1) {
    return { destination: live[0], candidates: [], unmatchedPlaceAttempt: false, days, interests };
  }
  if (live.length > 1) {
    return { destination: null, candidates: live, unmatchedPlaceAttempt: false, days, interests };
  }

  // Nothing matched at all. Only call this a "place attempt" (triggering
  // the India-focused message) when there's real letter content left —
  // guards against misfires on short filler like "yes" or "ok".
  const looksLikePlaceAttempt = /[a-z]{3,}/i.test(cleaned);
  return { destination: null, candidates: [], unmatchedPlaceAttempt: looksLikePlaceAttempt, days, interests };
}

// Used only for the "did you mean one of these Indian destinations"
// nudge after an unmatched place attempt — top few by review count, same
// popularity proxy used elsewhere (Home autocomplete, Plan Trip's old
// "Popular" row).
export const SUGGESTED_DESTINATIONS: Destination[] = [...DESTINATIONS]
  .filter((d) => !d.hidden)
  .sort((a, b) => b.reviews - a.reviews)
  .slice(0, 4);
