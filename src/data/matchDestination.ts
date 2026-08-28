/**
 * Shared "does this typed query mean one specific destination" logic —
 * used by both the Search tab (SearchResults.tsx) and the Home page's own
 * search bar, so typing a place name behaves the same everywhere in the
 * app: an unambiguous query (an exact name/state match, or a query with
 * only one live match) goes straight to that destination's page. An
 * ambiguous multi-match query is left for the user to pick from, rather
 * than guessed.
 *
 * Matching has two layers, checked together per word:
 *  1. Prefix — "aham" matches "Ahmedabad" (autocomplete-style, like a
 *     search engine's suggestion dropdown: matches the START of a word,
 *     not anywhere inside it, so "ada" — a mid-word fragment — doesn't
 *     match it).
 *  2. Fuzzy (edit-distance) fallback — when no word prefix-matches,
 *     tolerate a small number of typos scaled to word length, so "Neel
 *     Island" or "Neels Islands" still finds "Neil Island". Very short
 *     words (<=3 letters) require an exact prefix — fuzzy matching on
 *     something that short is more likely to misfire than help.
 *
 * A query can be multiple words ("neil island") — every query word must
 * match *some* word in the destination's name (or its aliases/state) for
 * the destination to count as a match at all. This also fixes a real bug:
 * a naive single-string prefix check against single words never matches a
 * multi-word query like "Neil Island" in the first place, since no single
 * word in the name starts with "neil island" (with the space included).
 */
import { DESTINATIONS, type Destination } from "./destinations";

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[()]/g, " ")
    .split(/[\s,-]+/)
    .filter(Boolean);
}

// Damerau-Levenshtein (optimal string alignment variant): edit distance
// counting insert/delete/substitute as 1 each, *and* an adjacent-letter
// transposition ("Agra" -> "Agar", "Goa" -> "Gao") as 1 rather than the
// 2 a plain Levenshtein charges for it — fat-finger swaps like that are
// one of the single most common typo patterns, and they're common on
// exactly the short place names (3-5 letters) where a 2-edit budget
// would otherwise be too loose to allow safely.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}

// How many typo'd characters to tolerate, scaled to word length. Very
// short words (<=2 letters) stay exact-prefix-only so single/double
// letters don't fuzzy-match half the dataset; from 3 letters up, a
// single edit (including a transposition) is allowed, growing with
// length.
function fuzzyThreshold(len: number): number {
  if (len <= 2) return 0;
  if (len <= 4) return 1;
  if (len <= 6) return 2;
  if (len <= 9) return 3;
  return 4;
}

// Best (lowest) score matching a single query word against a pool of
// candidate words — 0 for a prefix match, else edit distance if within
// that word's typo tolerance. Returns null if nothing in the pool is
// close enough.
function bestWordScore(qw: string, candidateWords: string[]): number | null {
  let best: number | null = null;
  const threshold = fuzzyThreshold(qw.length);
  for (const cw of candidateWords) {
    if (cw.startsWith(qw)) return 0; // can't beat a perfect prefix match
    if (threshold > 0) {
      const dist = levenshtein(qw, cw);
      if (dist <= threshold && (best === null || dist < best)) best = dist;
    }
  }
  return best;
}

// Every word in the query must match something in candidateWords (prefix
// or fuzzy) for this to count as a match at all — this is what makes
// "neil island" require both "neil" and "island" to be present, rather
// than matching on just one of them. Returns the summed score (lower =
// better) or null if any query word has no match.
function matchAllWords(queryWords: string[], candidateWords: string[]): number | null {
  let total = 0;
  for (const qw of queryWords) {
    const score = bestWordScore(qw, candidateWords);
    if (score === null) return null;
    total += score;
  }
  return total;
}

interface Scored {
  dest: Destination;
  score: number;
  isNameMatch: boolean; // name/alias match outranks a state-only match
}

function scoreDestinations(query: string): Scored[] {
  const queryWords = wordsOf(query);
  if (queryWords.length === 0) return [];
  const results: Scored[] = [];
  for (const d of DESTINATIONS) {
    const nameWords = [...wordsOf(d.name), ...(d.aliases ?? []).flatMap(wordsOf)];
    const nameScore = matchAllWords(queryWords, nameWords);
    if (nameScore !== null) {
      results.push({ dest: d, score: nameScore, isNameMatch: true });
      continue;
    }
    const stateScore = matchAllWords(queryWords, wordsOf(d.state));
    if (stateScore !== null) {
      results.push({ dest: d, score: stateScore, isNameMatch: false });
    }
  }
  results.sort((a, b) => (a.isNameMatch === b.isNameMatch ? a.score - b.score : a.isNameMatch ? -1 : 1));
  return results;
}

// Autocomplete-dropdown ranking, in the spirit of how a search engine's
// suggestion box orders completions — adapted to what this app actually
// has, not a copy of anyone's real system (there's no live query-volume
// data or ML ranker here, and scraping a third party's suggestion API for
// our own destination database wouldn't make sense even if we wanted to):
//   - Completion intent: match quality (prefix/fuzzy score) still comes
//     first — this is answered by scoreDestinations already.
//   - "Search popularity": approximated with each destination's own
//     `reviews` count as a popularity proxy, used as a tiebreaker between
//     otherwise equally-good matches.
//   - "User context": recentIds (this device's own recent-search history,
//     from useRecentSearchesStore) bumps a destination you've searched for
//     before ahead of an equally-good but unfamiliar one — the one piece
//     of real personalization this app can honestly offer, since there's
//     no server-side account/location profile behind it.
export function findLiveMatches(query: string, limit = 4, recentIds: string[] = []): Destination[] {
  if (!query.trim()) return [];
  const recentSet = new Set(recentIds);
  // Only re-rank within a slightly larger pool than `limit` so a much
  // weaker fuzzy match never outranks a strong one just for being recent
  // or popular — those only break ties among comparably good matches.
  const pool = scoreDestinations(query).slice(0, Math.max(limit * 3, 12));
  pool.sort((a, b) => {
    const aRecent = recentSet.has(a.dest.id) ? 0 : 1;
    const bRecent = recentSet.has(b.dest.id) ? 0 : 1;
    if (aRecent !== bRecent) return aRecent - bRecent;
    if (a.isNameMatch !== b.isNameMatch) return a.isNameMatch ? -1 : 1;
    if (a.score !== b.score) return a.score - b.score;
    return b.dest.reviews - a.dest.reviews;
  });
  return pool.slice(0, limit).map((r) => r.dest);
}

export function resolveUnambiguousMatch(query: string): Destination | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const exact = DESTINATIONS.find(
    (d) => d.name.toLowerCase() === q || d.state.toLowerCase() === q || (d.aliases ?? []).some((a) => a.toLowerCase() === q)
  );
  if (exact) return exact;

  const scored = scoreDestinations(query);
  if (scored.length === 1) return scored[0].dest;
  // A clear single best match (strictly better than the runner-up, and
  // itself a genuine name/typo match rather than a loose fallback) is
  // still auto-corrected to — e.g. "Neel Island" or "Neels Islands"
  // should land straight on Neil Island, not make the user pick from a
  // list for a typo this close. A tie or a close spread is left for the
  // user to choose from instead of guessing.
  if (scored.length > 1 && scored[0].isNameMatch && scored[0].score < scored[1].score) {
    return scored[0].dest;
  }
  return null;
}
