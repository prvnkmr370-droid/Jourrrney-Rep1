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
// alone rather than the whole uncut phrase. A day count can also lead
// ("3 days in Mysore" — the natural phrasing for a multi-leg message
// like "3 days in Mysore, then 2 days in Coorg") — stripping that leaves
// a dangling "in", which the second replace here also cleans up so
// "in mysore" still resolves to "mysore".
function stripDayClause(text: string): string {
  return text
    .replace(/\bfor\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s*-?\s*days?\b/i, "")
    .replace(/\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s*-?\s*days?\b/i, "")
    .trim()
    .replace(/^(?:in|at|to)\s+/i, "")
    .trim();
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
  /** Set (to the matched place's display name) when the message names a
   * well-known place outside India — checked BEFORE the fuzzy Indian-
   * destination matcher runs, so e.g. "Dubai" can't accidentally
   * fuzzy-match a same-length Indian name (like "Dubdi Monastery") and
   * get silently treated as if that's what was asked for. See
   * matchNonIndiaPlace below. */
  nonIndiaPlace: string | null;
  /** True when the message isn't attempting to name a place at all —
   * small talk or a question about the assistant/app itself ("who are
   * you", "can I ask u anything"). Lets the caller steer the
   * conversation back to travel instead of showing the "we're
   * India-focused" place-not-supported response, which would be a
   * non-sequitur here. Mutually exclusive with `unmatchedPlaceAttempt`. */
  offTopic: boolean;
  days: number | null;
  /** PREFERENCES ids opportunistically found by keyword in the message. */
  interests: string[];
}

// Spelled-out counts ("two days", "four people") are just as common in
// natural chat replies as digits, especially for small numbers — without
// this, a bare "two" reply to "How many days?" fails every digit-only
// pattern below and the user gets told to type a number they just typed.
export const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};

/** A bare number word ("two") or digit string ("2") to its numeric value. */
export function wordToNumber(text: string): number | null {
  const t = text.trim().toLowerCase();
  if (/^\d{1,2}$/.test(t)) return Number(t);
  return NUMBER_WORDS[t] ?? null;
}

const NUMBER_TOKEN = `(\\d{1,2}|${Object.keys(NUMBER_WORDS).join("|")})`;

const DAY_PATTERNS = [
  new RegExp(`\\bfor\\s+${NUMBER_TOKEN}\\s*-?\\s*days?\\b`, "i"),
  new RegExp(`\\b${NUMBER_TOKEN}\\s*-?\\s*days?\\b`, "i"),
  new RegExp(`\\b${NUMBER_TOKEN}\\s*-?\\s*d\\b`, "i"), // "5d"
];

// Not a "realistic trip" ceiling — the local template planner (see
// generateItinerary in data.ts) loops cleanly for any day count, so an
// extended-stay request (a month-plus somewhere) is genuinely answerable.
// This is only a sanity bound against junk input ("9999999 days"); it's
// set well above what the AI itinerary generator can reliably produce
// inside its free-tier time budget on purpose — a request past what it
// can finish in time just times out and falls back to the local planner,
// same as any other AI failure, rather than rendering a broken response.
export const MAX_TRIP_DAYS = 90;

export function extractDays(text: string): number | null {
  for (const re of DAY_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const n = wordToNumber(m[1]);
      if (n && n >= 1 && n <= MAX_TRIP_DAYS) return n;
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

// Generic trip-chat words that carry no place information on their own —
// used to tell "Plan a trip" (nothing but filler, not a failed place
// attempt) apart from "Take me to Narnia" (a real, if unsupported, place
// name) after everything else has failed to match. Not exhaustive; the
// bar is "does at least one word look like it's trying to name
// something," not perfect grammar parsing.
const FILLER_WORDS = new Set([
  "plan", "planning", "trip", "trips", "help", "me", "my", "the", "a", "an", "to", "for", "of", "in", "on",
  "go", "going", "want", "wanna", "would", "like", "please", "hi", "hello", "hey", "ok", "okay", "yes", "no",
  "sure", "thanks", "thank", "you", "i", "i'd", "id", "can", "could", "should", "need", "looking", "look",
  "somewhere", "some", "place", "places", "idea", "ideas", "suggest", "suggestion", "suggestions",
  "recommend", "recommendation", "anywhere", "dreaming", "travel", "traveling", "travelling",
  "vacation", "holiday", "visit", "journey", "dream", "new", "and", "with", "that", "this",
]);

function hasRealPlaceContent(cleaned: string): boolean {
  return cleaned.split(/\s+/).some((w) => w.length >= 3 && !FILLER_WORDS.has(w));
}

// Common phrasings for a message that isn't attempting to name a place at
// all — small talk, or a question about the assistant/app itself ("Can I
// ask u anything", "who are you", "tell me a joke"). Without this, a
// message like that has no filler-word overlap with FILLER_WORDS (none of
// "ask"/"anything"/"u" are in that list), so hasRealPlaceContent reads it
// as a genuine unsupported-place attempt and the chat wrongly replies
// "we're currently focused on India" — a non-sequitur for a question that
// was never about a destination. Not exhaustive; covers the common
// conversational patterns rather than attempting full intent detection.
const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\b(can|could|may)\s+i\s+ask\s+(you|u)\b/i,
  /\bask\s+(you|u)\s+(anything|something|a\s+question)\b/i,
  /\bwho\s+are\s+(you|u)\b/i,
  /\bwhat\s+are\s+(you|u)\b/i,
  /\bare\s+(you|u)\s+(a|an)?\s*(ai|bot|robot|human|real|person|alive)\b/i,
  /\bwhat('?s|\s+is)\s+your\s+name\b/i,
  /\bwhat\s+can\s+(you|u)\s+do\b/i,
  /\bhow\s+(do|does)\s+(you|u)\s+work\b/i,
  /\btell\s+me\s+a\s+joke\b/i,
  /\bhow\s+are\s+(you|u)\b/i,
  /\bhow('?s|\s+is)\s+the\s+weather\b/i,
  /\bwhat\s+time\s+is\s+it\b/i,
  /\bhow\s+old\s+are\s+(you|u)\b/i,
  /\bwho\s+(made|created|built)\s+(you|u)\b/i,
];

function isOffTopicMessage(raw: string): boolean {
  return OFF_TOPIC_PATTERNS.some((re) => re.test(raw));
}

// Well-known places outside India that people might type into Tia.
// Checked BEFORE the fuzzy Indian-destination matcher (matchDestination.ts)
// runs, because that matcher has no concept of "this doesn't belong in the
// dataset at all" — it only ranks candidates against each other, so a
// short, coincidentally-close query like "dubai" can win a weak-but-unique
// match against an unrelated Indian name ("Dubdi Monastery" is 1 edit
// away) and get silently treated as if that's what was asked for. Not an
// exhaustive gazetteer — covers the world's most commonly asked-about
// cities/countries; anything not on this list still falls through to the
// normal local-match -> Gemini-fallback -> "we're India-only" pipeline,
// just without this early exit.
const NON_INDIA_PLACES = new Set([
  "dubai", "abu dhabi", "uae", "united arab emirates", "sharjah",
  "usa", "us", "america", "united states", "new york", "los angeles", "san francisco",
  "las vegas", "chicago", "miami", "hawaii", "orlando", "seattle", "boston",
  "uk", "england", "britain", "united kingdom", "london", "scotland", "edinburgh", "manchester",
  "france", "paris", "nice", "marseille",
  "italy", "rome", "venice", "milan", "florence", "tuscany",
  "spain", "madrid", "barcelona", "ibiza",
  "germany", "berlin", "munich", "frankfurt",
  "switzerland", "zurich", "geneva", "interlaken",
  "netherlands", "amsterdam",
  "greece", "athens", "santorini", "mykonos",
  "turkey", "istanbul", "cappadocia", "antalya",
  "russia", "moscow", "st petersburg",
  "japan", "tokyo", "osaka", "kyoto", "hokkaido",
  "china", "beijing", "shanghai", "guangzhou", "shenzhen",
  "hong kong", "macau", "taiwan", "taipei",
  "south korea", "seoul", "busan",
  "thailand", "bangkok", "phuket", "pattaya", "chiang mai", "krabi",
  "singapore",
  "malaysia", "kuala lumpur", "penang", "langkawi",
  "indonesia", "bali", "jakarta",
  "vietnam", "hanoi", "ho chi minh city", "da nang", "halong bay",
  "cambodia", "siem reap",
  "philippines", "manila", "boracay", "cebu",
  "maldives", "male",
  "sri lanka", "colombo", "kandy",
  "nepal", "kathmandu", "pokhara",
  "bhutan", "thimphu", "paro",
  "bangladesh", "dhaka",
  "pakistan", "myanmar", "yangon",
  "australia", "sydney", "melbourne", "brisbane", "perth", "gold coast",
  "new zealand", "auckland", "queenstown", "wellington",
  "canada", "toronto", "vancouver", "montreal",
  "mexico", "cancun", "mexico city",
  "brazil", "rio de janeiro", "sao paulo",
  "egypt", "cairo", "sharm el sheikh",
  "south africa", "cape town", "johannesburg",
  "kenya", "nairobi",
  "morocco", "marrakech", "casablanca",
]);

function normalizeForLookup(text: string): string {
  return text.toLowerCase().trim().replace(/[.,!?]+$/g, "");
}

/** Levenshtein distance, deliberately independent of matchDestination's
 * fuzzy matcher (tuned for a much larger, differently-shaped dataset) and
 * deliberately capped at "is it 1 edit" — this list is short enough that a
 * looser budget risks a false positive against a real Indian place name. */
function isOneEditAway(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length] <= 1;
}

/** Returns the matched place's display name when `cleaned` names a
 * well-known place outside India, else null. */
export function matchNonIndiaPlace(cleaned: string): string | null {
  const norm = normalizeForLookup(cleaned);
  if (NON_INDIA_PLACES.has(norm)) return norm;
  // Light typo tolerance (1 edit) so a near-miss spelling ("duabi") is
  // still caught — only worth checking for reasonably long input, since a
  // very short query is too ambiguous to risk a false positive over.
  if (norm.length >= 4) {
    for (const place of NON_INDIA_PLACES) {
      if (isOneEditAway(norm, place)) return place;
    }
  }
  return null;
}

export function parseTripMessage(raw: string): ParsedTripMessage {
  const days = extractDays(raw);
  const interests = extractInterests(raw);

  if (isOffTopicMessage(raw)) {
    return { destination: null, candidates: [], unmatchedPlaceAttempt: false, nonIndiaPlace: null, offTopic: true, days, interests };
  }

  const cleaned = stripDayClause(stripLeadIn(raw));
  // A bare day-count reply ("5 days", "5") to a follow-up question has
  // nothing left to match as a place once the day clause is stripped —
  // don't treat empty leftover text as a failed place-name attempt.
  if (!cleaned) {
    return { destination: null, candidates: [], unmatchedPlaceAttempt: false, nonIndiaPlace: null, offTopic: false, days, interests };
  }

  // Checked before the fuzzy Indian-destination matcher below — see
  // matchNonIndiaPlace's doc comment for why this has to come first.
  const nonIndiaPlace = matchNonIndiaPlace(cleaned);
  if (nonIndiaPlace) {
    return { destination: null, candidates: [], unmatchedPlaceAttempt: false, nonIndiaPlace, offTopic: false, days, interests };
  }

  const exact = resolveUnambiguousMatch(cleaned);
  if (exact) {
    return { destination: exact, candidates: [], unmatchedPlaceAttempt: false, nonIndiaPlace: null, offTopic: false, days, interests };
  }

  const live = findLiveMatches(cleaned, 4);
  if (live.length === 1) {
    return { destination: live[0], candidates: [], unmatchedPlaceAttempt: false, nonIndiaPlace: null, offTopic: false, days, interests };
  }
  if (live.length > 1) {
    return { destination: null, candidates: live, unmatchedPlaceAttempt: false, nonIndiaPlace: null, offTopic: false, days, interests };
  }

  // Nothing matched at all. Only call this a "place attempt" (triggering
  // the India-focused message) when a real, non-filler word is left —
  // "any word 3+ letters" used to be the bar here, but "plan", "trip",
  // "help", "me" are all 3+ letters too, so a plain "Plan a trip" (no
  // place named at all) was wrongly read the same as someone naming an
  // unsupported destination.
  const looksLikePlaceAttempt = hasRealPlaceContent(cleaned);
  return { destination: null, candidates: [], unmatchedPlaceAttempt: looksLikePlaceAttempt, nonIndiaPlace: null, offTopic: false, days, interests };
}

// Used only for the "did you mean one of these Indian destinations"
// nudge after an unmatched place attempt — top few by review count, same
// popularity proxy used elsewhere (Home autocomplete, Plan Trip's old
// "Popular" row).
export const SUGGESTED_DESTINATIONS: Destination[] = [...DESTINATIONS]
  .filter((d) => !d.hidden)
  .sort((a, b) => b.reviews - a.reviews)
  .slice(0, 4);

export interface TripSegment {
  destination: Destination;
  days: number | null;
}

// Only these explicit sequencing words split a message into multiple
// legs — deliberately NOT splitting on bare "and" or commas, since
// those show up constantly inside a genuinely single-destination
// message ("Mysore, Karnataka", "temples and palaces") without meaning
// "then go somewhere else". "then"/"followed by"/"after that" are
// unambiguous sequencing signals in normal English.
const MULTI_DESTINATION_SPLIT = /\s*(?:,?\s*and\s+then\s+|,?\s*then\s+|\s+followed\s+by\s+|\s+after\s+that\s+)\s*/i;

// One segment must resolve *unambiguously* to count for multi-
// destination parsing — an ambiguous segment (multiple candidates)
// would need its own disambiguation UI per leg, which multi-destination
// parsing deliberately doesn't attempt; the caller just falls back to
// treating the whole message as a single (likely failing) destination
// parse in that case, same as any other unmatched message.
function matchSegment(raw: string): TripSegment | null {
  const days = extractDays(raw);
  const cleaned = stripDayClause(stripLeadIn(raw));
  if (!cleaned) return null;

  const exact = resolveUnambiguousMatch(cleaned);
  if (exact) return { destination: exact, days };

  const live = findLiveMatches(cleaned, 4);
  if (live.length === 1) return { destination: live[0], days };
  return null;
}

/**
 * "Mysore then Coorg", "3 days in Mysore, then 2 days in Coorg" — returns
 * null (not an empty array) whenever the message isn't genuinely multi-
 * destination, so callers can use `parsed !== null` as the trigger for
 * multi-leg chat flow without a separate length check everywhere.
 */
export function parseMultiDestinationMessage(raw: string): TripSegment[] | null {
  const segments = raw.split(MULTI_DESTINATION_SPLIT).map((s) => s.trim()).filter(Boolean);
  if (segments.length < 2) return null;

  const matches = segments.map(matchSegment);
  if (matches.some((m) => m === null)) return null;
  const resolved = matches as TripSegment[];

  // "Mysore then Mysore" isn't a real multi-leg trip — likely a mis-split
  // of a single-destination message that happened to contain "then" for
  // an unrelated reason.
  const uniqueIds = new Set(resolved.map((m) => m.destination.id));
  if (uniqueIds.size !== resolved.length) return null;

  return resolved;
}
